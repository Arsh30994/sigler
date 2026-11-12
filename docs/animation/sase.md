# SASE: automatic signing engine

`/signing-demo` is the automatic playback interface. Normal users select an avatar, enter a supported identifier and use play/pause/resume/stop; there are no individual-joint controls on this route.

The only installed asset is `SYNTHETIC_BIMANUAL_HAND_DEMO`. It drives AX-1's independent left/right fingers, thumb opposition, shoulders, forearms, wrists and head through the shared motion format. It is intentionally labelled `SYNTHETIC_TEST` and has no ISL meaning.

Approved ISL playback remains blocked until a human-reviewed registry record, approved motion asset, and compatibility validation exist. The resolver rejects unsupported text and does not turn arbitrary text into movement.

The development-only `/avatar-lab` retains direct joint diagnostics. It is not part of normal automatic playback.
