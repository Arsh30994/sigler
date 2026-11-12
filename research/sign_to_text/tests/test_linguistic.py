from research.sign_to_text.linguistic import GlossSequence
from research.sign_to_text.realtime import RecognitionEvent
from research.sign_to_text.sign_registry import DatasetSign
def event(identifier='e1',status='CANDIDATE'): return RecognitionEvent(identifier,'VERIFIED','ignored','now',.9,status,'model')
def registry(): return {'VERIFIED':DatasetSign('VERIFIED','GLOSS','test','hands','VERIFIED','COLLECTING')}
def test_accept_order_duplicate_and_literal():
 s=GlossSequence(registry()); assert s.accept(event()); assert not s.accept(event()); assert s.literal().text=='GLOSS' and not s.literal().validated
def test_unknown_and_unverified_rejected():
 s=GlossSequence({}); assert not s.accept(event()); assert not s.accept(event('e2','UNKNOWN'))
def test_manual_correction_and_speech():
 s=GlossSequence(registry()); s.accept(event()); s.correct('e1','EDITED'); assert s.literal().text=='EDITED'; assert s.speech(False).enabled is False
