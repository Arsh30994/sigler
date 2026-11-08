import { AnimationClip } from 'three'
import { describe, expect, it } from 'vitest'
import { validateSignAsset } from '../../frontend/src/avatar/animation/assetValidation'
import { developmentExamples } from '../../frontend/src/avatar/registry/approvedSigns'

describe('sign asset validation', () => {
  it('reports review status, unavailable channels, missing bones, and clips without approving the record', async () => {
    const result = await validateSignAsset({ ...developmentExamples[0], referencedBones: ['AX1_HEAD'] }, { loader: { load: async () => ({ animations: [new AnimationClip('other')] }) }, availableBones: new Set(), controllableChannels: new Set(['head']) })
    expect(result.eligibleForProduction).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('UNREVIEWED'), expect.stringContaining('uncontrollable channels'), expect.stringContaining('missing referenced bones'), expect.stringContaining('animation clip not found'), expect.stringContaining('metadata does not match')]))
  })
  it('reports a corrupted or missing animation asset and never makes a rejected record eligible', async () => {
    const rejected = { ...developmentExamples[0], reviewStatus: 'REJECTED' as const }
    const result = await validateSignAsset(rejected, { loader: { load: async () => { throw new Error('corrupt GLB') } }, availableBones: new Set(['AX1_HEAD']), controllableChannels: new Set(rejected.requiredChannels) })
    expect(result.eligibleForProduction).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('REJECTED'), expect.stringContaining('failed to load: corrupt GLB')]))
  })
})
