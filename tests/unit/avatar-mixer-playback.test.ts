import { AnimationMixer, Object3D } from 'three'
import { describe, expect, it } from 'vitest'
import { MixerPlayback } from '../../frontend/src/avatar/animation/mixerPlayback'
import type { ProductionSign } from '../../frontend/src/avatar/types'

const fixture: ProductionSign = { signId: 'TEST_FIXTURE', phraseId: 'TEST', label: 'Synthetic test fixture', intendedMeaning: 'No linguistic claim', context: 'test', language: 'ISL', handshape: 'test', palmOrientation: 'test', handLocation: 'test', movementSequence: 'test', leftHandBehaviour: 'test', rightHandBehaviour: 'test', requiredFacialExpression: 'neutral', requiredHeadMovement: 'test', requiredTorsoMovement: 'test', sourceReference: 'synthetic fixture', reviewStatus: 'APPROVED', approval: { reviewer: 'synthetic test harness', reviewedAt: '2000-01-01' }, version: '0.1', animationUrl: '/test.glb', animationClip: 'missing', durationMs: 1, requiredChannels: ['head'], referencedBones: [], subtitles: [], timeline: [] }

describe('MixerPlayback', () => {
  it('fails a missing clip and disposes actions without leaving a running controller', () => { const playback = new MixerPlayback(new AnimationMixer(new Object3D())); expect(() => playback.prepare(fixture, [])).toThrow('Animation clip not found'); expect(() => playback.dispose()).not.toThrow() })
})
