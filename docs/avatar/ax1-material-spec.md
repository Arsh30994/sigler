# AX-1 material specification

| Material | Use | Base colour | Metallic | Roughness | Notes |
|---|---|---|---:|---:|---|
| `M_AX1_Armour` | Shells, limbs, torso | `#E8EEF2` | 0.72 | 0.24 | Satin white ceramic-metal appearance. |
| `M_AX1_Joint` | Neck, elbows, wrists, finger mechanisms | `#101722` | 0.90 | 0.20 | Near-black machined mechanism. |
| `M_AX1_Visor` | Visor shell | `#05090F` | 0.82 | 0.08 | Glossy smoked surface; not facial grammar. |
| `M_AX1_VisorGlow` | Optional future mask areas | `#2D7CFF` | 0.35 | 0.22 | Disabled by default; review required before use. |

Use Principled BSDF materials in Blender. Avoid texture dependencies for the base model. Surface wear, branding, decals, or aggressive lighting should not reduce finger silhouette contrast.
