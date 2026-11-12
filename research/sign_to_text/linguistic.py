"""Transcript and speech contracts; no ISL grammar inference is implemented here."""
from dataclasses import dataclass
from .realtime import RecognitionEvent

@dataclass(frozen=True)
class TranscriptItem: event_id:str; sign_id:str; gloss:str; confidence:float; source:str
@dataclass(frozen=True)
class TranslationResult: text:str; method:str; validated:bool
@dataclass(frozen=True)
class SpeechRequest: text:str; rate:float; enabled:bool

class GlossSequence:
 def __init__(self,registry): self.registry=registry; self.items=[]; self.paused=False; self.seen=set()
 def accept(self,event:RecognitionEvent):
  if self.paused or event.status!='CANDIDATE' or not event.sign_id or event.event_id in self.seen: return False
  sign=self.registry.get(event.sign_id)
  if sign is None or not sign.is_collectable: return False
  self.items.append(TranscriptItem(event.event_id,event.sign_id,sign.gloss,event.confidence,'recognition')); self.seen.add(event.event_id); return True
 def remove(self,event_id): self.items=[item for item in self.items if item.event_id!=event_id]
 def correct(self,event_id,gloss): self.items=[TranscriptItem(item.event_id,item.sign_id,gloss,item.confidence,'manual-correction') if item.event_id==event_id else item for item in self.items]
 def clear(self): self.items.clear(); self.seen.clear()
 def literal(self): return TranslationResult(' '.join(item.gloss for item in self.items),'literal-gloss',False)
 def speech(self,enabled,rate=1.0):
  if not .5<=rate<=2: raise ValueError('speech rate must be between 0.5 and 2')
  return SpeechRequest(self.literal().text,rate,enabled)
