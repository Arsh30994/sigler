import { AnimationClip, AnimationMixer, Object3D } from 'three'
import { describe, expect, it } from 'vitest'
import { MixerPlayback } from '../../frontend/src/avatar/animation/mixerPlayback'
import { ChannelOwnership } from '../../frontend/src/avatar/animation/channelOwnership'
import type { ProductionSign } from '../../frontend/src/avatar/types'

const fixture: ProductionSign = { signId: 'TEST_FIXTURE', phraseId: 'TEST', label: 'Synthetic test fixture', intendedMeaning: 'No linguistic claim', context: 'test', language: 'ISL', handshape: 'test', palmOrientation: 'test', handLocation: 'test', movementSequence: 'test', leftHandBehaviour: 'test', rightHandBehaviour: 'test', requiredFacialExpression: 'neutral', requiredHeadMovement: 'test', requiredTorsoMovement: 'test', sourceReference: 'synthetic fixture', reviewStatus: 'APPROVED', approval: { reviewer: 'synthetic test harness', reviewedAt: '2000-01-01' }, version: '0.1', animationUrl: '/test.glb', animationClip: 'missing', durationMs: 1, requiredChannels: ['head'], referencedBones: [], subtitles: [], timeline: [] }

describe('MixerPlayback', () => {
  it('fails a missing clip and disposes actions without leaving a running controller', () => { const playback = new MixerPlayback(new AnimationMixer(new Object3D())); expect(() => playback.prepare(fixture, [])).toThrow('Animation clip not found'); expect(() => playback.dispose()).not.toThrow() })
  it('claims only declared sign channels for the action lifetime', () => {
    const ownership = new ChannelOwnership()
    const playback = new MixerPlayback(new AnimationMixer(new Object3D()), ownership)
    const clip = new AnimationClip('validated-clip')
    playback.prepare({ ...fixture, animationClip: clip.name, requiredChannels: ['head'] }, [clip])
    playback.play()
    expect(ownership.canWrite('idle-mouse', 'head')).toBe(false)
    expect(ownership.canWrite('idle-mouse', 'hands')).toBe(true)
    playback.stop()
    expect(ownership.canWrite('idle-mouse', 'head')).toBe(true)
  })
  it('uses the embedded rig validation clip as a system-owned diagnostic, never as a sign', () => {
    const ownership = new ChannelOwnership()
    const playback = new MixerPlayback(new AnimationMixer(new Object3D()), ownership)
    playback.prepareRigValidation([new AnimationClip('AX1_RigValidation_AX1_RIG')])
    playback.play()
    expect(ownership.canWrite('idle-mouse', 'head')).toBe(false)
    expect(ownership.canWrite('idle-mouse', 'hands')).toBe(false)
    playback.stop()
    expect(ownership.canWrite('idle-mouse', 'head')).toBe(true)
  })
})
