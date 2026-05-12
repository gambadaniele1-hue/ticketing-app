import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { tokens } from '../lib/tokens'

export function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh', background: tokens.bg, color: tokens.text,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center',
    }}>
      <div style={{ maxWidth: 520, animation: 'tkFadeUp 500ms ease' }}>
        <div style={{
          fontSize: 92, fontWeight: 800,
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.04em', marginBottom: 8, lineHeight: 1,
        }}>404</div>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: '8px 0 16px', letterSpacing: '-0.02em' }}>
          Non serviamo questa azienda
        </h1>
        <p style={{ color: tokens.textMuted, fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>
          Il workspace che stai cercando non esiste o non è attivo.
        </p>
        <Button onClick={() => navigate('/')}>Vai alla home</Button>
      </div>
    </div>
  )
}
