# AX-1 performance baseline

## Baseline environment

- Windows desktop local Vite server at `127.0.0.1`.
- Headless Chromium through Playwright; this is a reproducible engineering baseline, not representative mobile GPU hardware.
- Viewport: 1440 × 960.

## Recorded measurement

| Metric | Recorded baseline | Initial target |
|---|---:|---:|
| Ready state from navigation | 6.49 s | ≤ 10 s on this local baseline |
| GLB transfer size | 1,355,780 bytes | < 2 MB |
| GLB decoded body size | 1,355,480 bytes | < 2 MB |
| GLB resource duration | 30 ms | Informational: local cache/server dependent |
| JavaScript heap after ready | 42.1 MB used / 50.4 MB total | < 60 MB used on this baseline |
| Rendered clip count | 1 rig-validation clip | Informational; no approved sign clips |

The headless WebGL diagnostic showed 4–6 FPS while screenshots/readback were active. It must not be used as a product frame-rate target. A physical Android device and at least one lower-powered device have not yet been measured; platform integration remains blocked until those measurements establish device-specific FPS, memory, and animation-stability targets.

The real 390px mobile emulation loaded AX-1 successfully after adding the viewport meta tag. It verifies responsive layout and asset loading only, not mobile performance.
