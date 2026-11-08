import * as THREE from 'three'

export interface CameraFrame {
  position: THREE.Vector3
  target: THREE.Vector3
}

/**
 * Fits a perspective camera to the actual rendered hierarchy rather than a
 * conventionally assumed origin. This keeps modular hands in view even when
 * the avatar's rig root or neutral pose is offset.
 */
export function framePerspectiveCamera(
  bounds: THREE.Box3,
  verticalFovDegrees: number,
  aspect: number,
  padding = 1.1,
): CameraFrame {
  if (bounds.isEmpty()) throw new Error('Cannot frame an empty avatar hierarchy')
  if (aspect <= 0) throw new Error('Camera aspect ratio must be positive')

  const size = bounds.getSize(new THREE.Vector3())
  const target = bounds.getCenter(new THREE.Vector3())
  const verticalFov = THREE.MathUtils.degToRad(verticalFovDegrees)
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect)
  const fitHeight = size.y / 2 / Math.tan(verticalFov / 2)
  const fitWidth = size.x / 2 / Math.tan(horizontalFov / 2)
  const distance = Math.max(fitHeight, fitWidth) * padding + size.z / 2

  return { target, position: target.clone().add(new THREE.Vector3(0, 0, distance)) }
}
