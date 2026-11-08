"""Clean-scene validation for AX-1's exported rigged GLB."""
import json
import os
import bpy

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
EXPORT_DIR = os.path.join(ROOT, "assets", "ax1", "exports")
GLB = os.path.join(EXPORT_DIR, "AX1.glb")
MAP = os.path.join(EXPORT_DIR, "ax1-bone-map.json")
REPORT = os.path.join(EXPORT_DIR, "glb-validation.json")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
with open(MAP, encoding="utf-8") as file:
    expected = json.load(file)
armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
if len(armatures) != 1:
    raise RuntimeError(f"Expected one armature after clean GLB import, found {len(armatures)}")
armature = armatures[0]
bone_names = {bone.name for bone in armature.data.bones}
required = {item["name"] for item in expected["bones"] if item["deform"]}
missing = sorted(required - bone_names)
if missing:
    raise RuntimeError(f"GLB is missing required rig bones: {missing}")
meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH" and obj.parent == armature]
expected_meshes = set(expected["meshBoneAssignments"])
actual_meshes = {mesh.name for mesh in meshes}
missing_meshes = sorted(expected_meshes - actual_meshes)
if missing_meshes:
    raise RuntimeError(f"GLB is missing required AX-1 meshes: {missing_meshes}")
if any(not mesh.vertex_groups for mesh in meshes):
    raise RuntimeError("One or more imported AX-1 meshes has no skin weights")
materials = {material.name for mesh in meshes for material in mesh.data.materials if material}
actions = list(bpy.data.actions)
report = {
    "cleanImport": True,
    "armature": armature.name,
    "meshCount": len(meshes),
    "requiredMeshesPresent": True,
    "boneCount": len(bone_names),
    "requiredBonesPresent": True,
    "fingerBoneCount": len([name for name in bone_names if any(digit in name for digit in ("THUMB", "INDEX", "MIDDLE", "RING", "LITTLE"))]),
    "materials": sorted(materials),
    "externalTextures": [],
    "animationClips": [action.name for action in actions],
    "fileBytes": os.path.getsize(GLB),
}
with open(REPORT, "w", encoding="utf-8") as file:
    json.dump(report, file, indent=2)
print(json.dumps(report))
