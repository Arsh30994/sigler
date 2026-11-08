import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Expression } from './types'

interface Props { expression: Expression; trackingEnabled: boolean; target: { x: number; y: number } }
const joint = new THREE.MeshStandardMaterial({ color: '#10151e', roughness: 0.22, metalness: 0.85 })
const armour = new THREE.MeshStandardMaterial({ color: '#e8eff5', roughness: 0.22, metalness: 0.72 })

function Finger({ x, y, curl }: { x: number; y: number; curl: number }) {
  return <group position={[x, y, 0]} rotation={[curl, 0, 0]}><mesh material={joint} position={[0, -0.16, 0]}><boxGeometry args={[0.055, 0.32, 0.055]} /></mesh></group>
}
function Arm({ side }: { side: -1 | 1 }) {
  const fingers = useMemo(() => [-0.15, -0.075, 0, 0.075, 0.15], [])
  return <group position={[side * 0.74, 1.45, 0]} rotation={[0, 0, side * -0.16]}>
    <mesh material={joint}><sphereGeometry args={[0.16, 16, 16]} /></mesh><mesh material={armour} position={[0, -0.43, 0]}><capsuleGeometry args={[0.13, 0.64, 8, 12]} /></mesh>
    <group position={[0, -0.85, 0]} rotation={[0, 0, side * 0.12]}><mesh material={joint}><sphereGeometry args={[0.13, 16, 16]} /></mesh><mesh material={armour} position={[0, -0.35, 0]}><capsuleGeometry args={[0.11, 0.48, 8, 12]} /></mesh>
      <group position={[0, -0.75, 0.02]}><mesh material={joint}><boxGeometry args={[0.38, 0.25, 0.13]} /></mesh>{fingers.map((finger, index) => <Finger key={finger} x={finger} y={-0.1} curl={index === 0 ? -0.35 : -0.15} />)}</group>
    </group>
  </group>
}
export function Ax1Placeholder({ expression, trackingEnabled, target }: Props) {
  const head = useRef<THREE.Group>(null)
  const visorColor = expression === 'error' ? '#e53e3e' : expression === 'acknowledgement' ? '#40d6bc' : expression === 'question' ? '#9b8cff' : '#1c2533'
  useFrame((_, delta) => { if (!head.current) return; const response = 1 - Math.exp(-delta * 6.5); const yaw = trackingEnabled ? target.x * THREE.MathUtils.degToRad(25) : 0; const pitch = trackingEnabled ? target.y * THREE.MathUtils.degToRad(12) : 0; head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, yaw, response); head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, pitch, response) })
  return <Float speed={1.1} rotationIntensity={0.025} floatIntensity={0.05}><group position={[0, -1.7, 0]}>
    <mesh material={armour} position={[0, 0.05, 0]}><capsuleGeometry args={[0.48, 0.28, 8, 16]} /></mesh><mesh material={armour} position={[0, 0.95, 0]}><boxGeometry args={[1.25, 1.25, 0.52]} /></mesh>
    <Arm side={-1} /><Arm side={1} />
    <group ref={head} position={[0, 2.05, 0]}><mesh material={armour}><sphereGeometry args={[0.54, 24, 24]} /></mesh><mesh position={[0, 0.02, 0.48]}><sphereGeometry args={[0.43, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.8]} /><meshStandardMaterial color={visorColor} metalness={0.9} roughness={0.12} emissive={visorColor} emissiveIntensity={0.18} /></mesh></group>
  </group></Float>
}
