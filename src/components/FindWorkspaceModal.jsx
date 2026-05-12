import { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Modal, ModalHeader } from './ui/Modal'
import { OtpInput } from './ui/OtpInput'
import { api } from '../lib/api'
import { tokens } from '../lib/tokens'

export function FindWorkspaceModal({ open, onClose }) {
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
      const appUrl = import.meta.env.VITE_APP_URL
      window.location.href = appUrl.replace('localhost', `${tenant.id}.localhost`) + '/login'
    } catch {
      const appUrl = import.meta.env.VITE_APP_URL
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
