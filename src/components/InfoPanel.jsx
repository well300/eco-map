import { useEffect, useState } from 'react'
import { HotspotIcon } from '../data/icons.jsx'

const BRAND = '#283e3b'
const BRAND_DARK = '#1c2e2b'

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return mobile
}

export function InfoPanel({ hotspot, onClose }) {
  const mobile = useIsMobile()

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const open = !!hotspot

  const panelStyle = mobile ? {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    width: '100%',
    maxHeight: '78vh',
    background: '#fff',
    borderTop: `3px solid ${BRAND}`,
    borderRadius: '18px 18px 0 0',
    display: 'flex',
    flexDirection: 'column',
    transform: open ? 'translateY(0)' : 'translateY(100%)',
    transition: 'transform 0.42s cubic-bezier(0.22,1,0.36,1)',
    zIndex: 20,
    pointerEvents: open ? 'auto' : 'none',
    boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
  } : {
    position: 'absolute',
    top: 0, right: 0,
    width: '420px',
    maxWidth: '92vw',
    height: '100%',
    background: '#fff',
    borderLeft: `1px solid #e8e8e8`,
    display: 'flex',
    flexDirection: 'column',
    transform: open ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.42s cubic-bezier(0.22,1,0.36,1)',
    zIndex: 20,
    pointerEvents: open ? 'auto' : 'none',
  }

  return (
    <>
      {/* Click-away backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          pointerEvents: open ? 'auto' : 'none',
          opacity: open ? 1 : 0,
          transition: 'opacity 0.3s',
          background: mobile ? 'rgba(0,0,0,0.25)' : 'transparent',
        }}
      />

      {/* Panel */}
      <div style={panelStyle}>
        {hotspot && <PanelContent hotspot={hotspot} onClose={onClose} mobile={mobile} />}
      </div>
    </>
  )
}

function PanelContent({ hotspot, onClose, mobile }) {
  return (
    <>
      {/* Top bar / drag handle */}
      {mobile ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#ddd' }} />
        </div>
      ) : (
        <div style={{ height: '3px', background: BRAND, flexShrink: 0 }} />
      )}

      {/* Header */}
      <div style={{ padding: mobile ? '16px 20px 0' : '28px 28px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            {/* Icon badge */}
            <div style={{
              width: '44px', height: '44px',
              borderRadius: '10px',
              background: `${BRAND}18`,
              border: `1px solid ${BRAND}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '12px',
            }}>
              <HotspotIcon name={hotspot.icon} size={20} color={BRAND} />
            </div>

            <div style={{
              fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#999', marginBottom: '5px',
            }}>
              Township Amenity
            </div>

            <h2 style={{ fontSize: mobile ? '18px' : '22px', fontWeight: 700, color: BRAND, lineHeight: 1.2, margin: 0 }}>
              {hotspot.label}
            </h2>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              background: '#f4f4f4',
              border: '1px solid #e8e8e8',
              borderRadius: '8px',
              width: '34px', height: '34px',
              color: '#555',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              lineHeight: 1,
              fontFamily: 'sans-serif',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e8e8e8'}
            onMouseLeave={e => e.currentTarget.style.background = '#f4f4f4'}
          >
            ×
          </button>
        </div>

        <div style={{ height: '1px', background: '#ececec', margin: '16px 0 0' }} />
      </div>

      {/* Body */}
      <div style={{ padding: mobile ? '16px 20px 24px' : '20px 28px 32px', overflowY: 'auto', flex: 1 }}>
        <p style={{ color: '#555', fontSize: '13.5px', lineHeight: 1.75, margin: '0 0 22px' }}>
          {hotspot.description}
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '22px' }}>
          {[
            ['Status', 'Under Planning'],
            ['Access',  'Residents Only'],
            ['Hours',   '6 AM – 10 PM'],
            ['Booking', 'App-Based'],
          ].map(([k, v]) => (
            <div key={k} style={{
              background: '#fafafa',
              border: '1px solid #ececec',
              borderRadius: '8px',
              padding: '11px 13px',
            }}>
              <div style={{ fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>{k}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: BRAND }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <button style={{
          width: '100%',
          padding: '13px',
          background: BRAND,
          border: 'none',
          borderRadius: '10px',
          color: '#fff',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.03em',
          fontFamily: 'Inter, sans-serif',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = BRAND_DARK}
          onMouseLeave={e => e.currentTarget.style.background = BRAND}
        >
          {hotspot.cta} →
        </button>

        {/* Secondary — close */}
        <button onClick={onClose} style={{
          width: '100%',
          padding: '12px',
          marginTop: '8px',
          background: 'transparent',
          border: '1px solid #e0e0e0',
          borderRadius: '10px',
          color: '#888',
          fontSize: '13px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          transition: 'border-color 0.15s, color 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#bbb'; e.currentTarget.style.color = '#444' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.color = '#888' }}
        >
          Close & Explore Map
        </button>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #ececec',
        padding: '12px 28px',
        display: 'flex', alignItems: 'center', gap: '8px',
        flexShrink: 0,
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: BRAND }} />
        <span style={{ fontSize: '10px', color: '#bbb', letterSpacing: '0.07em' }}>
          TOWNSHIP MASTERPLAN · INTERACTIVE MAP
        </span>
      </div>
    </>
  )
}
