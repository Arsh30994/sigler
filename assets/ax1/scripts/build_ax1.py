"""AX-1 base-model production build for Blender 4.x.

Creates only a modular, unrigged upper-body model. It preserves unrelated scene
collections, replaces only the dedicated AX1_BUILD collection, writes AX1.blend,
exports a GLB convenience copy, and renders six inspection views.

Run from repository root:
  blender --background --python assets/ax1/scripts/build_ax1.py
"""
import math
import os
import bpy
from mathutils import Matrix, Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
OUT = os.path.join(ROOT, "assets", "ax1")
REVISION = "v0.1"
RENDER_DIR = os.path.join(OUT, "renders", "approval", REVISION)
SOURCE_DIR = os.path.join(OUT, "source")
APPROVAL_DIR = os.path.join(OUT, "approval", REVISION)


def named_collection(name, parent=None):
    collection = bpy.data.collections.get(name)
    parent = parent or bpy.context.scene.collection
    if collection is None:
        collection = bpy.data.collections.new(name)
        parent.children.link(collection)
    elif collection.name not in parent.children:
        parent.children.link(collection)
    return collection


def clear_previous_build(collection):
    """Non-destructive: only removes objects previously created in AX1_BUILD."""
    for obj in list(collection.objects):
        bpy.data.objects.remove(obj, do_unlink=True)


def production_scene():
    """Create an isolated render scene without altering an existing user scene."""
    scene = bpy.data.scenes.get("AX1_PRODUCTION")
    if scene is None:
        scene = bpy.data.scenes.new("AX1_PRODUCTION")
    bpy.context.window.scene = scene
    return scene


def material(name, colour, metallic, roughness, emission=None):
    result = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    result.use_nodes = True
    shader = result.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*colour, 1.0)
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    if emission:
        shader.inputs["Emission Color"].default_value = (*emission, 1.0)
        shader.inputs["Emission Strength"].default_value = 0.18
    return result


def move_to(obj, collection, mat=None):
    for existing in list(obj.users_collection):
        existing.objects.unlink(obj)
    collection.objects.link(obj)
    if mat is not None and hasattr(obj.data, "materials"):
        obj.data.materials.append(mat)
    obj["asset"] = "AX-1"
    obj["stage"] = "base_model_unrigged"
    return obj


def smooth(obj):
    for face in getattr(obj.data, "polygons", []):
        face.use_smooth = True


def sphere(name, loc, scale, mat, collection):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, location=loc)
    obj = bpy.context.object
    obj.name, obj.scale = name, scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth(obj)
    return move_to(obj, collection, mat)


def box(name, loc, scale, mat, collection, bevel=0.02):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    obj = bpy.context.object
    obj.name, obj.scale = name, scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    modifier = obj.modifiers.new("Soft armour edge", "BEVEL")
    modifier.width, modifier.segments = bevel, 3
    return move_to(obj, collection, mat)


def cylinder(name, loc, radius, depth, mat, collection, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=radius, depth=depth, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    bevel = obj.modifiers.new("Machined edge", "BEVEL")
    bevel.width, bevel.segments = min(radius * 0.22, 0.015), 2
    smooth(obj)
    return move_to(obj, collection, mat)


def segment(name, start, end, radius, mat, collection):
    """Low-density cylinder segment with origin at the proximal future joint."""
    start, end = Vector(start), Vector(end)
    direction = end - start
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=radius, depth=direction.length, location=start + direction / 2)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(direction.normalized())
    obj.rotation_mode = "XYZ"
    bevel = obj.modifiers.new("Joint clearance bevel", "BEVEL")
    bevel.width, bevel.segments = radius * 0.23, 2
    smooth(obj)
    move_to(obj, collection, mat)
    bpy.context.scene.cursor.location = start
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
    obj.select_set(False)
    return obj


