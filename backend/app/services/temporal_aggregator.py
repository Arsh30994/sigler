from __future__ import annotations

import time
from collections import deque
from dataclasses import dataclass, field

import numpy as np


@dataclass
class _SessionBuffer:
    probabilities: deque[np.ndarray] = field(default_factory=lambda: deque(maxlen=5))
    updated_at: float = field(default_factory=time.monotonic)


class TemporalAggregator:
    """Five-valid-frame mean-probability aggregation isolated per recognition session."""

    def __init__(self, ttl_seconds: int) -> None:
        self._ttl_seconds = ttl_seconds
        self._sessions: dict[str, _SessionBuffer] = {}

    def add(self, session_id: str, probabilities: np.ndarray) -> tuple[np.ndarray | None, int]:
        self._cleanup()
        if probabilities.ndim != 1 or not np.isfinite(probabilities).all():
            raise ValueError("probability vector must be finite and one-dimensional")
        session = self._sessions.setdefault(session_id, _SessionBuffer())
        session.probabilities.append(probabilities)
        session.updated_at = time.monotonic()
        count = len(session.probabilities)
        return (np.mean(np.stack(session.probabilities), axis=0) if count == 5 else None, count)

    def reset(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)

    def _cleanup(self) -> None:
        cutoff = time.monotonic() - self._ttl_seconds
        expired = [key for key, value in self._sessions.items() if value.updated_at < cutoff]
        for key in expired:
            self._sessions.pop(key, None)
