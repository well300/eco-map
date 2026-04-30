import { useEffect, useRef, useMemo, Suspense } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useTexture, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Hotspot } from './Hotspot'
import { Clouds } from './Clouds'
import { Birds } from './Birds'
import { SunGlow } from './Atmosphere'
import { FEATURED_HOTSPOTS } from '../data/hotspots'

const IMAGE_ASPECT = 5000 / 3448
const CAMERA_FOV   = 60
const MAX_Z        = 20   // zoomed-out limit — whole map visible here
const START_Z      = MAX_Z

function coverSize() {
  const scr  = window.innerWidth / window.innerHeight
  const visH = 2 * MAX_Z * Math.tan((CAMERA_FOV * Math.PI / 180) / 2)
  const visW = visH * scr
  let w, h
  // COVER: map fills the full viewport — no background visible at any zoom level
  if (scr > IMAGE_ASPECT) { w = visW; h = w / IMAGE_ASPECT }
  else                    { h = visH; w = h * IMAGE_ASPECT }
  // 8 % buffer absorbs parallax tilt (needs ~2 %) + damping overshoot
  w *= 1.08
  h *= 1.08
  return { w, h, visW, visH }
}

const { w: MAP_W, h: MAP_H } = coverSize()

const SKY_STOPS = [
  { p: 0.00, bg: '#f0946a', light: 1.5 },
  { p: 0.18, bg: '#d6e8f5', light: 2.8 },
  { p: 0.55, bg: '#e87c60', light: 1.3 },
  { p: 0.72, bg: '#1a2a55', light: 0.5 },
  { p: 1.00, bg: '#f0946a', light: 1.5 },
]

export function MapScene({ onHotspotClick, activeHotspot, resetCamera, mouseRef }) {
  const groupRef = useRef()
  const lightRef = useRef()

  return (
    <>
      <ambientLight ref={lightRef} intensity={2.8} />

      <group ref={groupRef}>
        <Suspense fallback={<FallbackPlane />}>
          <MapMesh />
          {FEATURED_HOTSPOTS.map(hs => (
            <Hotspot
              key={hs.id}
              data={hs}
              isActive={activeHotspot?.id === hs.id}
              onClick={onHotspotClick}
            />
          ))}
        </Suspense>

        <SunGlow />
        <Clouds />
        <Birds />
      </group>

      <OrbitControls
        makeDefault
        enableRotate={false}
        enablePan={true}
        enableZoom={true}
        mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
        panSpeed={1.2}
        zoomSpeed={0.9}
        dampingFactor={0.10}
        enableDamping={true}
        minDistance={3}
        maxDistance={MAX_Z}
        screenSpacePanning={true}
      />

      <SkyController lightRef={lightRef} />
      <ParallaxTilt groupRef={groupRef} mouseRef={mouseRef} />
      <PanLimiter />
      <FlyController activeHotspot={activeHotspot} resetCamera={resetCamera} />
    </>
  )
}

// ── Sky / time-of-day cycle ───────────────────────────────────────────────────

function SkyController({ lightRef }) {
  const { scene } = useThree()
  const bgColor   = useRef(new THREE.Color('#d6e8f5'))
  const stops     = useMemo(() =>
    SKY_STOPS.map(s => ({ ...s, color: new THREE.Color(s.bg) }))
  , [])

  useFrame(({ clock }) => {
    const phase = (clock.getElapsedTime() / 240) % 1

    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i], b = stops[i + 1]
      if (phase >= a.p && phase < b.p) {
        const t = (phase - a.p) / (b.p - a.p)
        bgColor.current.lerpColors(a.color, b.color, t)
        scene.background = bgColor.current
        if (lightRef.current)
          lightRef.current.intensity = a.light + (b.light - a.light) * t
        break
      }
    }
  })
  return null
}

// ── Map mesh ──────────────────────────────────────────────────────────────────

function MapMesh() {
  const texture = useTexture('/map.jpeg')
  useEffect(() => {
    if (!texture) return
    texture.minFilter   = THREE.LinearMipmapLinearFilter
    texture.magFilter   = THREE.LinearFilter
    texture.anisotropy  = 16
    texture.colorSpace  = THREE.SRGBColorSpace
    texture.needsUpdate = true
  }, [texture])
  return (
    <mesh>
      <planeGeometry args={[MAP_W, MAP_H]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}

function FallbackPlane() {
  return (
    <mesh>
      <planeGeometry args={[MAP_W, MAP_H]} />
      <meshBasicMaterial color="#c8dce8" />
    </mesh>
  )
}

// ── Mouse parallax tilt ───────────────────────────────────────────────────────

function ParallaxTilt({ groupRef, mouseRef }) {
  useFrame(() => {
    if (!groupRef.current || !mouseRef?.current) return
    const { x, y } = mouseRef.current
    const S = 0.018
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * S, 0.05)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y,  x * S, 0.05)
  })
  return null
}

// ── Pan limiter ───────────────────────────────────────────────────────────────

function PanLimiter() {
  const { camera, controls } = useThree()

  useFrame(() => {
    if (!controls?.target) return
    const scr   = window.innerWidth / window.innerHeight
    const camZ  = camera.position.z
    const halfH = camZ * Math.tan((CAMERA_FOV * Math.PI / 180) / 2)
    const halfW = halfH * scr
    const maxX  = Math.max(0, MAP_W / 2 - halfW * 1.02)
    const maxY  = Math.max(0, MAP_H / 2 - halfH * 1.02)
    const tx    = THREE.MathUtils.clamp(controls.target.x, -maxX, maxX)
    const ty    = THREE.MathUtils.clamp(controls.target.y, -maxY, maxY)
    if (tx !== controls.target.x || ty !== controls.target.y) {
      const dx = tx - controls.target.x, dy = ty - controls.target.y
      controls.target.x = tx; controls.target.y = ty
      camera.position.x += dx; camera.position.y += dy
    }
  })
  return null
}

// ── Camera fly-to / reset ─────────────────────────────────────────────────────

function FlyController({ activeHotspot, resetCamera }) {
  const { camera, controls } = useThree()
  const destPos    = useRef(new THREE.Vector3(0, 0, START_Z))
  const destTarget = useRef(new THREE.Vector3(0, 0, 0))
  const flying     = useRef(false)

  useEffect(() => {
    if (!activeHotspot) return
    const [px, py] = activeHotspot.position
    destPos.current.set(px, py, 6)
    destTarget.current.set(px, py, 0)
    flying.current = true
  }, [activeHotspot])

  useEffect(() => {
    if (!resetCamera) return
    destPos.current.set(0, 0, START_Z)
    destTarget.current.set(0, 0, 0)
    flying.current = true
  }, [resetCamera])

  useFrame(() => {
    if (!flying.current) return
    const L = 0.055
    camera.position.lerp(destPos.current, L)
    if (controls?.target) { controls.target.lerp(destTarget.current, L); controls.update() }
    const done =
      camera.position.distanceTo(destPos.current) < 0.012 &&
      (!controls?.target || controls.target.distanceTo(destTarget.current) < 0.012)
    if (done) {
      camera.position.copy(destPos.current)
      if (controls?.target) controls.target.copy(destTarget.current)
      flying.current = false
    }
  })
  return null
}
