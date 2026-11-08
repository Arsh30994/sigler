"""Build AX-1 base geometry only. Blender 4.x, no rigging or animation.

Run: blender --background --python scripts/blender/build_ax1_base.py
Outputs are written to artifacts/ax1 relative to the repository root.
"""
import math
import os
import sys
import bpy
from mathutils import Vector

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else os.getcwd()
sys.path.insert(0, SCRIPT_DIR)
from materials import create_materials


def collection(name, parent=None):
    existing = bpy.data.collections.get(name)
    if existing:
        return existing
    result = bpy.data.collections.new(name)
    (parent or bpy.context.scene.collection).children.link(result)
    return result


def clear_ax1():
    for col_name in ("AX1_GEO", "AX1_GUIDES"):
        col = bpy.data.collections.get(col_name)
        if not col:
            continue
        for obj in list(col.objects):
            bpy.data.objects.remove(obj, do_unlink=True)


def activate_only(col):
    bpy.context.view_layer.objects.active = None
    for obj in bpy.context.selected_objects:
        obj.select_set(False)
    bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[col.name]


def assign(obj, material, col):
    for current in list(obj.users_collection):
        current.objects.unlink(obj)
    col.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def smooth(obj):
    if hasattr(obj.data, "polygons"):
        for polygon in obj.data.polygons:
            polygon.use_smooth = True


def uv_sphere(name, location, scale, material, col):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth(obj)
    return assign(obj, material, col)


def cube(name, location, scale, material, col, bevel=0.03):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    modifier = obj.modifiers.new("EdgeSoftening", "BEVEL")
    modifier.width = bevel
    modifier.segments = 3
    return assign(obj, material, col)


def cylinder(name, location, radius, depth, material, col, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    bevel = obj.modifiers.new("EdgeSoftening", "BEVEL")
    bevel.width = min(radius * 0.24, 0.018)
    bevel.segments = 2
    smooth(obj)
    return assign(obj, material, col)


def capsule(name, start, end, radius, material, col):
    """Create an arm/finger segment and put origin at its proximal joint."""
    start, end = Vector(start), Vector(end)
    vector = end - start
    length = vector.length
    center = start + vector / 2
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=radius, depth=length, location=center)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(vector.normalized())
    obj.rotation_mode = "XYZ"
    bevel = obj.modifiers.new("EdgeSoftening", "BEVEL")
    bevel.width = radius * 0.28
    bevel.segments = 3
    smooth(obj)
    assign(obj, material, col)
    # Future rigger's useful local origin: proximal joint, not mesh centre.
    bpy.context.view_layer.update()
    cursor = bpy.context.scene.cursor
    cursor.location = start
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
    obj.select_set(False)
    return obj


def hand(side, materials, geo):
    sign = -1 if side == "L" else 1
    base_x, base_y, base_z = sign * 0.88, 1.18, 0.10
    # Palm: wide enough to read orientation; wrist collar remains mechanically distinct.
    cube(f"AX1_{side}_PALM", (base_x, base_y, base_z), (0.135, 0.070, 0.165), materials["armour"], geo, 0.035)
    cylinder(f"AX1_{side}_WRIST", (base_x, base_y - 0.16, base_z), 0.075, 0.11, materials["joint"], geo, (math.pi / 2, 0, 0))
    # Hand is slightly forward (positive Y) and shows a neutral open spread.
    finger_specs = (("INDEX", -0.075, 0.19), ("MIDDLE", -0.025, 0.21), ("RING", 0.030, 0.19), ("LITTLE", 0.078, 0.155))
    for digit, offset, total in finger_specs:
        root = Vector((base_x + sign * offset, base_y + 0.07, base_z + 0.145))
        lengths = (total * 0.43, total * 0.32, total * 0.25)
        current = root
        for index, length in enumerate(lengths, 1):
            # Very slight distal forward curl is geometry only, not an animation pose.
            end = current + Vector((0, length, -0.010 * (index - 1)))
            uv_sphere(f"AX1_{side}_{digit}_J{index - 1}", current, (0.028, 0.028, 0.028), materials["joint"], geo)
            capsule(f"AX1_{side}_{digit}_{index:02d}", current, end, 0.026 - index * 0.003, materials["armour"], geo)
            current = end
        uv_sphere(f"AX1_{side}_{digit}_TIP", current, (0.022, 0.022, 0.022), materials["armour"], geo)
    # Opposing thumb projects across the palm, avoiding armour at its rotational base.
    thumb_root = Vector((base_x + sign * 0.12, base_y + 0.01, base_z + 0.055))
    thumb_mid = thumb_root + Vector((sign * 0.075, 0.065, 0.035))
    thumb_tip = thumb_mid + Vector((sign * 0.020, 0.090, 0.025))
    for index, (start, end) in enumerate(((thumb_root, thumb_mid), (thumb_mid, thumb_tip)), 1):
        uv_sphere(f"AX1_{side}_THUMB_J{index - 1}", start, (0.032, 0.032, 0.032), materials["joint"], geo)
        capsule(f"AX1_{side}_THUMB_{index:02d}", start, end, 0.031 - index * 0.004, materials["armour"], geo)
    uv_sphere(f"AX1_{side}_THUMB_TIP", thumb_tip, (0.026, 0.026, 0.026), materials["armour"], geo)


