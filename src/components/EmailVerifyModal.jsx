import { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Modal, ModalHeader } from './ui/Modal'
import { OtpInput } from './ui/OtpInput'
import { api } from '../lib/api'
import { tokens } from '../lib/tokens'

export function EmailVerifyModal({ open, onClose, email }) {
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(600)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) { setStep(1); setOtp(''); setCountdown(600); setError('') }
  }, [open])

  useEffect(() => {
    if (step !== 2 || countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [step, countdown])

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const requestOtp = async () => {
    setLoading(true); setError('')
    try { await api.requestOtp(email) } catch {}
    setStep(2); setCountdown(600); setLoading(false)
  }

  const verifyOtp = async () => {
    if (otp.length !== 6) { setError('Inserisci il codice a 6 cifre'); return }
    setLoading(true); setError('')
    try {
      const r = await api.verifyOtp(email, otp)
      const identityToken = r.identity_token
      setStep(3)
      const subdomain = window.location.hostname.split('.')[0]
      const res = await api.selectTenant(subdomain, identityToken)
      const redirectUrl = res.data?.redirect_url
      if (redirectUrl) {
        await fetch(redirectUrl, { credentials: 'include' })
      }
      const appUrl = import.meta.env.VITE_APP_URL
      window.location.href = appUrl.replace('localhost', `${subdomain}.localhost`) + '/login'
    } catch {
      setError('Codice non valido o scaduto.')
      setLoading(false)
    }
  }

  const TITLES = {
    1: 'Email non verificata',
    2: 'Controlla la tua email',
    3: 'Reindirizzamento in corso...',
  }

  return (
    <Modal open={open} onClose={onClose} width={480}>
      <ModalHeader title={TITLES[step]} onClose={onClose} />
      <div style={{ padding: '0 32px 32px' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>
              La tua email non è stata ancora verificata. Verifica la tua email per poter accedere.
            </p>
            {error && <div style={{ color: tokens.error, fontSize: 13 }}>{error}</div>}
            <Button onClick={requestOtp} loading={loading}>Richiedi codice OTP</Button>
          </div>
        )}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
            <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0, textAlign: 'center' }}>
              Abbiamo inviato un codice a <strong style={{ color: tokens.text }}>{email}</strong>
            </p>
            <OtpInput length={6} value={otp} onChange={setOtp} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
              <span style={{ color: tokens.textMuted }}>
                Scade in:{' '}
                <span style={{ color: countdown < 60 ? tokens.error : tokens.accent, fontWeight: 600 }}>
                  {fmt(countdown)}
                </span>
              </span>
              <button
                onClick={() => { setCountdown(600); requestOtp() }}
                style={{ background: 'none', border: 'none', color: tokens.accent, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
              >
                Rinvia
              </button>
            </div>
            {error && <div style={{ color: tokens.error, fontSize: 13 }}>{error}</div>}
            <Button onClick={verifyOtp} loading={loading} style={{ width: '100%' }}>Verifica</Button>
          </div>
        )}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '16px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${tokens.borderSoft}`, borderTopColor: tokens.primary, animation: 'tkSpin 800ms linear infinite' }} />
            <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>Reindirizzamento in corso...</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
