import { AnimationMixer, Bone, Group, Material, Object3D } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ChannelOwnership } from '../animation/channelOwnership'
import { MixerPlayback } from '../animation/mixerPlayback'

export interface RigBoneDefinition { name: string; parent: string | null; deform: boolean; purpose: string }
export interface Ax1BoneMap { armature: string; bones: RigBoneDefinition[]; roles: { head: string; chest: string; leftHand: string; rightHand: string } }
export interface RigCompatibility { bones: ReadonlyMap<string, Bone>; requiredBoneCount: number }
export interface LoadedAx1 { scene: Group; mixer: AnimationMixer; playback: MixerPlayback; ownership: ChannelOwnership; animations: ReturnType<GLTFLoader['loadAsync']> extends Promise<infer G> ? G extends { animations: infer A } ? A : never : never; boneMap: Ax1BoneMap; rig: RigCompatibility; dispose(): void }

export class RigCompatibilityError extends Error {}

const modelUrl = import.meta.env.VITE_AX1_MODEL_URL ?? '/AX1.glb'
const boneMapUrl = import.meta.env.VITE_AX1_BONE_MAP_URL ?? '/ax1-bone-map.json'

export function validateRig(scene: Object3D, boneMap: Ax1BoneMap): RigCompatibility {
  const bones = new Map<string, Bone>()
  scene.traverse((object) => { if (object instanceof Bone) bones.set(object.name, object) })
  const missing = boneMap.bones.filter((bone) => bone.deform && !bones.has(bone.name)).map((bone) => bone.name)
  if (missing.length) throw new RigCompatibilityError(`AX-1 rig compatibility error: missing ${missing.join(', ')}`)
  const missingRoles = Object.entries(boneMap.roles).filter(([, name]) => !bones.has(name)).map(([role, name]) => `${role} (${name})`)
  if (missingRoles.length) throw new RigCompatibilityError(`AX-1 rig compatibility error: missing semantic roles ${missingRoles.join(', ')}`)
  return { bones, requiredBoneCount: boneMap.bones.filter((bone) => bone.deform).length }
}

function disposeScene(scene: Object3D) {
  scene.traverse((object) => {
    const mesh = object as Object3D & { geometry?: { dispose(): void }; material?: Material | Material[] }
    mesh.geometry?.dispose()
    const materials = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : []
    materials.forEach((material) => material.dispose())
  })
}

export async function loadAx1(): Promise<LoadedAx1> {
  const [gltf, response] = await Promise.all([new GLTFLoader().loadAsync(modelUrl), fetch(boneMapUrl)])
  if (!response.ok) throw new Error(`AX-1 bone map could not load (${response.status})`)
  const boneMap = await response.json() as Ax1BoneMap
  const rig = validateRig(gltf.scene, boneMap)
  const mixer = new AnimationMixer(gltf.scene)
  const ownership = new ChannelOwnership()
  const playback = new MixerPlayback(mixer, ownership)
  return { scene: gltf.scene, mixer, playback, ownership, animations: gltf.animations, boneMap, rig, dispose: () => { playback.dispose(); disposeScene(gltf.scene) } }
}
