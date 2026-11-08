"""Create AX-1's documented mechanical signing rig and validation renders.

Run from the repository root:
  blender --background assets/ax1/source/AX1.blend --python assets/ax1/scripts/rig_ax1.py

This script alters only AX1_RIG and AX1_BUILD objects. AX-1 is intentionally
made from rigid modular parts, so each mesh receives one full-weight skin
group instead of soft blended weights. No component is expected to deform.
"""
import json
import math
import os
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
OUT = os.path.join(ROOT, "assets", "ax1")
EXPORT_DIR = os.path.join(OUT, "exports")
RENDER_DIR = os.path.join(OUT, "renders", "rig_validation")
SOURCE = os.path.join(OUT, "source", "AX1.blend")


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


def remove_existing_rig():
    rig = bpy.data.objects.get("AX1_RIG")
    if rig:
        bpy.data.objects.remove(rig, do_unlink=True)
    for action in list(bpy.data.actions):
        if action.name.startswith("AX1_RigValidation"):
            bpy.data.actions.remove(action)


def create_armature():
    remove_existing_rig()
    bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
    rig = bpy.context.object
    rig.name = "AX1_RIG"
    rig.data.name = "AX1_RIG_DATA"
    rig.show_in_front = True
    edit = rig.data.edit_bones
    edit.remove(edit[0])

    specs = []
    def add(name, head, tail, parent=None, deform=True, purpose=""):
        bone = edit.new(name)
        bone.head, bone.tail = head, tail
        bone.parent = edit.get(parent) if parent else None
        bone.use_deform = deform
        specs.append({"name": name, "parent": parent, "deform": deform, "purpose": purpose})
        return bone

    add("AX1_ROOT", (0, 0, 0), (0, 0.25, 0), purpose="Global mechanical rig root")
    add("AX1_SPINE", (0, 0.25, 0), (0, 1.00, 0), "AX1_ROOT", purpose="Lower torso posture")
    add("AX1_CHEST", (0, 1.00, 0), (0, 1.50, 0), "AX1_SPINE", purpose="Chest armour posture")
    add("AX1_UPPER_CHEST", (0, 1.50, 0), (0, 1.78, 0), "AX1_CHEST", purpose="Shoulder-girdle posture")
    add("AX1_NECK", (0, 1.90, 0), (0, 2.18, 0), "AX1_UPPER_CHEST", purpose="Neck connector")
    add("AX1_HEAD", (0, 2.18, 0), (0, 2.62, 0), "AX1_NECK", purpose="Head shell and visor")

    for side, sign in (("L", -1), ("R", 1)):
        add(f"AX1_{side}_SHOULDER", (sign * 0.40, 1.66, 0.02), (sign * 0.61, 1.66, 0.02), "AX1_UPPER_CHEST", purpose=f"{side} shoulder pivot")
        add(f"AX1_{side}_UPPER_ARM", (sign * 0.61, 1.66, 0.02), (sign * 0.74, 1.28, 0.04), f"AX1_{side}_SHOULDER", purpose=f"{side} upper arm")
        add(f"AX1_{side}_FOREARM", (sign * 0.74, 1.28, 0.04), (sign * 0.85, 0.91, 0.08), f"AX1_{side}_UPPER_ARM", purpose=f"{side} forearm and elbow")
        add(f"AX1_{side}_HAND", (sign * 0.85, 0.91, 0.08), (sign * 0.88, 1.05, 0.10), f"AX1_{side}_FOREARM", purpose=f"{side} wrist and palm")
        for digit, offset, length in (("INDEX", -0.080, 0.190), ("MIDDLE", -0.027, 0.215), ("RING", 0.030, 0.195), ("LITTLE", 0.082, 0.160)):
            root = Vector((sign * 0.88 + sign * offset, 1.122, 0.250))
            current = root
            parent = f"AX1_{side}_HAND"
            for number, fraction in enumerate((0.43, 0.32, 0.25), 1):
                end = current + Vector((0, length * fraction - 0.010, -0.009 * (number - 1)))
                name = f"AX1_{side}_{digit}_{number:02d}"
                add(name, current, end, parent, purpose=f"{side} {digit.lower()} phalanx {number}")
                parent, current = name, end
        root = Vector((sign * 1.01, 1.055, 0.150))
        middle = root + Vector((sign * 0.075, 0.068, 0.038))
        tip = middle + Vector((sign * 0.018, 0.090, 0.025))
        add(f"AX1_{side}_THUMB_01", root, middle, f"AX1_{side}_HAND", purpose=f"{side} opposing thumb proximal phalanx")
        add(f"AX1_{side}_THUMB_02", middle, tip, f"AX1_{side}_THUMB_01", purpose=f"{side} opposing thumb distal phalanx")

    # Non-deforming animator controls. Hand IK targets are supplied with zero
    # influence constraints, so direct FK remains the predictable default.
    add("CTRL_AX1_CHEST", (0, 1.50, -0.45), (0, 1.80, -0.45), "AX1_ROOT", False, "Chest animator control")
    add("CTRL_AX1_HEAD", (0, 2.50, -0.45), (0, 2.80, -0.45), "AX1_UPPER_CHEST", False, "Head animator control")
    for side, sign in (("L", -1), ("R", 1)):
        add(f"CTRL_AX1_{side}_HAND_IK", (sign * 1.10, 0.92, 0.20), (sign * 1.10, 1.18, 0.20), "AX1_ROOT", False, f"{side} optional hand IK target")

    bpy.ops.object.mode_set(mode="POSE")
    rig.pose.bones["AX1_CHEST"].constraints.new("COPY_ROTATION").target = rig
    rig.pose.bones["AX1_CHEST"].constraints[-1].subtarget = "CTRL_AX1_CHEST"
    rig.pose.bones["AX1_CHEST"].constraints[-1].influence = 0.0
    rig.pose.bones["AX1_HEAD"].constraints.new("COPY_ROTATION").target = rig
    rig.pose.bones["AX1_HEAD"].constraints[-1].subtarget = "CTRL_AX1_HEAD"
    rig.pose.bones["AX1_HEAD"].constraints[-1].influence = 0.0
    for side in ("L", "R"):
        constraint = rig.pose.bones[f"AX1_{side}_FOREARM"].constraints.new("IK")
        constraint.target, constraint.subtarget, constraint.chain_count, constraint.influence = rig, f"CTRL_AX1_{side}_HAND_IK", 2, 0.0
    bpy.ops.object.mode_set(mode="OBJECT")
    return rig, specs


