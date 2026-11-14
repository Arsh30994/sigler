from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib
import numpy as np

from backend.app.config import EXPECTED_MODEL_SHA256, MODEL_LABELS


class ModelLoadError(RuntimeError):
    """The trusted VSRS artifact cannot be loaded safely."""


@dataclass(frozen=True)
class LoadedModel:
    model: Any
    scaler: Any
    classes: tuple[str, ...]

    def probabilities(self, features: np.ndarray) -> np.ndarray:
        scaled = self.scaler.transform(features.reshape(1, 126))
        probabilities = np.asarray(self.model.predict_proba(scaled)[0], dtype=np.float64)
        if probabilities.shape != (len(self.classes),) or not np.isfinite(probabilities).all():
            raise ModelLoadError("model returned an invalid probability vector")
        return probabilities


def verify_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as artifact:
        for chunk in iter(lambda: artifact.read(1_048_576), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_verified_model(path: Path) -> LoadedModel:
    if not path.is_file():
        raise ModelLoadError(f"VSRS model artifact is missing: {path}")
    actual_hash = verify_sha256(path)
    if actual_hash != EXPECTED_MODEL_SHA256:
        raise ModelLoadError("VSRS model artifact hash verification failed")
    try:
        artifact = joblib.load(path)
        model, scaler, classes = artifact["model"], artifact["scaler"], tuple(map(str, artifact["classes"]))
    except Exception as error:  # trusted artifact was verified before deserialization
        raise ModelLoadError(f"VSRS model artifact could not be loaded: {error}") from error
    if getattr(model, "n_features_in_", None) != 126 or getattr(scaler, "n_features_in_", None) != 126:
        raise ModelLoadError("VSRS model or scaler does not accept 126 features")
    if classes != MODEL_LABELS:
        raise ModelLoadError("VSRS artifact labels do not match the official V1 vocabulary")
    return LoadedModel(model=model, scaler=scaler, classes=classes)
