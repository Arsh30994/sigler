import numpy as np
from research.sign_to_text.config import FEATURE_DIMENSION
from research.sign_to_text.landmarks import HandLandmarks, frame_features
from research.sign_to_text.sequence_recorder import SequenceRecorder
from research.sign_to_text.dataset_manager import DatasetManager
from research.sign_to_text.quality import quality_report, training_readiness
from research.sign_to_text.sign_registry import DatasetSign
from research.sign_to_text.splits import signer_separated_split
def hand(side):
    points=np.arange(63,dtype=np.float32).reshape(21,3); points[9]=[2,3,4]; return HandLandmarks(side,points)
def test_features_are_fixed_and_ordered():
    values,presence=frame_features([hand('Right')]); assert values.shape==(FEATURE_DIMENSION,); assert presence.tolist()==[False,True]
def test_recorder_rejects_incomplete():
    recorder=SequenceRecorder(); recorder.start(); recorder.add(np.zeros(FEATURE_DIMENSION),np.array([True,False]));
    try: recorder.sample(); assert False
    except ValueError: assert True
def test_dataset_save_load(tmp_path):
    manager=DatasetManager(tmp_path); meta=manager.save('TEST','TEST',np.zeros((30,FEATURE_DIMENSION)),np.zeros((30,2),bool),'session','signer'); assert meta.label=='TEST'; assert manager.load(meta.sample_id)[0]['sample_id']==meta.sample_id; assert manager.inspect()['samples']==1
def test_quality_and_signer_split(tmp_path):
    manager=DatasetManager(tmp_path); samples=[]
    for signer in ('a','b','c'):
        meta=manager.save('VERIFIED','GLOSS',np.random.default_rng(ord(signer)).random((30,FEATURE_DIMENSION),dtype=np.float32),np.ones((30,2),bool),'session',signer); samples.append(manager.load(meta.sample_id)[0])
    assert quality_report(manager)['valid_samples']==3
    train,test=signer_separated_split(samples); assert {x['participant_id'] for x in train}.isdisjoint({x['participant_id'] for x in test})
    registry={'VERIFIED':DatasetSign('VERIFIED','GLOSS','test','two hands','VERIFIED','COLLECTING')}; assert training_readiness(manager,registry,min_samples=4)['ready'] is False