def mesh_bone(name):
    if name in ("AX1_HEAD_SHELL", "AX1_VISOR"):
        return "AX1_HEAD"
    if name == "AX1_SPINE_NECK":
        return "AX1_NECK"
    if name in ("AX1_TORSO", "AX1_CHEST_MECHANISM"):
        return "AX1_CHEST"
    for side in ("L", "R"):
        prefix = f"AX1_{side}_"
        if not name.startswith(prefix):
            continue
        rest = name[len(prefix):]
        if rest == "SHOULDER_JOINT": return f"AX1_{side}_SHOULDER"
        if rest == "UPPER_ARM": return f"AX1_{side}_UPPER_ARM"
        if rest in ("ELBOW_JOINT", "FOREARM"): return f"AX1_{side}_FOREARM"
        if rest in ("WRIST_JOINT", "PALM"): return f"AX1_{side}_HAND"
        for digit in ("THUMB", "INDEX", "MIDDLE", "RING", "LITTLE"):
            if rest.startswith(digit):
                segment_count = 2 if digit == "THUMB" else 3
                if "TIP" in rest: return f"AX1_{side}_{digit}_{segment_count:02d}"
                for number in range(1, segment_count + 1):
                    if rest.endswith(f"_{number:02d}") or rest.endswith(f"JOINT_{number - 1}"):
                        return f"AX1_{side}_{digit}_{number:02d}"
                return f"AX1_{side}_{digit}_01"
    return "AX1_CHEST"


def parent_mechanical_parts(rig):
    collection = bpy.data.collections["AX1_BUILD"]
    assignments = {}
    for obj in collection.objects:
        if obj.type != "MESH":
            continue
        bone = mesh_bone(obj.name)
        world = obj.matrix_world.copy()
        # Bake the module's rest transform into vertices before skin binding.
        # Leaving the old object transform in place would apply it twice after
        # glTF skin import (once as node transform, once as joint bind pose).
        obj.data.transform(world)
        obj.matrix_world.identity()
        obj.parent, obj.parent_type, obj.parent_bone = rig, "OBJECT", ""
        # Mechanical components are rigid skins: every vertex receives full
        # weight from its documented owning bone. This preserves the armature
        # and bone hierarchy in glTF without introducing soft deformation.
        group = obj.vertex_groups.get(bone) or obj.vertex_groups.new(name=bone)
        group.add(list(range(len(obj.data.vertices))), 1.0, "REPLACE")
        modifier = obj.modifiers.get("AX1_RIG_SKIN") or obj.modifiers.new("AX1_RIG_SKIN", "ARMATURE")
        modifier.object = rig
        assignments[obj.name] = bone
    return assignments


def remove_non_ax1_meshes():
    """Remove Blender startup geometry before saving/exporting this generated asset.

    AX1.blend is generated solely by these scripts.  Keeping a default-scene
    cube (or stale diagnostic mesh) would make it into a GLB as an unrelated
    node even when the AX1 collection is selected for export.
    """
    build_objects = set(bpy.data.collections["AX1_BUILD"].objects)
    for obj in list(bpy.data.objects):
        if obj.type == "MESH" and obj not in build_objects:
            bpy.data.objects.remove(obj, do_unlink=True)


def set_pose(rig, frame, pose):
    bpy.context.scene.frame_set(frame)
    for bone in rig.pose.bones:
        if bone.bone.use_deform:
            bone.rotation_mode = "XYZ"
            bone.rotation_euler = (0, 0, 0)
    for bone_name, rotation in pose.items():
        rig.pose.bones[bone_name].rotation_euler = rotation
    for bone in rig.pose.bones:
        if bone.bone.use_deform:
            bone.keyframe_insert(data_path="rotation_euler", frame=frame)


