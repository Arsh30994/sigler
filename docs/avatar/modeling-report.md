# AX-1 base-model implementation report

## Status

The reproducible Blender build script is present at `assets/ax1/scripts/build_ax1.py`. It creates the requested upper-body component set, applies reusable materials, configures studio lighting and an inspection camera, saves a `.blend`, exports a GLB convenience copy, and renders six required inspection views.

## Execution result — 9 November 2026

Blender 4.2.16 LTS generated and reopened the following artifacts successfully:

- `assets/ax1/source/AX1.blend`
- `assets/ax1/source/AX1_base.glb`
- `assets/ax1/renders/ax1_front.png`
- `assets/ax1/renders/ax1_side.png`
- `assets/ax1/renders/ax1_three_quarter.png`
- `assets/ax1/renders/ax1_head_closeup.png`
- `assets/ax1/renders/ax1_hand_closeup.png`
- `assets/ax1/renders/ax1_upper_body.png`

The saved `AX1_PRODUCTION` scene contains 83 AX-1 mesh objects, including the head shell, visor, both thumbs and 24 named non-thumb finger segments. The image renders were visually inspected after correcting the isolated-scene and camera-axis defects in the build script.

## Reproducible command

From the repository root, with Blender 4.x installed and available as `blender`:

```powershell
blender --background --python assets/ax1/scripts/build_ax1.py
blender --background assets/ax1/source/AX1.blend --python-expr "import bpy; bpy.ops.wm.open_mainfile(filepath='assets/ax1/source/AX1.blend')"
```

The first command is the generation command. The second is a reopen check; it must be followed by opening the six PNGs and visually verifying proportions, mirror symmetry, individual finger gaps, thumb opposition clearance, joint visibility, signing-space clearance, and visor reflections.

## Remaining quality-gate work

The generation, reopen and render gates are complete. The generated concept remains a low-density, modular blockout-quality base model. It requires human visual approval plus mesh-continuity, silhouette, collision and deformation review before an armature or any signing animation is permitted.
