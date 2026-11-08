export interface SigningSpaceLayout {
  shoulderDepth: number
  elbowDepth: number
  wristLocalDepth: number
  handPresentationDepth: number
}

/**
 * Places neutral hands in front of the chest envelope. The values are derived
 * from mesh depth and clearance, not from an animation or bone offset.
 */
export function createSigningSpaceLayout(
  torsoHalfDepth: number,
  presentationClearance: number,
  shoulderDepth = 0.1,
  elbowDepth = 0.14,
): SigningSpaceLayout {
  if (torsoHalfDepth <= 0 || presentationClearance <= 0) {
    throw new Error('Torso depth and signing clearance must be positive')
  }
  const handPresentationDepth = torsoHalfDepth + presentationClearance
  return {
    shoulderDepth,
    elbowDepth,
    wristLocalDepth: handPresentationDepth - shoulderDepth - elbowDepth,
    handPresentationDepth,
  }
}
