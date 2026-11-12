import numpy as np, torch
from research.sign_to_text.training.model import SignTCN
from research.sign_to_text.training.inference import SignInference
def test_forward_dimensions():
    model=SignTCN(126,3,channels=8); assert model(torch.zeros(2,30,126)).shape==(2,3)
def test_invalid_shape_rejected():
    try: SignTCN(126,2,channels=8)(torch.zeros(1,30,12)); assert False
    except ValueError: assert True
def test_unknown_rejection():
    model=SignTCN(126,2,channels=8)
    output=SignInference(model,[('A','A'),('B','B')],'test',threshold=1.1).predict(np.zeros((30,126),np.float32)); assert output.rejected and output.sign_id is None
