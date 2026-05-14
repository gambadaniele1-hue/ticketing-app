import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal, ModalHeader } from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { tokens } from '../lib/tokens'

// assignee: 'me' = current agent | '<name>' = other team member | null = unassigned
// category: null = triage
const TICKETS_INIT = [
  // I miei
  { id: 1,  title: 'Problema con il login',              status: 'in_progress', priority: 'high',   user: 'Mario Rossi',      assignee: 'me',        category: 'Tecnico',      date: '10 gen' },
  { id: 2,  title: 'Richiesta cambio piano',             status: 'in_progress', priority: 'medium', user: 'Giulia Bianchi',   assignee: 'me',        category: 'Commerciale',  date: '8 gen'  },
  { id: 9,  title: 'Configurazione SSO aziendale',       status: 'open',        priority: 'high',   user: 'Andrea Martini',   assignee: 'me',        category: 'Tecnico',      date: '13 gen' },
  { id: 10, title: 'Errore import CSV contatti',         status: 'in_progress', priority: 'medium', user: 'Marta Conti',      assignee: 'me',        category: 'Tecnico',      date: '12 gen' },
  { id: 11, title: 'Accesso report avanzati negato',     status: 'open',        priority: 'low',    user: 'Francesco Neri',   assignee: 'me',        category: 'Commerciale',  date: '9 gen'  },
  // Coda team (nessun assegnatario, con categoria)
  { id: 3,  title: 'Bug nella dashboard analytics',      status: 'open',        priority: 'medium', user: 'Sara Neri',        assignee: null,        category: 'Tecnico',      date: '9 gen'  },
  { id: 4,  title: 'Richiesta sessione di formazione',   status: 'open',        priority: 'low',    user: 'Pietro Verdi',     assignee: null,        category: 'Formazione',   date: '7 gen'  },
  { id: 12, title: 'Notifiche email non arrivano',       status: 'open',        priority: 'medium', user: 'Chiara Russo',     assignee: null,        category: 'Tecnico',      date: '14 gen' },
  { id: 13, title: 'Upgrade a piano Enterprise',         status: 'open',        priority: 'high',   user: 'Lorenzo Ferrari',  assignee: null,        category: 'Commerciale',  date: '13 gen' },
  { id: 16, title: 'Impossibile esportare in PDF',       status: 'open',        priority: 'low',    user: 'Teresa Ricci',     assignee: null,        category: 'Tecnico',      date: '11 gen' },
  // Team in lavorazione
  { id: 5,  title: 'Fattura duplicata dicembre',         status: 'in_progress', priority: 'low',    user: 'Luca Verdi',       assignee: 'Anna R.',   category: 'Commerciale',  date: '6 gen'  },
  { id: 6,  title: 'Supporto integrazione webhook API',  status: 'in_progress', priority: 'high',   user: 'Carlo Bianchi',    assignee: 'Marco V.',  category: 'Tecnico',      date: '5 gen'  },
  { id: 14, title: 'Migrazione dati da vecchio CRM',     status: 'in_progress', priority: 'high',   user: 'Beatrice Romano',  assignee: 'Giulia F.', category: 'Tecnico',      date: '11 gen' },
  { id: 17, title: 'Sconto contratto annuale',           status: 'in_progress', priority: 'medium', user: 'Simone Galli',     assignee: 'Anna R.',   category: 'Commerciale',  date: '10 gen' },
  // Triage (nessuna categoria)
  { id: 7,  title: 'Problema non classificato',          status: 'open',        priority: 'medium', user: 'Elena Bianchi',    assignee: null,        category: null,           date: '11 gen' },
  { id: 8,  title: 'Domanda generica sul prodotto',      status: 'open',        priority: 'low',    user: 'Roberto Neri',     assignee: null,        category: null,           date: '11 gen' },
  { id: 15, title: 'Lentezza del sistema nelle ore di punta', status: 'open',   priority: 'high',   user: 'Valentina Costa',  assignee: null,        category: null,           date: '14 gen' },
  { id: 18, title: 'Non so dove aprire la richiesta',    status: 'open',        priority: 'low',    user: 'Dario Mele',       assignee: null,        category: null,           date: '13 gen' },
]

