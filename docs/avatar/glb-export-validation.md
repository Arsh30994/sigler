# AX-1 GLB export validation

Run `assets/ax1/scripts/validate_rig_glb.py` in a clean Blender scene after exporting the rig. The script imports `AX1.glb`, validates every documented deform bone against `ax1-bone-map.json`, checks imported meshes/materials/actions, confirms no external texture dependency, and writes `assets/ax1/exports/glb-validation.json`.

The production viewer uses that same bone-map JSON at runtime. It refuses to mark AX-1 ready if a required exported bone is absent.

Latest clean-import result: 83 AX-1 meshes, one `AX1_RIG` armature with 46 total bones (42 deform bones), all 28 finger phalanges present, three embedded materials, no external textures, and one rig-validation clip. The published GLB is 1,355,480 bytes. The frontend also validates the generated semantic roles (`head`, `chest`, `leftHand`, and `rightHand`) before it enables model controls.
