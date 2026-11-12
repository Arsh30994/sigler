import type { SharedSignAnimation } from './schema'

const hand = (curl = 0, thumbOpposition = 0) => ({
  palmOrientation: 'front' as const, wrist: { rotation: 0 },
  fingers: { thumb: { mcp: curl * .65, pip: curl * .55, opposition: thumbOpposition }, index: { mcp: curl * .72, pip: curl * .88, dip: curl * .62 }, middle: { mcp: curl * .78, pip: curl * .92, dip: curl * .67 }, ring: { mcp: curl * .75, pip: curl * .90, dip: curl * .65 }, little: { mcp: curl * .70, pip: curl * .83, dip: curl * .58 } }, position: [0, 0, 0] as const,
})

/** Engineering-only bimanual movement. It is deliberately not an ISL sign. */
export const syntheticBimanualDemo: SharedSignAnimation = {
  schemaVersion: '1.0', animationId: 'SYNTHETIC_BIMANUAL_HAND_DEMO_V1', signId: 'SYNTHETIC_BIMANUAL_HAND_DEMO', durationMs: 2800, dominantHand: 'both', provenance: 'Sigler engineering rig demonstration; no linguistic meaning.', validationStatus: 'SYNTHETIC_TEST', supportedRuntimes: ['ax1-3d'],
  keyframes: [
    { atMs: 0, left: hand(), right: hand(), leftArm: { shoulder: { flexion: 0 }, elbow: { flexion: 0 } }, rightArm: { shoulder: { flexion: 0 }, elbow: { flexion: 0 } }, head: { rotation: 0 } },
    { atMs: 600, left: hand(.18, .25), right: hand(.18, .25), leftArm: { shoulder: { flexion: -.25 }, elbow: { flexion: .45 } }, rightArm: { shoulder: { flexion: -.25 }, elbow: { flexion: .45 } }, head: { rotation: .12 } },
    { atMs: 1250, left: hand(.92, .78), right: hand(.50, .70), leftArm: { shoulder: { flexion: -.34 }, elbow: { flexion: .65 } }, rightArm: { shoulder: { flexion: -.34 }, elbow: { flexion: .65 } }, head: { rotation: -.10 } },
    { atMs: 1900, left: hand(.25, .45), right: hand(.95, .82), leftArm: { shoulder: { flexion: -.18 }, elbow: { flexion: .40 } }, rightArm: { shoulder: { flexion: -.18 }, elbow: { flexion: .54 } }, head: { rotation: .08 } },
    { atMs: 2800, left: hand(), right: hand(), leftArm: { shoulder: { flexion: 0 }, elbow: { flexion: 0 } }, rightArm: { shoulder: { flexion: 0 }, elbow: { flexion: 0 } }, head: { rotation: 0 } },
  ],
}

export function resolveSyntheticDemo(input: string) { const normalized = input.trim().toLowerCase().replaceAll(/[-_\s]+/g, ' '); return normalized === 'synthetic demo' || input.trim() === syntheticBimanualDemo.signId ? syntheticBimanualDemo : null }
