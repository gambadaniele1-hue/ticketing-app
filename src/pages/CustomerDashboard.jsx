import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { tokens } from '../lib/tokens'

const TICKETS_INIT = [
  { id: 1, title: 'Problema con il login',               status: 'in_progress', date: '12 gen 2025', unread: 1 },
  { id: 2, title: 'Richiesta upgrade al piano Pro',      status: 'open',        date: '10 gen 2025', unread: 0 },
  { id: 3, title: 'Fattura duplicata dicembre',          status: 'closed',      date: '5 gen 2025',  unread: 0 },
  { id: 4, title: 'Import contatti CSV bloccato',        status: 'in_progress', date: '14 gen 2025', unread: 2 },
  { id: 5, title: "Come funziona l'esportazione dati?",  status: 'closed',      date: '2 gen 2025',  unread: 0 },
  { id: 6, title: 'Accesso negato alla sezione Report',  status: 'resolved',    date: '8 gen 2025',  unread: 0 },
  { id: 7, title: 'Aggiornamento dati aziendali',        status: 'open',        date: '15 gen 2025', unread: 3 },
]

const MESSAGES_INIT = {
  1: [
    { id: 1, from: 'Tu',       agent: false, text: 'Non riesco ad accedere al sistema da ieri mattina. Ho già provato a reimpostare la password.', time: '10:30' },
    { id: 2, from: 'Supporto', agent: true,  text: 'Ciao! Ho sbloccato manualmente il tuo account. Prova ora ad accedere — se il problema persiste scrivici di nuovo.', time: '10:45' },
    { id: 3, from: 'Tu',       agent: false, text: 'Ho riprovato ma continua a non funzionare. Uso Chrome aggiornato.', time: '11:02' },
    { id: 4, from: 'Supporto', agent: true,  text: 'Proviamo a svuotare i cookie: Impostazioni → Privacy → Cancella dati → spunta solo "Cookie". Poi riprova.', time: '11:10' },
  ],
  2: [
    { id: 1, from: 'Tu',       agent: false, text: 'Vorrei passare al piano Pro il prossimo mese. È possibile avere anche uno sconto annuale?', time: '09:15' },
    { id: 2, from: 'Supporto', agent: true,  text: 'Ciao! Certamente, per il piano annuale prevediamo uno sconto del 20%. Ti invio i dettagli via email.', time: '09:40' },
  ],
  3: [
    { id: 1, from: 'Tu',       agent: false, text: 'Ho ricevuto due fatture identiche per dicembre. Ho pagato una sola volta, come posso ottenere il rimborso?', time: '14:00' },
    { id: 2, from: 'Supporto', agent: true,  text: 'Ci scusiamo per il disagio. Ho verificato e confermo la duplicazione. Il rimborso sarà accreditato entro 3 giorni lavorativi.', time: '15:30' },
    { id: 3, from: 'Tu',       agent: false, text: 'Perfetto, grazie per la rapida risposta!', time: '15:35' },
    { id: 4, from: 'Supporto', agent: true,  text: 'Prego! Il ticket verrà chiuso automaticamente. Siamo sempre a disposizione.', time: '15:36' },
  ],
  4: [
    { id: 1, from: 'Tu',       agent: false, text: "L'import CSV si blocca alla riga 450 su 1200. Non appare nessun messaggio di errore.", time: '09:30' },
    { id: 2, from: 'Supporto', agent: true,  text: 'Grazie per la segnalazione. Puoi inviarci il file CSV? Potrebbe esserci un carattere speciale in una cella.', time: '09:50' },
    { id: 3, from: 'Tu',       agent: false, text: 'Ho caricato il file nella sezione allegati.', time: '10:05' },
    { id: 4, from: 'Supporto', agent: true,  text: 'Ottimo, sto analizzando il file. Ti aggiorno a breve.', time: '10:30' },
    { id: 5, from: 'Supporto', agent: true,  text: 'Trovato il problema: le righe con valori vuoti nella colonna "telefono" causano il blocco. Prova a rimuovere quelle righe e ricarica.', time: '11:15' },
  ],
  5: [
    { id: 1, from: 'Tu',       agent: false, text: "Non trovo il pulsante per esportare i dati nell'interfaccia.", time: '11:00' },
    { id: 2, from: 'Supporto', agent: true,  text: "Vai in Dashboard → Report → icona di download in alto a destra. È disponibile nei formati CSV, XLSX e PDF.", time: '11:20' },
    { id: 3, from: 'Tu',       agent: false, text: 'Trovato, grazie!', time: '11:25' },
  ],
  6: [
    { id: 1, from: 'Tu',       agent: false, text: "Quando apro la sezione Report avanzati ricevo 'Accesso negato'. Il mio collega con lo stesso piano ci entra.", time: '10:00' },
    { id: 2, from: 'Supporto', agent: true,  text: "Ho verificato il tuo profilo: mancava il permesso 'reports.advanced'. L'ho abilitato ora, ricarica la pagina.", time: '10:25' },
    { id: 3, from: 'Tu',       agent: false, text: 'Perfetto, ora funziona!', time: '10:30' },
  ],
  7: [
    { id: 1, from: 'Tu',       agent: false, text: 'Dobbiamo aggiornare la ragione sociale e il codice fiscale della nostra azienda nel profilo account.', time: '08:45' },
    { id: 2, from: 'Supporto', agent: true,  text: 'Ciao! Per motivi di sicurezza, la modifica dei dati fiscali richiede un documento di identità del titolare. Puoi caricarlo qui?', time: '09:10' },
    { id: 3, from: 'Supporto', agent: true,  text: 'Nella sezione Allegati qui sotto puoi caricare il documento in formato PDF o JPG.', time: '09:11' },
  ],
}

