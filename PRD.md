<<<<<<< HEAD
# SIGLER — Product Requirements Document (PRD)

**Document status:** Draft product baseline  
**Product:** Sigler  
**Initial language scope:** Indian Sign Language (ISL), subject to qualified human validation.

## 1. Product summary

Sigler is an accessibility-focused communication product intended to help signing and non-signing people communicate through two complementary experiences:

- Recognize supported signing through a camera and present the result as text and optional speech.
- Convert supported text or speech into approved sign sequences displayed by an articulated avatar.

The product must be transparent about vocabulary coverage, confidence, and limitations. It is not a universal sign-language translator and must not replace qualified interpreters in high-stakes contexts.

## 2. Problem statement

Communication between signers and non-signers can require an interpreter or another shared communication method. Existing generic speech interfaces do not provide a reliable, linguistically grounded signing experience.

Sigler aims to provide an additional accessible communication aid by combining reviewed sign content, camera-based recognition research, and articulated avatar playback.

## 3. Goals

1. Build a dependable, accessible two-way communication interface.
2. Establish a human-reviewed ISL vocabulary and sign asset library.
3. Demonstrate reliable recognition for a deliberately limited, measured vocabulary.
4. Present supported text/speech input through approved avatar signing sequences.
5. Support multiple validated avatars through a shared animation representation.
6. Make uncertainty, unsupported phrases, and media permissions explicit.
7. Build a maintainable engineering foundation with tests and traceable approvals.

## 4. Non-goals for the initial release

- Universal or unrestricted ISL translation.
- Claiming natural, fluent ISL generation from arbitrary English sentences.
- Replacing professional interpreters, especially in medical, legal, emergency, or other high-stakes settings.
- Treating alphabet/digit handshape images as a continuous sign-language dataset.
- Automatically inventing signs, fingerspelling animations, facial grammar, or transitions.
- Supporting every avatar before its rig and animation quality have been validated.
- Retaining user camera/audio recordings by default.

## 5. Target users and use cases

### Primary user groups

- People who sign and want an additional way to communicate with non-signers.
- Non-signers who need to understand a limited set of supported signs.
- Educators, demonstrators, and accessibility teams evaluating a bounded ISL communication aid.

These groups require user research before broad product claims or release decisions.

### Core use cases

**UC-1: Sign to text**
A signer opens the camera experience, performs a supported sign, and sees the recognized result with appropriate confidence/uncertainty.

**UC-2: Sign to speech**
A signer reviews the recognized text and chooses to have it spoken aloud.

**UC-3: Text to sign**
A user enters a supported phrase, reviews what can be represented, and plays the approved sign sequence on a selected avatar.

**UC-4: Speech to sign**
A user speaks, reviews/corrects the transcript, and plays the supported sign sequence.

**UC-5: Learn and inspect signs**
A user browses approved sign entries, their meaning/usage notes, and available demonstrations.

**UC-6: Change avatar**
A user switches between avatars that have passed rig and sign-playback validation.

## 6. Functional requirements

### FR-1: Mode selection

- The application shall provide clearly labelled Sign → Speech and Speech → Sign modes.
- The selected mode shall be visible at all times.
- Switching modes shall stop the previous media stream before starting another.

### FR-2: Camera capture

- Camera capture shall begin only after an explicit user action and permission.
- The interface shall show camera status and provide a stop control.
- Camera tracks shall be released when capture stops, the mode changes, or the session ends.
- Camera denial and device errors shall have clear recovery guidance.

### FR-3: Sign recognition

- The system shall process only the vocabulary and sign types supported by the active model.
- The recognition result shall include a confidence/quality signal and support an unknown/rejected state.
- The system shall not silently convert low-confidence output into a definite transcript.
- The model shall be evaluated on signer-separated test data.
- Continuous signing shall not be claimed based solely on isolated-sign tests.

### FR-4: Transcript and speech output

- Recognized text shall be visible before optional speech output.
- Users shall be able to stop speech playback.
- Provisional or rejected recognition output shall not be spoken as finalized content.
- The interface shall preserve uncertainty and allow user correction where supported.

### FR-5: Text and speech input

- Users shall be able to enter text.
- If microphone input is implemented, recording shall require explicit permission and action.
- Speech transcription shall be visible and editable before sign playback.
- The system shall identify unsupported phrases instead of generating unapproved signs.

### FR-6: Approved sign library

- Each production sign shall have a stable ID, language, gloss/meaning metadata, evidence, review record, version, and approval status.
- A sign shall be playable in production only when required linguistic and animation approvals are complete.
- Deprecated or rejected records shall not be presented as approved.

### FR-7: Avatar playback

- The renderer shall consume a versioned, renderer-independent animation representation.
- Each avatar shall have a rig adapter and explicit capability validation.
- Playback shall expose play, pause, replay, and stop controls.
- Missing or unsupported articulation channels shall be reported; they shall not be silently omitted while claiming a valid sign.
- A rig-validation animation shall never be labelled as an ISL sign.

### FR-8: Multiple avatars

- Users may select only avatars marked signing-capable after validation.
- The sign content should be reusable across compatible avatars through adapters.
- Each avatar requires independent hand/finger, palm, thumb, body, and relevant non-manual validation.

### FR-9: Accessibility

