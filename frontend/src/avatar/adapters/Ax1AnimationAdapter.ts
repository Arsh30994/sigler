import * as THREE from 'three'
import type { LoadedAx1 } from '../rig/runtime'
import type { AvatarAnimationAdapter, AvatarCapabilities } from './AvatarAnimationAdapter'
import { sampleAnimation } from '../shared/engine'
import type { FingerName, JointPose, SharedSignAnimation } from '../shared/schema'

const digits: readonly FingerName[] = ['thumb', 'index', 'middle', 'ring', 'little']
const digitName: Record<FingerName, string> = { thumb: 'THUMB', index: 'INDEX', middle: 'MIDDLE', ring: 'RING', little: 'LITTLE' }
const segments: Record<FingerName, readonly string[]> = { thumb: ['01', '02'], index: ['01', '02', '03'], middle: ['01', '02', '03'], ring: ['01', '02', '03'], little: ['01', '02', '03'] }
const limit = (value: number | undefined, min: number, max: number) => Math.max(min, Math.min(max, value ?? 0))

/**
 * Retargets renderer-independent synthetic/approved movement data to AX-1's
 * exported FK rig. Names and primary axes come from assets/ax1/scripts/rig_ax1.py:
 * each phalanx's validation action is keyed on its local X axis; thumb opposition
 * is the local Z axis. No controls are guessed when a named bone is absent.
 */
export class Ax1AnimationAdapter implements AvatarAnimationAdapter {
  private readonly rest = new Map<string, THREE.Quaternion>()
  constructor(private readonly asset: LoadedAx1) { asset.rig.bones.forEach((bone, name) => this.rest.set(name, bone.quaternion.clone())) }
  capabilities(): AvatarCapabilities { return { runtime: 'ax1-3d', hands: true, independentFingers: true, thumbOpposition: true, face: false, head: true, body: true } }
  supports(animation: SharedSignAnimation) { const missing: string[] = []; if (!animation.supportedRuntimes.includes('ax1-3d')) missing.push('asset does not declare ax1-3d support'); if (animation.keyframes.some((frame) => frame.facialExpression)) missing.push('AX-1 has no validated facial expression runtime'); return missing }
  apply(animation: SharedSignAnimation, elapsedMs: number) {
    const compatibility = this.supports(animation); if (compatibility.length) throw new Error(compatibility.join('; '))
    const frame = sampleAnimation(animation, elapsedMs)
    this.setJoint('AX1_HEAD', frame.head)
    this.setArm('L', frame.leftArm?.shoulder, frame.leftArm?.elbow, frame.left?.wrist)
    this.setArm('R', frame.rightArm?.shoulder, frame.rightArm?.elbow, frame.right?.wrist)
    this.setHand('L', frame.left?.fingers)
    this.setHand('R', frame.right?.fingers)
  }
  reset() { this.rest.forEach((rotation, name) => this.asset.rig.bones.get(name)?.quaternion.copy(rotation)) }
  dispose() { this.reset() }
  private setArm(side: 'L' | 'R', shoulder: JointPose | undefined, elbow: JointPose | undefined, wrist: JointPose | undefined) {
    this.setJoint(`AX1_${side}_SHOULDER`, shoulder)
    this.setJoint(`AX1_${side}_UPPER_ARM`, { flexion: shoulder?.rotation, rotation: shoulder?.spread })
    this.setJoint(`AX1_${side}_FOREARM`, elbow)
    this.setJoint(`AX1_${side}_HAND`, wrist)
  }
  private setHand(side: 'L' | 'R', fingers: Partial<Record<FingerName, { mcp?: number; pip?: number; dip?: number; opposition?: number }>> | undefined) {
    digits.forEach((digit) => segments[digit].forEach((segment, index) => {
      const finger = fingers?.[digit]
      const flexion = index === 0 ? finger?.mcp : index === 1 ? finger?.pip : finger?.dip
      const name = `AX1_${side}_${digitName[digit]}_${segment}`
      this.setJoint(name, { flexion: -Math.abs(flexion ?? 0), rotation: digit === 'thumb' && index === 0 ? -Math.abs(finger?.opposition ?? 0) : 0 }, digit === 'thumb' ? [-1.2, 0] : [-1.25, 0])
    }))
  }
  private setJoint(name: string, target: JointPose | undefined, flexionRange: readonly [number, number] = [-1.25, 1.25]) {
    const bone = this.asset.rig.bones.get(name); const neutral = this.rest.get(name); if (!bone || !neutral) return
    const flexion = limit(target?.flexion, flexionRange[0], flexionRange[1]); const spread = limit(target?.spread, -.55, .55); const rotation = limit(target?.rotation, -.9, .9)
    bone.quaternion.copy(neutral).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(flexion, spread, rotation, 'XYZ')))
  }
}
