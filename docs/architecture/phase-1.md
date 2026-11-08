# AX-1 Phase 1 architecture

The foundation is deliberately frontend-only. Rendering and canvas interaction are separate from the typed registry and playback state machine. The viewer is the only interaction surface; no communication platform capabilities are included.

An approved-sign implementation must route ownership through the scheduler: approved sign → system feedback → idle head tracking → ambient motion. Mouse movement is a head-only additive offset, bounded and disabled during sign playback.
