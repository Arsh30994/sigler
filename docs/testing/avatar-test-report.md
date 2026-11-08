# AX-1 release validation report

Date: 9 November 2026. Scope: AX-1 asset, rig integration, reviewed-sign boundary, and development workspace only.

## Executed checks

| Area | Evidence | Result |
|---|---|---|
| GLB loading and material rendering | Browser GLTFLoader inspection; Blender clean re-import | Pass |
| Meshes, bone map, and fingers | Blender validation: 83 meshes, 46 bones, 28 finger phalanges, all required mesh/bone mappings present | Pass |
| Wrist/arm/finger rig fixtures | Existing Blender validation clip and front/side/three-quarter open, fist, and opposition renders | Pass in Blender fixture; no browser per-joint control surface |
| Neutral reset and idle tracking | Workspace reset, pointer-leave/blur code path, exponential head offset limited to `AX1_HEAD` | Pass by code and browser inspection |
| Head tracking during signing | `ChannelOwnership` unit coverage prevents an idle mouse claim over an approved-sign claim | Partial: no approved asset exists for end-to-end playback |
| Visor/facial controller | Presentation selector is explicitly preview-only; GLB has no expression morphs or facial tracks | Limitation |
| Scheduler and timeline | 15 unit tests cover reject/pause/resume/slow/timeline event synchronization | Pass for data/scheduler layer |
| Playback controls and registry | Empty approved registry; UI disables playback and explains the lock | Pass as safe failure; no production playback to validate |
| WebGL fallback, keyboard, resize, touch | Playwright desktop and narrow fallback tests; touch pointer is ignored by head tracker; 390px real GLB inspection | Pass for browser/emulation baseline |
| Asset failure paths | Unit coverage for corrupted/missing load, missing clip, missing bone, unknown ID, rejected/unreviewed state, disposal, and rapid ownership changes | Pass |

## Linguistic review

There are no `APPROVED` sign records and no published sign animation assets. Therefore no animation has been marked linguistically valid, and none has source/reviewer/manual/non-manual/version evidence to audit. This is intentional and blocks sign playback release.

## Test results

- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm test`: pass after the final audit additions.
- `npm run test:e2e`: desktop workspace and narrow fallback pass.
- Blender clean re-import: pass.

One intermediate Playwright run failed because `getByText('Development controls')` matched both the panel and footer. The assertion was changed to an exact panel label and the rerun passed. No product defect was hidden by this fix.
