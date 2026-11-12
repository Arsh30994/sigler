import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { applyIdleHeadTracking } from '../../avatar/controllers/headTracking'
import { type LoadedAx1, loadAx1 } from '../../avatar/rig/runtime'
import { Ax1AnimationAdapter } from '../../avatar/adapters/Ax1AnimationAdapter'
import type { SharedSignAnimation } from '../../avatar/shared/schema'

export type Ax1LoadState = { kind: 'loading' } | { kind: 'ready'; boneCount: number; animationCount: number } | { kind: 'error'; message: string }
interface Props { trackingEnabled: boolean; target: { x: number; y: number }; rigValidationActive: boolean; automaticAnimation?: SharedSignAnimation | null; automaticPlaying?: boolean; automaticSpeed?: number; onAutomaticProgress?(elapsedMs: number): void; onAutomaticComplete?(): void; onStateChange(state: Ax1LoadState): void }

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

function AutomaticMotion({ asset, animation, playing = false, speed = 1, onProgress, onComplete }: { asset: LoadedAx1; animation?: SharedSignAnimation | null; playing?: boolean; speed?: number; onProgress?: (elapsedMs: number) => void; onComplete?: () => void }) {
  const adapter = useRef<Ax1AnimationAdapter | null>(null)
  const elapsed = useRef(0)
  const reported = useRef(0)
  useEffect(() => { adapter.current?.dispose(); adapter.current = new Ax1AnimationAdapter(asset); elapsed.current = 0; reported.current = 0; return () => { adapter.current?.dispose(); asset.ownership.release('system') } }, [asset])
  useEffect(() => { elapsed.current = 0; reported.current = 0; if (!animation) { adapter.current?.reset(); asset.ownership.release('system') } }, [animation, asset])
  useFrame((_, delta) => {
    if (!animation || !adapter.current) return
    if (!playing) return
    asset.ownership.claim('system', ['head', 'leftArm', 'rightArm', 'hands'])
    elapsed.current = Math.min(animation.durationMs, elapsed.current + delta * 1000 * speed)
    adapter.current.apply(animation, elapsed.current)
    if (elapsed.current - reported.current >= 80 || elapsed.current === animation.durationMs) { reported.current = elapsed.current; onProgress?.(elapsed.current) }
    if (elapsed.current === animation.durationMs) { adapter.current.reset(); asset.ownership.release('system'); onComplete?.() }
  })
  return null
}

export function Ax1Model({ trackingEnabled, target, rigValidationActive, automaticAnimation, automaticPlaying, automaticSpeed, onAutomaticProgress, onAutomaticComplete, onStateChange }: Props) {
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
  useEffect(() => {
    if (!asset) return
    if (!rigValidationActive) {
      asset.playback.stop()
      return
    }
    try {
      asset.playback.prepareRigValidation(asset.animations, asset.boneMap.validation.animationClip)
      asset.playback.play()
    } catch (error) {
      onStateChange({ kind: 'error', message: error instanceof Error ? error.message : 'AX-1 rig validation playback could not start' })
    }
    return () => asset.playback.stop()
  }, [asset, onStateChange, rigValidationActive])
  return asset ? <><primitive object={asset.scene} /><AutomaticMotion asset={asset} animation={automaticAnimation} playing={automaticPlaying} speed={automaticSpeed} onProgress={onAutomaticProgress} onComplete={onAutomaticComplete} /><HeadIdleOffset asset={asset} trackingEnabled={trackingEnabled && !automaticPlaying} target={target} /></> : null
}
