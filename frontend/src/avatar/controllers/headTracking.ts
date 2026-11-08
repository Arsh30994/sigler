import { Euler, MathUtils, Quaternion, type Bone } from 'three'
import type { ChannelOwnership } from '../animation/channelOwnership'

export interface HeadTrackingInput {
  head: Bone | undefined
  neutralRotation: Quaternion
  target: { x: number; y: number }
  enabled: boolean
  deltaSeconds: number
  ownership: ChannelOwnership
}

/**
 * Applies only the idle controller's local offset. A claimed animation head
 * channel always wins, preserving the exported clip's authored transform.
 */
export function applyIdleHeadTracking({ head, neutralRotation, target, enabled, deltaSeconds, ownership }: HeadTrackingInput) {
  if (!head || !ownership.canWrite('idle-mouse', 'head')) return false

  const response = 1 - Math.exp(-deltaSeconds * 6.5)
  const yaw = enabled ? target.x * MathUtils.degToRad(25) : 0
  const pitch = enabled ? target.y * MathUtils.degToRad(12) : 0
  const offset = new Quaternion().setFromEuler(new Euler(pitch, yaw, 0))
  head.quaternion.slerp(neutralRotation.clone().multiply(offset), response)
  return true
}
