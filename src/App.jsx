import { useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { MapScene } from './components/MapScene'
import { InfoPanel } from './components/InfoPanel'
import { HUD } from './components/HUD'
import { useAmbientSound } from './hooks/useAmbientSound'

export default function App() {
  const [activeHotspot, setActiveHotspot] = useState(null)
  const [resetCamera,   setResetCamera]   = useState(false)
  const sound    = useAmbientSound()
  const mouseRef = useRef({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    mouseRef.current = {
      x:  (e.clientX / window.innerWidth)  * 2 - 1,
      y: -((e.clientY / window.innerHeight) * 2 - 1),
    }
  }, [])

  const handleFirstClick = useCallback(() => sound.start(), [sound])

  const handleHotspotClick = useCallback((hs) => setActiveHotspot(hs), [])

  const handleClose = useCallback(() => {
    setActiveHotspot(null)
    setResetCamera(true)
    setTimeout(() => setResetCamera(false), 80)
  }, [])

  const handleReset = useCallback(() => {
    setActiveHotspot(null)
    setResetCamera(true)
    setTimeout(() => setResetCamera(false), 80)
  }, [])

  return (
    <div
      style={{ width: '100vw', height: '100vh', position: 'relative', background: '#d6e8f5', overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
      onClick={handleFirstClick}
    >
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 300, position: [0, 0, 20] }}
        gl={{ antialias: true, alpha: false }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        <color attach="background" args={['#d6e8f5']} />
        <MapScene
          onHotspotClick={handleHotspotClick}
          activeHotspot={activeHotspot}
          resetCamera={resetCamera}
          mouseRef={mouseRef}
        />
      </Canvas>

      <InfoPanel hotspot={activeHotspot} onClose={handleClose} />
      <HUD onReset={handleReset} sound={sound} />
    </div>
  )
}
