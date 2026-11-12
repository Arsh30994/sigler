from collections import deque
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
import torch, numpy as np
from .config import FEATURE_DIMENSION, FEATURE_SCHEMA_VERSION
from .training.model import SignTCN
from .training.inference import SignInference
@dataclass(frozen=True)
class RecognitionEvent: event_id:str; sign_id:str|None; gloss:str; timestamp:str; confidence:float; status:str; model_version:str
class SequenceBuffer:
 def __init__(self,length=30,features=FEATURE_DIMENSION): self.length=length; self.features=features; self.items=deque(maxlen=length)
 def add(self,frame):
  frame=np.asarray(frame,dtype=np.float32)
  if frame.shape!=(self.features,) or not np.isfinite(frame).all(): raise ValueError('invalid realtime feature frame')
  self.items.append(frame)
 @property
 def ready(self): return len(self.items)==self.length
 def reset(self): self.items.clear()
 def sequence(self):
  if not self.ready: raise ValueError('sequence buffer incomplete')
  return np.stack(self.items)
def load_checkpoint(path):
 checkpoint=torch.load(Path(path),map_location='cpu',weights_only=False); required={'state_dict','config','labels','feature_schema_version','model_version'}
 if not required<=checkpoint.keys(): raise ValueError('incompatible checkpoint metadata')
 config=checkpoint['config']
 if checkpoint['feature_schema_version']!=FEATURE_SCHEMA_VERSION or config['features']!=FEATURE_DIMENSION: raise ValueError('checkpoint feature schema is incompatible')
 model=SignTCN(config['features'],len(checkpoint['labels']),config.get('channels',64),config.get('dropout',.2)); model.load_state_dict(checkpoint['state_dict'])
 return SignInference(model,checkpoint['labels'],checkpoint['model_version'],checkpoint.get('unknown_threshold',.75))
class StableRecognizer:
 def __init__(self,inference,consecutive=3,cooldown_frames=15): self.inference=inference; self.consecutive=consecutive; self.cooldown_frames=cooldown_frames; self.history=deque(maxlen=consecutive); self.cooldown=0; self.last=None
 def tracking_lost(self): self.history.clear(); self.cooldown=0; self.last=None
 def predict(self,sequence):
  prediction=self.inference.predict(sequence)
  if self.cooldown: self.cooldown-=1; return None
  key=prediction.sign_id if not prediction.rejected else 'UNKNOWN'; self.history.append(key)
  if len(self.history)<self.consecutive or len(set(self.history))!=1 or key==self.last: return None
  self.last=key; self.cooldown=self.cooldown_frames
  return RecognitionEvent(str(uuid4()),prediction.sign_id,prediction.gloss or 'UNKNOWN',datetime.now(timezone.utc).isoformat(),prediction.confidence,'UNKNOWN' if prediction.rejected else 'CANDIDATE',prediction.model_version)
