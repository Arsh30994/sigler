"""Training is intentionally blocked until reviewed, signer-separated data exists."""
from pathlib import Path
from .dataset_manager import DatasetManager
from .quality import training_readiness
from .sign_registry import REGISTRY
def main(root="research/sign_to_text/data"):
    readiness=training_readiness(DatasetManager(Path(root)),REGISTRY)
    if not readiness["ready"]: raise SystemExit("Training blocked: " + "; ".join(readiness["missing"]))
    raise SystemExit("Dataset gate passed; add a reviewed registry and signer-separated training configuration before training.")
if __name__=="__main__": main()
