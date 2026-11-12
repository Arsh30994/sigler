from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
import json, numpy as np
from .config import FEATURE_DIMENSION, FEATURE_SCHEMA_VERSION

@dataclass(frozen=True)
class SampleMetadata:
    sample_id: str; label: str; gloss: str; frame_count: int; schema_version: str; timestamp: str; participant_id: str | None; session_id: str

class DatasetManager:
    def __init__(self, root: str | Path): self.root = Path(root); self.root.mkdir(parents=True, exist_ok=True)
    def save(self, label, gloss, features, presence, session_id, participant_id=None):
        if features.ndim != 2 or features.shape[1] != FEATURE_DIMENSION or presence.shape != (features.shape[0], 2): raise ValueError("invalid sample shape")
        meta = SampleMetadata(str(uuid4()), label, gloss, int(features.shape[0]), FEATURE_SCHEMA_VERSION, datetime.now(timezone.utc).isoformat(), participant_id, session_id)
        folder = self.root / meta.sample_id; folder.mkdir(); np.save(folder / "features.npy", features); np.save(folder / "presence.npy", presence); (folder / "metadata.json").write_text(json.dumps(asdict(meta), indent=2)); return meta
    def inspect(self):
        samples=[]; invalid=[]
        for folder in self.root.iterdir():
            try:
                meta=json.loads((folder / "metadata.json").read_text()); features=np.load(folder / "features.npy"); presence=np.load(folder / "presence.npy")
                if features.shape != (meta["frame_count"], FEATURE_DIMENSION) or presence.shape != (meta["frame_count"],2): raise ValueError("shape mismatch")
                samples.append(meta)
            except Exception as error: invalid.append({"path":str(folder),"error":str(error)})
        classes={}; [classes.__setitem__(s["label"], classes.get(s["label"],0)+1) for s in samples]
        return {"samples":len(samples),"classes":len(classes),"samples_per_class":classes,"invalid":invalid}
    def load(self, sample_id):
        folder=self.root / sample_id
        return json.loads((folder / "metadata.json").read_text()), np.load(folder / "features.npy"), np.load(folder / "presence.npy")
    def delete(self, sample_id):
        folder=self.root / sample_id
        for item in folder.iterdir(): item.unlink()
        folder.rmdir()