def arm(side, materials, geo):
    sign = -1 if side == "L" else 1
    shoulder = (sign * 0.61, 1.67, 0.02)
    elbow = (sign * 0.74, 1.28, 0.04)
    wrist = (sign * 0.85, 0.95, 0.08)
    uv_sphere(f"AX1_{side}_SHOULDER_JOINT", shoulder, (0.13, 0.13, 0.13), materials["joint"], geo)
    capsule(f"AX1_{side}_UPPER_ARM", shoulder, elbow, 0.105, materials["armour"], geo)
    uv_sphere(f"AX1_{side}_ELBOW", elbow, (0.10, 0.10, 0.10), materials["joint"], geo)
    capsule(f"AX1_{side}_FOREARM", elbow, wrist, 0.090, materials["armour"], geo)
    hand(side, materials, geo)


def build():
    clear_ax1()
    geo, guides = collection("AX1_GEO"), collection("AX1_GUIDES")
    materials = create_materials()
    # Core assembly: separate mechanical parts, no armature.
    cube("AX1_TORSO", (0, 1.55, 0), (0.44, 0.26, 0.58), materials["armour"], geo, 0.09)
    cube("AX1_CHEST_CORE", (0, 1.80, 0.15), (0.32, 0.08, 0.20), materials["joint"], geo, 0.04)
    cylinder("AX1_NECK", (0, 2.18, 0), 0.105, 0.16, materials["joint"], geo)
    uv_sphere("AX1_HEAD_ARMOUR", (0, 2.43, 0), (0.34, 0.31, 0.34), materials["armour"], geo)
    visor = uv_sphere("AX1_VISOR", (0, 2.43, 0.275), (0.285, 0.20, 0.065), materials["visor"], geo)
    visor.rotation_euler.x = math.radians(90)
    # Shoulder armour keeps exposed joint gap clear.
    for side in ("L", "R"):
        arm(side, materials, geo)
    # A non-rendered signing-space guide at the chest plane.
    cube("AX1_SIGNING_SPACE_GUIDE", (0, 1.48, 0.62), (0.70, 0.72, 0.005), materials["visor_glow"], guides, 0.01)
    bpy.data.objects["AX1_SIGNING_SPACE_GUIDE"].hide_render = True
    bpy.data.objects["AX1_SIGNING_SPACE_GUIDE"].display_type = "WIRE"
    for obj in geo.objects:
        obj["ax1_stage"] = "base_model_unrigged"
    return geo


if __name__ == "__main__":
    build()
    root = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
    output = os.path.join(root, "artifacts", "ax1")
    os.makedirs(output, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(output, "ax1_base_model.blend"))
    bpy.ops.object.select_all(action="DESELECT")
    for obj in bpy.data.collections["AX1_GEO"].objects:
        obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(output, "ax1_base_model.glb"), export_format="GLB", use_selection=True)
    print("AX-1 base model created (unrigged).")
