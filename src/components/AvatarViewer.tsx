import { Environment, Grid, Html } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useCallback, useState } from 'react'
import { Ax1Placeholder } from '../avatar/Ax1Placeholder'
import type { Expression } from '../avatar/types'

interface Props { expression: Expression; signing: boolean }
export function AvatarViewer({ expression, signing }: Props) {
  const [target, setTarget] = useState({ x: 0, y: 0 })
  const updateTarget = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (signing || event.pointerType === 'touch') return
    const box = event.currentTarget.getBoundingClientRect()
    setTarget({ x: ((event.clientX - box.left) / box.width - 0.5) * 2, y: -((event.clientY - box.top) / box.height - 0.5) * 2 })
  }, [signing])
  const reset = useCallback(() => setTarget({ x: 0, y: 0 }), [])
  return <section className="viewer" aria-label="AX-1 avatar viewer" onPointerMove={updateTarget} onPointerLeave={reset} onBlur={reset} tabIndex={0}>
    <Canvas camera={{ position: [0, 0.65, 5.7], fov: 35 }} dpr={[1, 2]}>
      <color attach="background" args={['#07101d']} /><ambientLight intensity={1.4} /><directionalLight position={[3, 5, 4]} intensity={2.7} /><pointLight position={[-3, 2, 3]} color="#559dff" intensity={20} />
      <Ax1Placeholder expression={expression} trackingEnabled={!signing} target={target} /><Grid position={[0, -2.02, 0]} args={[10, 10]} cellSize={0.5} cellThickness={0.45} sectionSize={2} sectionColor="#285c9c" fadeDistance={8} infiniteGrid />
      <Environment preset="city" /><Html position={[0, -2.3, 0]} center><span className="asset-label">DEVELOPMENT PLACEHOLDER · AX-1 GLB REQUIRED</span></Html>
    </Canvas>
  </section>
}
