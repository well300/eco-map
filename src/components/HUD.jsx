import { useEffect, useState } from 'react'
import { MdVolumeUp, MdVolumeOff, MdRefresh, MdDownload } from 'react-icons/md'

const BRAND = '#283e3b'

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return mobile
}

export function HUD({ onReset, sound }) {
  const mobile = useIsMobile()

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>

      {/* Top-left: branding */}
      <div style={{ position: 'absolute', top: '18px', left: '18px', userSelect: 'none' }}>
        <div style={{ fontSize: mobile ? '13px' : '16px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', textShadow: '0 1px 6px rgba(0,0,0,0.25)' }}>
          Township Masterplan
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>
          Interactive Site Map
        </div>
      </div>

      {/* Top-right: legend — hidden on mobile */}
      {!mobile && <Legend />}

      {/* Bottom-left: hints — hidden on mobile */}
      {!mobile && (
        <div style={{
          position: 'absolute', bottom: '22px', left: '22px',
          display: 'flex', flexDirection: 'column', gap: '5px',
          userSelect: 'none',
        }}>
          {[
            ['Drag',   'Pan around'],
            ['Scroll', 'Zoom in / out'],
            ['Click',  'View details'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: '4px',
                padding: '2px 7px',
                fontSize: '10px', fontWeight: 600, color: '#fff',
                minWidth: '46px', textAlign: 'center',
              }}>{k}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)' }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mobile hint — single line */}
      {mobile && (
        <div style={{
          position: 'absolute', bottom: '18px', left: '18px',
          userSelect: 'none',
        }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            Pinch · Pan · Tap to explore
          </span>
        </div>
      )}

      {/* Bottom-right: action buttons */}
      <div style={{
        position: 'absolute', bottom: '18px', right: '18px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        alignItems: 'flex-end',
        pointerEvents: 'auto',
      }}>
        <a
          href="/broucher.pdf"
          download="Township-Masterplan-Brochure.pdf"
          title="Download Brochure"
          style={{
            background: '#283e3b',
            border: '1px solid #1c2e2b',
            borderRadius: '8px',
            width: '36px', height: '36px',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#1c2e2b'}
          onMouseLeave={e => e.currentTarget.style.background = '#283e3b'}
        >
          <MdDownload size={18} />
        </a>
        <IconBtn onClick={sound.toggle} title={sound.muted ? 'Unmute' : 'Mute'}>
          {sound.muted || !sound.active ? <MdVolumeOff size={16} /> : <MdVolumeUp size={16} />}
        </IconBtn>
        <IconBtn onClick={onReset} title="Reset view">
          <MdRefresh size={16} />
        </IconBtn>
      </div>
    </div>
  )
}

function IconBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        width: '36px', height: '36px',
        color: '#333',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
        boxShadow: '0 1px 6px rgba(0,0,0,0.10)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.borderColor = '#bbb' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff';    e.currentTarget.style.borderColor = '#ddd' }}
    >
      {children}
    </button>
  )
}

const LEGEND_ITEMS = [
  { label: 'Sports & Recreation' },
  { label: 'Clubhouse & Pools' },
  { label: 'Parks, Gardens & Greens' },
  { label: 'Residential & Apartments' },
  { label: 'Entry & Roads' },
  { label: 'Dining & Leisure' },
  { label: 'Nature & Water' },
  { label: 'Kids & Wellness' },
]

function Legend() {
  return (
    <div style={{
      position: 'absolute', top: '22px', right: '22px',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid #e8e8e8',
      borderRadius: '10px',
      padding: '13px 15px',
      userSelect: 'none',
      minWidth: '175px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    }}>
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: '#aaa', textTransform: 'uppercase', marginBottom: '9px' }}>
        Amenities
      </div>
      {LEGEND_ITEMS.map(({ label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: BRAND, flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: '#444' }}>{label}</span>
        </div>
      ))}
    </div>
  )
}
