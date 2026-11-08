"""Render AX-1 after a clean GLB re-import for visual export verification.

Run from the repository root:
  blender --background --python assets/ax1/scripts/render_glb_import.py
"""
import os
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
GLB = os.path.join(ROOT, "assets", "ax1", "exports", "AX1.glb")
OUTPUT = os.path.join(ROOT, "assets", "ax1", "renders", "rig_validation", "ax1_glb_reimport_front.png")


def aim(camera, target):
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.engine = "BLENDER_EEVEE_NEXT"
bpy.context.scene.render.resolution_x = 800
bpy.context.scene.render.resolution_y = 800
world = bpy.data.worlds.new("AX1 reimport world")
bpy.context.scene.world = world
world.color = (0.008, 0.015, 0.028)
bpy.ops.import_scene.gltf(filepath=GLB)
for obj in sorted((item for item in bpy.context.scene.objects if item.type == "MESH"), key=lambda item: item.dimensions.length, reverse=True)[:8]:
    print(f"MESH {obj.name}: parent={obj.parent.name if obj.parent else None} dimensions={tuple(round(value, 3) for value in obj.dimensions)} location={tuple(round(value, 3) for value in obj.matrix_world.translation)}")

bpy.ops.object.light_add(type="AREA", location=(3.5, 5.5, 5.5))
bpy.context.object.data.energy, bpy.context.object.data.shape, bpy.context.object.data.size = 1200, "DISK", 5.0
aim(bpy.context.object, (0, 1.5, 0))
bpy.ops.object.light_add(type="AREA", location=(-4, 2, 3))
bpy.context.object.data.energy, bpy.context.object.data.size = 650, 4.0
aim(bpy.context.object, (0, 1.5, 0))
bpy.ops.object.camera_add(location=(0, 1.55, 6.2))
camera = bpy.context.object
camera.data.lens = 50
aim(camera, (0, 1.55, 0.05))
bpy.context.scene.camera = camera
bpy.context.scene.render.filepath = OUTPUT
bpy.ops.render.render(write_still=True)
print(OUTPUT)
