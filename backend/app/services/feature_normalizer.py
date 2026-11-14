from __future__ import annotations

import math

import numpy as np

from backend.app.schemas.recognition import HandLandmarks


class LandmarkValidationError(ValueError):
    """Input cannot safely be converted to a VSRS feature vector."""


def normalize_hand(hand: HandLandmarks) -> np.ndarray:
    """Reproduce the published VSRS wrist-centred, max-radius normalization."""
    points = np.asarray([[point.x, point.y, point.z] for point in hand.landmarks], dtype=np.float64)
    if points.shape != (21, 3) or not np.isfinite(points).all():
        raise LandmarkValidationError("landmarks must contain 21 finite x/y/z coordinate triples")
    translated = points - points[0]
    radii = np.linalg.norm(translated, axis=1)
    maximum_radius = float(np.max(radii))
    if not math.isfinite(maximum_radius) or maximum_radius <= 0:
        raise LandmarkValidationError("hand landmarks have zero or invalid maximum radius")
    return (translated / maximum_radius).reshape(63)


def build_feature_vector(hands: list[HandLandmarks]) -> np.ndarray:
    """Return [right hand 0..62, left hand 63..125], zero-padding absent hands."""
    vector = np.zeros(126, dtype=np.float64)
    for hand in hands:
        normalized = normalize_hand(hand)
        offset = 0 if hand.handedness == "right" else 63
        vector[offset : offset + 63] = normalized
    return vector
