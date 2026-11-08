# AX-1 skeletal rig hierarchy

`AX1_RIG` is a mechanical, rigid-part armature. The generated model is assembled from separate armour, joint and digit meshes; each mesh has one documented full-weight vertex group plus an Armature modifier. This preserves the skeleton in GLB while avoiding soft blended deformation across mechanical joints.

## Body

`AX1_ROOT → AX1_SPINE → AX1_CHEST → AX1_UPPER_CHEST → AX1_NECK → AX1_HEAD`

The head bone owns the shell and visor. Chest and upper-chest separate torso posture from shoulder placement.

## Arms

Each side follows `AX1_[L|R]_SHOULDER → UPPER_ARM → FOREARM → HAND`. Shoulder joints, elbow modules, forearms, wrist modules and palms are assigned to the corresponding nearest bone to preserve their mechanical separation.

## Digits

Index, middle, ring and little fingers each use three phalanges: `01 → 02 → 03`. The actual model has two thumb modules, represented by `THUMB_01 → THUMB_02`, with an opposing thumb-root orientation. Every digit chain is a child of its side’s hand bone and can be animated independently.

## Controls

`CTRL_AX1_CHEST`, `CTRL_AX1_HEAD`, `CTRL_AX1_L_HAND_IK`, and `CTRL_AX1_R_HAND_IK` are non-deforming animator controls. Their constraints begin at zero influence; direct FK deform bones remain the predictable default. Enabling an optional control is an animator decision, not a default hidden override.
