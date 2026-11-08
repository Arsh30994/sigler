import { describe, expect, it } from 'vitest'
import { createSigningSpaceLayout } from './signingSpace'

describe('createSigningSpaceLayout', () => {
  it('keeps the neutral hand presentation plane in front of chest armour', () => {
    const torsoHalfDepth = 0.52
    const layout = createSigningSpaceLayout(torsoHalfDepth, 0.18)

    expect(layout.handPresentationDepth).toBeGreaterThan(torsoHalfDepth)
    expect(layout.shoulderDepth + layout.elbowDepth + layout.wristLocalDepth).toBeCloseTo(layout.handPresentationDepth)
  })
})
