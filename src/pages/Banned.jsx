import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { tokens } from '../lib/tokens'

export function Banned() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh', background: tokens.bg, color: tokens.text,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center',
    }}>
      <div style={{ maxWidth: 460, animation: 'tkFadeUp 500ms ease' }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${tokens.border}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#ef4444" strokeWidth="1.6" />
            <line x1="6.34" y1="6.34" x2="17.66" y2="17.66" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          Accesso revocato
        </h1>
        <p style={{ color: tokens.textMuted, fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>
          Il tuo accesso a questa area di lavoro è stato revocato.
        </p>
        <Button variant="secondary" onClick={() => navigate('/login')}>Torna alla login</Button>
      </div>
    </div>
  )
}
