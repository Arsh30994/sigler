import { Bone } from 'three'
import { describe, expect, it } from 'vitest'
import { Ax1AnimationAdapter } from '../../frontend/src/avatar/adapters/Ax1AnimationAdapter'
import { ReferenceAvatarAdapter } from '../../frontend/src/avatar/adapters/ReferenceAvatarAdapter'
import { sampleAnimation, SharedAnimationEngine } from '../../frontend/src/avatar/shared/engine'
import { resolveSyntheticDemo, syntheticBimanualDemo } from '../../frontend/src/avatar/shared/syntheticDemo'

function rig() {
  const names = ['AX1_HEAD', 'AX1_L_SHOULDER', 'AX1_L_UPPER_ARM', 'AX1_L_FOREARM', 'AX1_L_HAND', 'AX1_R_SHOULDER', 'AX1_R_UPPER_ARM', 'AX1_R_FOREARM', 'AX1_R_HAND']
  for (const side of ['L', 'R']) for (const digit of ['THUMB', 'INDEX', 'MIDDLE', 'RING', 'LITTLE']) for (const segment of digit === 'THUMB' ? ['01', '02'] : ['01', '02', '03']) names.push(`AX1_${side}_${digit}_${segment}`)
  const bones = new Map(names.map((name) => { const bone = new Bone(); bone.name = name; return [name, bone] as const }))
  return { rig: { bones }, playback: { stop() {} } } as never
}

describe('automatic signing engine', () => {
  it('resolves only the explicit synthetic engineering demonstration', () => {
    expect(resolveSyntheticDemo('synthetic demo')?.validationStatus).toBe('SYNTHETIC_TEST')
    expect(resolveSyntheticDemo('hello')).toBeNull()
  })
  it('interpolates independent left and right finger targets', () => {
    const frame = sampleAnimation(syntheticBimanualDemo, 1250)
    expect(frame.left?.fingers.index?.mcp).not.toBe(frame.right?.fingers.index?.mcp)
    expect(frame.left?.fingers.thumb?.opposition).toBeGreaterThan(0)
  })
  it('applies two hands and restores AX-1 neutral bone rotations', () => {
    const asset = rig(); const adapter = new Ax1AnimationAdapter(asset); const left = asset.rig.bones.get('AX1_L_INDEX_01')!; const right = asset.rig.bones.get('AX1_R_INDEX_01')!
    adapter.apply(syntheticBimanualDemo, 1250)
    expect(left.quaternion.equals(right.quaternion)).toBe(false)
    expect(left.quaternion.equals(new Bone().quaternion)).toBe(false)
    adapter.reset()
    expect(left.quaternion.equals(new Bone().quaternion)).toBe(true)
  })
  it('honours pause and completion in the shared playback state machine', () => {
    const engine = new SharedAnimationEngine(); engine.load(syntheticBimanualDemo); engine.play(); engine.tick(600); expect(engine.snapshot().keyframe?.atMs).toBe(600); engine.pause(); engine.tick(100); expect(engine.snapshot().elapsedMs).toBe(600); engine.play(); engine.tick(10_000); expect(engine.snapshot().state).toBe('completed')
  })
  it('keeps visual-reference avatars fail-closed until a real rig exists', () => {
    const adapter = new ReferenceAvatarAdapter('animated-female', 'production rig not supplied')
    expect(adapter.supports(syntheticBimanualDemo)).toContain('animated-female is unavailable for signing: production rig not supplied')
  })
})
