import { useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { HotspotIcon } from '../data/icons.jsx'

const DOT_COLOR  = new THREE.Color('#ffffff')
const RING_COLOR = new THREE.Color('#ffffff')

export function Hotspot({ data, isActive, onClick }) {
  const ringFastRef = useRef()
  const ringSlowRef = useRef()
  const coreRef     = useRef()
  const glowRef     = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (ringFastRef.current) {
      const s = 1 + 0.28 * Math.sin(t * 2.6)
      ringFastRef.current.scale.setScalar(s)
      ringFastRef.current.material.opacity = 0.55 + 0.3 * Math.sin(t * 2.6)
    }
    if (ringSlowRef.current) {
      const s = 1 + 0.45 * Math.sin(t * 1.2 + 1)
      ringSlowRef.current.scale.setScalar(s)
      ringSlowRef.current.material.opacity = 0.22 + 0.15 * Math.abs(Math.sin(t * 1.2))
    }
    if (coreRef.current) {
      const target = isActive ? 1.3 : hovered ? 1.5 : 1.0
      coreRef.current.scale.setScalar(
        THREE.MathUtils.lerp(coreRef.current.scale.x, target, 0.1)
      )
    }
    if (glowRef.current) {
      const target = isActive || hovered ? 0.32 : 0.10
      glowRef.current.material.opacity = THREE.MathUtils.lerp(
        glowRef.current.material.opacity, target, 0.08
      )
    }
  })

  const handleOver = useCallback((e) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }, [])

  const handleOut = useCallback((e) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'grab'
  }, [])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    onClick(data)
  }, [data, onClick])

  const [px, py, pz] = data.position

  return (
    <group position={[px, py, pz]}>

      {/* Outer slow ring — 1.5× bigger than before */}
      <mesh ref={ringSlowRef}>
        <ringGeometry args={[0.30, 0.39, 56]} />
        <meshBasicMaterial color={RING_COLOR} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Inner fast ring */}
      <mesh ref={ringFastRef}>
        <ringGeometry args={[0.18, 0.26, 56]} />
        <meshBasicMaterial color={RING_COLOR} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Soft glow disc */}
      <mesh ref={glowRef} position={[0, 0, -0.005]}>
        <circleGeometry args={[0.36, 40]} />
        <meshBasicMaterial color={RING_COLOR} transparent opacity={0.10} depthWrite={false} />
      </mesh>

      {/* Core — clickable hit area */}
      <mesh
        ref={coreRef}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <circleGeometry args={[0.15, 40]} />
        <meshStandardMaterial
          color={DOT_COLOR}
          emissive={DOT_COLOR}
          emissiveIntensity={1.2}
          roughness={0.0}
          metalness={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Centre pin */}
      <mesh position={[0, 0, 0.006]}>
        <circleGeometry args={[0.055, 20]} />
        <meshBasicMaterial color="#283e3b" transparent opacity={0.9} depthWrite={false} />
      </mesh>

      {/*
        distanceFactor={4}:
          at camera z=10 (default) → HTML scale = 10/4 = 2.5 → labels appear at ~2.5× CSS size (very readable)
          at camera z=4  (zoomed in) → scale = 1.0 → normal CSS size
        This means labels are large at overview and shrink naturally as you zoom in.
      */}
      <Html
        center
        position={[0, 0.70, 0]}
        style={{ pointerEvents: 'auto' }}
        zIndexRange={[1, 1]}
        sprite
      >
        <div
          onClick={() => onClick(data)}
          onMouseEnter={() => { document.body.style.cursor = 'pointer' }}
          onMouseLeave={() => { document.body.style.cursor = 'grab' }}
          style={{
            background: isActive ? '#283e3b' : '#fff',
            border: `1.5px solid ${isActive ? '#283e3b' : '#ccc'}`,
            borderRadius: '10px',
            padding: '5px 12px 5px 9px',
            color: isActive ? '#fff' : '#283e3b',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            userSelect: 'none',
            cursor: 'pointer',
          }}
        >
          <HotspotIcon name={data.icon} size={14} color={isActive ? '#fff' : '#283e3b'} />
          {data.label}
        </div>
      </Html>
    </group>
  )
}