- Primary controls shall be large and clearly labelled.
- Text shall be scalable and high contrast.
- Core flows shall support keyboard navigation and screen readers.
- Captions/transcripts shall be visible.
- Reduced-motion settings shall be respected.
- Status and errors shall not rely on color alone.

### FR-10: Privacy and consent

- Camera and microphone use shall be explicit and visible.
- Raw media shall not be retained by default.
- Dataset recording shall require informed consent and documented purpose, access, retention, and deletion procedures.
- Any network transmission of media or derived data shall be disclosed.

## 7. Non-functional requirements

- **Reliability:** Unsupported input must fail safely and transparently.
- **Performance:** Measure end-to-end latency on representative target devices before setting numeric release targets.
- **Maintainability:** Typed contracts, modular boundaries, tests, and versioned assets.
- **Accessibility:** Keyboard, touch, screen-reader, contrast, text scaling, and reduced-motion support.
- **Privacy:** Data minimization, explicit permissions, and documented retention.
- **Traceability:** Sign assets and model releases must record provenance and versions.
- **Compatibility:** Avatar support must be based on tested rig capabilities, not file extension or appearance.

## 8. Initial release strategy

### Foundation milestone — current repository focus

- Maintain the AX-1 viewer and rig-validation workspace.
- Validate the exported model and semantic bone mapping.
- Keep sign playback approval-gated.
- Document the sign registry and animation contracts.
- Add automated checks around asset loading and rig capabilities.

### Vocabulary and data milestone

- Select a small vocabulary with an ISL reviewer.
- Create reviewed sign records and reference evidence.
- Collect consented multi-signer video.
- Include idle, transition, no-sign, and unknown samples.
- Create signer-separated dataset splits and a dataset card.

### Recognition research milestone

- Establish simple baselines.
- Compare temporal models only after data quality is understood.
- Report per-class metrics, confusion, rejection performance, and latency.
- Demonstrate bounded recognition before expanding vocabulary.

### Approved avatar playback milestone

- Author a small number of expert-reviewed sign animations.
- Validate full hand and body articulation on AX-1.
- Validate the same animation contract on a second rig only after AX-1 playback is correct.
- Keep unsupported phrases unresolved.

### Communication experience milestone

- Implement accessible mode selection and media lifecycle.
- Add text-to-approved-sign playback.
- Add camera recognition after the offline model is credible.
- Add speech input/output with user-visible transcripts and explicit controls.

## 9. Acceptance criteria

The product is not ready for a public claim of two-way ISL translation until all applicable criteria pass:

- [ ] Vocabulary has qualified ISL review and source evidence.
- [ ] Dataset provenance, consent, and licence are documented.
- [ ] Evaluation uses signer-separated test data.
- [ ] Recognition includes unknown/rejection behavior and published metrics.
- [ ] Continuous signing claims are backed by continuous-sequence evaluation.
- [ ] Every production animation is approved and visually reviewed.
- [ ] Avatar adapters pass articulation and retargeting tests.
- [ ] Unsupported phrases never trigger invented signs.
- [ ] Camera/microphone lifecycle and privacy behavior pass tests.
- [ ] Accessibility checks pass for primary workflows.
- [ ] Build, typecheck, lint, automated tests, and manual demo checks pass.
- [ ] Known limitations are visible to users and documented.

## 10. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Insufficient or unrepresentative data | Poor generalization across signers | Multi-signer collection and signer-separated evaluation |
| Incorrect sign labels | Linguistic harm and loss of trust | Qualified ISL review and evidence traceability |
| Confusing static handshapes with continuous signs | False product claims | Separate experiments and explicit scope |
| Low-confidence predictions | Incorrect communication | Calibrated rejection and user confirmation |
| Incomplete avatar articulation | Incorrect or unintelligible signs | Rig capability checks and human animation review |
| Gloss-to-English oversimplification | Loss of meaning/grammar | Defer fluent translation until linguistic resources exist |
| Media privacy concerns | User harm and adoption risk | Explicit permissions, minimization, retention controls |
| Scope expansion | Unfinished or unverified platform | Milestone gates and bounded acceptance criteria |

## 11. Success measures

Set numeric targets only after baseline measurement and user research. Track:

- Per-class precision, recall, F1, and confusion.
- Unknown/rejection accuracy and false acceptance rate.
- Recognition latency and end-to-end response latency.
- Sign animation review outcomes and rig coverage.
- Task completion and error rate in both communication modes.
- Accessibility test findings and user-reported usability.
- User understanding of system limitations and confidence.

## 12. Open questions

- Who are the first pilot users and what setting will the pilot serve?
- Which ISL vocabulary and reference sources will be approved?
- Which signer groups and recording conditions are required?
- What are the minimum acceptable recognition metrics for the pilot?
- Which avatar is the first production signing avatar?
- What privacy/deployment model is acceptable for the target users?
- Which spoken languages and output voices are in scope?

## Related documents

- [System architecture](ARCHITECTURE.md)
- [Product and interaction design](DESIGN.md)
- [Project memory](MEMORY.md)
## 13. Implementation snapshot — 2026-11-13

Communication Mode is an accessible, local interface at `/communication`. Sign recognition and approved sign playback are intentionally unavailable until validated assets/models exist.
