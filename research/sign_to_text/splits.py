from collections import defaultdict
import hashlib

def signer_separated_split(metadata, test_fraction=0.2):
    """Deterministic split; a participant can never appear in both sets."""
    signers=sorted({item["participant_id"] for item in metadata if item.get("participant_id")})
    if len(signers)<2: raise ValueError("need at least two signers for leakage-safe split")
    test_count=max(1, round(len(signers)*test_fraction)); test=set(signers[-test_count:])
    train=[item for item in metadata if item["participant_id"] not in test]; evaluation=[item for item in metadata if item["participant_id"] in test]
    return train,evaluation
