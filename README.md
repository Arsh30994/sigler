# SIGLER — AX-1 Foundation

Local, frontend-only integration lab for AX-1. It intentionally excludes all platform services, authentication, AI orchestration, translation, speech, camera input, and networking.

## Run

```bash
npm install
npm run dev
```

Validation commands: `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`.

## Current asset status

The browser loads the production AX-1 export at `assets/ax1/exports/AX1.glb` through `GLTFLoader`. Its generated `ax1-bone-map.json` validates the documented deform bones and semantic controller roles before the viewer enables head tracking. `assets/ax1/source/AX1.blend` remains the Blender source; `assets/ax1/renders/` contains modelling and rig-inspection renders.

`frontend/src/avatar/registry/approvedSigns.ts` deliberately contains no signs. A production record must include the typed evidence fields in `ApprovedSign`, including a human reviewer, review date, source, and version. The app does not generate or assert ISL signs.

## Architecture

- `frontend/src/avatar/rig/runtime.ts`: GLB loader, real-bone validation, mixer initialization, and disposal.
- `frontend/src/avatar/animation/AnimationScheduler.ts`: pure playback state machine (play, pause, resume, stop and slow speed).
- `frontend/src/avatar/registry/approvedSigns.ts`: approved-only registry boundary and validation.
- `frontend/src/features/avatar-viewer/`: model and canvas interaction boundary.

The visual toggle simulates the scheduler ownership lock; it is intentionally not a sign animation. Retain the channel priority: approved sign, system feedback, idle mouse head, ambient idle.