const MESSAGES_INIT = {
  1: [
    { id: 1, from: 'Mario Rossi', agent: false, internal: false, text: 'Non riesco ad accedere al sistema da ieri mattina. Ho provato a reimpostare la password ma non cambia nulla.',   time: '10:30' },
    { id: 2, from: 'Me',          agent: true,  internal: true,  text: 'Controllare i log di accesso — possibile blocco per troppi tentativi falliti.',                                   time: '10:35' },
    { id: 3, from: 'Me',          agent: true,  internal: false, text: 'Ciao Mario, sto verificando il tuo account. Nel frattempo prova a svuotare la cache del browser.',               time: '10:40' },
    { id: 4, from: 'Mario Rossi', agent: false, internal: false, text: 'Ho svuotato la cache ma il problema persiste.',                                                                   time: '11:05' },
    { id: 5, from: 'Me',          agent: true,  internal: false, text: 'Ho sbloccato manualmente il tuo account lato backend. Prova ora ad accedere e dimmi se funziona.',               time: '11:12' },
  ],
  2: [
    { id: 1, from: 'Giulia Bianchi', agent: false, internal: false, text: 'Vorrei passare al piano Pro dal prossimo mese, è possibile avere anche uno sconto annuale?',                  time: '09:15' },
    { id: 2, from: 'Me',             agent: true,  internal: true,  text: "Cliente su piano Base da 8 mesi — verificare se è idonea all'offerta fedeltà.",                               time: '09:20' },
    { id: 3, from: 'Me',             agent: true,  internal: false, text: "Ciao Giulia! Certamente, stiamo valutando la tua richiesta. Ti rispondo entro oggi con un'offerta dedicata.", time: '09:25' },
  ],
  3: [
    { id: 1, from: 'Sara Neri', agent: false, internal: false, text: "I dati nella sezione analytics non si aggiornano, mostrano ancora i numeri di 3 giorni fa.",                       time: '09:00' },
    { id: 2, from: 'Giulia F.', agent: true,  internal: true,  text: 'Problema noto in staging — potrebbe essere la cache del widget. Ticket aperto con il team Dev.',                   time: '09:45' },
  ],
  4: [
    { id: 1, from: 'Pietro Verdi', agent: false, internal: false, text: 'Avrei bisogno di una sessione di onboarding per il mio team di 6 persone, preferibilmente online.',            time: '14:00' },
  ],
  5: [
    { id: 1, from: 'Luca Verdi', agent: false, internal: false, text: 'Ho ricevuto una fattura duplicata per dicembre, ma ho pagato una sola volta.',                                    time: '14:00' },
    { id: 2, from: 'Anna R.',    agent: true,  internal: false, text: 'Ciao Luca, ho aperto una verifica con il team fatturazione. Ti aggiorno entro 24 ore.',                           time: '14:30' },
    { id: 3, from: 'Anna R.',    agent: true,  internal: true,  text: 'Probabile bug nel sistema di rinnovo automatico. Ho escalato al team Dev con priorità alta.',                     time: '14:31' },
    { id: 4, from: 'Luca Verdi', agent: false, internal: false, text: 'Grazie, attendo aggiornamenti.',                                                                                  time: '14:40' },
  ],
  6: [
    { id: 1, from: 'Carlo Bianchi', agent: false, internal: false, text: "I webhook configurati per il nostro e-commerce non ricevono i payload. L'endpoint risponde correttamente.", time: '11:00' },
    { id: 2, from: 'Marco V.',      agent: true,  internal: true,  text: 'Verificare la configurazione SSL del loro endpoint — potrebbe essere il certificato scaduto.',              time: '11:15' },
    { id: 3, from: 'Marco V.',      agent: true,  internal: false, text: 'Sto analizzando i log in uscita. Puoi inviarmi un esempio del payload atteso e il tuo endpoint completo?', time: '11:20' },
    { id: 4, from: 'Carlo Bianchi', agent: false, internal: false, text: 'Endpoint: https://api.mioshop.it/hooks/ticketing — il payload atteso è in allegato al ticket.',           time: '11:35' },
  ],
  7: [
    { id: 1, from: 'Elena Bianchi', agent: false, internal: false, text: 'Ho un problema con un ordine ma non so esattamente dove segnalarlo, spero sia il posto giusto.',           time: '08:30' },
  ],
  8: [
    { id: 1, from: 'Roberto Neri', agent: false, internal: false, text: "Come funziona la funzione di esportazione dei dati? Non trovo il pulsante nell'interfaccia.",              time: '10:00' },
  ],
  9: [
    { id: 1, from: 'Andrea Martini', agent: false, internal: false, text: 'Dobbiamo configurare il login SSO con il nostro provider Okta. Come procediamo?',                        time: '08:15' },
    { id: 2, from: 'Me',             agent: true,  internal: true,  text: 'Verificare se il loro piano include SSO — solo Enterprise. Controllare prima di rispondere.',            time: '08:20' },
    { id: 3, from: 'Me',             agent: true,  internal: false, text: "Ciao Andrea! Per configurare l'SSO con Okta ho bisogno dell'Entity ID e del Metadata URL del vostro IdP.", time: '08:30' },
  ],
  10: [
    { id: 1, from: 'Marta Conti', agent: false, internal: false, text: "L'import CSV si blocca sempre alla riga 450 circa senza messaggio di errore. Il file ha 1200 righe.",      time: '09:30' },
    { id: 2, from: 'Me',          agent: true,  internal: false, text: "Ciao Marta, puoi inviarci il file CSV? Probabilmente c'è un carattere speciale in una cella.",             time: '09:45' },
  ],
  11: [
    { id: 1, from: 'Francesco Neri', agent: false, internal: false, text: "Quando provo ad aprire la sezione Report Avanzati mi dice 'Accesso negato'. Il mio collega riesce.", time: '10:00' },
  ],
  12: [
    { id: 1, from: 'Chiara Russo', agent: false, internal: false, text: 'Da tre giorni non ricevo più le email di notifica per i nuovi ticket. Gli altri colleghi le ricevono.',  time: '15:00' },
  ],
  13: [
    { id: 1, from: 'Lorenzo Ferrari', agent: false, internal: false, text: 'Siamo interessati a passare al piano Enterprise per tutta la nostra azienda (50 utenti). Volete farci una proposta?', time: '16:00' },
  ],
  14: [
    { id: 1, from: 'Beatrice Romano', agent: false, internal: false, text: 'Dobbiamo importare circa 8000 clienti dal nostro vecchio CRM. È possibile farlo in batch?',             time: '10:00' },
    { id: 2, from: 'Giulia F.',       agent: true,  internal: true,  text: "Limite standard import: 5000 righe. Serve autorizzazione per import multipli. Chiedere all'admin.", time: '10:20' },
    { id: 3, from: 'Giulia F.',       agent: true,  internal: false, text: "Ciao Beatrice! Sì, è possibile in due batch. Ti mando le istruzioni per il formato del file.",          time: '10:30' },
  ],
  15: [
    { id: 1, from: 'Valentina Costa', agent: false, internal: false, text: "Il sistema è molto lento tra le 9 e le 11 di mattina, ci mette 10+ secondi a caricare ogni pagina.", time: '09:05' },
  ],
  16: [
    { id: 1, from: 'Teresa Ricci', agent: false, internal: false, text: 'Il tasto "Esporta in PDF" non fa nulla quando lo clicco, né su Chrome né su Firefox.',                   time: '11:00' },
  ],
  17: [
    { id: 1, from: 'Simone Galli', agent: false, internal: false, text: "Vorrei rinnovare per un anno anziché mensile. C'è uno sconto dedicato?",                                  time: '14:30' },
    { id: 2, from: 'Anna R.',      agent: true,  internal: false, text: 'Ciao Simone! Sì, per il piano annuale hai il 20% di sconto rispetto al mensile. Posso inviarti il link di pagamento.', time: '15:00' },
  ],
  18: [
    { id: 1, from: 'Dario Mele', agent: false, internal: false, text: 'Non capisco bene dove devo scrivere per il supporto, ho provato varie sezioni.',                             time: '12:00' },
  ],
}

