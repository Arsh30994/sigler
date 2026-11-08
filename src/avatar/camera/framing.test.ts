import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { framePerspectiveCamera } from './framing'

describe('framePerspectiveCamera', () => {
  it('frames an offset avatar hierarchy rather than world origin', () => {
    const bounds = new THREE.Box3(new THREE.Vector3(-1, -2.3, -0.5), new THREE.Vector3(1, 0.9, 0.5))
    const frame = framePerspectiveCamera(bounds, 35, 16 / 9)

    expect(frame.target.y).toBeCloseTo(-0.7)
    expect(frame.position.y).toBeCloseTo(frame.target.y)
    const depthToFront = frame.position.z - bounds.max.z
    const visibleHeight = 2 * depthToFront * Math.tan(THREE.MathUtils.degToRad(35) / 2)
    expect(visibleHeight).toBeGreaterThanOrEqual(bounds.getSize(new THREE.Vector3()).y)
  })
})
