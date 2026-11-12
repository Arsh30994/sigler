from dataclasses import dataclass

@dataclass(frozen=True)
class DatasetSign:
    sign_id: str; gloss: str; description: str; hand_requirements: str
    human_validation_status: str; collection_status: str; reference: str | None = None
    @property
    def is_collectable(self): return self.human_validation_status == "VERIFIED"

# These are placeholders only. A researcher must replace/approve them with an ISL signer.
REGISTRY = {"ISL_UNVERIFIED_EXAMPLE": DatasetSign("ISL_UNVERIFIED_EXAMPLE", "UNVERIFIED_EXAMPLE", "Schema demonstration only; not an ISL claim.", "Not specified", "UNVERIFIED", "BLOCKED")}

def get_sign(sign_id: str) -> DatasetSign:
    if sign_id not in REGISTRY: raise KeyError(f"unknown sign ID: {sign_id}")
    return REGISTRY[sign_id]
