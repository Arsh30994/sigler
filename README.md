# SIGLER — AX-1 Phase 1

Local, frontend-only integration lab for AX-1. It intentionally excludes all platform services, authentication, AI orchestration, translation, speech, camera input, and networking.

## Run

```bash
npm install
npm run dev
```

Validation commands: `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`.

## Current asset status

The viewer renders a clearly marked **procedural development placeholder**, not the final AX-1 asset. A production integration needs a rigged AX-1 GLB with named head, torso, arms, wrists, and individual finger bones; authored clips; and licensing/provenance information.

`src/registry/approvedSigns.ts` deliberately contains no signs. A production record must include the typed evidence fields in `ApprovedSign`, including a human reviewer, review date, source, and version. The app does not generate or assert ISL signs.

## Architecture

- `avatar/Ax1Placeholder.tsx`: render-only temporary robot and additive, delta-time head yaw/pitch offset. Pointer input is bounded at ±25° yaw and ±12° pitch, returns to neutral on leave/blur, ignores touch, and is disabled while signing.
- `avatar/AnimationScheduler.ts`: pure playback state machine (play, pause, resume, stop and slow speed).
- `registry/approvedSigns.ts`: approved-only registry boundary and validation.
- `components/AvatarViewer.tsx`: interaction-canvas input boundary.

The visual toggle simulates the scheduler ownership lock; it is intentionally not a sign animation. When a GLB is supplied, bind model-specific clips and bone channels behind the scheduler, retaining its channel priority: approved sign, system feedback, idle mouse head, ambient idle.
