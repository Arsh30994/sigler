import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AnimationClip } from 'three'
import { isProductionEligible, validateSignSpecification } from '../registry/approvedSigns'
import type { AvatarChannel, SignSpecification } from '../types'

export interface LoadedAnimationAsset { animations: readonly AnimationClip[]; metadata?: { signId?: string; version?: string } }
export interface AnimationAssetLoader { load(url: string): Promise<LoadedAnimationAsset> }
export interface SignAssetValidationContext {
  loader: AnimationAssetLoader
  availableBones: ReadonlySet<string>
  controllableChannels: ReadonlySet<AvatarChannel>
}
export interface SignAssetValidation {
  eligibleForProduction: boolean
  errors: readonly string[]
}

export function createGltfAnimationAssetLoader(loader = new GLTFLoader()): AnimationAssetLoader {
  return { load: async (url) => {
    const gltf = await loader.loadAsync(url)
    const metadata = gltf.userData as { signId?: string; version?: string }
    return { animations: gltf.animations, metadata }
  } }
}

/** Loads and inspects an asset but never grants linguistic approval. */
export async function validateSignAsset(sign: SignSpecification, context: SignAssetValidationContext): Promise<SignAssetValidation> {
  const errors = validateSignSpecification(sign)
  if (!isProductionEligible(sign)) errors.push(`review status ${sign.reviewStatus} is not eligible for production playback`)
  const unavailableChannels = sign.requiredChannels.filter((channel) => !context.controllableChannels.has(channel))
  if (unavailableChannels.length) errors.push(`uncontrollable channels: ${unavailableChannels.join(', ')}`)
  const missingBones = sign.referencedBones.filter((bone) => !context.availableBones.has(bone))
  if (missingBones.length) errors.push(`missing referenced bones: ${missingBones.join(', ')}`)
  try {
    const asset = await context.loader.load(sign.animationUrl)
    if (!asset.animations.some((clip) => clip.name === sign.animationClip)) errors.push(`animation clip not found: ${sign.animationClip}`)
    if (asset.metadata?.signId !== sign.signId || asset.metadata?.version !== sign.version) errors.push('animation asset metadata does not match the registry record')
  } catch (error) {
    errors.push(`animation asset failed to load: ${error instanceof Error ? error.message : 'unknown error'}`)
  }
  return { eligibleForProduction: errors.length === 0, errors }
}
