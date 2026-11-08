import type { ApprovedSign } from '../avatar/types'

/** Only add records after human linguistic review. This development registry has no sign animations. */
export const approvedSigns: readonly ApprovedSign[] = []

export function validateApprovedSign(sign: ApprovedSign): string[] {
  const required: (keyof ApprovedSign)[] = ['id', 'label', 'sourceReference', 'meaningContext', 'handshape', 'palmOrientation', 'handLocation', 'movement', 'handBehaviour', 'nonManualFeatures', 'bodyMovement', 'reviewer', 'reviewDate', 'animationVersion']
  return required.filter((field) => !String(sign[field]).trim()).map((field) => `${field} is required`)
}
