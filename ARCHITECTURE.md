# SIGLER — System Architecture

**Status:** Architecture baseline  
**Scope:** Current AX-1 engineering workspace and the proposed path toward the wider Sigler communication platform.

> This document distinguishes the implemented repository foundation from planned platform capabilities. A component described as planned is not evidence that it exists in the codebase.

## 1. Architectural goals

- Keep sign-language content, animation data, and avatar rendering independent.
- Make every published sign traceable to human-reviewed linguistic evidence and approved animation assets.
- Support multiple avatar rigs through adapters rather than embedding rig-specific bone names in sign definitions.
- Keep recognition uncertainty explicit. Never turn a low-confidence prediction into a confident translation.
- Build and verify small vertical increments with tests, review evidence, and commits.
- Preserve the existing AX-1 workspace while adding capabilities behind clear module boundaries.

## 2. Current repository foundation

The current repository is an AX-1 avatar engineering workspace. Its documented foundation includes:

- React, Vite, TypeScript, Three.js and React Three Fiber.
- AX-1 GLB loading and bone compatibility validation.
- A typed, approval-gated sign-animation registry and playback infrastructure.
- Timeline, scheduler, asset validation, and animation-channel ownership boundaries.
- Blender source/export and validation assets.

The README states that there are currently no approved ISL sign records or approved sign-animation assets. The rig-validation clip is not a sign. Production sign playback must remain disabled until the relevant approval gates are met.

## 3. Target platform context

The longer-term product has two communication directions:

### A. Sign to speech/text

`Camera → Landmark extraction → Sequence normalization → Temporal recognition → Gloss transcript → Reviewed language rendering → Text / optional speech`

Planned modules:

1. **Capture:** Browser camera permission, explicit active state, frame capture, and stream cleanup.
2. **Landmark extraction:** Hand landmarks first; add pose and face features only when the chosen linguistic scope requires them.
3. **Preprocessing:** Coordinate normalization, handedness convention, missing-hand masks, temporal sampling, and quality checks.
4. **Recognition:** A measured baseline followed by a temporal model if data supports it.
5. **Segmentation and rejection:** Detect sign boundaries and return an unknown/uncertain state when evidence is insufficient.
6. **Gloss transcript:** Preserve the recognized gloss sequence before any natural-language rendering.
7. **Language rendering:** Requires reviewed ISL linguistic rules and suitable corpus evidence; do not assume gloss-to-English is a trivial lookup.
8. **Speech output:** Speak only finalized, user-visible recognized text, with uncertainty communicated clearly.

### B. Speech/text to sign

`Text / speech-to-text → Intent and phrase resolution → Approved sign sequence → Avatar-independent animation timeline → Avatar adapter → WebGL renderer`

Planned modules:

1. **Input:** Text entry or microphone with explicit permission and recording state.
2. **Phrase resolver:** Resolve only content covered by the approved sign vocabulary and grammar rules.
3. **Sign registry:** Resolve stable sign IDs to reviewed linguistic metadata and approved animation assets.
4. **Sequence planner:** Compose approved sign units, transitions, and non-manual features where available.
5. **Animation representation:** Store semantic channels and timing independently of a specific skeleton.
6. **Avatar adapter:** Retarget approved motion to a compatible rig and report unsupported channels.
7. **Renderer:** Play the resulting timeline with diagnostics and accessible controls.

Unknown phrases must remain unresolved or be presented as text. Do not invent signs or automatically fabricate fingerspelling assets.

## 4. Core boundaries

| Boundary | Responsibility | Must not do |
| --- | --- | --- |
| Sign registry | Stable IDs, linguistic metadata, approval state, evidence references | Invent signs or silently change meanings |
| Recognition | Produce candidate glosses, confidence, timestamps, and rejection state | Directly manipulate avatar joints |
| Language rendering | Convert reviewed gloss sequences using validated rules | Pretend isolated word labels are fluent ISL |
| Animation schema | Describe semantic motion and timing | Depend on one avatar's bone names |
| Avatar adapter | Map semantic channels to a rig and validate coverage | Claim unsupported articulation is working |
| Renderer | Execute validated timelines and expose playback state | Decide linguistic correctness |
| UI | Capture input, explain state, expose controls and accessibility | Start camera/microphone without user action |

