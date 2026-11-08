import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { applyIdleHeadTracking } from '../../avatar/controllers/headTracking'
import { type LoadedAx1, loadAx1 } from '../../avatar/rig/runtime'

export type Ax1LoadState = { kind: 'loading' } | { kind: 'ready'; boneCount: number; animationCount: number } | { kind: 'error'; message: string }
interface Props { trackingEnabled: boolean; target: { x: number; y: number }; onStateChange(state: Ax1LoadState): void }

function HeadIdleOffset({ asset, trackingEnabled, target }: { asset: LoadedAx1; trackingEnabled: boolean; target: Props['target'] }) {
  const rest = useRef<THREE.Quaternion | null>(null)
  const head = asset.rig.bones.get(asset.boneMap.roles.head)
  useEffect(() => { if (head) rest.current = head.quaternion.clone() }, [head])
  useFrame((_, delta) => {
    asset.mixer.update(delta)
    if (!head || !rest.current) return
    applyIdleHeadTracking({ head, neutralRotation: rest.current, target, enabled: trackingEnabled, deltaSeconds: delta, ownership: asset.ownership })
  })
  return null
}

export function Ax1Model({ trackingEnabled, target, onStateChange }: Props) {
  const [asset, setAsset] = useState<LoadedAx1 | null>(null)
  useEffect(() => {
    let disposed = false
    onStateChange({ kind: 'loading' })
    loadAx1().then((loaded) => {
      if (disposed) { loaded.dispose(); return }
      setAsset(loaded)
      onStateChange({ kind: 'ready', boneCount: loaded.rig.requiredBoneCount, animationCount: loaded.animations.length })
    }).catch((error: unknown) => onStateChange({ kind: 'error', message: error instanceof Error ? error.message : 'Unknown AX-1 loading error' }))
    return () => { disposed = true; setAsset((current) => { current?.dispose(); return null }) }
  }, [onStateChange])
  return asset ? <><primitive object={asset.scene} /><HeadIdleOffset asset={asset} trackingEnabled={trackingEnabled} target={target} /></> : null
}
