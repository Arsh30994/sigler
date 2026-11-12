export const avatars = [
  { id: 'ax1', name: 'AX-1', style: 'Rigged 3D robot', rigStatus: 'READY', capabilities: ['arms', 'wrists', 'independent_fingers', 'thumb_opposition', 'head'] },
  { id: 'animated-boy', name: 'Animated boy', style: 'Stylized human', rigStatus: 'REFERENCE_ONLY', capabilities: [] },
  { id: 'realistic-male', name: 'Realistic male', style: 'Realistic human', rigStatus: 'REFERENCE_ONLY', capabilities: [] },
  { id: 'animated-female', name: 'Animated female', style: 'Stylized human', rigStatus: 'REFERENCE_ONLY', capabilities: [] },
  { id: 'realistic-female', name: 'Realistic female', style: 'Realistic human', rigStatus: 'REFERENCE_ONLY', capabilities: [] },
]
export const syntheticDemo = { signId: 'SYNTHETIC_BIMANUAL_HAND_DEMO', gloss: 'synthetic demo', validationStatus: 'SYNTHETIC_TEST', animationId: 'SYNTHETIC_BIMANUAL_HAND_DEMO_V1', durationMs: 2800, productionEligible: false }
export function resolveSigning(input, avatarId) {
  const avatar = avatars.find((item) => item.id === avatarId)
  if (!avatar) return { ok: false, code: 'UNKNOWN_AVATAR', message: 'The selected avatar does not exist.' }
  if (avatar.rigStatus !== 'READY') return { ok: false, code: 'RIG_UNAVAILABLE', message: `${avatar.name} has no signing rig.` }
  const normalized = String(input ?? '').trim().toLowerCase().replace(/[-_\s]+/g, ' ')
  if (normalized === 'synthetic demo' || input === syntheticDemo.signId) return { ok: true, asset: syntheticDemo }
  return { ok: false, code: 'UNSUPPORTED_SIGN', message: 'No approved sign is installed. Only the synthetic engineering demo is available.' }
}
