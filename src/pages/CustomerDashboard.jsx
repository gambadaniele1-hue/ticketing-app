import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { tokens } from '../lib/tokens'

const TICKETS_INIT = [
  { id: 1, title: 'Problema con il login', status: 'open', date: '10 gen 2025' },
  { id: 2, title: 'Richiesta cambio piano', status: 'in_progress', date: '8 gen 2025' },
  { id: 3, title: 'Errore nella fatturazione', status: 'closed', date: '5 gen 2025' },
]

const MESSAGES_INIT = {
  1: [
    { id: 1, from: 'Tu', agent: false, text: 'Non riesco ad accedere al sistema da ieri mattina.', time: '10:30' },
    { id: 2, from: 'Supporto', agent: true, text: 'Ciao! Ho verificato il tuo account. Prova a fare il reset della password.', time: '10:45' },
  ],
  2: [
    { id: 1, from: 'Tu', agent: false, text: 'Vorrei passare al piano Pro il prossimo mese.', time: '09:15' },
  ],
  3: [
    { id: 1, from: 'Tu', agent: false, text: 'Ho ricevuto una fattura duplicata per dicembre.', time: '14:00' },
    { id: 2, from: 'Supporto', agent: true, text: 'Problema risolto. Il rimborso sarà accreditato entro 3 giorni lavorativi.', time: '15:30' },
    { id: 3, from: 'Tu', agent: false, text: 'Perfetto, grazie!', time: '15:35' },
  ],
}

const STATUS = {
  open: { label: 'Aperto', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  in_progress: { label: 'In lavorazione', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  resolved: { label: 'Risolto', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  closed: { label: 'Chiuso', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.open
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: s.color, background: s.bg }}>
      {s.label}
    </span>
  )
}

const inputStyle = {
  width: '100%', background: tokens.inputBg, border: `1px solid ${tokens.border}`,
  borderRadius: 8, padding: '10px 12px', color: tokens.text, fontSize: 14,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}

const backBtn = {
  background: 'none', border: 'none', color: tokens.accent, fontSize: 14,
  cursor: 'pointer', padding: 0, marginBottom: 24, fontFamily: 'inherit',
}

export function CustomerDashboard() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuth()
  const [tickets, setTickets] = useState(TICKETS_INIT)
  const [messages, setMessages] = useState(MESSAGES_INIT)
  const [view, setView] = useState('list')
  const [selectedId, setSelectedId] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [reply, setReply] = useState('')

  const selected = tickets.find((t) => t.id === selectedId)
  const thread = selectedId ? (messages[selectedId] || []) : []

  const logout = async () => {
    try { await api.logout() } catch {}
    clearAuth()
    navigate('/login', { replace: true })
  }

  const openDetail = (id) => { setSelectedId(id); setView('detail') }

  const openNew = () => { setNewTitle(''); setNewDesc(''); setView('new') }

  const submitNew = () => {
    if (!newTitle.trim()) return
    const id = Date.now()
    const now = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    const date = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
    setTickets((prev) => [{ id, title: newTitle.trim(), status: 'open', date }, ...prev])
    setMessages((prev) => ({ ...prev, [id]: [{ id: 1, from: 'Tu', agent: false, text: newDesc.trim() || newTitle.trim(), time: now }] }))
    setSelectedId(id); setView('detail')
  }

  const closeTicket = () => {
    setTickets((prev) => prev.map((t) => t.id === selectedId ? { ...t, status: 'closed' } : t))
    setView('list')
  }

  const sendReply = () => {
    if (!reply.trim()) return
    const now = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => ({ ...prev, [selectedId]: [...thread, { id: Date.now(), from: 'Tu', agent: false, text: reply.trim(), time: now }] }))
    setReply('')
  }

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, color: tokens.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header style={{
        padding: '16px 32px', borderBottom: `1px solid ${tokens.borderSoft}`,
        background: 'rgba(13,13,20,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrandMark size={24} />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Ticketing</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: tokens.textMuted }}>
            Ciao, <strong style={{ color: tokens.text }}>{user?.name || 'Utente'}</strong>
          </span>
          <button onClick={logout} style={{ background: 'transparent', border: `1px solid ${tokens.border}`, borderRadius: 6, color: tokens.textMuted, fontSize: 13, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Esci
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>

        {view === 'list' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>I miei ticket</h2>
              <Button onClick={openNew}>+ Apri nuovo ticket</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => openDetail(t.id)}
                  style={{
                    background: tokens.surface, border: `1px solid ${tokens.borderSoft}`,
                    borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'border-color 150ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = tokens.border)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = tokens.borderSoft)}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{t.title}</div>
                    <div style={{ fontSize: 13, color: tokens.textMuted }}>{t.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <StatusBadge status={t.status} />
                    <span style={{ color: tokens.textMuted, fontSize: 18 }}>›</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {view === 'new' && (
          <>
            <button style={backBtn} onClick={() => setView('list')}>← Torna ai ticket</button>
            <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700 }}>Apri nuovo ticket</h2>
            <Card style={{ padding: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, color: tokens.textMuted, fontWeight: 500 }}>Titolo</label>
                  <input
                    placeholder="Descrivi brevemente il problema"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, color: tokens.textMuted, fontWeight: 500 }}>Descrizione</label>
                  <textarea
                    placeholder="Fornisci tutti i dettagli necessari..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setView('list')}
                    style={{ background: 'transparent', border: `1px solid ${tokens.border}`, borderRadius: 8, color: tokens.textMuted, fontSize: 14, padding: '10px 20px', cursor: 'pointer', fontFamily: 'inherit' }}
                  >Annulla</button>
                  <Button onClick={submitNew}>Invia ticket</Button>
                </div>
              </div>
            </Card>
          </>
        )}

        {view === 'detail' && selected && (
          <>
            <button style={backBtn} onClick={() => setView('list')}>← Torna ai ticket</button>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 700 }}>{selected.title}</h2>
                <StatusBadge status={selected.status} />
              </div>
              {selected.status !== 'closed' && (
                <button
                  onClick={closeTicket}
                  style={{ background: 'transparent', border: `1px solid rgba(239,68,68,0.4)`, borderRadius: 8, color: tokens.error, fontSize: 13, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit' }}
                >Chiudi ticket</button>
              )}
            </div>

            <Card style={{ padding: 20, marginBottom: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {thread.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.agent ? 'flex-start' : 'flex-end' }}>
                    <div style={{ fontSize: 11, color: tokens.textMuted, marginBottom: 4 }}>
                      {msg.from} · {msg.time}
                    </div>
                    <div style={{
                      maxWidth: '78%', padding: '10px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.55,
                      background: msg.agent ? 'rgba(124,58,237,0.1)' : tokens.inputBg,
                      border: `1px solid ${msg.agent ? tokens.borderSoft : 'transparent'}`,
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {selected.status !== 'closed' && (
              <Card style={{ padding: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <textarea
                    placeholder="Scrivi un messaggio..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={sendReply}>Invia</Button>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

      </main>
    </div>
  )
}
