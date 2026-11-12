from dataclasses import dataclass
import torch
@dataclass(frozen=True)
class Prediction: sign_id: str | None; gloss: str | None; confidence: float; rejected: bool; model_version: str
class SignInference:
    def __init__(self, model, labels, version, threshold=.75): self.model=model.eval(); self.labels=labels; self.version=version; self.threshold=threshold
    @torch.inference_mode()
    def predict(self, sequence):
        tensor=torch.as_tensor(sequence,dtype=torch.float32)
        if tensor.ndim!=2 or tensor.shape[-1]!=self.model.features: raise ValueError("invalid temporal sequence")
        confidence,index=torch.softmax(self.model(tensor.unsqueeze(0)),dim=-1).max(dim=-1); score=float(confidence.item())
        if score<self.threshold: return Prediction(None,None,score,True,self.version)
        sign_id,gloss=self.labels[int(index.item())]; return Prediction(sign_id,gloss,score,False,self.version)