def hand(side, materials, collection):
    sign = -1 if side == "L" else 1
    x, y, z = sign * 0.88, 1.05, 0.10
    box(f"AX1_{side}_PALM", (x, y, z), (0.145, 0.075, 0.165), materials["armour"], collection, 0.035)
    cylinder(f"AX1_{side}_WRIST_JOINT", (x, y - 0.15, z), 0.075, 0.12, materials["joint"], collection, (math.pi / 2, 0, 0))
    # Segment gaps and black joint spheres make all hand articulation visible.
    digits = (("INDEX", -0.080, 0.190), ("MIDDLE", -0.027, 0.215), ("RING", 0.030, 0.195), ("LITTLE", 0.082, 0.160))
    for digit, offset, full_length in digits:
        cursor = Vector((x + sign * offset, y + 0.072, z + 0.150))
        for number, fraction in enumerate((0.43, 0.32, 0.25), 1):
            endpoint = cursor + Vector((0, full_length * fraction - 0.010, -0.009 * (number - 1)))
            sphere(f"AX1_{side}_{digit}_JOINT_{number - 1}", cursor, (0.028, 0.028, 0.028), materials["joint"], collection)
            segment(f"AX1_{side}_{digit}_{number:02d}", cursor, endpoint, 0.028 - number * 0.003, materials["armour"], collection)
            cursor = endpoint
        sphere(f"AX1_{side}_{digit}_TIP", cursor, (0.022, 0.022, 0.022), materials["armour"], collection)
    # Opposing thumb: free of palm armour and directed diagonally across the palm.
    root = Vector((x + sign * 0.130, y + 0.005, z + 0.050))
    middle = root + Vector((sign * 0.075, 0.068, 0.038))
    tip = middle + Vector((sign * 0.018, 0.090, 0.025))
    for number, (start, end) in enumerate(((root, middle), (middle, tip)), 1):
        sphere(f"AX1_{side}_THUMB_JOINT_{number - 1}", start, (0.032, 0.032, 0.032), materials["joint"], collection)
        segment(f"AX1_{side}_THUMB_{number:02d}", start, end, 0.032 - number * 0.004, materials["armour"], collection)
    sphere(f"AX1_{side}_THUMB_TIP", tip, (0.026, 0.026, 0.026), materials["armour"], collection)


def arm(side, materials, collection):
    sign = -1 if side == "L" else 1
    shoulder, elbow, wrist = (sign * 0.61, 1.66, 0.02), (sign * 0.74, 1.28, 0.04), (sign * 0.85, 0.91, 0.08)
    sphere(f"AX1_{side}_SHOULDER_JOINT", shoulder, (0.13, 0.13, 0.13), materials["joint"], collection)
    segment(f"AX1_{side}_UPPER_ARM", shoulder, elbow, 0.105, materials["armour"], collection)
    sphere(f"AX1_{side}_ELBOW_JOINT", elbow, (0.10, 0.10, 0.10), materials["joint"], collection)
    segment(f"AX1_{side}_FOREARM", elbow, wrist, 0.09, materials["armour"], collection)
    hand(side, materials, collection)


def build_model():
    scene = production_scene()
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene["ax1_design_revision"] = REVISION
    scene["ax1_approval_status"] = "pending_human_visual_approval"
    collection = named_collection("AX1_BUILD")
    clear_previous_build(collection)
    materials = {
        "armour": material("M_AX1_Armour", (0.80, 0.87, 0.92), 0.72, 0.24),
        "joint": material("M_AX1_Joint", (0.006, 0.010, 0.018), 0.90, 0.20),
        "visor": material("M_AX1_Visor", (0.002, 0.004, 0.008), 0.82, 0.08),
    }
    # Upper-body mechanical assembly. No armature is created at this stage.
    box("AX1_TORSO", (0, 1.55, 0), (0.44, 0.26, 0.58), materials["armour"], collection, 0.09)
    box("AX1_CHEST_MECHANISM", (0, 1.80, 0.15), (0.32, 0.08, 0.20), materials["joint"], collection, 0.04)
    # Bridges the chest envelope (top ≈ 1.81 m) to the head shell (bottom ≈ 2.12 m).
    cylinder("AX1_SPINE_NECK", (0, 1.98, 0), 0.105, 0.40, materials["joint"], collection, (math.pi / 2, 0, 0))
    sphere("AX1_HEAD_SHELL", (0, 2.43, 0), (0.34, 0.31, 0.34), materials["armour"], collection)
    sphere("AX1_VISOR", (0, 2.43, 0.275), (0.285, 0.20, 0.065), materials["visor"], collection)
    arm("L", materials, collection)
    arm("R", materials, collection)
    return collection