const STATUS = {
  open:        { label: 'Aperto',         color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: '●' },
  in_progress: { label: 'In lavorazione', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', icon: '◐' },
  resolved:    { label: 'Risolto',        color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: '✓' },
  closed:      { label: 'Chiuso',         color: '#6b7280', bg: 'rgba(107,114,128,0.12)',icon: '○' },
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.open
  return (
    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: s.color, background: s.bg, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontSize: 9 }}>{s.icon}</span>
      {s.label}
    </span>
  )
}

function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel, danger }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onCancel}>
      <div
        style={{
          background: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: 16, padding: '32px 28px',
          maxWidth: 400, width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(124,58,237,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={danger ? '#EF4444' : tokens.primary} strokeWidth="2" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: tokens.text }}>{title}</h3>
        </div>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: tokens.textMuted, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent', border: `1px solid ${tokens.border}`, borderRadius: 8,
              color: tokens.textMuted, fontSize: 14, padding: '9px 20px',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 150ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >Annulla</button>
          <button
            onClick={onConfirm}
            style={{
              background: danger ? 'rgba(239,68,68,0.15)' : tokens.primary,
              border: `1px solid ${danger ? 'rgba(239,68,68,0.4)' : 'transparent'}`,
              borderRadius: 8, color: danger ? '#EF4444' : '#fff',
              fontSize: 14, fontWeight: 600, padding: '9px 20px',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 150ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.25)' : '#6D28D9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.15)' : tokens.primary)}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', background: tokens.inputBg, border: `1px solid ${tokens.border}`,
  borderRadius: 8, padding: '10px 12px', color: tokens.text, fontSize: 14,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
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
  const [closeConfirm, setCloseConfirm] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  const selected = tickets.find((t) => t.id === selectedId)
  const thread = selectedId ? (messages[selectedId] || []) : []
  const totalUnread = tickets.reduce((sum, t) => sum + (t.unread || 0), 0)
  const unreadTickets = tickets.filter((t) => t.unread > 0)

  useEffect(() => {
    if (!notifOpen) return
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  const logout = async () => {
    try { await api.logout() } catch {}
    clearAuth()
    navigate('/login', { replace: true })
  }

  const openDetail = (id) => {
    setSelectedId(id)
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, unread: 0 } : t))
    setNotifOpen(false)
    setView('detail')
  }

  const markAllRead = () => {
    setTickets((prev) => prev.map((t) => ({ ...t, unread: 0 })))
    setNotifOpen(false)
  }

  const openNew = () => { setNewTitle(''); setNewDesc(''); setView('new') }

  const submitNew = () => {
    if (!newTitle.trim()) return
    const id = Date.now()
    const now = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    const date = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
    setTickets((prev) => [{ id, title: newTitle.trim(), status: 'open', date, unread: 0 }, ...prev])
    setMessages((prev) => ({ ...prev, [id]: [{ id: 1, from: 'Tu', agent: false, text: newDesc.trim() || newTitle.trim(), time: now }] }))
    setSelectedId(id); setView('detail')
  }

  const closeTicket = () => {
    setTickets((prev) => prev.map((t) => t.id === selectedId ? { ...t, status: 'closed' } : t))
    setCloseConfirm(false)
    setView('list')
  }

  const sendReply = () => {
    if (!reply.trim()) return
    const now = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => ({ ...prev, [selectedId]: [...thread, { id: Date.now(), from: 'Tu', agent: false, text: reply.trim(), time: now }] }))
    setReply('')
  }

  const lastMessage = (id) => {
    const msgs = messages[id] || []
    return msgs[msgs.length - 1] || null
  }

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, color: tokens.text, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {closeConfirm && (
        <ConfirmDialog
          title="Chiudi ticket"
          message="Sei sicuro di voler chiudere questo ticket? Una volta chiuso non potrai più inviare messaggi."
          confirmLabel="Chiudi ticket"
          onConfirm={closeTicket}
          onCancel={() => setCloseConfirm(false)}
          danger
        />
      )}

      <header style={{
        padding: '0 32px', height: 60,
        borderBottom: `1px solid ${tokens.borderSoft}`,
        background: 'rgba(13,13,20,0.9)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrandMark size={24} />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Ticketing</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

          {/* Notification bell with dropdown */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifOpen((o) => !o)}
              style={{
                position: 'relative', background: notifOpen ? 'rgba(124,58,237,0.12)' : 'none',
                border: notifOpen ? `1px solid rgba(124,58,237,0.3)` : '1px solid transparent',
                color: totalUnread > 0 ? tokens.text : tokens.textMuted,
                cursor: 'pointer', padding: '6px 8px', borderRadius: 8,
                transition: 'color 150ms, background 150ms',
                display: 'flex', alignItems: 'center',
              }}
              title={totalUnread > 0 ? `${totalUnread} notifiche non lette` : 'Nessuna notifica'}
              onMouseEnter={(e) => { if (!notifOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={(e) => { if (!notifOpen) e.currentTarget.style.background = 'none' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {totalUnread > 0 && (
                <span style={{
                  position: 'absolute', top: 3, right: 3,
                  background: '#EF4444', color: '#fff',
                  fontSize: 10, fontWeight: 700, lineHeight: 1,
                  minWidth: 15, height: 15, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                }}>{totalUnread}</span>
              )}
            </button>

            {/* Notification dropdown */}
            {notifOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                width: 360, maxHeight: 480,
                background: tokens.surface,
                border: `1px solid ${tokens.border}`,
                borderRadius: 14,
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                zIndex: 50,
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
              }}>
                {/* Header */}
                <div style={{
                  padding: '14px 18px',
                  borderBottom: `1px solid ${tokens.borderSoft}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Notifiche</span>
                    {totalUnread > 0 && (
                      <span style={{
                        background: tokens.primary, color: '#fff',
                        fontSize: 11, fontWeight: 700,
                        padding: '2px 7px', borderRadius: 99,
                      }}>{totalUnread}</span>
                    )}
                  </div>
                  {totalUnread > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 12, color: tokens.primary, fontFamily: 'inherit',
                        padding: '2px 4px', borderRadius: 4,
                        transition: 'opacity 150ms',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >Segna tutte come lette</button>
                  )}
                </div>

                {/* Notification items */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {unreadTickets.length === 0 ? (
                    <div style={{ padding: '32px 18px', textAlign: 'center', color: tokens.textMuted, fontSize: 13 }}>
                      Nessuna notifica non letta
                    </div>
                  ) : (
                    unreadTickets.map((t, idx) => {
                      const msgs = messages[t.id] || []
                      const unreadMsgs = msgs.slice(-t.unread)
                      const s = STATUS[t.status] || STATUS.open
                      return (
                        <div
                          key={t.id}
                          onClick={() => openDetail(t.id)}
                          style={{
                            padding: '14px 18px',
                            borderBottom: idx < unreadTickets.length - 1 ? `1px solid ${tokens.borderSoft}` : 'none',
                            cursor: 'pointer',
                            transition: 'background 150ms',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124,58,237,0.05)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {/* Ticket title row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <div style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: tokens.primary, flexShrink: 0,
                            }} />
                            <span style={{ fontWeight: 700, fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {t.title}
                            </span>
                            <span style={{ fontSize: 11, color: s.color, fontWeight: 600, flexShrink: 0 }}>
                              {s.label}
                            </span>
                          </div>

                          {/* Unread messages */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {unreadMsgs.map((msg) => (
                              <div key={msg.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <div style={{
                                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                                  background: msg.agent ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 10, fontWeight: 700,
                                  color: msg.agent ? tokens.primary : tokens.textMuted,
                                }}>
                                  {msg.agent ? 'S' : (user?.name || 'T').charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 11, color: tokens.textMuted, marginBottom: 2 }}>
                                    {msg.agent ? 'Supporto' : 'Tu'} · {msg.time}
                                  </div>
                                  <div style={{
                                    fontSize: 12, color: tokens.text, lineHeight: 1.5,
                                    overflow: 'hidden', display: '-webkit-box',
                                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                  }}>
                                    {msg.text}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: 8, fontSize: 11, color: tokens.primary, fontWeight: 600 }}>
                            Apri ticket →
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <span style={{ fontSize: 13, color: tokens.textMuted }}>
            Ciao, <strong style={{ color: tokens.text }}>{user?.name || 'Utente'}</strong>
          </span>

          {/* Logout — red by default */}
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 7, color: '#EF4444', fontSize: 13,
              padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'border-color 200ms, background 200ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.14)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Esci
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px' }}>

        {/* LIST VIEW */}
        {view === 'list' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em' }}>I miei ticket</h2>
                <p style={{ margin: 0, fontSize: 13, color: tokens.textMuted }}>
                  {tickets.length} ticket totali
                  {totalUnread > 0 && <> · <span style={{ color: '#EF4444', fontWeight: 600 }}>{totalUnread} non letti</span></>}
                </p>
              </div>
              <Button onClick={openNew}>+ Apri nuovo ticket</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tickets.map((t) => {
                const last = lastMessage(t.id)
                const s = STATUS[t.status] || STATUS.open
                return (
                  <div
                    key={t.id}
                    onClick={() => openDetail(t.id)}
                    style={{
                      background: tokens.surface,
                      border: `1px solid ${t.unread > 0 ? 'rgba(124,58,237,0.35)' : tokens.borderSoft}`,
                      borderRadius: 14, padding: '20px 22px', cursor: 'pointer',
                      display: 'flex', alignItems: 'flex-start', gap: 16,
                      transition: 'border-color 150ms ease, background 150ms ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.03)'; if (!t.unread) e.currentTarget.style.borderColor = tokens.border }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = tokens.surface; e.currentTarget.style.borderColor = t.unread > 0 ? 'rgba(124,58,237,0.35)' : tokens.borderSoft }}
                  >
                    {t.unread > 0 && (
                      <div style={{
                        position: 'absolute', left: 0, top: 12, bottom: 12, width: 3,
                        background: tokens.primary, borderRadius: '0 3px 3px 0',
                      }} />
                    )}

                    <div style={{
                      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                      background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 18, color: s.color }}>{s.icon}</span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontWeight: t.unread > 0 ? 700 : 600, fontSize: 16, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.title}
                        </span>
                        <StatusBadge status={t.status} />
                      </div>
                      {last && (
                        <p style={{ margin: '0 0 6px', fontSize: 13, color: tokens.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.5 }}>
                          <span style={{ color: last.agent ? tokens.primary : tokens.textMuted, fontWeight: 500 }}>
                            {last.agent ? 'Supporto' : 'Tu'}:
                          </span>{' '}
                          {last.text}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, color: tokens.textMuted }}>{t.date}</span>
                        <span style={{ fontSize: 12, color: tokens.textMuted }}>·</span>
                        <span style={{ fontSize: 12, color: tokens.textMuted }}>{(messages[t.id] || []).length} messaggi</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                      {t.unread > 0 && (
                        <span style={{
                          background: tokens.primary, color: '#fff',
                          fontSize: 11, fontWeight: 700,
                          minWidth: 20, height: 20, borderRadius: 10,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: '0 6px',
                        }}>{t.unread}</span>
                      )}
                      <span style={{ color: tokens.textMuted, fontSize: 20, lineHeight: 1 }}>›</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* NEW TICKET VIEW */}
        {view === 'new' && (
          <>
            <button
              style={{ background: 'none', border: 'none', color: tokens.accent, fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 24, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setView('list')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              Torna ai ticket
            </button>
            <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700 }}>Apri nuovo ticket</h2>
            <Card style={{ padding: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                    rows={5}
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

        {/* DETAIL VIEW */}
        {view === 'detail' && selected && (
          <>
            <button
              style={{ background: 'none', border: 'none', color: tokens.accent, fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 24, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setView('list')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              Torna ai ticket
            </button>

            <div style={{
              background: tokens.surface, border: `1px solid ${tokens.borderSoft}`,
              borderRadius: 14, padding: '20px 24px', marginBottom: 16,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
            }}>
              <div>
                <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700 }}>{selected.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StatusBadge status={selected.status} />
                  <span style={{ fontSize: 12, color: tokens.textMuted }}>{selected.date}</span>
                  <span style={{ fontSize: 12, color: tokens.textMuted }}>·</span>
                  <span style={{ fontSize: 12, color: tokens.textMuted }}>{thread.length} messaggi</span>
                </div>
              </div>
              {selected.status !== 'closed' && (
                <button
                  onClick={() => setCloseConfirm(true)}
                  style={{
                    flexShrink: 0,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 8, color: '#EF4444', fontSize: 13, fontWeight: 500,
                    padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.16)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Chiudi ticket
                </button>
              )}
            </div>

            <Card style={{ padding: '24px 20px', marginBottom: 12, minHeight: 320 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {thread.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.agent ? 'flex-start' : 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {msg.agent && (
                        <div style={{
                          width: 24, height: 24, borderRadius: 6,
                          background: 'rgba(124,58,237,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: tokens.primary,
                        }}>S</div>
                      )}
                      <span style={{ fontSize: 12, color: tokens.textMuted, fontWeight: 500 }}>{msg.from}</span>
                      <span style={{ fontSize: 11, color: tokens.textMuted }}>·</span>
                      <span style={{ fontSize: 11, color: tokens.textMuted }}>{msg.time}</span>
                      {!msg.agent && (
                        <div style={{
                          width: 24, height: 24, borderRadius: 6,
                          background: 'rgba(255,255,255,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: tokens.textMuted,
                        }}>{(user?.name || 'T').charAt(0).toUpperCase()}</div>
                      )}
                    </div>
                    <div style={{
                      maxWidth: '72%', padding: '12px 16px',
                      borderRadius: msg.agent ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                      fontSize: 14, lineHeight: 1.6,
                      background: msg.agent ? 'rgba(124,58,237,0.12)' : tokens.inputBg,
                      border: `1px solid ${msg.agent ? 'rgba(124,58,237,0.2)' : tokens.borderSoft}`,
                      color: tokens.text,
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {selected.status !== 'closed' ? (
              <Card style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <textarea
                    placeholder="Scrivi un messaggio..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendReply() }}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: tokens.textMuted }}>Ctrl+Enter per inviare</span>
                    <Button onClick={sendReply} disabled={!reply.trim()}>Invia messaggio</Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div style={{
                textAlign: 'center', padding: '20px',
                background: tokens.surface, border: `1px solid ${tokens.borderSoft}`,
                borderRadius: 12, color: tokens.textMuted, fontSize: 14,
              }}>
                Questo ticket è chiuso. Apri un nuovo ticket per ulteriore assistenza.
              </div>
            )}
          </>
        )}

      </main>
    </div>
  )
}
