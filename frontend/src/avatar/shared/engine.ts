import type { AnimationKeyframe, ArmPose, FingerPose, HandPose, JointPose, SharedSignAnimation } from './schema'

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'completed'
const lerp = (a: number | undefined, b: number | undefined, t: number) => (a ?? 0) + ((b ?? 0) - (a ?? 0)) * t
const pose = (a: JointPose | undefined, b: JointPose | undefined, t: number): JointPose => ({ flexion: lerp(a?.flexion, b?.flexion, t), spread: lerp(a?.spread, b?.spread, t), rotation: lerp(a?.rotation, b?.rotation, t) })
const finger = (a: FingerPose | undefined, b: FingerPose | undefined, t: number): FingerPose => ({ ...pose(a, b, t), mcp: lerp(a?.mcp, b?.mcp, t), pip: lerp(a?.pip, b?.pip, t), dip: lerp(a?.dip, b?.dip, t), opposition: lerp(a?.opposition, b?.opposition, t) })
const arm = (a: ArmPose | undefined, b: ArmPose | undefined, t: number): ArmPose => ({ shoulder: pose(a?.shoulder, b?.shoulder, t), elbow: pose(a?.elbow, b?.elbow, t), wrist: pose(a?.wrist, b?.wrist, t) })
const hand = (a: HandPose | undefined, b: HandPose | undefined, t: number): HandPose => { const names = ['thumb', 'index', 'middle', 'ring', 'little'] as const; return { palmOrientation: t < .5 ? (a?.palmOrientation ?? b?.palmOrientation ?? 'front') : (b?.palmOrientation ?? a?.palmOrientation ?? 'front'), wrist: pose(a?.wrist, b?.wrist, t), fingers: Object.fromEntries(names.map((name) => [name, finger(a?.fingers[name], b?.fingers[name], t)])), position: [lerp(a?.position[0], b?.position[0], t), lerp(a?.position[1], b?.position[1], t), lerp(a?.position[2], b?.position[2], t)] } }

/** Samples shared keyframes without coupling the data to a renderer or particular rig. */
export function sampleAnimation(animation: SharedSignAnimation, elapsedMs: number): AnimationKeyframe { const later = animation.keyframes.find((frame) => frame.atMs >= elapsedMs) ?? animation.keyframes.at(-1)!; const earlier = [...animation.keyframes].reverse().find((frame) => frame.atMs <= elapsedMs) ?? animation.keyframes[0]!; const span = later.atMs - earlier.atMs; const t = span ? Math.max(0, Math.min(1, (elapsedMs - earlier.atMs) / span)) : 0; return { atMs: elapsedMs, left: hand(earlier.left, later.left, t), right: hand(earlier.right, later.right, t), leftArm: arm(earlier.leftArm, later.leftArm, t), rightArm: arm(earlier.rightArm, later.rightArm, t), head: pose(earlier.head, later.head, t), body: pose(earlier.body, later.body, t), facialExpression: t < .5 ? earlier.facialExpression : later.facialExpression } }

export class SharedAnimationEngine {
  private animation: SharedSignAnimation | null = null; private elapsed = 0; private speed = 1; private state: PlaybackState = 'idle'
  load(animation: SharedSignAnimation) { this.animation = animation; this.elapsed = 0; this.state = 'idle' }
  play() { if (this.animation) this.state = 'playing' }
  pause() { if (this.state === 'playing') this.state = 'paused' }
  stop() { this.elapsed = 0; this.state = 'idle' }
  setSpeed(speed: number) { if (speed <= 0) throw new Error('speed must be positive'); this.speed = speed }
  tick(ms: number) { if (this.state !== 'playing' || !this.animation) return; this.elapsed = Math.min(this.animation.durationMs, this.elapsed + ms * this.speed); if (this.elapsed === this.animation.durationMs) this.state = 'completed' }
  snapshot() { return { state: this.state, elapsedMs: this.elapsed, keyframe: this.frame() } }
  private frame(): AnimationKeyframe | null { return this.animation ? sampleAnimation(this.animation, this.elapsed) : null }
}
