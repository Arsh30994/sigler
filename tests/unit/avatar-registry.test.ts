import { describe, expect, it } from 'vitest'
import { validateApprovedSign } from '../../frontend/src/avatar/registry/approvedSigns'

describe('approved-sign registry validation', () => {
  it('rejects incomplete sign evidence', () => {
    expect(validateApprovedSign({ id: '', label: '', sourceReference: '', meaningContext: '', handshape: '', palmOrientation: '', handLocation: '', movement: '', handBehaviour: '', nonManualFeatures: '', bodyMovement: '', reviewer: '', reviewDate: '', approvalStatus: 'approved', animationVersion: '', durationSeconds: 1, subtitles: [] })).toContain('reviewer is required')
  })
})
