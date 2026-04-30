import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Soft puff with subtle top-left lighting hint
function makePuffTexture(size = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const c = size / 2

  // Lit core (offset toward top-left)
  const lit = ctx.createRadialGradient(c * 0.65, c * 0.65, 0, c, c, c * 0.96)
  lit.addColorStop(0.00, 'rgba(255,255,255,1.00)')
  lit.addColorStop(0.30, 'rgba(255,255,255,0.90)')
  lit.addColorStop(0.60, 'rgba(235,242,252,0.48)')
  lit.addColorStop(0.82, 'rgba(215,228,248,0.14)')
  lit.addColorStop(1.00, 'rgba(200,218,245,0.00)')
  ctx.fillStyle = lit
  ctx.fillRect(0, 0, size, size)

  const t = new THREE.CanvasTexture(canvas)
  t.needsUpdate = true
  return t
}

// Wispy cirrus streak texture
function makeCirrusTexture() {
  const W = 512, H = 96
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')
  ;[
    [0.25, 0.45, W * 0.38],
    [0.55, 0.35, W * 0.32],
    [0.75, 0.55, W * 0.28],
    [0.45, 0.60, W * 0.22],
  ].forEach(([cx, cy, r]) => {
    const g = ctx.createRadialGradient(cx * W, cy * H, 0, cx * W, cy * H, r)
    g.addColorStop(0.0, 'rgba(255,255,255,0.52)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.18)')
    g.addColorStop(1.0, 'rgba(255,255,255,0.00)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  })
  const t = new THREE.CanvasTexture(canvas)
  t.needsUpdate = true
  return t
}

// Individual puff — breathes and drifts slowly within the cloud
function Puff({ tex, bx, by, bz, sw, sh, opacity, breatheSpeed, breathePhase, driftR, driftSpeed, driftPhase }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const breathe = 1 + Math.sin(t * breatheSpeed + breathePhase) * 0.045
    ref.current.scale.x = sw * breathe
    ref.current.scale.y = sh * breathe
    ref.current.position.x = bx + Math.sin(t * driftSpeed + driftPhase) * driftR
    ref.current.position.y = by + Math.cos(t * driftSpeed * 0.68 + driftPhase) * driftR * 0.5
  })

  return (
    <mesh ref={ref} position={[bx, by, bz]} renderOrder={5}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

// Full cumulus cloud — group of breathing, drifting puffs
function CumulusCloud({ initX, y, z, w, h, speed, phase }) {
  const groupRef = useRef()
  const tex = useMemo(() => makePuffTexture(256), [])

  const puffs = useMemo(() => [
    // Centre body
    { bx:  0,      by:  0.05, bz: 0.00, sw: w,       sh: h,       op: 0.82, bs: 0.28, bp: phase,       dr: 0.07, ds: 0.11, dp: phase       },
    // Left lobe
    { bx: -w*0.31, by:  h*0.08, bz: 0.04, sw: w*0.65, sh: h*0.70, op: 0.72, bs: 0.34, bp: phase+1.1,   dr: 0.10, ds: 0.09, dp: phase+0.8   },
    // Right lobe
    { bx:  w*0.30, by:  h*0.05, bz: 0.03, sw: w*0.62, sh: h*0.68, op: 0.70, bs: 0.31, bp: phase+2.3,   dr: 0.09, ds: 0.13, dp: phase+2.1   },
    // Far-left wisp
    { bx: -w*0.52, by: -h*0.06, bz: 0.02, sw: w*0.44, sh: h*0.50, op: 0.52, bs: 0.42, bp: phase+0.5,   dr: 0.12, ds: 0.08, dp: phase+1.5   },
    // Far-right wisp
    { bx:  w*0.50, by: -h*0.08, bz: 0.02, sw: w*0.42, sh: h*0.48, op: 0.48, bs: 0.38, bp: phase+3.5,   dr: 0.11, ds: 0.10, dp: phase+3.2   },
    // Top crown
    { bx: -w*0.06, by:  h*0.24, bz: 0.05, sw: w*0.50, sh: h*0.54, op: 0.65, bs: 0.25, bp: phase+1.8,   dr: 0.07, ds: 0.15, dp: phase+0.3   },
    // Flat base
    { bx:  w*0.08, by: -h*0.22, bz: 0.01, sw: w*0.72, sh: h*0.34, op: 0.38, bs: 0.20, bp: phase+4.2,   dr: 0.06, ds: 0.07, dp: phase+4.0   },
  ], [w, h, phase])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    let x = initX + t * speed
    if (x > 42)  x -= 84
    if (x < -42) x += 84
    groupRef.current.position.x = x
    groupRef.current.position.y = y + Math.sin(t * 0.09 + phase) * 0.18
  })

  return (
    <group ref={groupRef} position={[initX, y, z]}>
      {puffs.map((p, i) => (
        <Puff key={i} tex={tex}
          bx={p.bx} by={p.by} bz={p.bz}
          sw={p.sw} sh={p.sh} opacity={p.op}
          breatheSpeed={p.bs} breathePhase={p.bp}
          driftR={p.dr} driftSpeed={p.ds} driftPhase={p.dp}
        />
      ))}
    </group>
  )
}

// High-altitude cirrus — thin, translucent, slow
function CirrusCloud({ initX, y, z, w, speed, phase }) {
  const groupRef = useRef()
  const tex = useMemo(() => makeCirrusTexture(), [])
  const h = w * 0.18

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    let x = initX + t * speed
    if (x > 42)  x -= 84
    if (x < -42) x += 84
    groupRef.current.position.x = x
    groupRef.current.position.y = y + Math.sin(t * 0.025 + phase) * 0.05
    groupRef.current.scale.x = 1 + Math.sin(t * 0.018 + phase) * 0.015
  })

  return (
    <group ref={groupRef} position={[initX, y, z]}>
      <mesh renderOrder={4}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} transparent opacity={0.42} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[w * 0.18, h * 0.35, 0.01]} renderOrder={4}>
        <planeGeometry args={[w * 0.65, h * 0.65]} />
        <meshBasicMaterial map={tex} transparent opacity={0.26} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

const CUMULUS = [
  { initX: -14, y:  6.0, z: 2.8, w: 6.0, h: 2.4, speed: 0.08, phase: 0.0 },
  { initX:   8, y:  7.5, z: 3.5, w: 5.5, h: 2.2, speed: 0.06, phase: 1.8 },
  { initX: -28, y: -5.0, z: 2.2, w: 7.0, h: 2.8, speed: 0.10, phase: 3.2 },
  { initX:  22, y:  4.0, z: 3.0, w: 5.0, h: 2.0, speed: 0.07, phase: 0.6 },
  { initX:  -5, y: -7.0, z: 2.5, w: 6.5, h: 2.5, speed: 0.09, phase: 5.0 },
  { initX:  30, y:  8.0, z: 2.0, w: 5.8, h: 2.3, speed: 0.05, phase: 2.4 },
]

const CIRRUS = [
  { initX:  -8, y: 10.0, z: 1.5, w: 11.0, speed: 0.035, phase: 0.0 },
  { initX:  18, y:  9.0, z: 1.2, w:  9.5, speed: 0.028, phase: 2.5 },
  { initX: -26, y: -8.0, z: 1.8, w: 10.5, speed: 0.040, phase: 4.0 },
]

export function Clouds() {
  return (
    <>
      {CIRRUS.map((d, i)   => <CirrusCloud   key={`ci${i}`} {...d} />)}
      {CUMULUS.map((d, i)  => <CumulusCloud  key={`cu${i}`} {...d} />)}
    </>
  )
}
