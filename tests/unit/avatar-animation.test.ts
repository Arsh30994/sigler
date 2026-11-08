import { describe, expect, it } from 'vitest'
import { AnimationScheduler } from '../../frontend/src/avatar/animation/AnimationScheduler'
import type { SignSpecification } from '../../frontend/src/avatar/types'

const sign: SignSpecification = { signId: 'TEST_FIXTURE', phraseId: 'TEST', label: 'Synthetic test fixture', intendedMeaning: 'No linguistic claim', context: 'unit test', language: 'ISL', handshape: 'test', palmOrientation: 'test', handLocation: 'test', movementSequence: 'test', leftHandBehaviour: 'test', rightHandBehaviour: 'test', requiredFacialExpression: 'neutral', requiredHeadMovement: 'test', requiredTorsoMovement: 'test', sourceReference: 'test fixture', reviewStatus: 'UNREVIEWED', approval: null, version: '0.1', animationUrl: '/test.glb', animationClip: 'test', durationMs: 2000, requiredChannels: ['head'], referencedBones: ['AX1_HEAD'], subtitles: [{ startMs: 500, endMs: 1500, text: 'Test', language: 'en' }], timeline: [{ atMs: 500, kind: 'expression', value: 'neutral' }] }
describe('AnimationScheduler', () => {
  it('refuses unreviewed production playback', () => { const scheduler = new AnimationScheduler(); scheduler.play(sign); expect(scheduler.snapshot().state).toBe('error') })
  it('keeps subtitles and events synchronized while paused and slowed in isolated development playback', () => { const scheduler = new AnimationScheduler(); scheduler.playDevelopment(sign, 'slow'); scheduler.tick(1); expect(scheduler.snapshot().elapsedMs).toBe(500); expect(scheduler.snapshot().activeSubtitle?.text).toBe('Test'); scheduler.pause(); scheduler.tick(5); expect(scheduler.snapshot().elapsedMs).toBe(500); scheduler.resume(); scheduler.tick(3); expect(scheduler.snapshot().state).toBe('completed') })
})
