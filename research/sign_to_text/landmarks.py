"""Renderer-independent, versioned two-hand feature extraction."""
from dataclasses import dataclass
import numpy as np
from .config import FEATURE_DIMENSION, LANDMARKS_PER_HAND

@dataclass(frozen=True)
class HandLandmarks:
    handedness: str
    points: np.ndarray

    def __post_init__(self):
        if self.handedness not in {"Left", "Right"}: raise ValueError("handedness must be Left or Right")
        if self.points.shape != (LANDMARKS_PER_HAND, 3): raise ValueError("hand points must have shape (21, 3)")
        if not np.isfinite(self.points).all(): raise ValueError("hand points must be finite")

def normalize_hand(points: np.ndarray) -> np.ndarray:
    """Wrist-relative, scale-normalized landmarks; zero is never a presence signal."""
    if points.shape != (LANDMARKS_PER_HAND, 3): raise ValueError("hand points must have shape (21, 3)")
    relative = points.astype(np.float32) - points[0].astype(np.float32)
    scale = np.linalg.norm(relative[9])
    if scale < 1e-6: raise ValueError("cannot normalize zero-scale hand")
    return relative / scale

def frame_features(hands: list[HandLandmarks]) -> tuple[np.ndarray, np.ndarray]:
    """Returns fixed [Left, Right] features (126) and separate bool presence (2)."""
    if len(hands) > 2: raise ValueError("at most two hands are supported")
    slots = {hand.handedness: hand for hand in hands}
    if len(slots) != len(hands): raise ValueError("duplicate handedness in frame")
    output = np.zeros((2, LANDMARKS_PER_HAND, 3), dtype=np.float32)
    presence = np.zeros(2, dtype=bool)
    for index, side in enumerate(("Left", "Right")):
        hand = slots.get(side)
        if hand is not None:
            output[index] = normalize_hand(hand.points)
            presence[index] = True
    return output.reshape(FEATURE_DIMENSION), presence
