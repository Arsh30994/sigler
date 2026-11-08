# Known AX-1 limitations

- No human-reviewed `APPROVED` sign record or approved sign GLB is available. Production sign playback, linguistic review, and end-to-end track ownership cannot be released.
- The shipped clip is a mechanical rig-validation animation, not an ISL sign.
- Visor presentation selection has no authored morph target, eye/brow/mouth system, or reviewer-approved ISL non-manual grammar.
- Browser workspace does not expose individual finger, wrist, or arm control widgets. Those capabilities are evidenced by the exported rig and Blender validation fixtures only.
- The AX-1 visual model remains a modular blockout candidate pending human character-design approval. It is not a frozen, production-ready character asset.
- Physical Android/low-powered-device GPU, memory, thermal, and frame-stability baselines are not yet recorded.
- Pointer leave and window blur reset head targets in code; direct bone-transform assertions for those events are not yet automated.