const STATUS = {
  open:        { label: 'Aperto',        color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  in_progress: { label: 'In lavorazione',color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'  },
  resolved:    { label: 'Risolto',       color: '#10B981', bg: 'rgba(16,185,129,0.12)'  },
  closed:      { label: 'Chiuso',        color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
}

const PRIORITY = {
  high:   { label: 'Alta',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)'   },
  medium: { label: 'Media', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  low:    { label: 'Bassa', color: '#10B981', bg: 'rgba(16,185,129,0.12)'  },
}

const STATUS_OPTIONS = [
  { value: 'open',        label: 'Aperto'         },
  { value: 'in_progress', label: 'In lavorazione' },
  { value: 'resolved',    label: 'Risolto'        },
  { value: 'closed',      label: 'Chiuso'         },
]

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.open
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: s.color, background: s.bg }}>{s.label}</span>
}

function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || PRIORITY.low
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: p.color, background: p.bg }}>{p.label}</span>
}

const inputStyle = {
  width: '100%', background: tokens.inputBg, border: `1px solid ${tokens.border}`,
  borderRadius: 8, padding: '10px 12px', color: tokens.text, fontSize: 14,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}

const sectionLabel = {
  fontSize: 11, fontWeight: 700, color: tokens.textMuted,
  textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px',
}

