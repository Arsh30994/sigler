# signBridge Technical Audit for Sigler

**Audit date:** 2026-11-13  
**Source repository:** https://github.com/Uni-Creator/signBridge  
**Source branch inspected:** `main`  
**Model repository:** https://huggingface.co/Creator-090/isl-swin3d-model  
**Purpose:** Evaluate reusable recognition components for Sigler without importing signBridge's Flutter application or replacing Sigler's AX-1 architecture.

> This is a source-level integration audit, not a reproduction of the reported accuracy. Repository claims are labelled as such. The external model-serving implementation and checkpoint internals were not available in the inspected source tree.

## 1. Executive decision

**Recommendation: keep signBridge as a research/integration candidate behind a separate recognition provider. Do not replace VSRS V1 or merge signBridge wholesale into Sigler yet.**

The public repository documents a video-based ISL word classifier using Swin3D-S, MediaPipe hand/pose processing, a FastAPI WebSocket application backend, and a separate model API. This is architecturally compatible with a future FastAPI recognition service for Sigler.

However, the inspected repository does not contain the actual Swin3D inference server implementation. Its `backend/app/models/model.py` is an HTTP client that sends clips to an external model API. The Hugging Face model repository currently exposes only `ISL_best_model.pt` (227,921,863 bytes); no model source, config, preprocessing implementation, or label-map file was present in that repository listing. Therefore, the checkpoint cannot be safely loaded or reproduced from the inspected artifacts alone.

## 2. Source inventory inspected

### GitHub repository

- `README.md`: architecture, model description, dataset, metrics, setup and claimed test coverage.
- `backend/pyproject.toml`: backend runtime dependencies.
- `backend/app/models/model.py`: model API client and frame/video request logic.
- `backend/app/websocket/websocket_processing.py`: MediaPipe initialization, landmark overlay, frame resize/JPEG encoding, and inference dispatch.
- `backend/app/websocket/frame_codec.py`: custom binary JPEG frame container.
- `backend/app/websocket/websocket_handler.py`: WebSocket configuration, frame buffering, concurrency limits and inference result delivery.
- `docs/camera-frame-consistency.md`: Flutter camera frame conversion and lifecycle notes.
- `LICENSE`: MIT licence for the repository code.

### External model repository

The Hugging Face model repository listing contained:

- `ISL_best_model.pt` — 227,921,863 bytes (approximately 217.3 MiB).

No other model files were listed at the time of inspection.

## 3. Recognition model claims from README

The README describes:

| Property | Repository-reported value |
|---|---|
| Model | Swin3D-S / Video Swin Transformer Small |
| Pretraining | Kinetics-400 |
| Output classes | 76 ISL word labels |
| Input tensor | 3 × 16 × 224 × 224 |
| Spatial resolution | 224 × 224 |
| Temporal clip | 16 frames |
| Total parameters | 33,112,492 |
| Trainable parameters | 9,510,988 |
| Approximate model size | 126 MB |
| Top-1 accuracy | 66.84% |
| Macro F1 | 0.638 |
| Weighted F1 | 0.648 |
| Test samples | 187 |

The README describes a four-stage backbone with dimensions 96, 192, 384 and 768; the listed block counts are 2, 2, 18 and 2. It says patch embedding and stages 1–2 are frozen while stages 3–4, normalization and the classification head are fine-tuned.

**Important discrepancy to resolve:** the README reports an approximate 126 MB model size, while the currently listed hosted checkpoint is 227,921,863 bytes. These may refer to different representations or checkpoints. Do not assume they are the same artifact or that the reported parameter memory matches the downloaded file size.

