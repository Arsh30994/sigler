from dataclasses import dataclass

FEATURE_SCHEMA_VERSION = "1.0.0"
LANDMARKS_PER_HAND = 21
COORDINATES_PER_LANDMARK = 3
HANDS_PER_FRAME = 2
FEATURE_DIMENSION = LANDMARKS_PER_HAND * COORDINATES_PER_LANDMARK * HANDS_PER_FRAME

@dataclass(frozen=True)
class RecorderConfig:
    window_frames: int = 30
    schema_version: str = FEATURE_SCHEMA_VERSION
