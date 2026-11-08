import { describe, expect, it } from 'vitest'
import { approvedSigns, developmentExamples, isProductionEligible, validateSignSpecification } from '../../frontend/src/avatar/registry/approvedSigns'

describe('approved-sign registry validation', () => {
  it('keeps production registry empty and prevents the unreviewed example from production playback', () => { expect(approvedSigns).toHaveLength(0); expect(isProductionEligible(developmentExamples[0])).toBe(false) })
  it('requires human approval metadata for an APPROVED record', () => { expect(validateSignSpecification({ ...developmentExamples[0], reviewStatus: 'APPROVED' })).toContain('APPROVED records require human approval metadata') })
})