export function AgentDashboard() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuth()

  const [tickets, setTickets]     = useState(TICKETS_INIT)
  const [messages, setMessages]   = useState(MESSAGES_INIT)
  const [section, setSection]     = useState('my')   // 'my' | 'team' | 'triage'
  const [view, setView]           = useState('list') // 'list' | 'detail'
  const [selectedId, setSelectedId] = useState(null)
  const [reply, setReply]         = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [statusDraft, setStatusDraft]     = useState('open')
  const [teamTab, setTeamTab]             = useState('queue')
  const [categories, setCategories]       = useState([])
  const [assignModalId, setAssignModalId] = useState(null)

  // Ticket groups (recomputed on every render so they stay in sync after mutations)
  const myTickets   = tickets.filter((t) => t.assignee === 'me')
  const queueTickets = tickets.filter((t) => !t.assignee && t.category)
  const teamTickets  = tickets.filter((t) => t.assignee && t.assignee !== 'me')
  const triageTickets = tickets.filter((t) => !t.category)

  // Always use live ticket (post-mutation) in detail view
  const selectedLive = tickets.find((t) => t.id === selectedId)
  const thread = selectedId ? (messages[selectedId] || []) : []
  const isMineLive = selectedLive?.assignee === 'me'
  const isTeamLive = !!(selectedLive?.assignee && selectedLive.assignee !== 'me')

  const logout = async () => {
    try { await api.logout() } catch {}
    clearAuth()
    navigate('/login', { replace: true })
  }

  const goToSection = (s) => { setSection(s); setView('list'); setSelectedId(null) }

  const openDetail = (id) => {
    const t = tickets.find((t) => t.id === id)
    setSelectedId(id)
    setStatusDraft(t?.status || 'open')
    setReply('')
    setIsInternal(false)
    setView('detail')
  }

  const takeOver = (id, e) => {
    e?.stopPropagation()
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, assignee: 'me', status: 'in_progress' } : t))
    if (selectedId === id) setStatusDraft('in_progress')
  }

  const sendReply = () => {
    if (!reply.trim()) return
    const now = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    const forcedInternal = isTeamLive || isInternal
    const msg = { id: Date.now(), from: user?.name || 'Agente', agent: true, internal: forcedInternal, text: reply.trim(), time: now }
    setMessages((prev) => ({ ...prev, [selectedId]: [...thread, msg] }))
    setReply('')
  }

  const updateStatus = () => {
    setTickets((prev) => prev.map((t) => t.id === selectedId ? { ...t, status: statusDraft } : t))
  }

  const categoriesFetchedRef = useRef(false)

  useEffect(() => {
    if (categoriesFetchedRef.current) return
    categoriesFetchedRef.current = true
    api.getAdminCategories().then((r) => setCategories(r.data || [])).catch(() => {})
  }, [])

  const assignCategory = (ticketId, catName) => {
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, category: catName } : t))
    setAssignModalId(null)
  }

  const NAV = [
    { key: 'my',    label: 'I tuoi ticket',    icon: '🎫', count: myTickets.length    },
    { key: 'team',  label: 'Ticket del team',  icon: '👥', count: queueTickets.length },
    { key: 'triage',label: 'Triage',           icon: '🔀', count: triageTickets.length},
  ]

  const TicketRow = ({ t, showAssignee = false, actionSlot = null }) => (
    <div
      onClick={() => openDetail(t.id)}
      style={{
        background: tokens.surface, border: `1px solid ${tokens.borderSoft}`,
        borderRadius: 12, padding: '14px 18px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'border-color 150ms ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = tokens.border)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = tokens.borderSoft)}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
        <div style={{ fontSize: 12, color: tokens.textMuted }}>
          {t.user}
          {t.category && ` · ${t.category}`}
          {showAssignee && t.assignee && ` · `}
          {showAssignee && t.assignee && <strong style={{ color: tokens.text }}>{t.assignee}</strong>}
          {` · ${t.date}`}
        </div>
      </div>
      <PriorityBadge priority={t.priority} />
      {actionSlot || <><StatusBadge status={t.status} /><span style={{ color: tokens.textMuted, fontSize: 16 }}>›</span></>}
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, color: tokens.text, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0, background: tokens.sidebar,
        borderRight: `1px solid ${tokens.borderSoft}`,
        display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0,
      }}>
        <div style={{ padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${tokens.borderSoft}` }}>
          <BrandMark size={26} />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>Ticketing</div>
            <div style={{ fontSize: 11, color: tokens.textMuted, fontWeight: 500 }}>Agente</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map((item) => {
            const active = section === item.key
            return (
              <button
                key={item.key}
                onClick={() => goToSection(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 8, width: '100%',
                  background: active ? 'rgba(124,58,237,0.18)' : 'transparent',
                  border: 'none', color: active ? tokens.text : tokens.textMuted,
                  fontSize: 14, fontWeight: active ? 600 : 500,
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  transition: 'background 200ms ease, color 200ms ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = tokens.text } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tokens.textMuted } }}
              >
                {active && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, background: tokens.primary, borderRadius: '0 3px 3px 0' }} />}
                <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.count > 0 && (
                  <span style={{ background: 'rgba(124,58,237,0.2)', color: tokens.accent, borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '2px 7px' }}>
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User + logout */}
        <div style={{ margin: 12, borderRadius: 10, background: 'rgba(124,58,237,0.06)', border: `1px solid ${tokens.borderSoft}`, overflow: 'hidden' }}>
          <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
              {(user?.name || '?').charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || '—'}</div>
              <div style={{ fontSize: 11, color: tokens.textMuted }}>Agente</div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${tokens.borderSoft}` }}>
            <button
              onClick={logout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 12px', background: 'transparent', border: 'none',
                color: tokens.textMuted, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 200ms, color 200ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#EF4444' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tokens.textMuted }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Esci
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          padding: '18px 32px', borderBottom: `1px solid ${tokens.borderSoft}`,
          background: 'rgba(18,18,26,0.65)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
            {view === 'detail' && selectedLive ? selectedLive.title : NAV.find((n) => n.key === section)?.label}
          </h1>
          {view === 'detail' && (
            <button
              onClick={() => { setView('list'); setSelectedId(null) }}
              style={{ background: 'transparent', border: `1px solid ${tokens.border}`, borderRadius: 6, color: tokens.textMuted, fontSize: 13, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}
            >← Lista</button>
          )}
        </header>

        <div style={{ padding: '28px 32px', flex: 1 }}>

          {/* ── I TUOI TICKET ── */}
          {section === 'my' && view === 'list' && (
            myTickets.length === 0
              ? <p style={{ color: tokens.textMuted, fontSize: 14 }}>Nessun ticket assegnato a te.</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {myTickets.map((t) => <TicketRow key={t.id} t={t} />)}
                </div>
          )}

          {/* ── TICKET DEL TEAM ── */}
          {section === 'team' && view === 'list' && (
            <>
              <div style={{ display: 'flex', marginBottom: 24, borderRadius: 10, overflow: 'hidden', border: `1px solid ${tokens.border}` }}>
                {[
                  { key: 'queue',       label: 'Da prendere in carico', count: queueTickets.length },
                  { key: 'in_progress', label: 'In lavorazione',        count: teamTickets.length  },
                ].map((tab, i) => {
                  const active = teamTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setTeamTab(tab.key)}
                      style={{
                        flex: 1, padding: '11px 16px',
                        border: 'none', borderLeft: i > 0 ? `1px solid ${tokens.border}` : 'none',
                        cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
                        fontWeight: active ? 700 : 500,
                        background: active ? tokens.primary : 'transparent',
                        color: active ? '#fff' : tokens.textMuted,
                        transition: 'background 200ms ease, color 200ms ease',
                      }}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span style={{
                          marginLeft: 8, borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '2px 6px',
                          background: active ? 'rgba(255,255,255,0.25)' : 'rgba(124,58,237,0.2)',
                          color: active ? '#fff' : tokens.accent,
                        }}>{tab.count}</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {teamTab === 'queue' && (
                queueTickets.length === 0
                  ? <p style={{ color: tokens.textMuted, fontSize: 14 }}>Nessun ticket in coda.</p>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {queueTickets.map((t) => (
                        <TicketRow
                          key={t.id} t={t}
                          actionSlot={<Button size="sm" onClick={(e) => takeOver(t.id, e)}>Prendi in carico</Button>}
                        />
                      ))}
                    </div>
              )}

              {teamTab === 'in_progress' && (
                teamTickets.length === 0
                  ? <p style={{ color: tokens.textMuted, fontSize: 14 }}>Nessun ticket in lavorazione.</p>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {teamTickets.map((t) => <TicketRow key={t.id} t={t} showAssignee />)}
                    </div>
              )}
            </>
          )}

          {/* ── TRIAGE ── */}
          {section === 'triage' && view === 'list' && (
            triageTickets.length === 0
              ? <p style={{ color: tokens.textMuted, fontSize: 14 }}>Nessun ticket da smistare.</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {triageTickets.map((t) => (
                    <TicketRow
                      key={t.id} t={t}
                      actionSlot={
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); setAssignModalId(t.id) }}>Assegna categoria</Button>
                      }
                    />
                  ))}
                </div>
          )}

          {/* ── DETAIL ── */}
          {view === 'detail' && selectedLive && (
            <>
              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                <StatusBadge status={selectedLive.status} />
                <PriorityBadge priority={selectedLive.priority} />
                <span style={{ fontSize: 13, color: tokens.textMuted }}>· {selectedLive.user}</span>
                {selectedLive.category && <span style={{ fontSize: 13, color: tokens.textMuted }}>· {selectedLive.category}</span>}
                {isTeamLive && <span style={{ fontSize: 13, color: tokens.textMuted }}>· gestito da <strong style={{ color: tokens.text }}>{selectedLive.assignee}</strong></span>}
                {isMineLive && <span style={{ fontSize: 13, color: tokens.accent, fontWeight: 600 }}>· tuo</span>}
              </div>

              {/* Thread */}
              <Card style={{ padding: 20, marginBottom: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {thread.map((msg) => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.agent ? 'flex-end' : 'flex-start' }}>
                      <div style={{ fontSize: 11, color: msg.internal ? '#F59E0B' : tokens.textMuted, marginBottom: 4 }}>
                        {msg.from} · {msg.time}{msg.internal && ' · nota interna'}
                      </div>
                      <div style={{
                        maxWidth: '78%', padding: '10px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.55,
                        background: msg.internal ? 'rgba(245,158,11,0.08)' : msg.agent ? 'rgba(124,58,237,0.1)' : tokens.inputBg,
                        border: `1px solid ${msg.internal ? 'rgba(245,158,11,0.25)' : msg.agent ? tokens.borderSoft : 'transparent'}`,
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Unassigned: only take-over */}
              {!selectedLive.assignee && (
                <Card style={{ padding: 20, marginBottom: 12 }}>
                  <p style={{ color: tokens.textMuted, fontSize: 13, margin: '0 0 12px' }}>Questo ticket non è ancora assegnato.</p>
                  <Button onClick={(e) => takeOver(selectedId, e)}>Prendi in carico</Button>
                </Card>
              )}

              {/* Mine: full reply + internal toggle */}
              {isMineLive && (
                <Card style={{ padding: 20, marginBottom: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: isInternal ? '#F59E0B' : tokens.textMuted, userSelect: 'none' }}>
                      <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                      Nota interna
                    </label>
                    <textarea
                      placeholder={isInternal ? 'Nota visibile solo al team...' : 'Scrivi una risposta...'}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, borderColor: isInternal ? 'rgba(245,158,11,0.4)' : tokens.border }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button onClick={sendReply}>Invia</Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Team ticket: internal note only */}
              {isTeamLive && (
                <Card style={{ padding: 20, marginBottom: 12 }}>
                  <p style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nota interna</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <textarea
                      placeholder="Nota visibile solo al team..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, borderColor: 'rgba(245,158,11,0.4)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button onClick={sendReply}>Aggiungi nota</Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Status updater — only for mine */}
              {isMineLive && (
                <Card style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, color: tokens.textMuted, fontWeight: 500, flexShrink: 0 }}>Stato:</span>
                    <select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '7px 12px' }}>
                      {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <Button variant="secondary" onClick={updateStatus}>Aggiorna</Button>
                  </div>
                </Card>
              )}
            </>
          )}

        </div>
      </main>

      {/* ── Category assign modal ── */}
      {assignModalId !== null && (() => {
        const roots = categories.filter((c) => c.parent_id === null)
        return (
          <Modal open onClose={() => setAssignModalId(null)} width={440}>
            <ModalHeader title="Assegna categoria" onClose={() => setAssignModalId(null)} />
            <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {roots.length === 0
                ? <p style={{ color: tokens.textMuted, fontSize: 14 }}>Nessuna categoria disponibile.</p>
                : roots.map((root) => {
                    const children = categories.filter((c) => c.parent_id === root.id)
                    return (
                      <div key={root.id}>
                        <button
                          onClick={() => assignCategory(assignModalId, root.name)}
                          style={{
                            display: 'block', width: '100%', textAlign: 'left',
                            padding: '10px 14px', borderRadius: 8,
                            border: `1px solid ${tokens.borderSoft}`, background: tokens.inputBg,
                            color: tokens.text, fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit',
                            marginBottom: children.length ? 6 : 0,
                            transition: 'border-color 150ms ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = tokens.accent)}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = tokens.borderSoft)}
                        >{root.name}</button>
                        {children.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 16, marginBottom: 4 }}>
                            {children.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => assignCategory(assignModalId, child.name)}
                                style={{
                                  display: 'block', width: '100%', textAlign: 'left',
                                  padding: '8px 14px', borderRadius: 8,
                                  border: `1px solid ${tokens.borderSoft}`, background: 'transparent',
                                  color: tokens.textMuted, fontSize: 13,
                                  cursor: 'pointer', fontFamily: 'inherit',
                                  transition: 'background 150ms ease, color 150ms ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; e.currentTarget.style.color = tokens.text }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tokens.textMuted }}
                              >{child.name}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
              }
            </div>
          </Modal>
        )
      })()}
    </div>
  )
}
