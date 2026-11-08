import { AnimationMixer, LoopOnce, type AnimationAction, type AnimationClip } from 'three'
import { ChannelOwnership } from './channelOwnership'
import type { PlaybackSpeed, ProductionSign } from '../types'

/** Thin Three.js adapter; linguistic eligibility and asset validation occur before `prepare`. */
export class MixerPlayback {
  private action: AnimationAction | null = null
  private sign: ProductionSign | null = null
  constructor(private readonly mixer: AnimationMixer, private readonly ownership = new ChannelOwnership()) {}

  prepare(sign: ProductionSign, clips: readonly AnimationClip[]) {
    const clip = clips.find((item) => item.name === sign.animationClip)
    if (!clip) throw new Error(`Animation clip not found: ${sign.animationClip}`)
    this.stop()
    this.sign = sign
    this.action = this.mixer.clipAction(clip)
    this.action.setLoop(LoopOnce, 1)
    this.action.clampWhenFinished = true
  }
  play(speed: PlaybackSpeed = 'natural') {
    if (!this.action || !this.sign) throw new Error('Animation playback was not prepared')
    this.ownership.claim('approved-sign', this.sign.requiredChannels)
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
    this.sign = null
    this.ownership.release('approved-sign')
  }
  dispose() { this.stop(); this.mixer.stopAllAction() }
}
