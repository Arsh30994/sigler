import type { ApprovedSign, PlaybackSpeed, SchedulerState } from '../types'

export class AnimationScheduler {
  private state: SchedulerState = 'idle'
  private current: ApprovedSign | null = null
  private speed: PlaybackSpeed = 'natural'
  private elapsed = 0

  play(sign: ApprovedSign, speed: PlaybackSpeed = 'natural') { this.current = sign; this.speed = speed; this.elapsed = 0; this.state = 'playing' }
  pause() { if (this.state === 'playing') this.state = 'paused' }
  resume() { if (this.state === 'paused') this.state = 'playing' }
  stop() { this.state = 'idle'; this.current = null; this.elapsed = 0 }
  tick(delta: number) { if (this.state !== 'playing' || !this.current) return; this.elapsed += delta * (this.speed === 'slow' ? 0.5 : 1); if (this.elapsed >= this.current.durationSeconds) this.stop() }
  snapshot() { return { state: this.state, sign: this.current, elapsed: this.elapsed, speed: this.speed } }
}
