import { describe, expect, it } from 'vitest'
import { AnimationScheduler } from '../../frontend/src/avatar/animation/AnimationScheduler'
import type { ApprovedSign } from '../../frontend/src/avatar/types'

const sign: ApprovedSign = { id: 'test', label: 'Test', sourceReference: 'review', meaningContext: 'test only', handshape: 'n/a', palmOrientation: 'n/a', handLocation: 'n/a', movement: 'n/a', handBehaviour: 'n/a', nonManualFeatures: 'n/a', bodyMovement: 'n/a', reviewer: 'Reviewer', reviewDate: '2026-11-08', approvalStatus: 'approved', animationVersion: '1', durationSeconds: 2, subtitles: [] }
describe('AnimationScheduler', () => {
  it('pauses and completes a sign without advancing while paused', () => { const scheduler = new AnimationScheduler(); scheduler.play(sign); scheduler.tick(1); scheduler.pause(); scheduler.tick(3); expect(scheduler.snapshot().elapsed).toBe(1); scheduler.resume(); scheduler.tick(1); expect(scheduler.snapshot().state).toBe('idle') })
})