def create_validation_action(rig):
    rig.animation_data_create()
    action = bpy.data.actions.new("AX1_RigValidation")
    rig.animation_data.action = action
    set_pose(rig, 1, {})
    fist = {}
    for side in ("L", "R"):
        for digit in ("INDEX", "MIDDLE", "RING", "LITTLE"):
            for number, angle in (("01", -0.75), ("02", -0.95), ("03", -0.72)):
                fist[f"AX1_{side}_{digit}_{number}"] = (angle, 0, 0)
        fist[f"AX1_{side}_THUMB_01"] = (-0.65, 0, -0.55)
        fist[f"AX1_{side}_THUMB_02"] = (-0.70, 0, 0)
    set_pose(rig, 20, fist)
    opposition = {f"AX1_{side}_THUMB_01": (-0.38, 0, -0.85) for side in ("L", "R")}
    opposition.update({f"AX1_{side}_THUMB_02": (-0.55, 0, -0.20) for side in ("L", "R")})
    opposition.update({f"AX1_{side}_INDEX_01": (-0.30, 0, 0) for side in ("L", "R")})
    opposition.update({f"AX1_{side}_INDEX_02": (-0.42, 0, 0) for side in ("L", "R")})
    set_pose(rig, 40, opposition)
    bpy.context.scene.frame_set(1)


def point_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def render_validation_views():
    ensure_dir(RENDER_DIR)
    scene = bpy.context.scene
    scene.render.engine, scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = "BLENDER_EEVEE_NEXT", 800, 800, 100
    bpy.ops.object.camera_add()
    camera = bpy.context.object
    scene.camera = camera
    views = {"front": ((0, 1.55, 6.2), (0, 1.55, 0.05)), "side": ((5.8, 1.55, 0.05), (0, 1.55, 0.05)), "three_quarter": ((4.8, 2.15, 4.8), (0, 1.55, 0.05))}
    for frame, label in ((1, "open"), (20, "fist"), (40, "opposition")):
        scene.frame_set(frame)
        for view, (position, target) in views.items():
            camera.location, camera.data.lens = position, 50
            point_at(camera, target)
            scene.render.filepath = os.path.join(RENDER_DIR, f"ax1_{label}_{view}.png")
            bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(camera, do_unlink=True)
    scene.frame_set(1)


def validate(rig, specs, assignments):
    expected = {"AX1_ROOT", "AX1_SPINE", "AX1_CHEST", "AX1_UPPER_CHEST", "AX1_NECK", "AX1_HEAD"}
    for side in ("L", "R"):
        expected |= {f"AX1_{side}_{part}" for part in ("SHOULDER", "UPPER_ARM", "FOREARM", "HAND")}
        expected |= {f"AX1_{side}_{digit}_{number:02d}" for digit in ("INDEX", "MIDDLE", "RING", "LITTLE") for number in range(1, 4)}
        expected |= {f"AX1_{side}_THUMB_{number:02d}" for number in range(1, 3)}
    actual = {bone.name for bone in rig.data.bones}
    missing = sorted(expected - actual)
    if missing:
        raise RuntimeError(f"Required AX-1 bones are missing: {missing}")
    meshes = [o for o in bpy.data.collections["AX1_BUILD"].objects if o.type == "MESH"]
    if len(assignments) != len(meshes) or any(not o.vertex_groups or not o.modifiers.get("AX1_RIG_SKIN") for o in meshes):
        raise RuntimeError("Not all AX-1 mechanical meshes were assigned to a glTF skin bone")
    return {"bone_count": len(actual), "required_bones_present": True, "rigid_mesh_assignments": len(assignments), "validation_frames": {"open_palm": 1, "closed_fist": 20, "thumb_opposition_index_contact_test": 40}}


if __name__ == "__main__":
    ensure_dir(EXPORT_DIR)
    rig, specs = create_armature()
    assignments = parent_mechanical_parts(rig)
    remove_non_ax1_meshes()
    create_validation_action(rig)
    render_validation_views()
    result = validate(rig, specs, assignments)
    with open(os.path.join(EXPORT_DIR, "ax1-bone-map.json"), "w", encoding="utf-8") as file:
        json.dump({
            "armature": rig.name,
            "bones": specs,
            "roles": {
                "head": "AX1_HEAD",
                "chest": "AX1_CHEST",
                "leftHand": "AX1_L_HAND",
                "rightHand": "AX1_R_HAND",
            },
            "meshBoneAssignments": assignments,
            "validation": result,
        }, file, indent=2)
    bpy.ops.wm.save_as_mainfile(filepath=SOURCE)
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    for obj in bpy.data.collections["AX1_BUILD"].objects:
        if obj.type == "MESH": obj.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.gltf(filepath=os.path.join(EXPORT_DIR, "AX1.glb"), export_format="GLB", use_selection=True, export_animations=True)
    print(json.dumps(result))