def point_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def set_studio_lights():
    light_collection = named_collection("AX1_BUILD_LIGHTS")
    for obj in list(light_collection.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for number, (position, energy, size) in enumerate((((3, -2, 4), 1100, 3.0), ((-3, -1, 2), 800, 2.5), ((0, 3, 4), 600, 2.0))):
        bpy.ops.object.light_add(type="AREA", location=position)
        light = bpy.context.object
        light.name, light.data.energy, light.data.shape, light.data.size = f"AX1_KEY_{number}", energy, "DISK", size
        point_at(light, (0, 1.5, 0))
        move_to(light, light_collection)


def render_views():
    os.makedirs(RENDER_DIR, exist_ok=True)
    scene = bpy.context.scene
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    if scene.world is None:
        scene.world = bpy.data.worlds.new("AX1_RENDER_WORLD")
    scene.world.color = (0.012, 0.020, 0.035)
    views = {
        # AX-1 uses Blender Y-up, Z-depth. All views therefore preserve Y as
        # camera height and orbit in the X/Z plane around the character.
        "01_front": ((0, 1.55, 6.2), (0, 1.55, 0.05), 50),
        "02_side": ((5.8, 1.55, 0.05), (0, 1.55, 0.05), 50),
        "03_three_quarter": ((4.8, 2.15, 4.8), (0, 1.55, 0.05), 50),
        "04_head_visor_closeup": ((1.8, 2.50, 2.9), (0, 2.40, 0.05), 58),
        "05_left_hand_closeup": ((-2.1, 1.15, 2.4), (-0.88, 1.10, 0.10), 55),
        "06_right_hand_closeup": ((2.1, 1.15, 2.4), (0.88, 1.10, 0.10), 55),
        "07_full_upper_body": ((0, 1.70, 7.0), (0, 1.60, 0.05), 42),
    }
    bpy.ops.object.camera_add()
    camera = bpy.context.object
    camera.name = "AX1_INSPECTION_CAMERA"
    scene.camera = camera
    for name, (position, target, lens) in views.items():
        camera.location, camera.data.lens = position, lens
        point_at(camera, target)
        scene.render.filepath = os.path.join(RENDER_DIR, f"ax1_{name}.png")
        bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(camera, do_unlink=True)


def render_signing_space_pose(collection):
    """Render a non-destructive approval pose; the neutral source remains unchanged."""
    scene = bpy.context.scene
    arm_meshes = [obj for obj in collection.objects if obj.type == "MESH" and obj.name.startswith(("AX1_L_", "AX1_R_"))]
    original_matrices = {obj: obj.matrix_world.copy() for obj in arm_meshes}
    for side, sign in (("L", -1), ("R", 1)):
        pivot = Vector((sign * 0.61, 1.66, 0.02))
        pose_transform = Matrix.Translation(pivot) @ Matrix.Rotation(-0.78, 4, "X") @ Matrix.Translation(-pivot)
        for obj in (item for item in arm_meshes if item.name.startswith(f"AX1_{side}_")):
            obj.matrix_world = pose_transform @ original_matrices[obj]
    bpy.ops.object.camera_add(location=(0, 1.55, 6.5))
    camera = bpy.context.object
    camera.name, camera.data.lens = "AX1_SIGNING_SPACE_CAMERA", 50
    point_at(camera, (0, 1.55, 0.34))
    scene.camera = camera
    scene.render.filepath = os.path.join(RENDER_DIR, "08_signing_space_demonstration.png")
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(camera, do_unlink=True)
    for obj, matrix in original_matrices.items():
        obj.matrix_world = matrix


def approval_manifest(collection):
    os.makedirs(APPROVAL_DIR, exist_ok=True)
    depsgraph = bpy.context.evaluated_depsgraph_get()
    components = []
    polygon_count = 0
    for obj in sorted((item for item in collection.objects if item.type == "MESH"), key=lambda item: item.name):
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        polygons = len(mesh.polygons)
        polygon_count += polygons
        components.append({"name": obj.name, "polygons": polygons, "material": obj.data.materials[0].name if obj.data.materials else None})
        evaluated.to_mesh_clear()
    materials = [{"name": material.name, "metallic": material.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value, "roughness": material.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value} for material in bpy.data.materials if material.name.startswith("M_AX1_")]
    manifest = {"revision": REVISION, "approvalStatus": "pending_human_visual_approval", "source": f"assets/ax1/source/AX1-base-{REVISION}.blend", "polygonCount": polygon_count, "meshComponentCount": len(components), "components": components, "materials": materials}
    import json
    with open(os.path.join(APPROVAL_DIR, "approval-manifest.json"), "w", encoding="utf-8") as file:
        json.dump(manifest, file, indent=2)
    return manifest


def save_and_export(collection):
    os.makedirs(SOURCE_DIR, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCE_DIR, f"AX1-base-{REVISION}.blend"))
    bpy.ops.object.select_all(action="DESELECT")
    for obj in collection.objects:
        if obj.type == "MESH":
            obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(SOURCE_DIR, f"AX1-base-{REVISION}.glb"), export_format="GLB", use_selection=True)


if __name__ == "__main__":
    asset_collection = build_model()
    set_studio_lights()
    render_views()
    render_signing_space_pose(asset_collection)
    manifest = approval_manifest(asset_collection)
    save_and_export(asset_collection)
    print(f"AX-1 {REVISION} base approval package generated: {manifest['polygonCount']} evaluated polygons across {manifest['meshComponentCount']} mesh components.")
