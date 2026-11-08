# SIGLER — AX-1 Phase 1

Local, frontend-only integration lab for AX-1. It intentionally excludes all platform services, authentication, AI orchestration, translation, speech, camera input, and networking.

## Run

```bash
npm install
npm run dev
```

Validation commands: `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`.

## Current asset status

The browser viewer currently renders a clearly marked **procedural development placeholder**. The reproducible unrigged AX-1 blockout is available at `assets/ax1/source/AX1.blend` and `assets/ax1/source/AX1_base.glb`, with six inspection renders in `assets/ax1/renders/`. Browser integration is deferred until the model receives base-model approval and a rig map exists; it must not replace the placeholder with whole-body mouse rotation.

`src/registry/approvedSigns.ts` deliberately contains no signs. A production record must include the typed evidence fields in `ApprovedSign`, including a human reviewer, review date, source, and version. The app does not generate or assert ISL signs.

## Architecture

- `avatar/Ax1Placeholder.tsx`: render-only temporary robot and additive, delta-time head yaw/pitch offset. Pointer input is bounded at ±25° yaw and ±12° pitch, returns to neutral on leave/blur, ignores touch, and is disabled while signing.
- `avatar/AnimationScheduler.ts`: pure playback state machine (play, pause, resume, stop and slow speed).
- `registry/approvedSigns.ts`: approved-only registry boundary and validation.
- `components/AvatarViewer.tsx`: interaction-canvas input boundary.

The visual toggle simulates the scheduler ownership lock; it is intentionally not a sign animation. When a GLB is supplied, bind model-specific clips and bone channels behind the scheduler, retaining its channel priority: approved sign, system feedback, idle mouse head, ambient idle.
