import { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { Modal, ModalHeader } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { OtpInput } from '../components/ui/OtpInput'
import { BrandMark } from '../components/BrandMark'
import { FadeInOnScroll } from '../components/FadeInOnScroll'
import { api } from '../lib/api'
import { tokens } from '../lib/tokens'

function CheckIcon() {
  return (
    <span style={{ width: 18, height: 18, borderRadius: 999, background: 'rgba(16,185,129,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.5 6.5L9 1" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

// ─── Register Modal ──────────────────────────────────────────────────────────
function RegisterModal({ open, onClose, plans, plansError, preselectedPlanId }) {
  const [step, setStep] = useState(1)
  const [planId, setPlanId] = useState(null)
  const [form, setForm] = useState({ companyName: '', subdomain: '', description: '', adminName: '', adminEmail: '', adminPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registeredSubdomain, setRegisteredSubdomain] = useState('')
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(600)
  const [otpError, setOtpError] = useState('')

  useEffect(() => {
    if (open) {
      setStep(preselectedPlanId ? 2 : 1)
      setPlanId(preselectedPlanId || null)
      setForm({ companyName: '', subdomain: '', description: '', adminName: '', adminEmail: '', adminPassword: '' })
      setErrors({})
      setSuccess(false)
      setRegisteredSubdomain('')
      setOtp('')
      setCountdown(600)
      setOtpError('')
    }
  }, [open, preselectedPlanId])

  const selectedPlan = plans?.find((p) => p.id === planId)

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  useEffect(() => {
    if (step !== 3 || countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [step, countdown])

  const verifyOtp = async () => {
    if (otp.length !== 6) { setOtpError('Inserisci il codice a 6 cifre'); return }
    setLoading(true); setOtpError('')
    try {
      await api.verifyRegistrationOtp(form.adminEmail, otp)
      setSuccess(true)
      setTimeout(() => {
        const appUrl = import.meta.env.VITE_APP_URL
        window.location.href = appUrl.replace('localhost', `${registeredSubdomain}.localhost`) + '/login'
      }, 1500)
    } catch {
      setOtpError('Codice non valido o scaduto.')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setCountdown(600); setOtpError('')
    try { await api.resendVerificationEmail(form.adminEmail) } catch {}
  }

  const submit = async () => {
    const errs = {}
    if (!form.companyName) errs.companyName = 'Obbligatorio'
    if (!form.subdomain) errs.subdomain = 'Obbligatorio'
    else if (!/^[a-z0-9-]+$/.test(form.subdomain)) errs.subdomain = 'Solo lettere minuscole, numeri e trattini'
    if (!form.adminName) errs.adminName = 'Obbligatorio'
    if (!form.adminEmail) errs.adminEmail = 'Obbligatorio'
    if (!form.adminPassword) errs.adminPassword = 'Obbligatorio'
    else if (form.adminPassword.length < 8) errs.adminPassword = 'Almeno 8 caratteri'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      if (form.subdomain === 'test') {
        setErrors({ subdomain: 'Questo sottodominio è già in uso' })
        return
      }
      const res = await api.registerTenant({ ...form, planId })
      setRegisteredSubdomain(res.subdomain || form.subdomain)
      setOtp('')
      setCountdown(600)
      setOtpError('')
      setStep(3)
    } catch {
      setErrors({ _form: 'Errore nella registrazione, riprova.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} width={560}>
      <ModalHeader
        title={success ? 'Verifica completata' : step === 1 ? 'Scegli il tuo piano' : step === 2 ? 'Crea il tuo workspace' : 'Verifica la tua email'}
        onClose={onClose}
      />
      {success ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '24px 32px 40px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${tokens.borderSoft}`, borderTopColor: tokens.primary, animation: 'tkSpin 800ms linear infinite' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: tokens.text, fontWeight: 600, fontSize: 16, margin: '0 0 8px' }}>Email verificata!</p>
            <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>Reindirizzamento al tuo workspace...</p>
          </div>
        </div>
      ) : step === 1 ? (
        <div style={{ padding: '8px 32px 32px' }}>
          {!plans && !plansError && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[0, 1].map((i) => <Skeleton key={i} width="100%" height={80} />)}
            </div>
          )}
          {plansError && (
            <p style={{ color: tokens.error, fontSize: 14, textAlign: 'center', padding: '24px 0', margin: 0 }}>
              Impossibile caricare i piani. Chiudi e riprova più tardi.
            </p>
          )}
          {plans && (
            <>
              <p style={{ color: tokens.textMuted, fontSize: 14, margin: '0 0 24px' }}>
                Seleziona il piano più adatto alla tua azienda. Potrai cambiarlo in seguito.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plans.map((plan) => (
                  <Card key={plan.id} hoverable onClick={() => { setPlanId(plan.id); setStep(2) }} style={{ padding: 20, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <h4 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{plan.name}</h4>
                          {plan.database_type === 'dedicated' && <Badge color="purple">Premium</Badge>}
                        </div>
                        <p style={{ color: tokens.textMuted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{plan.description}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>€{plan.price_month}</div>
                        <div style={{ fontSize: 12, color: tokens.textMuted }}>/ mese</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      ) : step === 2 ? (
        <div style={{ padding: '8px 32px 32px' }}>
          {selectedPlan && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, marginBottom: 20, background: 'rgba(124,58,237,0.08)', border: `1px solid ${tokens.borderSoft}`, borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: tokens.textMuted, marginBottom: 2 }}>Piano selezionato</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{selectedPlan.name} · €{selectedPlan.price_month}/mese</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Cambia</Button>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Nome azienda" placeholder="Es. Acme Srl" value={form.companyName} error={errors.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            <Input label="Sottodominio" placeholder="tuodominio" value={form.subdomain} error={errors.subdomain} suffix=".localhost"
              onChange={(e) => setForm({ ...form, subdomain: e.target.value.toLowerCase() })} />
            {form.subdomain && !errors.subdomain && (
              <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: -8, marginLeft: 2 }}>
                Anteprima: <span style={{ color: tokens.accent, fontWeight: 600 }}>{form.subdomain}.localhost</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, color: tokens.textMuted, fontWeight: 500 }}>
                Descrizione azienda <span style={{ marginLeft: 6, fontSize: 11, color: 'rgba(139,139,158,0.6)', fontWeight: 400 }}>(opzionale)</span>
              </label>
              <textarea
                placeholder="Breve descrizione dell'azienda e del tipo di supporto..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                style={{
                  background: tokens.inputBg, border: `1px solid ${tokens.border}`,
                  borderRadius: 8, padding: '10px 12px', color: tokens.text,
                  fontSize: 14, fontFamily: 'inherit', outline: 'none',
                  resize: 'vertical', minHeight: 72, transition: 'border-color 200ms ease', lineHeight: 1.55,
                }}
                onFocus={(e) => (e.target.style.borderColor = tokens.primary)}
                onBlur={(e) => (e.target.style.borderColor = tokens.border)}
              />
            </div>
            <Input label="Nome Admin" placeholder="Mario Rossi" value={form.adminName} error={errors.adminName}
              onChange={(e) => setForm({ ...form, adminName: e.target.value })} />
            <Input label="Email Admin" type="email" placeholder="mario@azienda.it" value={form.adminEmail} error={errors.adminEmail}
              onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
            <Input label="Password Admin" type="password" placeholder="Almeno 8 caratteri" value={form.adminPassword} error={errors.adminPassword}
              onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} />
            {errors._form && <div style={{ color: tokens.error, fontSize: 13 }}>{errors._form}</div>}
            <Button onClick={submit} loading={loading} style={{ marginTop: 8 }}>Crea workspace</Button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '8px 32px 32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
            <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0, textAlign: 'center' }}>
              Abbiamo inviato un codice di verifica a{' '}
              <strong style={{ color: tokens.text }}>{form.adminEmail}</strong>
            </p>
            <OtpInput length={6} value={otp} onChange={setOtp} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
              <span style={{ color: tokens.textMuted }}>
                Scade in:{' '}
                <span style={{ color: countdown < 60 ? tokens.error : tokens.accent, fontWeight: 600 }}>{fmt(countdown)}</span>
              </span>
              <button onClick={resendOtp} style={{ background: 'none', border: 'none', color: tokens.accent, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                Rinvia codice
              </button>
            </div>
            {otpError && <div style={{ color: tokens.error, fontSize: 13 }}>{otpError}</div>}
            <Button onClick={verifyOtp} loading={loading} style={{ width: '100%' }}>Verifica</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Find Workspace Modal ────────────────────────────────────────────────────
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
    try {
      await api.requestOtp(email)
    } catch {}
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

  const STEP_TITLES = { 1: 'Trova il tuo spazio di lavoro', 2: 'Controlla la tua email', 3: 'I tuoi spazi di lavoro', 4: 'Reindirizzamento in corso...' }

  return (
    <Modal open={open} onClose={onClose} width={480}>
      <ModalHeader title={STEP_TITLES[step]} onClose={onClose} />
      <div style={{ padding: '0 32px 32px' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>
              Inserisci la tua email per ricevere un codice di accesso.
            </p>
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
              <button onClick={() => { setCountdown(600); requestOtp() }} style={{ background: 'none', border: 'none', color: tokens.accent, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                Rinvia codice
              </button>
            </div>
            {error && <div style={{ color: tokens.error, fontSize: 13 }}>{error}</div>}
            <Button onClick={verifyOtp} loading={loading} style={{ width: '100%' }}>Verifica</Button>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>
              Seleziona il workspace a cui vuoi accedere.
            </p>
            {tenants.map((t) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderRadius: 12,
                background: 'rgba(124,58,237,0.06)', border: `1px solid ${tokens.borderSoft}`,
              }}>
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
              <p style={{ color: tokens.text, fontWeight: 600, fontSize: 16, margin: '0 0 8px' }}>
                Accesso a {selectedTenant?.name}
              </p>
              <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>Reindirizzamento in corso...</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── Landing ─────────────────────────────────────────────────────────────────
export function Landing() {
  const [plans, setPlans] = useState(null)
  const [plansError, setPlansError] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [findOpen, setFindOpen] = useState(false)
  const [preselectedPlan, setPreselectedPlan] = useState(null)

  const fetchPlans = () => {
    setPlansError(false)
    setPlans(null)
    api.getPlans().then((r) => setPlans(r.data)).catch(() => setPlansError(true))
  }

  useEffect(() => { fetchPlans() }, [])

  const openRegister = (planId) => { setPreselectedPlan(planId || null); setRegisterOpen(true) }

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, color: tokens.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top bar */}
      <div style={{ padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrandMark />
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>Ticketing</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '80px 24px 96px', textAlign: 'center', position: 'relative' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.22) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, animation: 'tkFadeUp 700ms ease' }}>
          <Badge color="purple" style={{ marginBottom: 24 }}>✨ Piattaforma SaaS multi-tenant</Badge>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 68px)', lineHeight: 1.05, fontWeight: 800, margin: '0 0 24px', letterSpacing: '-0.025em' }}>
            Il supporto clienti<br />
            <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #A78BFA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              che scala con te
            </span>
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, color: tokens.textMuted, maxWidth: 640, margin: '0 auto 40px' }}>
            Ticketing è la piattaforma SaaS per gestire le richieste di assistenza del tuo team, con isolamento completo per ogni azienda.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button size="lg" onClick={() => openRegister()}>Registra la tua azienda</Button>
            <Button size="lg" variant="secondary" onClick={() => setFindOpen(true)}>Trova il tuo spazio di lavoro</Button>
          </div>
        </div>
      </section>

      {/* Come funziona */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px 96px' }}>
        <FadeInOnScroll>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 40, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Come funziona</h2>
            <p style={{ color: tokens.textMuted, fontSize: 16, margin: 0 }}>Tutto quello che serve per gestire il supporto, in un'unica piattaforma</p>
          </div>
        </FadeInOnScroll>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {[
            { icon: '🎫', title: 'Ticket', text: 'Gestisci tutte le richieste in un unico posto' },
            { icon: '👥', title: 'Team', text: 'Organizza il tuo staff in team specializzati' },
            { icon: '⏱️', title: 'SLA', text: 'Monitora i tempi di risposta con policy configurabili' },
            { icon: '🔔', title: 'Notifiche', text: 'Tieni tutti aggiornati in tempo reale' },
          ].map((f, i) => (
            <FadeInOnScroll key={f.title} delay={i * 80}>
              <Card hoverable style={{ height: '100%' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(124, 58, 237, 0.12)', border: `1px solid ${tokens.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ color: tokens.textMuted, fontSize: 14, lineHeight: 1.55, margin: 0 }}>{f.text}</p>
              </Card>
            </FadeInOnScroll>
          ))}
        </div>
      </section>

      {/* Piani */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 96px' }}>
        <FadeInOnScroll>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 40, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Scegli il piano giusto per te</h2>
            <p style={{ color: tokens.textMuted, fontSize: 16, margin: 0 }}>Altri piani in arrivo 🚀</p>
          </div>
        </FadeInOnScroll>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, maxWidth: 820, margin: '0 auto' }}>
          {!plans && !plansError && [0, 1].map((i) => (
            <Card key={i} style={{ padding: 32 }}>
              <Skeleton width={120} height={20} style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height={14} count={2} />
              <div style={{ height: 24 }} />
              <Skeleton width={140} height={36} />
              <div style={{ height: 24 }} />
              <Skeleton width="100%" height={42} />
            </Card>
          ))}
          {plansError && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: tokens.error, fontSize: 15, margin: '0 0 16px' }}>
                Impossibile caricare i piani. Controlla la connessione e riprova.
              </p>
              <Button variant="secondary" onClick={fetchPlans}>Riprova</Button>
            </div>
          )}
          {plans && plans.map((plan, i) => (
            <FadeInOnScroll key={plan.id} delay={i * 100}>
              <Card hoverable style={{
                padding: 32, height: '100%', display: 'flex', flexDirection: 'column',
                background: plan.database_type === 'dedicated' ? `linear-gradient(180deg, rgba(124,58,237,0.08) 0%, ${tokens.surface} 100%)` : tokens.surface,
                borderColor: plan.database_type === 'dedicated' ? tokens.border : tokens.borderSoft,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{plan.name}</h3>
                  {plan.database_type === 'dedicated' && <Badge color="purple">Premium</Badge>}
                </div>
                <p style={{ color: tokens.textMuted, fontSize: 14, lineHeight: 1.55, margin: '0 0 24px', minHeight: 44 }}>{plan.description}</p>
                <div style={{ marginBottom: 28 }}>
                  <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em' }}>€{plan.price_month}</span>
                  <span style={{ color: tokens.textMuted, fontSize: 15 }}> / mese</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {(plan.features || []).map((feat) => (
                    <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                      <CheckIcon />{feat}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.database_type === 'dedicated' ? 'primary' : 'secondary'} onClick={() => openRegister(plan.id)} style={{ width: '100%' }}>
                  Scegli piano
                </Button>
              </Card>
            </FadeInOnScroll>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${tokens.borderSoft}`, padding: '32px 24px', textAlign: 'center', color: tokens.textMuted, fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <BrandMark size={18} />
          <span style={{ fontWeight: 600, color: tokens.text }}>Ticketing</span>
        </div>
        © {new Date().getFullYear()} Ticketing. Tutti i diritti riservati.
      </footer>

      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} plans={plans} plansError={plansError} preselectedPlanId={preselectedPlan} />
      <FindWorkspaceModal open={findOpen} onClose={() => setFindOpen(false)} />
    </div>
  )
}
