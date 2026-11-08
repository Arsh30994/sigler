import type { ProductionSign, SignSpecification } from '../types'

/** Production playback reads only this registry. Automated systems cannot add a reviewer or approval. */
export const approvedSigns: readonly ProductionSign[] = []

export function findApprovedSign(signId: string): ProductionSign | undefined { return approvedSigns.find((sign) => sign.signId === signId) }

/** Isolated schema example; it is never eligible for production playback or ISL output. */
export const developmentExamples: readonly SignSpecification[] = [{
  signId: 'ISL_EXAMPLE_001', phraseId: 'PHRASE_EXAMPLE_001', label: 'Schema-only development example',
  intendedMeaning: 'No linguistic meaning asserted', context: 'Development schema validation only', language: 'ISL',
  handshape: 'Not specified', palmOrientation: 'Not specified', handLocation: 'Not specified', movementSequence: 'No animation asset is supplied',
  leftHandBehaviour: 'Not specified', rightHandBehaviour: 'Not specified', requiredFacialExpression: 'neutral',
  requiredHeadMovement: 'Not specified', requiredTorsoMovement: 'Not specified',
  sourceReference: 'Placeholder schema only — not a dictionary or reviewer source', reviewStatus: 'UNREVIEWED', approval: null,
  version: '0.1', animationUrl: '/animations/example.glb', animationClip: 'example', durationMs: 1800,
  requiredChannels: ['head', 'face', 'leftArm', 'rightArm', 'hands', 'torso'], referencedBones: [], subtitles: [], timeline: [],
}]

export function isProductionEligible(sign: SignSpecification): sign is ProductionSign {
  return sign.reviewStatus === 'APPROVED' && sign.approval !== null
}

export function validateSignSpecification(sign: SignSpecification): string[] {
  const fields: (keyof SignSpecification)[] = ['signId', 'phraseId', 'label', 'intendedMeaning', 'context', 'handshape', 'palmOrientation', 'handLocation', 'movementSequence', 'leftHandBehaviour', 'rightHandBehaviour', 'requiredHeadMovement', 'requiredTorsoMovement', 'sourceReference', 'version', 'animationUrl', 'animationClip']
  const errors = fields.filter((field) => !String(sign[field]).trim()).map((field) => `${field} is required`)
  if (!/^\d+(\.\d+)+$/.test(sign.version)) errors.push('version must use semantic numeric form, for example 0.1')
  if (sign.durationMs <= 0) errors.push('durationMs must be positive')
  if (sign.reviewStatus === 'APPROVED' && !sign.approval) errors.push('APPROVED records require human approval metadata')
  if (sign.reviewStatus !== 'APPROVED' && sign.approval) errors.push('only APPROVED records may contain approval metadata')
  if (sign.subtitles.some((cue) => cue.startMs < 0 || cue.endMs <= cue.startMs || cue.endMs > sign.durationMs)) errors.push('subtitle timings must fit the animation duration')
  return errors
}
