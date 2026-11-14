# VSRS V1 recognition integration

## Scope and status

Sigler contains a separate FastAPI service for the official VSRS V1 MLP artifact. It is a bounded isolated-sign classifier with eleven model labels. It is not continuous ISL recognition, sentence translation, speech output, or an approved AX-1 animation source.

The React Communication Mode checks service readiness only. It does not send camera video or landmarks until a browser landmark provider has demonstrated preprocessing parity.

## Source of truth: Hugging Face Storage Bucket

Primary source: [`arshjhawar/VSRS-V1-Models-bucket`](https://huggingface.co/buckets/arshjhawar/VSRS-V1-Models-bucket).

This is a mutable Hugging Face Storage Bucket, not a Git model repository. Setup must not use `hf_hub_download`. It uses the official CLI paths:

```powershell
hf buckets cp hf://buckets/arshjhawar/VSRS-V1-Models-bucket/mlp/model.joblib ./backend/models/vsrs/mlp/model.joblib
hf buckets cp hf://buckets/arshjhawar/VSRS-V1-Models-bucket/mediapipe/hand_landmarker.task ./backend/models/vsrs/mediapipe/hand_landmarker.task
```

`backend/scripts/download_vsrs_model.py` discovers and invokes `hf buckets cp`; only when the CLI is genuinely unavailable does it use the official `huggingface_hub.download_bucket_files` bucket API. It intentionally never calls `hf_hub_download`.

The script downloads the bucket `README.md`, verifies the MLP before any deserialization, and writes `backend/models/vsrs/manifest.json`. Models and manifests are ignored by Git.

## Verified bucket download

Downloaded on **2026-11-14 IST** (`2026-11-13T18:49:49.899835+00:00`) using `hf buckets cp`.

| Bucket path | Local path | Size | SHA-256 | Result |
| --- | --- | ---: | --- | --- |
| `mlp/model.joblib` | `backend/models/vsrs/mlp/model.joblib` | 1,084,552 bytes | `4f13ec96dee5999d2fb6ff8cefbd10d23f80b762ef2ddbe1c7656a5a00b23098` | Matches required fingerprint |
| `mediapipe/hand_landmarker.task` | `backend/models/vsrs/mediapipe/hand_landmarker.task` | 7,819,105 bytes | `fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1` | Downloaded and task-load tested |
| `README.md` | `backend/models/vsrs/README.md` | 11,060 bytes | `2c3cc70fa964e7aad11fad0ab170fe464e9dcf83f41469bf963e44fcf7ba851e` | Downloaded for local provenance |

The bucket is mutable and has no Git-style immutable revision record. The dated local manifest is evidence for this download only; every future setup run must verify the bytes again.

## Actual MLP inspection

The verified joblib object was loaded only after the MLP checksum passed. It contains:

- `sklearn.neural_network.MLPClassifier` and a fitted `sklearn.preprocessing.StandardScaler` with 126 input features.
- Labels in stored order: `cellphone`, `good`, `hello`, `house`, `i`, `loud`, `quiet`, `red`, `shoes`, `teacher`, `time`.
- Eleven-value `predict_proba` output for one 126-value feature vector.
- ReLU activation, Adam solver, hidden layers `(256, 128)`, `alpha=0.01`, `max_iter=500`, and `random_state=42`.

The bucket README describes right-hand indices 0–62, left-hand indices 63–125, zero-filled missing-hand slots, wrist-centred translation, maximum-radius normalization, fitted `StandardScaler` for MLP/SVM, and a five-valid-frame mean-probability window. The FastAPI service implements those documented constraints.

## MediaPipe task compatibility

`mediapipe==1.2.3` was installed in the isolated backend environment. The bucket task loaded successfully through `mediapipe.tasks.python.vision.HandLandmarker` with `num_hands=2` and `RunningMode.IMAGE`.

This proves the downloaded task is load-compatible with that runtime. It does **not** prove browser MediaPipe parity, handedness parity, or real-camera recognition quality. The task model is a hand-landmark extraction dependency, not the ISL classifier.

## API contract and safety

- `GET /health` reports process health only; `GET /ready` reports whether the hash-verified MLP has loaded.
- `POST /api/v1/recognition/predict` accepts a session ID and zero, one or two typed hands; each has exactly 21 finite x/y/z landmarks.
- Invalid dimensions, duplicate handedness, invalid values and degenerate hands are rejected. No-hand input resets the temporal session.
- Five valid predictions are mean-aggregated per session. Without a signer-separated validated threshold, the output remains a `candidate`.
- `human_validated`, `speech_permitted` and `animation_permitted` remain `false`; a model output cannot trigger speech or AX-1 animation by itself.

## Verification performed

- MLP SHA-256 independently calculated and matched the required value.
- MLP classifier, scaler, classes, 126-dimensional input and eleven-value output inspected.
- A standalone normalized synthetic right-hand vector passed through the verified MLP and returned an eleven-value distribution summing to `1.0` (highest synthetic-input label: `i`). This is a pipeline check, not a human-sign result or accuracy measurement.
- MediaPipe task constructed successfully with version 1.2.3.
- Existing backend tests cover landmark ordering, zero-padding, invalid input, temporal isolation, threshold rejection and API availability.

## Commands

```powershell
python -m venv backend/.venv
.\backend\.venv\Scripts\python -m pip install -r backend/requirements.txt
npm run recognition:download-model
.\backend\.venv\Scripts\python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
npm run dev
```

## Limitations and next steps

1. The intended VSRS GitHub implementation repository remained unavailable during this work, so source-code-level extractor parity cannot yet be claimed.
2. Sigler has no browser landmark provider wired to this task, so it transmits neither camera frames nor landmarks.
3. Validate confidence/rejection policy with representative signer-separated data, unknown/no-sign examples and real MediaPipe output before connecting live camera recognition.
4. Obtain qualified ISL review and approved AX-1 animation assets before enabling speech or avatar playback for any VSRS label.
