from __future__ import annotations

import numpy as np

from backend.app.config import MODEL_LABELS
from backend.app.schemas.recognition import HandLandmarks, Landmark
from backend.app.services.inference import RecognitionService
from backend.app.services.temporal_aggregator import TemporalAggregator


class FakeModel:
    classes = MODEL_LABELS

    def probabilities(self, _features: np.ndarray) -> np.ndarray:
        probabilities = np.zeros(11)
        probabilities[2] = 0.8
        probabilities[1] = 0.2
        return probabilities


def right_hand() -> HandLandmarks:
    return HandLandmarks(handedness="right", landmarks=[Landmark(x=index, y=index % 2, z=index % 3) for index in range(21)])


def test_five_frames_are_required_before_candidate() -> None:
    service = RecognitionService(FakeModel(), TemporalAggregator(120), None)
    results = [service.predict("session-a", [right_hand()]) for _ in range(5)]
    assert [result.status for result in results[:4]] == ["collecting"] * 4
    assert results[-1].status == "candidate"
    assert results[-1].model_label == "hello"
    assert results[-1].frames_used == 5
    assert not results[-1].speech_permitted


def test_threshold_rejects_low_confidence_and_sessions_do_not_mix() -> None:
    service = RecognitionService(FakeModel(), TemporalAggregator(120), 0.9)
    for _ in range(4):
        service.predict("first", [right_hand()])
    isolated = service.predict("second", [right_hand()])
    rejected = service.predict("first", [right_hand()])
    assert isolated.status == "collecting"
    assert rejected.status == "unknown"
    assert rejected.reason == "below_configured_confidence_threshold"


def test_no_hand_resets_aggregation() -> None:
    service = RecognitionService(FakeModel(), TemporalAggregator(120), None)
    for _ in range(3):
        service.predict("reset", [right_hand()])
    assert service.predict("reset", []).reason == "insufficient_hand_landmarks"
    assert service.predict("reset", [right_hand()]).frames_used == 1
