import { AnimationClip } from 'three'
import { describe, expect, it } from 'vitest'
import { validateSignAsset } from '../../frontend/src/avatar/animation/assetValidation'
import { developmentExamples } from '../../frontend/src/avatar/registry/approvedSigns'

describe('sign asset validation', () => {
  it('reports review status, unavailable channels, missing bones, and clips without approving the record', async () => {
    const result = await validateSignAsset(developmentExamples[0], { loader: { load: async () => ({ animations: [new AnimationClip('other')] }) }, availableBones: new Set(), controllableChannels: new Set(['head']) })
    expect(result.eligibleForProduction).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('UNREVIEWED'), expect.stringContaining('uncontrollable channels'), expect.stringContaining('animation clip not found')]))
  })
})
