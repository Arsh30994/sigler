from __future__ import annotations

import math

import numpy as np
import pytest

from backend.app.schemas.recognition import HandLandmarks, Landmark
from backend.app.services.feature_normalizer import LandmarkValidationError, build_feature_vector, normalize_hand


def hand(handedness: str, scale: float = 1.0) -> HandLandmarks:
    return HandLandmarks(
        handedness=handedness,
        landmarks=[Landmark(x=0 if index == 0 else scale * index, y=scale * (index % 3), z=scale * (index % 2)) for index in range(21)],
    )


def test_two_hands_use_published_right_then_left_order() -> None:
    right, left = hand("right", 1), hand("left", 2)
    vector = build_feature_vector([left, right])
    assert vector.shape == (126,)
    assert np.allclose(vector[:63], normalize_hand(right))
    assert np.allclose(vector[63:], normalize_hand(left))


def test_missing_hand_slot_is_zero_padded() -> None:
    right_only = build_feature_vector([hand("right")])
    left_only = build_feature_vector([hand("left")])
    assert np.any(right_only[:63]) and np.all(right_only[63:] == 0)
    assert np.all(left_only[:63] == 0) and np.any(left_only[63:])


def test_no_hands_is_a_zero_126_vector() -> None:
    assert np.all(build_feature_vector([]) == 0)


def test_degenerate_or_nonfinite_hand_is_rejected() -> None:
    degenerate = HandLandmarks(handedness="right", landmarks=[Landmark(x=0, y=0, z=0) for _ in range(21)])
    with pytest.raises(LandmarkValidationError):
        normalize_hand(degenerate)
    invalid = hand("right").model_copy(update={"landmarks": [Landmark(x=math.nan, y=0, z=0) for _ in range(21)]})
    with pytest.raises(LandmarkValidationError):
        normalize_hand(invalid)
