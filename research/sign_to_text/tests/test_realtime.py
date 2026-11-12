import numpy as np, torch
from research.sign_to_text.config import FEATURE_DIMENSION, FEATURE_SCHEMA_VERSION
from research.sign_to_text.realtime import SequenceBuffer, StableRecognizer, load_checkpoint
from research.sign_to_text.training.model import SignTCN
def test_buffer():
 b=SequenceBuffer(2); b.add(np.zeros(FEATURE_DIMENSION)); b.add(np.ones(FEATURE_DIMENSION)); assert b.ready and b.sequence().shape==(2,FEATURE_DIMENSION); b.reset(); assert not b.ready
def test_checkpoint(tmp_path):
 p=tmp_path/'m.pt'; m=SignTCN(FEATURE_DIMENSION,2,channels=8); torch.save({'state_dict':m.state_dict(),'config':{'features':FEATURE_DIMENSION,'channels':8},'labels':[('A','A'),('B','B')],'feature_schema_version':FEATURE_SCHEMA_VERSION,'model_version':'test'},p); assert load_checkpoint(p).version=='test'
def test_stability():
 class F:
  def predict(self,x):
   from research.sign_to_text.training.inference import Prediction
   return Prediction('A','A',.9,False,'test')
 r=StableRecognizer(F(),2,2); assert r.predict(np.zeros((1,1))) is None; assert r.predict(np.zeros((1,1))).gloss=='A'; r.tracking_lost(); assert r.last is None
