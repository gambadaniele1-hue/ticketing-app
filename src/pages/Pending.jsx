import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { tokens } from '../lib/tokens'

export function Pending() {
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
          background: 'rgba(124, 58, 237, 0.12)',
          border: `1px solid ${tokens.border}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#8B5CF6" strokeWidth="1.6" />
            <path d="M12 7V12L15 14" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          Accesso in attesa di approvazione
        </h1>
        <p style={{ color: tokens.textMuted, fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>
          L'amministratore di questa azienda deve ancora approvarti. Se il tempo si prolunga, contatta direttamente l'azienda.
        </p>
        <Button variant="secondary" onClick={() => navigate('/')}>Torna alla home</Button>
      </div>
    </div>
  )
}
