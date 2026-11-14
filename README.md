# SIGLER — AX-1 Foundation

SIGLER is a local engineering workspace for AX-1, a signing-focused humanoid avatar. This repository is deliberately not the end-user communication platform and contains no authentication, translation, speech, camera input, AI orchestration, or network services.

## AX-1 Phase 1 scope

- Exported AX-1 GLB loading with real-bone compatibility validation.
- A responsive React workspace for inspecting the neutral avatar and its development diagnostics.
- A typed, approval-gated sign animation registry, scheduler, timeline, asset validation, and channel-ownership boundary.
- Blender generation, rigging, GLB clean-import validation, and inspection-render scripts.

The project never presents a generated or unreviewed motion as a valid ISL sign.

## Technology

React, Vite, TypeScript, Tailwind CSS, Three.js / React Three Fiber, Vitest, Playwright, ESLint, and Prettier are installed and configured. Tailwind's Vite integration is active; the workspace uses a small purpose-written stylesheet alongside it.

## Install and run

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. The viewer serves the exact reviewed export from `assets/ax1/exports/`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development workspace. |
| `npm run dev:recognition` | Start the local FastAPI VSRS V1 recognition service on port 8000. |
| `npm run recognition:download-model` | Explicitly download from the VSRS storage bucket and SHA-256 verify the official V1 MLP artifact. |
| `npm run test:recognition` | Run FastAPI recognition-service tests. |
| `npm run build` | Type-check and create a production build. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run TypeScript project checks. |
| `npm test` | Run the Vitest unit suite. |
| `npm run test:e2e` | Run Playwright workspace checks. |

## Current asset status

`assets/ax1/exports/AX1.glb` is the actual production model export. The paired `ax1-bone-map.json` is loaded at runtime and validates every required deform bone and semantic role before AX-1 is reported ready. Clean Blender re-import validates 83 meshes, 46 bones (42 deform), 28 finger phalanges, three embedded materials, no external textures, and one rig-validation clip.

The Blender source is `assets/ax1/source/AX1.blend`. Its scripts and renders are under `assets/ax1/scripts/` and `assets/ax1/renders/`. The separate base-design candidate is retained at `assets/ax1/source/AX1-base-v0.1.blend`, together with its human-approval package.

## Current limitations and release gate

There are intentionally no `APPROVED` sign records or approved sign-animation assets. The development workspace therefore disables production playback rather than pretending that the included rig-validation clip is a sign. Visor presentation is a visual preview only; AX-1 currently has no facial morph target or reviewer-approved non-manual grammar system.

Human character-design approval, human ISL approval plus source evidence for each published sign, an approved sign asset with required tracks, and physical lower-powered mobile performance measurements are still required before platform integration. See [the release checklist](docs/avatar/release-checklist.md) and [known limitations](docs/testing/known-limitations.md).
