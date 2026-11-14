from __future__ import annotations

import json
import os
import shutil
import site
import subprocess
import sysconfig
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from huggingface_hub import HfApi

from backend.app.config import BUCKET_ID, EXPECTED_MODEL_SHA256, MODEL_FILE
from backend.app.services.model_loader import verify_sha256


@dataclass(frozen=True)
class BucketArtifact:
    source_path: str
    destination: Path

    @property
    def uri(self) -> str:
        return f"hf://buckets/{BUCKET_ID}/{self.source_path}"


ARTIFACTS = (
    BucketArtifact(MODEL_FILE, Path("backend/models/vsrs/mlp/model.joblib")),
    BucketArtifact("mediapipe/hand_landmarker.task", Path("backend/models/vsrs/mediapipe/hand_landmarker.task")),
    BucketArtifact("README.md", Path("backend/models/vsrs/README.md")),
)


def find_hf_cli() -> str | None:
    candidates = [os.getenv("HF_CLI"), shutil.which("hf")]
    candidates.append(str(Path(site.getuserbase()) / ("Scripts/hf.exe" if os.name == "nt" else "bin/hf")))
    candidates.append(str(Path(site.getusersitepackages()).parent / ("Scripts/hf.exe" if os.name == "nt" else "bin/hf")))
    scripts_directory = sysconfig.get_path("scripts")
    if scripts_directory:
        candidates.append(str(Path(scripts_directory) / ("hf.exe" if os.name == "nt" else "hf")))
    return next((candidate for candidate in candidates if candidate and Path(candidate).is_file()), None)


def download_artifacts() -> str:
    for artifact in ARTIFACTS:
        artifact.destination.parent.mkdir(parents=True, exist_ok=True)
    cli = find_hf_cli()
    if cli:
        for artifact in ARTIFACTS:
            subprocess.run([cli, "buckets", "cp", artifact.uri, str(artifact.destination)], check=True)
        return "hf buckets cp"
    # Official storage-bucket fallback. hf_hub_download is intentionally not used.
    HfApi().download_bucket_files(BUCKET_ID, [(artifact.source_path, artifact.destination) for artifact in ARTIFACTS], raise_on_missing_files=True)
    return "huggingface_hub.download_bucket_files"


def write_manifest(download_method: str) -> dict[str, object]:
    metadata = {
        artifact.source_path: {"destination": str(artifact.destination), "size_bytes": artifact.destination.stat().st_size, "sha256": verify_sha256(artifact.destination)}
        for artifact in ARTIFACTS
    }
    actual_hash = metadata[MODEL_FILE]["sha256"]
    if actual_hash != EXPECTED_MODEL_SHA256:
        raise SystemExit(f"MLP SHA-256 mismatch: expected {EXPECTED_MODEL_SHA256}, got {actual_hash}")
    manifest = {
        "bucket_id": BUCKET_ID,
        "bucket_is_mutable": True,
        "downloaded_at_utc": datetime.now(timezone.utc).isoformat(),
        "download_method": download_method,
        "artifacts": metadata,
    }
    Path("backend/models/vsrs/manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return manifest


def main() -> None:
    method = download_artifacts()
    print(json.dumps(write_manifest(method), indent=2))


if __name__ == "__main__":
    main()
