import { Bone, Group } from 'three'
import { describe, expect, it } from 'vitest'
import { RigCompatibilityError, validateRig } from './runtime'

const map = { armature: 'AX1_RIG', roles: { head: 'AX1_HEAD', chest: 'AX1_HEAD', leftHand: 'AX1_HEAD', rightHand: 'AX1_HEAD' }, bones: [{ name: 'AX1_HEAD', parent: 'AX1_NECK', deform: true, purpose: 'Head' }, { name: 'CTRL_AX1_HEAD', parent: 'AX1_ROOT', deform: false, purpose: 'Control' }] }
describe('validateRig', () => {
  it('accepts the exported, documented deform bone names', () => { const scene = new Group(); const head = new Bone(); head.name = 'AX1_HEAD'; scene.add(head); expect(validateRig(scene, map).requiredBoneCount).toBe(1) })
  it('reports a compatibility error rather than enabling a partial rig', () => { expect(() => validateRig(new Group(), map)).toThrow(RigCompatibilityError) })
  it('rejects an export missing a mapped semantic role', () => { const scene = new Group(); const head = new Bone(); head.name = 'AX1_HEAD'; scene.add(head); expect(() => validateRig(scene, { ...map, roles: { ...map.roles, chest: 'AX1_MISSING_CHEST' } })).toThrow('semantic roles') })
})
