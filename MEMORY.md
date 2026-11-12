<<<<<<< HEAD
# SIGLER — Project Memory

**Purpose:** A concise, maintained record of durable project context, accepted constraints, decisions, and verified status. This is project memory for contributors—not a record of private user information.

## 1. Project identity

- **Project:** Sigler
- **Repository:** https://github.com/Arsh30994/sigler
- **Initial sign-language scope:** Indian Sign Language (ISL), pending qualified review for every published sign.
- **Current engineering focus:** AX-1 signing-avatar foundation.
- **Long-term direction:** Two-way communication between signing and non-signing people, using camera-based sign recognition, speech/text input, and an articulated avatar.

## 2. Current verified/documented baseline

The repository README documents:

- React, Vite, TypeScript, Three.js / React Three Fiber.
- An AX-1 GLB viewer and real-bone compatibility validation.
- Typed, approval-gated sign animation registry and playback infrastructure.
- Scheduler, timeline, asset validation, and animation-channel ownership boundaries.
- Blender source and export workflow.
- Unit and browser test tooling.

The README also documents that:

- There are no approved ISL sign records or approved sign-animation assets yet.
- The rig-validation clip is not a sign.
- Production sign playback is intentionally disabled until approval requirements are met.
- AX-1 has no facial morph target or reviewer-approved non-manual grammar system at this baseline.
- The repository is an engineering workspace, not yet the full end-user communication platform.

These are repository-documented claims. Re-check the actual code and assets before changing their status.

## 3. Product direction

The target experience has two modes:

1. **Sign to Speech:** camera input → landmark sequence → recognition → gloss transcript → reviewed text rendering → optional speech.
2. **Speech to Sign:** text or speech input → transcription/resolution → approved sign sequence → renderer-independent animation timeline → avatar adapter → WebGL playback.

The product should support multiple avatars over time. Each avatar needs a validated rig and adapter; character artwork alone does not establish signing capability.

## 4. Non-negotiable project rules

- Never label a generated or unreviewed movement as a correct ISL sign.
- Every production sign requires source evidence, consent/attribution where applicable, qualified linguistic review, and approved animation.
- Do not confuse static handshape classification with continuous sign-language recognition.
- Do not treat gloss-to-English as a simple one-to-one mapping or claim fluent translation without linguistic rules and corpus evidence.
- Unknown or low-confidence input must remain unknown/uncertain; do not hallucinate a result.
- Keep recognition independent from avatar joint control.
- Keep sign definitions and animation data independent from a particular avatar skeleton.
- Lottie is for interface feedback, not sign animation.
- Camera and microphone activation must be explicit, visible, and stoppable.
- Preserve the existing AX-1 foundation while adding features incrementally.
- Do not claim a feature is implemented until code, tests, and a working demo support that claim.

## 5. Dataset and recognition research notes

A user-provided Kaggle ZIP was inspected in an earlier project discussion. It contained 900 JPEG images, 36 folders, and 25 images per folder. The folder names appeared to correspond to digits and letters, but the sign language, class mapping, and licence were not established.

Therefore:

- Treat it as an experimental static handshape dataset only.
- Do not call it an ISL dataset until its language and labels are verified.
- Do not use it as evidence of continuous sign recognition.
- Preserve the original files and document provenance, licence, class mapping, and preprocessing.
- Keep any experiment isolated from the approved ISL sign registry.

The recommended recognition research order is:

1. Approve a small vocabulary and reference material with an ISL reviewer.
2. Collect consented video from multiple signers.
3. Include idle, transitions, no-sign, and unknown examples.
4. Record signer/session metadata and maintain signer-separated test data.
5. Establish simple baselines before choosing a temporal model.
6. Measure per-class precision/recall/F1, confusion, rejection quality, and latency.
7. Add continuous segmentation only after isolated-sign evidence is credible.

MediaPipe landmarks and a temporal model are research options, not a validated implementation or model choice.

## 6. Avatar direction

The project has discussed five avatar styles:

- Stylized animated boy.
- AX-1 futuristic robot.
- Realistic male.
- Stylized animated female.
- Realistic female.

These are design targets/references, not proof that five production-ready rigs exist. AX-1 is the current engineering focus. Each additional avatar must pass full-body rig, finger articulation, palm orientation, thumb opposition, retargeting, and visual review before being marked signing-capable.

## 7. Engineering workflow

For every milestone:

1. Write scope, non-goals, dependencies, and acceptance criteria.
2. Inspect the current repository before editing.
3. Implement one bounded increment.
4. Add regression/unit/integration tests.
5. Run build, typecheck, lint, and relevant tests.
6. Run and inspect the demo.
7. Record evidence, limitations, and remaining blockers.
8. Commit the work with a focused message.

Do not stack later phases on an unverified result. If a milestone depends on missing dataset, linguistic review, or rig capability, mark it blocked rather than bypassing the dependency.

## 8. Current status snapshot

| Area | Status | Notes |
| --- | --- | --- |
| AX-1 viewer/workspace | Documented in repository | Verify current branch before relying on details |
| AX-1 rig validation | Documented in repository | Not equivalent to signing validation |
| Approved ISL vocabulary | Not established | Requires reviewer-approved entries |
| Approved sign animations | None documented | Production playback remains gated |
| Static Kaggle images | Experimental input only | Language/licence/class mapping need verification |
| Continuous ISL dataset | Not established | Requires consented multi-signer recordings |
| Sign recognition model | Not established | Baselines and evaluation come first |
| Gloss-to-language translation | Not established | Requires linguistic rules/corpus |
| Multi-avatar production support | Not established | Additional rigs/adapters need validation |
| Full communication platform | Planned | Not part of the documented current workspace |

Update this table only when repository evidence, tests, review records, or demos justify a status change.

## 9. Decision log

| Date | Decision | Status |
| --- | --- | --- |
| 2026-11-12 | Keep the AX-1 engineering workspace distinct from the future end-user platform | Accepted |
| 2026-11-12 | Human approval and evidence are mandatory for production ISL signs and animations | Accepted |
| 2026-11-12 | Validate vocabulary and data before selecting/committing to a recognition model | Accepted |
| 2026-11-12 | Keep experimental static Kaggle data separate from approved ISL content | Accepted |
| 2026-11-12 | Use renderer-independent animation data and per-avatar adapters as the multi-avatar direction | Proposed |

## 10. Update policy

When changing this file:

- Add a dated decision instead of silently rewriting history.
- Mark assumptions as assumptions.
- Link to code, tests, issues, datasets, or review evidence when available.
- Remove stale status only after confirming the replacement.
- Never store API keys, passwords, personal data, or secrets here.

## Related documents

- [System architecture](ARCHITECTURE.md)
- [Product and interaction design](DESIGN.md)
- [Product requirements](PRD.md)
## 11. Implementation snapshot — 2026-11-13

AX-1 is the only rigged avatar. The approved sign registry is empty. Camera/microphone access is opt-in and releases tracks; recognition and speech-to-text are placeholders.
