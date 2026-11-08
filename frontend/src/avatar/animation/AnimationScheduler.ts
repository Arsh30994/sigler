import { isProductionEligible } from '../registry/approvedSigns'
import { projectSignTimeline } from '../timeline/signTimeline'
import type { PlaybackSpeed, SchedulerSnapshot, SchedulerState, SignSpecification } from '../types'

export class AnimationScheduler {
  private state: SchedulerState = 'idle'
  private current: SignSpecification | null = null
  private speed: PlaybackSpeed = 'natural'
  private elapsedMs = 0
  private error: string | null = null

  play(sign: SignSpecification, speed: PlaybackSpeed = 'natural') {
    if (!isProductionEligible(sign)) return this.fail(`Sign ${sign.signId} is ${sign.reviewStatus}; only human-approved records may play in production.`)
    this.current = sign; this.speed = speed; this.elapsedMs = 0; this.error = null; this.state = 'playing'
  }
  /** Development tooling must opt in explicitly and must label its output unreviewed. */
  playDevelopment(sign: SignSpecification, speed: PlaybackSpeed = 'natural') {
    this.current = sign; this.speed = speed; this.elapsedMs = 0; this.error = null; this.state = 'playing'
  }
  pause() { if (this.state === 'playing') this.state = 'paused' }
  resume() { if (this.state === 'paused') this.state = 'playing' }
  stop() { this.state = 'idle'; this.current = null; this.elapsedMs = 0; this.error = null }
  replay() { if (this.current) { this.elapsedMs = 0; this.error = null; this.state = 'playing' } }
  setSpeed(speed: PlaybackSpeed) { this.speed = speed }
  tick(deltaSeconds: number) {
    if (this.state !== 'playing' || !this.current) return
    this.elapsedMs += deltaSeconds * 1000 * (this.speed === 'slow' ? 0.5 : 1)
    if (this.elapsedMs >= this.current.durationMs) { this.elapsedMs = this.current.durationMs; this.state = 'completed' }
  }
  snapshot(): SchedulerSnapshot {
    const sign = this.current
    const frame = sign ? projectSignTimeline(sign, this.elapsedMs) : null
    return { state: this.state, sign, elapsedMs: this.elapsedMs, speed: this.speed, activeSubtitle: frame?.subtitle ?? null, activeEvents: frame?.events ?? [], error: this.error }
  }
  private fail(message: string) { this.state = 'error'; this.error = message; this.current = null; this.elapsedMs = 0 }
}
