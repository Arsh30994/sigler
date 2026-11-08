"""Standard Blender materials for AX-1's base model. Run through build_ax1_base.py."""
import bpy


def _principled(name, color, metallic, roughness, emission=None):
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.use_nodes = True
    node = material.node_tree.nodes.get("Principled BSDF")
    node.inputs["Base Color"].default_value = (*color, 1.0)
    node.inputs["Metallic"].default_value = metallic
    node.inputs["Roughness"].default_value = roughness
    if emission:
        node.inputs["Emission Color"].default_value = (*emission, 1.0)
        node.inputs["Emission Strength"].default_value = 0.25
    return material


def create_materials():
    return {
        "armour": _principled("M_AX1_Armour", (0.80, 0.87, 0.92), 0.72, 0.24),
        "joint": _principled("M_AX1_Joint", (0.006, 0.010, 0.018), 0.90, 0.20),
        "visor": _principled("M_AX1_Visor", (0.002, 0.004, 0.008), 0.82, 0.08),
        "visor_glow": _principled("M_AX1_VisorGlow", (0.02, 0.12, 0.45), 0.35, 0.22, (0.02, 0.12, 0.45)),
    }
