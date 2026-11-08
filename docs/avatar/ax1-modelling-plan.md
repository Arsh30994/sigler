# AX-1 modelling plan

## Scope and stage gate

This stage creates base geometry only. No armature, constraints, animation clips, sign data, facial grammar or controller code is included. Base-model visual approval is mandatory before rigging.

## Reproducible workflow

1. Open Blender 4.x.
2. Run `scripts/blender/build_ax1_base.py` from Blender's Text Editor, or headlessly with `blender --background --python scripts/blender/build_ax1_base.py`.
3. Inspect the output `assets/ax1/source/AX1.blend` and `assets/ax1/source/AX1_base.glb`.
4. Inspect all six images in `assets/ax1/renders/`.
5. Review hand silhouette, finger clearance, shoulder reach and visor proportions. Do not begin rigging until approval is recorded.

## Object organisation

`AX1_GEO` holds modular render meshes; `AX1_GUIDES` holds non-rendered reference markers. Objects are named by side, region and segment, for example `AX1_L_INDEX_02`. Origins are placed at the intended future joint centres. Each finger contains three segments; the thumb has a separate opposing root angle.

The scripts use only Blender's standard `bpy` API and are safe to rerun because they first rebuild their own `AX1_*` collections. They never delete unrelated scene content.
