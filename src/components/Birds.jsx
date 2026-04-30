import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Bird({ offset, flapOffset, scale }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Smooth organic flap
    const flap = Math.sin(t * 4 + flapOffset) * 0.25

    if (groupRef.current) {
      groupRef.current.rotation.z = flap * 0.4
      groupRef.current.position.y = offset[1] + Math.sin(t * 2 + flapOffset) * 0.05
    }
  })

  const wingShape = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.08, 0.05, 0),
      new THREE.Vector3(-0.18, 0, 0)
    )
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(10))
  }, [])

  const wingShapeRight = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.08, 0.05, 0),
      new THREE.Vector3(0.18, 0, 0)
    )
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(10))
  }, [])

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#2a2a2a',
        transparent: true,
        opacity: 0.7 + Math.random() * 0.3,
      }),
    []
  )

  return (
    <group ref={groupRef} position={offset} scale={scale}>
      <line geometry={wingShape} material={material} />
      <line geometry={wingShapeRight} material={material} />
    </group>
  )
}

function Flock({ center, height, rx, ry, speed, count, phase }) {
  const groupRef = useRef()

  const birds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        offset: [
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.5,
          0,
        ],
        flapOffset: i * 0.9 + phase,
        scale: 0.8 + Math.random() * 0.6, // depth feel
      })),
    [count, phase]
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const angle = t * speed + phase

    if (!groupRef.current) return

    groupRef.current.position.x = center[0] + Math.cos(angle) * rx
    groupRef.current.position.y = center[1] + Math.sin(angle * 0.6) * ry
    groupRef.current.position.z = height + Math.sin(t * 0.3 + phase) * 0.4

    // smoother rotation
    const vx = -Math.sin(angle)
    const vy = Math.cos(angle * 0.6)

    const targetRot = Math.atan2(vy, vx)
    groupRef.current.rotation.z += (targetRot - groupRef.current.rotation.z) * 0.08
  })

  return (
    <group ref={groupRef}>
      {birds.map((b, i) => (
        <Bird key={i} {...b} />
      ))}
    </group>
  )
}

const FLOCKS = [
  { center: [-2, 2], height: 3.8, rx: 8, ry: 3.5, speed: 0.2, count: 6, phase: 0 },
  { center: [5, -3], height: 5.2, rx: 6, ry: 2.5, speed: -0.15, count: 4, phase: 1.6 },
  { center: [-6, -1], height: 4.5, rx: 5, ry: 3, speed: 0.12, count: 5, phase: 3.2 },
  { center: [3, 5], height: 6, rx: 4, ry: 2, speed: -0.18, count: 3, phase: 4.8 },
]

export function Birds() {
  return (
    <>
      {FLOCKS.map((f, i) => (
        <Flock key={i} {...f} />
      ))}
    </>
  )
}