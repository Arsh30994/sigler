import { AnimationMixer, LoopOnce, LoopRepeat, type AnimationAction, type AnimationClip } from 'three'
import { ChannelOwnership, type ChannelOwner } from './channelOwnership'
import type { AvatarChannel, PlaybackSpeed, ProductionSign } from '../types'

/** Thin Three.js adapter; linguistic eligibility and asset validation occur before `prepare`. */
export class MixerPlayback {
  private action: AnimationAction | null = null
  private owner: ChannelOwner | null = null
  private channels: readonly AvatarChannel[] = []
  constructor(private readonly mixer: AnimationMixer, private readonly ownership = new ChannelOwnership()) {}

  prepare(sign: ProductionSign, clips: readonly AnimationClip[]) {
    const clip = clips.find((item) => item.name === sign.animationClip)
    if (!clip) throw new Error(`Animation clip not found: ${sign.animationClip}`)
    this.stop()
    this.owner = 'approved-sign'
    this.channels = sign.requiredChannels
    this.action = this.mixer.clipAction(clip)
    this.action.setLoop(LoopOnce, 1)
    this.action.clampWhenFinished = true
  }
  /**
   * A development-only diagnostic using the animation embedded in AX-1.glb.
   * It is deliberately separate from sign playback and carries no linguistic meaning.
   */
  prepareRigValidation(clips: readonly AnimationClip[]) {
    const clip = clips.find((item) => item.name === 'AX1_RigValidation_AX1_RIG')
    if (!clip) throw new Error('AX-1 rig validation clip is missing from the exported model')
    this.stop()
    this.owner = 'system'
    this.channels = ['head', 'leftArm', 'rightArm', 'hands', 'torso']
    this.action = this.mixer.clipAction(clip)
    this.action.setLoop(LoopRepeat, Infinity)
    this.action.clampWhenFinished = false
  }
  play(speed: PlaybackSpeed = 'natural') {
    if (!this.action || !this.owner) throw new Error('Animation playback was not prepared')
    this.ownership.claim(this.owner, this.channels)
    this.action.reset()
    this.action.paused = false
    this.action.setEffectiveTimeScale(speed === 'slow' ? 0.5 : 1)
    this.action.play()
  }
  pause() { if (this.action) this.action.paused = true }
  resume() { if (this.action) this.action.paused = false }
  stop() {
    this.action?.stop()
    this.action = null
    if (this.owner) this.ownership.release(this.owner)
    this.owner = null
    this.channels = []
  }
  dispose() { this.stop(); this.mixer.stopAllAction() }
}
