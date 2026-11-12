# Multi-avatar signing architecture

## Actual asset audit

| Avatar | Visual reference | Model asset | Rig / fingers | Playback |
| --- | --- | --- | --- | --- |
| AX-1 | available | `assets/ax1/exports/AX1.glb` | Verified: 46 bones, 28 finger phalanges | Synthetic engineering demonstration verified in browser |
| Animated boy | available | none | none | unavailable |
| Realistic male | available | none | none | unavailable |
| Animated female | available | none | none | unavailable |
| Realistic female | available | none | none | unavailable |

The five supplied images are visual references. They are not production models and are not treated as signing avatars.

## Shared motion format

`SharedSignAnimation` is renderer-independent. It stores timestamped arm, wrist, palm, finger, thumb-opposition, head, body and facial targets in radians. `sampleAnimation` linearly interpolates those targets and never imports Three.js.

An `AvatarAnimationAdapter` owns retargeting. `Ax1AnimationAdapter` maps the shared sequence to documented AX-1 bones. `ReferenceAvatarAdapter` is a fail-closed contract implementation for characters with no model/rig: it always reports why playback cannot begin.

## Human-avatar production gate

Each human avatar needs a neutral full-body mesh; bilateral shoulder, upper-arm, forearm, wrist and hand bones; independently controllable finger phalanges; thumb opposition; weight validation; facial controls; a GLB export; and browser articulation validation. Only then may its adapter report compatible.
