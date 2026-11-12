# Static handshape research dataset

This module preserves an experimental Kaggle archive separately from Sigler's approved ISL registry, continuous recognition, TCN work, and avatar animation assets. Raw folder names are identifiers only; their language and meanings are unverified.

Run `python tools/build_manifest.py` from this directory to regenerate metadata and a representative contact sheet. Use `python tools/extract_landmarks.py` only when MediaPipe is installed. Baseline experiments are explicitly random-split exploratory results and cannot establish signer-independent generalization because no signer/session metadata was supplied.
