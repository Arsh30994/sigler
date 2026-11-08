import { Environment, Grid, Html } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Ax1Model, type Ax1LoadState } from './Ax1Model'
import type { Expression } from '../../avatar/types'

interface Props { expression: Expression; trackingEnabled: boolean; showLandmarks: boolean; resetToken: number; forceWebGlFallback?: boolean; onModelState(state: Ax1LoadState): void; onFrameRate(value: number): void }
function StableAx1Camera({ ready }: { ready: boolean }) {
  const { camera } = useThree()
  useLayoutEffect(() => {
    if (!ready) return
    // Blender export maps authoring (x, y, z) to glTF (x, z, -y). These are
    // the validated neutral front-camera coordinates in exported AX-1 space.
    camera.position.set(0, 6.2, -1.55)
    camera.up.set(0, 0, -1)
    camera.lookAt(0, 0.05, -1.55)
    camera.updateProjectionMatrix()
  }, [camera, ready])
  return null
}
function FrameMeter({ onFrameRate }: { onFrameRate(value: number): void }) {
  const elapsed = useRef(0)
  const frames = useRef(0)
  useFrame((_, delta) => { elapsed.current += delta; frames.current += 1; if (elapsed.current >= 0.5) { onFrameRate(Math.round(frames.current / elapsed.current)); elapsed.current = 0; frames.current = 0 } })
  return null
}

export function WebGlFallback() { return <div className="webgl-fallback" role="status"><strong>3D preview unavailable</strong><span>WebGL could not be initialized. Verify browser graphics support, then reload.</span></div> }

export function AvatarViewer({ expression, trackingEnabled, showLandmarks, resetToken, forceWebGlFallback = false, onModelState, onFrameRate }: Props) {
  const [target, setTarget] = useState({ x: 0, y: 0 })
  const [modelState, setModelState] = useState<Ax1LoadState>({ kind: 'loading' })
  useEffect(() => { setTarget({ x: 0, y: 0 }) }, [resetToken])
  const reportModelState = useCallback((state: Ax1LoadState) => { setModelState(state); onModelState(state) }, [onModelState])
  const updateTarget = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!trackingEnabled || event.pointerType === 'touch') return
    const box = event.currentTarget.getBoundingClientRect()
    setTarget({ x: ((event.clientX - box.left) / box.width - 0.5) * 2, y: -((event.clientY - box.top) / box.height - 0.5) * 2 })
  }, [trackingEnabled])
  const reset = useCallback(() => setTarget({ x: 0, y: 0 }), [])
  useEffect(() => { window.addEventListener('blur', reset); return () => window.removeEventListener('blur', reset) }, [reset])
  if (forceWebGlFallback) return <section className="viewer" aria-label="AX-1 avatar viewer"><WebGlFallback /></section>
  return <section className="viewer" aria-label="AX-1 avatar viewer" onPointerMove={updateTarget} onPointerLeave={reset} onBlur={reset} tabIndex={0}>
    <Canvas camera={{ fov: 35 }} dpr={[1, 2]} fallback={<WebGlFallback />}>
      <color attach="background" args={['#07101d']} /><ambientLight intensity={1.4} /><directionalLight position={[3, 5, 4]} intensity={2.7} /><pointLight position={[-3, 2, 3]} color="#559dff" intensity={20} />
      <Ax1Model trackingEnabled={trackingEnabled} target={target} onStateChange={reportModelState} /><StableAx1Camera ready={modelState.kind === 'ready'} /><FrameMeter onFrameRate={onFrameRate} />{showLandmarks && <Grid position={[0, -0.1, 0]} args={[10, 10]} cellSize={0.5} cellThickness={0.45} sectionSize={2} sectionColor="#285c9c" fadeDistance={8} infiniteGrid />}
      <Environment preset="city" /><Html position={[0, -0.8, 0]} center><span className="asset-label">{modelState.kind === 'loading' ? 'LOADING AX-1 RIG…' : modelState.kind === 'ready' ? `AX-1 RIG VERIFIED · ${modelState.boneCount} BONES · ${modelState.animationCount} CLIP · VISOR ${expression}` : modelState.message}</span></Html>
    </Canvas>
  </section>
}
