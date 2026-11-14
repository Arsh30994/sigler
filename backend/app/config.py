from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


EXPECTED_MODEL_SHA256 = "4f13ec96dee5999d2fb6ff8cefbd10d23f80b762ef2ddbe1c7656a5a00b23098"
BUCKET_ID = "arshjhawar/VSRS-V1-Models-bucket"
MODEL_FILE = "mlp/model.joblib"
MODEL_VERSION = "vsrs-v1"
MODEL_LABELS = ("cellphone", "good", "hello", "house", "i", "loud", "quiet", "red", "shoes", "teacher", "time")


@dataclass(frozen=True)
class Settings:
    model_path: Path
    allowed_origins: list[str]
    min_confidence: float | None
    session_ttl_seconds: int
    max_request_bytes: int = 65_536

    @classmethod
    def from_environment(cls) -> "Settings":
        raw_threshold = os.getenv("VSRS_MIN_CONFIDENCE", "").strip()
        threshold = float(raw_threshold) if raw_threshold else None
        if threshold is not None and not 0 <= threshold <= 1:
            raise ValueError("VSRS_MIN_CONFIDENCE must be between 0 and 1")
        origins = [value.strip() for value in os.getenv("SIGLER_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if value.strip()]
        return cls(
            model_path=Path(os.getenv("VSRS_MODEL_PATH", "backend/models/vsrs/mlp/model.joblib")),
            allowed_origins=origins,
            min_confidence=threshold,
            session_ttl_seconds=int(os.getenv("VSRS_SESSION_TTL_SECONDS", "120")),
        )