## 5. Proposed data flow and contracts

### Sign record

A sign record should include, at minimum:

- `sign_id`: stable, language-scoped identifier.
- `language`: for example, `ISL`.
- `gloss`: reviewed label, not a claim of one-to-one English equivalence.
- `meaning` and usage notes.
- `source_evidence`: reference video/source, attribution, consent and review record.
- `linguistic_review`: reviewer, date, status, and notes.
- `animation_asset_id`: reference to an approved animation asset.
- `status`: draft, in_review, approved, deprecated, or rejected.
- `version`: immutable content version.

Only records with the required linguistic and animation approvals may be used for production signing.

### Recognition result

A recognition result should preserve:

- Candidate gloss or gloss sequence.
- Start/end timestamps.
- Confidence and calibrated rejection threshold.
- Hand/pose/face input quality indicators.
- Model and preprocessing versions.
- Explicit unknown/no-sign state.

### Animation timeline

The renderer-independent timeline should describe:

- Sign and asset identifiers.
- Duration and timebase.
- Semantic channels: torso, head, shoulders, elbows, wrists, palms, fingers, and optional facial/non-manual channels.
- Keyframes, interpolation metadata, and transition segments.
- Rig capability requirements.
- Provenance and approval metadata.

The exact schema must be versioned and validated before it becomes a shared contract.

## 6. Recognition research strategy

Do not begin by assuming a complex model is necessary. Establish a trustworthy dataset and baseline first.

1. Define a small vocabulary with an ISL reviewer.
2. Collect consented recordings from multiple signers and varied conditions.
3. Include idle, transition, no-sign, and unknown examples.
4. Keep signer-separated training, validation, and test splits.
5. Compare simple baselines before selecting a temporal architecture.
6. Evaluate per-class precision, recall, F1, confusion matrix, rejection quality, and latency.
7. Test continuous segmentation separately from isolated-sign classification.

A Kaggle static handshape image collection, if used, belongs in a separate research experiment until its sign language, labels, provenance, and licence are verified. Static images are not a continuous ISL dataset.

## 7. Security, privacy, and accessibility

- Request camera and microphone permissions only after an explicit user action.
- Show clear camera/microphone active indicators and provide immediate stop controls.
- Stop media tracks when a mode is exited or the session ends.
- Prefer on-device processing where practical; document any data sent to a server.
- Do not retain raw video/audio by default. Any recording dataset workflow needs informed consent, purpose limitation, access controls, and retention rules.
- Provide captions, large controls, keyboard access, high contrast, scalable text, and reduced-motion support.
- Never market the system as a substitute for a qualified human interpreter in high-stakes settings.

## 8. Deployment direction

The current workspace is a local frontend engineering environment. A future platform may introduce a backend for dataset management, model inference, user sessions, and content governance. Choose deployment and API boundaries only after latency, privacy, and offline requirements are measured.

No backend, authentication, hosted inference, or network service should be assumed to exist merely because it appears in this target architecture.

## 9. Quality gates

A milestone is complete only when:

- Its scope and acceptance criteria are written.
- Relevant unit, integration, and end-to-end tests pass.
- Build, typecheck, and lint pass where applicable.
- Human review evidence exists for linguistic or character/animation claims.
- The demo is run and inspected.
- Limitations and known failures are documented.
- The change is committed with a focused message.

## 10. Architecture decision log

Record consequential decisions here using this format:

| Date | Decision | Reason | Status |
| --- | --- | --- | --- |
| 2026-11-12 | Keep the AX-1 workspace as the current implementation baseline; describe full communication flows as target architecture | Avoid conflating planned platform scope with implemented code | Accepted |
| 2026-11-12 | Require human approval and source evidence before publishing an ISL sign or sign animation | Linguistic correctness and provenance are product-critical | Accepted |
| 2026-11-12 | Keep sign/animation representation renderer-independent and use avatar adapters | Enables multiple compatible avatars without duplicating sign content | Proposed; schema validation pending |

## 11. Related documents

- [Product requirements](PRD.md)
- [Product and interaction design](DESIGN.md)
- [Project memory and engineering decisions](MEMORY.md)
- [Repository README](README.md)
