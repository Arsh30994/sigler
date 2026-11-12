import torch
from torch import nn

class TemporalBlock(nn.Module):
    def __init__(self, channels, dilation, dropout):
        super().__init__(); padding=dilation
        self.net=nn.Sequential(nn.Conv1d(channels,channels,3,padding=padding,dilation=dilation),nn.ReLU(),nn.Dropout(dropout),nn.Conv1d(channels,channels,3,padding=padding,dilation=dilation),nn.ReLU(),nn.Dropout(dropout))
    def forward(self,x): return self.net(x)[...,:x.shape[-1]]+x

class SignTCN(nn.Module):
    def __init__(self, features, classes, channels=64, dropout=.2):
        super().__init__(); self.features=features; self.input=nn.Conv1d(features,channels,1); self.blocks=nn.Sequential(TemporalBlock(channels,1,dropout),TemporalBlock(channels,2,dropout),TemporalBlock(channels,4,dropout)); self.head=nn.Linear(channels,classes)
    def forward(self,x):
        if x.ndim!=3 or x.shape[-1]!=self.features: raise ValueError(f"expected [batch, frames, {self.features}]")
        return self.head(self.blocks(self.input(x.transpose(1,2))).mean(dim=-1))
