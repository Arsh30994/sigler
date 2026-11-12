from collections import Counter, defaultdict
import hashlib, json, numpy as np
from .config import FEATURE_DIMENSION, FEATURE_SCHEMA_VERSION

def sample_fingerprint(features: np.ndarray, presence: np.ndarray) -> str:
    return hashlib.sha256(features.astype(np.float32).tobytes() + presence.astype(np.uint8).tobytes()).hexdigest()

def quality_report(manager):
    valid, issues, seen = [], [], set()
    for folder in manager.root.iterdir():
        try:
            meta=json.loads((folder / "metadata.json").read_text()); features=np.load(folder / "features.npy"); presence=np.load(folder / "presence.npy")
            if meta.get("schema_version") != FEATURE_SCHEMA_VERSION: raise ValueError("feature schema mismatch")
            if features.ndim != 2 or features.shape[1] != FEATURE_DIMENSION or presence.shape != (len(features),2): raise ValueError("feature shape mismatch")
            if not np.isfinite(features).all(): raise ValueError("invalid numerical values")
            if not meta.get("label") or not meta.get("session_id") or not meta.get("participant_id"): raise ValueError("missing required metadata")
            fingerprint=sample_fingerprint(features,presence)
            if fingerprint in seen: raise ValueError("duplicate sample")
            seen.add(fingerprint); valid.append(meta)
        except Exception as error: issues.append({"path":str(folder),"error":str(error)})
    classes=Counter(item["label"] for item in valid); signers=defaultdict(set); sessions=defaultdict(set)
    for item in valid: signers[item["label"]].add(item["participant_id"]); sessions[item["label"]].add(item["session_id"])
    return {"valid_samples":len(valid),"invalid_samples":issues,"samples_per_class":dict(classes),"signers_per_class":{k:len(v) for k,v in signers.items()},"sessions_per_class":{k:len(v) for k,v in sessions.items()},"class_imbalance":(max(classes.values()) / min(classes.values()) if classes else None)}

def training_readiness(manager, registry, min_samples=100, min_signers=3):
    report=quality_report(manager); missing=[]
    for sign_id, sign in registry.items():
        if not sign.is_collectable: missing.append(f"{sign_id}: human validation is {sign.human_validation_status}"); continue
        count=report["samples_per_class"].get(sign_id,0); signers=report["signers_per_class"].get(sign_id,0)
        if count < min_samples: missing.append(f"{sign_id}: {count}/{min_samples} samples")
        if signers < min_signers: missing.append(f"{sign_id}: {signers}/{min_signers} signers")
    if report["invalid_samples"]: missing.append(f"{len(report['invalid_samples'])} invalid samples")
    return {"ready":not missing,"missing":missing,"quality":report}
