"""Render an inspection preview after build_ax1_base.py has generated the base model."""
import os
import bpy
from mathutils import Vector

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else os.getcwd()
ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
OUT = os.path.join(ROOT, "artifacts", "ax1")


def look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


if not bpy.data.objects.get("AX1_TORSO"):
    raise RuntimeError("Build the AX-1 base model before rendering a preview.")
bpy.context.scene.render.engine = "BLENDER_EEVEE_NEXT"
bpy.context.scene.render.resolution_x = 1200
bpy.context.scene.render.resolution_y = 1200
bpy.context.scene.render.resolution_percentage = 100
bpy.context.scene.world.color = (0.012, 0.020, 0.035)
bpy.ops.object.camera_add(location=(3.8, -5.8, 3.0))
camera = bpy.context.object
look_at(camera, (0, 1.55, 0.05))
bpy.context.scene.camera = camera
for location, energy, size in (((3, -2, 4), 1100, 3.0), ((-3, -1, 2), 800, 2.5), ((0, 3, 4), 600, 2.0)):
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.data.energy, light.data.shape, light.data.size = energy, "DISK", size
    look_at(light, (0, 1.5, 0))
os.makedirs(OUT, exist_ok=True)
bpy.context.scene.render.filepath = os.path.join(OUT, "ax1_preview.png")
bpy.ops.render.render(write_still=True)
print("AX-1 preview rendered.")
