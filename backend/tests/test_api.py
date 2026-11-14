from __future__ import annotations

from pathlib import Path

import numpy as np
from fastapi.testclient import TestClient

from backend.app.config import MODEL_LABELS, Settings
from backend.app.main import create_app
from backend.app.services.inference import RecognitionService
from backend.app.services.temporal_aggregator import TemporalAggregator


class FakeModel:
    classes = MODEL_LABELS

    def probabilities(self, _features: np.ndarray) -> np.ndarray:
        probabilities = np.zeros(11)
        probabilities[2] = 1
        return probabilities


def payload(session_id: str = "test-session") -> dict:
    return {"session_id": session_id, "hands": [{"handedness": "right", "landmarks": [{"x": index, "y": index % 2, "z": index % 3} for index in range(21)]}]}


def test_health_ready_and_unavailable_prediction(tmp_path: Path) -> None:
    app = create_app(Settings(tmp_path / "missing.joblib", ["http://localhost:5173"], None, 120))
    with TestClient(app) as client:
        assert client.get("/health").json()["status"] == "ok"
        assert client.get("/ready").json()["ready"] is False
        assert client.post("/api/v1/recognition/predict", json=payload()).status_code == 503


def test_prediction_schema_and_validation(tmp_path: Path) -> None:
    app = create_app(Settings(tmp_path / "missing.joblib", ["http://localhost:5173"], None, 120))
    with TestClient(app) as client:
        app.state.service = RecognitionService(FakeModel(), TemporalAggregator(120), None)
        for _ in range(4):
            assert client.post("/api/v1/recognition/predict", json=payload()).json()["status"] == "collecting"
        result = client.post("/api/v1/recognition/predict", json=payload()).json()
        assert result["status"] == "candidate"
        assert result["model_label"] == "hello"
        assert result["speech_permitted"] is False
        assert client.post("/api/v1/recognition/predict", json={"session_id": "bad", "hands": []}).status_code == 200
        assert client.post("/api/v1/recognition/predict", json={"session_id": "bad", "hands": [{"handedness": "right", "landmarks": []}]}).status_code == 422
