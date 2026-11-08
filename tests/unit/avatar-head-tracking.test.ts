import { Bone, Euler, Quaternion } from 'three'
import { describe, expect, it } from 'vitest'
import { ChannelOwnership } from '../../frontend/src/avatar/animation/channelOwnership'
import { applyIdleHeadTracking } from '../../frontend/src/avatar/controllers/headTracking'

describe('idle head tracking', () => {
  it('does not overwrite an authored AX-1 head channel while a sign owns it, then resumes after release', () => {
    const head = new Bone()
    head.name = 'AX1_HEAD'
    const neutral = new Quaternion()
    const authoredRotation = new Quaternion().setFromEuler(new Euler(0.18, -0.34, 0.05))
    const ownership = new ChannelOwnership()
    ownership.claim('approved-sign', ['head'])
    head.quaternion.copy(authoredRotation)

    const changedWhileClaimed = applyIdleHeadTracking({
      head,
      neutralRotation: neutral,
      target: { x: 1, y: 1 },
      enabled: true,
      deltaSeconds: 1 / 60,
      ownership,
    })

    expect(changedWhileClaimed).toBe(false)
    expect(head.quaternion.angleTo(authoredRotation)).toBeCloseTo(0)
    expect(ownership.canWrite('idle-mouse', 'hands')).toBe(true)

    ownership.release('approved-sign')
    const changedAfterRelease = applyIdleHeadTracking({
      head,
      neutralRotation: neutral,
      target: { x: 1, y: 1 },
      enabled: true,
      deltaSeconds: 1 / 60,
      ownership,
    })

    expect(changedAfterRelease).toBe(true)
    expect(head.quaternion.angleTo(authoredRotation)).toBeGreaterThan(0.001)
  })
})