The README identifies the training dataset as [Indian Sign Language Words with Landmarks on Kaggle](https://www.kaggle.com/datasets/kaushikyh/indian-sign-language-words-with-landmarks), with 745 train, 234 validation and 187 test samples (1,166 total). It lists 76 word labels.

The reported metrics are repository claims. They have not been independently reproduced. The small test set and lack of inspected signer-level split metadata mean the score must not be treated as production generalization accuracy.

## 4. Source-level findings

### 4.1 Backend dependency manifest

The backend uses Python >=3.12,<3.14 and declares:

- FastAPI and Uvicorn
- Firebase Admin
- MediaPipe 1.0.1
- NumPy
- Pillow
- OpenCV headless
- Requests
- python-dotenv
- SlowAPI
- Pydantic

The project description string in `pyproject.toml` still says "Flask REST API and WebSocket sign-language translation", although the dependencies and README describe FastAPI. Treat this as stale metadata, not proof that the backend is Flask.

### 4.2 Model API client

`backend/app/models/model.py` defines `ISLModelAPI`. It reads `BASE_URL` from the environment and targets:

- `/predict_frames_bin`
- `/predict`
- `/health`
- `/health/deep`

The primary frame path requires exactly 16 frames. It JPEG-encodes frames as needed, packs them into the ISLF binary container and POSTs an `application/octet-stream` request. The client uses a persistent Requests session, a 15-second prediction timeout and a retry loop for selected failures.

The fallback video path writes a temporary MP4 under `/tmp`, POSTs it as multipart video, then removes it unless `SAVE_TEST_VIDEOS=1`.

**Integration implication:** this module is an API client, not the Swin3D model loader. It does not expose model construction, checkpoint loading, tensor transforms, class-index mapping or the actual prediction implementation.

### 4.3 MediaPipe and frame processing

`websocket_processing.py`:

- Loads MediaPipe Tasks APIs.
- Resolves pose and hand `.task` files using environment variables and documented search paths.
- Creates a PoseLandmarker and a HandLandmarker with `num_hands=2`.
- Draws detected pose and hand landmarks onto the input image.
- Resizes processed frames to 224 × 224.
- Encodes JPEG at quality 80.
- Wraps image and JPEG bytes in a `BufferedFrame`.
- Dispatches a 16-frame list to the model API.

The code sets `RESPECT_LANDMARK_VISIBILITY = False` by default and strips visibility/presence scores before drawing to preserve its previous drawing behaviour. It also allows the server to continue with landmark drawing disabled when MediaPipe/model files cannot be initialized.

**Critical preprocessing question:** the README describes RGB video clips with center crop, pixel rescaling and mean/std normalization. The application backend shown here draws landmarks onto frames before sending them to the external model API. The actual model server's final decode, colour conversion, resize/crop and normalization code was not present in the inspected repository. Exact training/inference parity is therefore unverified. Do not copy this preprocessing into Sigler until the model server code or a validated reference transform is obtained.

### 4.4 Binary frame codec

`frame_codec.py` defines a small binary container:

- 4 bytes: magic `ISLF`
- 2 bytes: little-endian frame count
- 4 bytes per frame: little-endian JPEG byte length
- Remaining bytes: JPEG payloads concatenated

The decoder checks magic, expected frame count, length-table completeness, per-frame maximum size and total payload length. The documented default expected count is 16.

This codec is a transport detail, not a model requirement. Sigler should adopt it only if transport profiling shows a benefit and should implement it as an isolated, tested adapter.

### 4.5 WebSocket streaming behaviour

The inspected WebSocket handler documents and configures:

- 16-frame inference windows.
- A stride of 6 new frames, producing overlapping windows with 10 frames of overlap.
- Approximately 12.5 incoming frames per second (`FRAME_DELAY = 0.08`).
- A per-connection soft limit of 2 concurrent inference jobs.
- Shared application-level landmark and inference thread pools.
- A maximum of 8 pending decoded-but-not-yet-landmarked frames.
- A 30-second receive timeout.
- Input validation limits and a versioned configuration handshake.
- Supported transport labels include JPEG binary and JSON/base64; H.264/H.265 are described as reserved/not implemented in the inspected handler comments and configuration logic.
- Results are emitted as a label and confidence after validating the response shape.

The comments explicitly distinguish per-connection concurrency from the global shared executor limit. This is a useful design pattern for avoiding per-user thread-pool multiplication.

### 4.6 Camera consistency documentation

The Flutter camera note describes handling Android YUV420 and iOS BGRA8888, respecting row and pixel strides, serializing camera lifecycle operations, and stopping the stream on conversion failure. It also documents that camera conversion remains on the Dart UI isolate and that rotation, mirroring, cropping and YUV colour-range calibration still need comparison with model training preprocessing.

This is useful reference material, but Sigler is a browser-based React application. The Dart camera implementation should not be transplanted into the browser frontend.

## 5. What is reusable, and what is not

| Component | Reuse decision | Reason |
|---|---|---|
| Swin3D checkpoint | Conditional research candidate | Checkpoint exists, but loader and exact preprocessing are missing |
| Model architecture | Needs source/reference implementation | README describes it, but no matching inference code was found in the inspected repo |
| MediaPipe pose/hand concepts | Reusable design reference | Sigler can use its own browser/server capture boundary |
| ISLF binary codec | Optional transport adapter | Not required for initial integration |
| 16-frame overlapping windows | Candidate to benchmark | Depends on model training and latency requirements |
| FastAPI separation | Reuse architectural pattern | Fits Sigler's selected backend preference |
| Firebase authentication | Do not import by default | Sigler should preserve its own auth/system boundaries |
| Flutter client | Do not import | Sigler frontend is React/Vite/TypeScript |
| Translation history implementation | Do not import wholesale | Separate product data model and privacy requirements |
| Sign label list | Research metadata only | Labels need linguistic/source review before production registry use |

## 6. Important limitations and risks

1. **No self-contained model inference code in inspected repository.** The backend calls an external model API. The hosted model repo listing contains a checkpoint only.
2. **No independently verified checkpoint compatibility.** The exact architecture class, state-dict keys, checkpoint format and loading procedure still need to be established.
3. **Preprocessing parity is unknown.** Landmark overlays, colour order, crop, normalization and frame sampling must exactly match the training pipeline.
4. **Accuracy is limited and reported on a small test set.** 66.84% top-1 and macro F1 0.638 do not establish reliable real-world recognition.
5. **Isolated vocabulary is not continuous ISL translation.** A 76-class word classifier does not by itself provide sign segmentation, grammar, facial/non-manual features or natural-language translation.
6. **Dataset provenance and signer split need verification.** Confirm consent, licence, class definitions, signer overlap and recording conditions before relying on the evaluation.
7. **Inference cost is unknown for Sigler's deployment target.** Benchmark CPU and GPU latency, memory, cold start and concurrent users before deployment.
8. **Model output must not directly trigger avatar motion.** Recognition results are candidate glosses only. They must pass vocabulary, confidence, linguistic and animation approval gates.

## 7. Recommended Sigler architecture

Keep the existing React/Vite/TypeScript application and AX-1 avatar workspace unchanged. Add recognition behind a FastAPI service boundary.

Proposed structure (adapt to the actual Sigler repository conventions; do not create a duplicate backend if one already exists):

```text
backend/
  app/
    api/
      routes/
        recognition.py
        health.py
    recognition/
      contracts.py
      provider.py
      providers/
        vsrs_v1.py
        signbridge_swin3d.py
      preprocessing/
        frame_sampling.py
        swin3d_transform.py
      validation/
        confidence.py
        vocabulary.py
    services/
      recognition_service.py
  tests/
    recognition/
      test_contracts.py
      test_frame_sampling.py
      test_unknown_rejection.py
      test_provider_unavailable.py
  models/
    manifests/
      signbridge-swin3d.json
```

This is a proposal, not a claim that these files already exist.

### Provider contract

Both VSRS V1 and signBridge should implement a common interface that accepts a normalized input request and returns:

- provider/model ID and version
- candidate label(s)
- calibrated or explicitly uncalibrated confidence
- timestamp/window metadata
- supported-vocabulary status
- rejection/unknown state
- inference latency
- preprocessing/model error details where relevant

Never compare confidence scores from the two providers as if they were calibrated on the same data.

### Model execution

Do not add the Swin3D provider to production routing until all of the following are available:

- Verified checkpoint checksum and source revision.
- Exact model architecture implementation and checkpoint load test.
- Exact 16-frame sampler and transforms.
- Exact 76-class ordered label map.
- Golden input/output test vectors or a validated reference inference endpoint.
- CPU/GPU latency and memory measurements.
- Per-class evaluation and unknown/rejection behaviour.
- Security review of model loading and external inference communication.

If a model server is used, keep it separate from the application API and protect it with private networking or service authentication. Do not expose the model endpoint directly to browsers.

## 8. Implementation phases and acceptance criteria

### Phase 0 — Artifact and source verification

- Obtain the actual model-serving source or a documented inference endpoint contract.
- Download the checkpoint from its canonical Hugging Face model repository.
- Compute and record SHA-256.
- Inspect the checkpoint keys and tensor shapes without executing untrusted custom code.
- Confirm model architecture and class ordering.
- Record all licences and dataset terms.

**Exit:** checkpoint and reference inference can be loaded/reproduced in an isolated environment.

### Phase 1 — Offline inference proof

- Implement a standalone Python inference harness outside Sigler's production request path.
- Reproduce 16-frame sampling and all preprocessing.
- Run known test samples and compare with the reference implementation.
- Record per-class precision, recall, F1, confusion matrix and latency.
- Verify unknown/out-of-vocabulary handling.

**Exit:** deterministic inference with documented parity and measured evaluation.

### Phase 2 — FastAPI provider adapter

- Add the provider behind the common recognition contract.
- Keep VSRS V1 as an independent provider.
- Add health/readiness checks and timeouts.
- Add bounded concurrency and request-size limits.
- Add tests with mocked inference and a small licensed fixture set.

**Exit:** API integration works without modifying the avatar renderer or sign registry.

### Phase 3 — Controlled UI integration

- Connect camera capture to the recognition service only after explicit permission.
- Show capture and inference status, candidate label and uncertainty.
- Require user review/confirmation before finalizing transcript or speech.
- Keep unsupported predictions out of AX-1 playback.

**Exit:** end-to-end demo with transparent limitations and no false sign playback.

## 9. Security and privacy requirements

- Do not persist camera frames by default.
- Do not log raw frames, credentials or bearer tokens.
- Authenticate service-to-service model requests.
- Enforce maximum image dimensions, frame sizes, clip lengths and request timeouts.
- Bound per-user and global inference concurrency.
- Keep model files read-only in deployment.
- Verify checkpoint integrity before loading.
- Avoid unsafe pickle/joblib loading from untrusted sources. The Swin3D `.pt` checkpoint must be inspected and loaded with the safest compatible PyTorch options.
- Keep user media processing and retention policy explicit.

## 10. Repository and artifact links

- Source: https://github.com/Uni-Creator/signBridge
- README: https://github.com/Uni-Creator/signBridge/blob/main/README.md
- Model: https://huggingface.co/Creator-090/isl-swin3d-model
- Dataset: https://www.kaggle.com/datasets/kaushikyh/indian-sign-language-words-with-landmarks
- Camera notes: https://github.com/Uni-Creator/signBridge/blob/main/docs/camera-frame-consistency.md

## 11. Audit status

**Inspected:** README, backend dependency manifest, model API client, MediaPipe/frame processing, binary frame codec, WebSocket handler configuration/flow, camera consistency note, repository MIT licence, and Hugging Face model repository file listing.

**Not inspected or independently verified:** external model API server source, actual checkpoint internals, training notebook/source, raw dataset contents/licence, full test execution, production deployment, live accuracy, or inference latency.

**Decision:** retain signBridge as a separate research provider candidate. Continue with VSRS V1 as the initial lightweight integration already selected for Sigler. Revisit Swin3D only after Phase 0 and Phase 1 pass.
