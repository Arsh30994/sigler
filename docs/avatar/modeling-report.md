# AX-1 base-model approval report

## Status

The reproducible Blender build script is present at `assets/ax1/scripts/build_ax1.py`. It creates an unrigged upper-body candidate, applies reusable materials, configures studio lighting, saves a versioned `.blend`, exports a convenience GLB, and renders an approval package. It does not create or modify an armature.

## Execution result — 9 November 2026

Blender 4.2.16 LTS generated the following unapproved `v0.1` candidate successfully:

- `assets/ax1/source/AX1-base-v0.1.blend`
- `assets/ax1/source/AX1-base-v0.1.glb`
- `assets/ax1/renders/approval/v0.1/ax1_01_front.png`
- `assets/ax1/renders/approval/v0.1/ax1_02_side.png`
- `assets/ax1/renders/approval/v0.1/ax1_03_three_quarter.png`
- `assets/ax1/renders/approval/v0.1/ax1_04_head_visor_closeup.png`
- `assets/ax1/renders/approval/v0.1/ax1_05_left_hand_closeup.png`
- `assets/ax1/renders/approval/v0.1/ax1_06_right_hand_closeup.png`
- `assets/ax1/renders/approval/v0.1/ax1_07_full_upper_body.png`
- `assets/ax1/renders/approval/v0.1/08_signing_space_demonstration.png`
- `assets/ax1/approval/v0.1/approval-manifest.json`

The saved `AX1_PRODUCTION` scene contains 83 mesh components and 20,218 evaluated polygons. Components include the head shell, visor, torso, neck, two shoulder assemblies, upper arms, elbows, forearms, wrists, palms, 8 non-thumb digits with 3 segments each, and 2 thumbs with 2 segments each. Materials are `M_AX1_Armour`, `M_AX1_Joint`, and `M_AX1_Visor`; exact component-to-material assignments are in the approval manifest.

## Reproducible command

From the repository root, with Blender 4.x installed and available as `blender`:

```powershell
blender --background --python assets/ax1/scripts/build_ax1.py
blender --background assets/ax1/source/AX1-base-v0.1.blend --python-expr "import bpy; bpy.ops.wm.open_mainfile(filepath='assets/ax1/source/AX1-base-v0.1.blend')"
```

The first command is the generation command. The second is a reopen check; it must be followed by opening all eight PNGs and visually verifying proportions, mirror symmetry, individual finger gaps, thumb opposition clearance, joint visibility, signing-space clearance, and visor reflections.

## Remaining quality-gate work

The generation, reopen and render gates are complete. The candidate remains **pending human visual approval**. Identified limitations: the armour is a low-density modular blockout, there is no production-grade edge-flow or continuous skin topology, joints have only static clearance review, the visor has no expression geometry, and the demonstration pose is a temporary render transform rather than a rig test. No new rigging or sign-animation work is authorized until the project owner approves this candidate.
