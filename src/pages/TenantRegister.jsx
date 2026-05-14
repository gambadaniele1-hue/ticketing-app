import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { Input } from '../components/ui/Input'
import { BrandMark } from '../components/BrandMark'
import { Badge } from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { tokens } from '../lib/tokens'
import { EmailVerifyModal } from '../components/EmailVerifyModal'

export function TenantRegister() {
  const navigate = useNavigate()
  const { tenantInfo } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifyOpen, setVerifyOpen] = useState(false)

  const hostname = window.location.hostname
  const parts = hostname.split('.')
  const subdomain = parts.length > 1 ? parts[0] : hostname

  const submit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) { setError('Compila tutti i campi'); return }
    if (password.length < 8) { setError('La password deve essere di almeno 8 caratteri'); return }
    setLoading(true); setError('')
    try {
      await api.register(name, email, password)
      setVerifyOpen(true)
    } catch (err) {
      setError(err?.data?.message || 'Registrazione fallita. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: tokens.bg, color: tokens.text,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative',
    }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 20%, rgba(124,58,237,0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1, animation: 'tkFadeUp 500ms ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <BrandMark size={32} />
          <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.01em' }}>Ticketing</span>
        </div>

        {!tenantInfo ? (
          <Card style={{ padding: 24, marginBottom: 16 }}>
            <Skeleton width={180} height={22} style={{ marginBottom: 10 }} />
            <Skeleton width="100%" height={14} />
          </Card>
        ) : (
          <Card style={{ padding: 24, marginBottom: 16, textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 24,
              marginBottom: 14, boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
            }}>{tenantInfo.name.charAt(0)}</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.01em' }}>{tenantInfo.name}</h2>
            <p style={{ color: tokens.textMuted, fontSize: 14, margin: '0 0 14px' }}>{tenantInfo.description}</p>
            <Badge color="green">Spazio di lavoro verificato ✓</Badge>
          </Card>
        )}

        <Card style={{ padding: 28 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Crea il tuo account</h3>
          <p style={{ color: tokens.textMuted, fontSize: 13, margin: '0 0 20px' }}>{subdomain}.localhost</p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Nome" type="text" placeholder="Mario Rossi" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" placeholder="tu@azienda.it" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
              <label style={{ fontSize: 13, color: tokens.textMuted, fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: tokens.inputBg,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: 8,
                    padding: '10px 40px 10px 12px',
                    color: tokens.text,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 200ms ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = tokens.primary)}
                  onBlur={(e) => (e.target.style.borderColor = tokens.border)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: tokens.textMuted,
                    cursor: 'pointer',
                    fontSize: 16,
                    padding: 4,
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            {error && (
              <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: tokens.error, fontSize: 13 }}>{error}</div>
            )}
            <Button type="submit" loading={loading} style={{ marginTop: 4 }}>Registrati</Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'transparent', border: 'none', color: tokens.accent, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >Hai già un account? Accedi</button>
          </div>
        </Card>
      </div>

      <EmailVerifyModal
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        email={email}
        verifyOnly
        message="Verifica la tua email per iniziare ad usare il tuo account."
        onVerified={() => navigate('/login', { state: { registered: true } })}
      />
    </div>
  )
}
