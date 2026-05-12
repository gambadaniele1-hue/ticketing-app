import { useEffect } from 'react'
import { tokens } from '../../lib/tokens'

export function Modal({ open, onClose, children, width = 480 }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(5, 5, 10, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
        animation: 'tkFadeIn 200ms ease',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: width,
          maxHeight: '90vh', overflowY: 'auto',
          background: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.15)',
          animation: 'tkScaleIn 240ms cubic-bezier(0.2, 0.9, 0.3, 1.2)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ title, onClose }) {
  return (
    <div style={{
      padding: '20px 32px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h3>
      <button
        onClick={onClose}
        aria-label="Chiudi"
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'transparent', border: 'none', color: tokens.textMuted,
          cursor: 'pointer', fontSize: 20, lineHeight: 1,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = tokens.text }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tokens.textMuted }}
      >×</button>
    </div>
  )
}
