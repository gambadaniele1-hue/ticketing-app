import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { Input } from '../components/ui/Input'
import { BrandMark } from '../components/BrandMark'
import { Modal, ModalHeader } from '../components/ui/Modal'
import { OtpInput } from '../components/ui/OtpInput'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { tokens } from '../lib/tokens'

function FindWorkspaceModal({ open, onClose }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [tenants, setTenants] = useState([])
  const [countdown, setCountdown] = useState(600)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [identityToken, setIdentityToken] = useState('')
  const [selectedTenant, setSelectedTenant] = useState(null)

  useEffect(() => {
    if (open) {
      setStep(1); setEmail(''); setOtp(''); setTenants([])
      setCountdown(600); setError(''); setIdentityToken(''); setSelectedTenant(null)
    }
  }, [open])

  useEffect(() => {
    if (step !== 2 || countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [step, countdown])

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const requestOtp = async () => {
    if (!email) { setError('Inserisci la tua email'); return }
    setLoading(true); setError('')
    try { await api.requestOtp(email) } catch {}
    setStep(2); setCountdown(600); setLoading(false)
  }

  const verifyOtp = async () => {
    if (otp.length !== 6) { setError('Inserisci il codice a 6 cifre'); return }
    setLoading(true); setError('')
    try {
      const r = await api.verifyOtp(email, otp)
      const token = r.identity_token
      setIdentityToken(token)
      const tenantsRes = await api.getTenants(token)
      setTenants(tenantsRes.data)
      setStep(3)
    } catch {
      setError('Codice non valido o scaduto.')
    } finally {
      setLoading(false)
    }
  }

  const selectTenant = async (tenant) => {
    setSelectedTenant(tenant)
    setStep(4)
    setLoading(true)
    try {
      const r = await api.selectTenant(tenant.id, identityToken)
      const redirectUrl = r.data?.redirect_url
      if (redirectUrl) {
        await fetch(redirectUrl, { credentials: 'include' })
      }
      const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173'
      window.location.href = appUrl.replace('localhost', `${tenant.id}.localhost`) + '/login'
    } catch {
      const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173'
      window.location.href = appUrl.replace('localhost', `${tenant.id}.localhost`) + '/login'
    } finally {
      setLoading(false)
    }
  }

  const STEP_TITLES = {
    1: 'Trova il tuo spazio di lavoro',
    2: 'Controlla la tua email',
    3: 'I tuoi spazi di lavoro',
    4: 'Reindirizzamento in corso...',
  }

  return (
    <Modal open={open} onClose={onClose} width={480}>
      <ModalHeader title={STEP_TITLES[step]} onClose={onClose} />
      <div style={{ padding: '0 32px 32px' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>Inserisci la tua email per ricevere un codice di accesso.</p>
            <Input label="Email" type="email" placeholder="tu@azienda.it" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && requestOtp()} />
            {error && <div style={{ color: tokens.error, fontSize: 13 }}>{error}</div>}
            <Button onClick={requestOtp} loading={loading}>Invia codice</Button>
          </div>
        )}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
            <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0, textAlign: 'center' }}>
              Abbiamo inviato un codice a <strong style={{ color: tokens.text }}>{email}</strong>
            </p>
            <OtpInput length={6} value={otp} onChange={setOtp} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
              <span style={{ color: tokens.textMuted }}>Scade in: <span style={{ color: countdown < 60 ? tokens.error : tokens.accent, fontWeight: 600 }}>{fmt(countdown)}</span></span>
              <button onClick={() => { setCountdown(600); requestOtp() }} style={{ background: 'none', border: 'none', color: tokens.accent, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>Rinvia</button>
            </div>
            {error && <div style={{ color: tokens.error, fontSize: 13 }}>{error}</div>}
            <Button onClick={verifyOtp} loading={loading} style={{ width: '100%' }}>Verifica</Button>
          </div>
        )}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>Seleziona il workspace a cui vuoi accedere.</p>
            {tenants.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 12, background: 'rgba(124,58,237,0.06)', border: `1px solid ${tokens.borderSoft}` }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: tokens.textMuted }}>{t.id}.localhost</div>
                </div>
                <Button size="sm" onClick={() => selectTenant(t)}>Entra</Button>
              </div>
            ))}
          </div>
        )}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '16px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${tokens.borderSoft}`, borderTopColor: tokens.primary, animation: 'tkSpin 800ms linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: tokens.text, fontWeight: 600, fontSize: 16, margin: '0 0 8px' }}>Accesso a {selectedTenant?.name}</p>
              <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>Reindirizzamento in corso...</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export function TenantLogin() {
  const navigate = useNavigate()
  const { setAuth, tenantInfo, authChecked, user, role } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [findOpen, setFindOpen] = useState(false)

  const hostname = window.location.hostname
  const parts = hostname.split('.')
  const subdomain = parts.length > 1 ? parts[0] : hostname

  useEffect(() => {
    if (!authChecked || !user) return
    const dest = {
      Admin: '/admin/dashboard',
      Agent: '/agent/dashboard',
      'Team Lead': '/agent/dashboard',
      Customer: '/customer/dashboard',
    }[role?.name] || '/admin/dashboard'
    navigate(dest, { replace: true })
  }, [authChecked, user, role, navigate])

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Inserisci email e password'); return }
    setLoading(true); setError('')
    try {
      const r = await api.login(email, password)
      setAuth(r.data)
      // redirect is handled by the useEffect watching [authChecked, user]
    } catch (err) {
      if (err?.status === 403) {
        navigate('/pending')
      } else {
        setError('Credenziali non valide.')
      }
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
          <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Accedi al tuo account</h3>
          <p style={{ color: tokens.textMuted, fontSize: 13, margin: '0 0 20px' }}>{subdomain}.localhost</p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Email" type="email" placeholder="tu@azienda.it" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && (
              <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: tokens.error, fontSize: 13 }}>{error}</div>
            )}
            <Button type="submit" loading={loading} style={{ marginTop: 4 }}>Accedi</Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={() => setFindOpen(true)}
              style={{ background: 'transparent', border: 'none', color: tokens.accent, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >Non ricordi il tuo spazio di lavoro?</button>
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'transparent', border: 'none', color: tokens.textMuted, fontSize: 13, cursor: 'pointer', padding: 6 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = tokens.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = tokens.textMuted)}
          >← Torna a ticketing.com</button>
        </div>
      </div>

      <FindWorkspaceModal open={findOpen} onClose={() => setFindOpen(false)} />
    </div>
  )
}
