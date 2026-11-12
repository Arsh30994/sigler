from dataclasses import dataclass, field
import numpy as np
from .config import RecorderConfig, FEATURE_DIMENSION

@dataclass
class SequenceRecorder:
    config: RecorderConfig = field(default_factory=RecorderConfig)
    features: list[np.ndarray] = field(default_factory=list)
    presence: list[np.ndarray] = field(default_factory=list)
    recording: bool = False
    def start(self): self.reset(); self.recording = True
    def stop(self): self.recording = False
    def reset(self): self.features.clear(); self.presence.clear(); self.recording = False
    def add(self, features: np.ndarray, presence: np.ndarray):
        if not self.recording: return
        if features.shape != (FEATURE_DIMENSION,) or presence.shape != (2,): raise ValueError("invalid frame schema")
        if len(self.features) < self.config.window_frames:
            self.features.append(features.astype(np.float32).copy()); self.presence.append(presence.astype(bool).copy())
    @property
    def complete(self): return len(self.features) == self.config.window_frames
    def sample(self, allow_incomplete=False):
        if not self.complete and not allow_incomplete: raise ValueError("incomplete sequence")
        return np.stack(self.features), np.stack(self.presence)
