import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { Input } from '../components/ui/Input'
import { BrandMark } from '../components/BrandMark'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { tokens } from '../lib/tokens'
import { FindWorkspaceModal } from '../components/FindWorkspaceModal'

export function TenantLogin() {
  const navigate = useNavigate()
  const { setAuth, tenantInfo, authChecked, user, role } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [findOpen, setFindOpen] = useState(false)
  const [findInitialStep, setFindInitialStep] = useState(1)
  const [findInitialEmail, setFindInitialEmail] = useState('')

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
      if (err?.status === 403 && err?.data?.error_code === 'EMAIL_NOT_VERIFIED') {
        setFindInitialEmail(email)
        setFindInitialStep(0)
        setFindOpen(true)
      } else if (err?.status === 403) {
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

      <FindWorkspaceModal open={findOpen} onClose={() => setFindOpen(false)} initialStep={findInitialStep} initialEmail={findInitialEmail} />
    </div>
  )
}
