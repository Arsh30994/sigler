# AX-1 rig validation report

The rigging script verified 46 bones, assigned all 83 AX1_BUILD meshes to documented bones, wrote the bone mapping JSON, saved the updated blend file, exported `assets/ax1/exports/AX1.glb`, and rendered open-palm, fist and thumb-opposition poses from front, side and three-quarter viewpoints.

The saved blend was reopened headlessly after generation. The audit confirmed `AX1_RigValidation`, the complete left index and right thumb parent chains, four non-deforming animator controls, and 83 rigid full-weight skinned meshes.

The open, fist and opposition renders were visually inspected. The source model has rigid modular construction, so there are no soft-weight deformation spikes; the fist side view confirms digit curling. No pose in this report represents an approved ISL sign.
