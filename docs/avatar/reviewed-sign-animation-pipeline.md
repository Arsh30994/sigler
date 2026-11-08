# Reviewed sign animation pipeline

This pipeline is an asset registry and playback boundary, not an ISL translation engine. It does not create signs, infer grammar, or approve linguistic content.

## Registry and approval

`frontend/src/avatar/types.ts` defines `SignSpecification`, including sign/phrase identifiers, intended meaning and context, handshape, orientation, location, movement, independent hand behaviour, face/head/torso requirements, source, timing, required channels, clip name, and referenced bones.

Records have one of four statuses: `APPROVED`, `UNREVIEWED`, `REJECTED`, or `UNAVAILABLE`. `frontend/src/avatar/registry/approvedSigns.ts` is the only production registry and is intentionally empty. Its `ISL_EXAMPLE_001` entry is an isolated `UNREVIEWED` schema example, with no reviewer and no supplied asset; it must never be presented as an ISL result.

`HumanApprovalMetadata` requires a reviewer and review date for an `APPROVED` record. This interface validates the presence of metadata only; it cannot establish linguistic correctness. Human ISL review remains the authority.

## Asset validation and playback

`animation/assetValidation.ts` loads a GLB through an injectable loader and verifies the registry version/sign ID metadata, named animation clip, referenced bones, and required controllable channels. It returns errors for a failed load, mismatch, or missing dependency. A passing asset check does not change review status.

`animation/AnimationScheduler.ts` coordinates all track events and subtitles from one elapsed-time clock. `pause`, `resume`, and slow speed preserve the shared timeline. Production `play` rejects every non-approved record. `playDevelopment` exists only for explicitly isolated development tooling and must be visibly labelled unreviewed.

## Channel ownership

A reviewed sign declares its channels (`head`, `face`, `leftArm`, `rightArm`, `hands`, `torso`). A future mixer adapter must claim those channels for the duration of playback, leaving idle head tracking disabled until the neutral transition completes. The current project has no approved record or approved sign asset, so the viewer remains neutral.

## Test coverage

Unit tests cover production rejection of unreviewed records, approval-metadata validation, timeline pause/slow synchronization, and failed asset/channel/bone/clip validation. Browser tests continue to verify the neutral AX-1 GLB viewer.
