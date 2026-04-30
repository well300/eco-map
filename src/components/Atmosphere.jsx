import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Sun glow ──────────────────────────────────────────────────────────────────

function makeSunTexture() {
  const S = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = S
  const ctx = canvas.getContext('2d')
  const c = S / 2

  const g = ctx.createRadialGradient(c, c, 0, c, c, c)
  g.addColorStop(0.00, 'rgba(255,252,200,1.00)')
  g.addColorStop(0.08, 'rgba(255,245,160,0.92)')
  g.addColorStop(0.22, 'rgba(255,230,120,0.60)')
  g.addColorStop(0.45, 'rgba(255,210,90,0.22)')
  g.addColorStop(0.70, 'rgba(255,190,70,0.07)')
  g.addColorStop(1.00, 'rgba(255,170,50,0.00)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)

  const t = new THREE.CanvasTexture(canvas)
  t.needsUpdate = true
  return t
}

export function SunGlow() {
  const ref = useRef()
  const tex = useMemo(() => makeSunTexture(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current?.material)
      ref.current.material.opacity = 0.62 + Math.sin(t * 0.35) * 0.07
  })

  return (
    <mesh ref={ref} position={[22, 13, 0.8]} renderOrder={3}>
      <planeGeometry args={[11, 11]} />
      <meshBasicMaterial map={tex} transparent opacity={0.62} depthWrite={false} />
    </mesh>
  )
}

// ── Hot air balloon ───────────────────────────────────────────────────────────

function makeBalloonTexture() {
  const S = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = S
  const ctx = canvas.getContext('2d')
  const cx = S / 2, cy = S / 2

  const segments = 8
  const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#27ae60', '#2980b9', '#8e44ad', '#e74c3c', '#f39c12']

  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2 - Math.PI / 2
    const a1 = ((i + 1) / segments) * Math.PI * 2 - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, S / 2, a0, a1)
    ctx.closePath()
    ctx.fillStyle = colors[i]
    ctx.fill()
  }

  // Centre circle
  ctx.beginPath()
  ctx.arc(cx, cy, S * 0.12, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()

  const t = new THREE.CanvasTexture(canvas)
  t.needsUpdate = true
  return t
}

export function HotAirBalloon() {
  const ref = useRef()
  const balloonTex = useMemo(() => makeBalloonTexture(), [])

  // Rope geometry — two V lines from envelope bottom to basket
  const ropeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute([
      -0.07, 0.05, 0,  -0.04, -0.18, 0,
       0.07, 0.05, 0,   0.04, -0.18, 0,
    ], 3))
    return g
  }, [])
  const ropeMat = useMemo(() => new THREE.LineBasicMaterial({ color: '#7a5c2e' }), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    let x = -18 + t * 0.016
    if (x > 24) x -= 42
    ref.current.position.x = x
    ref.current.position.y = 8.2 + Math.sin(t * 0.28) * 0.38
    ref.current.rotation.z = Math.sin(t * 0.42) * 0.028
  })

  return (
    <group ref={ref} position={[-18, 8.2, 4.8]} renderOrder={7}>
      {/* Envelope — slightly taller than wide */}
      <mesh position={[0, 0.28, 0]} scale={[0.30, 0.40, 0.30]}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshBasicMaterial map={balloonTex} />
      </mesh>

      {/* Ropes */}
      <lineSegments geometry={ropeGeo} material={ropeMat} />

      {/* Basket */}
      <mesh position={[0, -0.20, 0]}>
        <boxGeometry args={[0.11, 0.08, 0.11]} />
        <meshBasicMaterial color="#8B6014" />
      </mesh>

      {/* Basket rim highlight */}
      <mesh position={[0, -0.16, 0]}>
        <boxGeometry args={[0.115, 0.012, 0.115]} />
        <meshBasicMaterial color="#a07820" />
      </mesh>
    </group>
  )
}
