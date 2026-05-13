import { useState, useEffect, useRef } from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { api } from '../../lib/api'
import { tokens } from '../../lib/tokens'

const MOCK_TEAMS = [
  { id: 1, name: 'Supporto Tecnico'   },
  { id: 2, name: 'Assistenza Clienti' },
  { id: 3, name: 'IT Interno'         },
  { id: 4, name: 'Onboarding'         },
]

const MOCK_MACROS = [
  {
    id: 1, team_id: null, title: 'Saluto iniziale',
    content: 'Gentile Cliente, grazie per aver contattato il nostro supporto. Sono qui per aiutarti. Può descrivermi nel dettaglio il problema che sta riscontrando?',
  },
  {
    id: 2, team_id: null, title: 'Ticket in lavorazione',
    content: 'Abbiamo preso in carico la sua richiesta e il nostro team sta lavorando per risolvere il problema nel più breve tempo possibile. La terremo aggiornata sugli sviluppi.',
  },
  {
    id: 3, team_id: null, title: 'In attesa di risposta',
    content: 'Stiamo attendendo ulteriori informazioni da parte sua per procedere con la risoluzione. Se non riceveremo risposta entro 48 ore, il ticket verrà chiuso automaticamente.',
  },
  {
    id: 4, team_id: null, title: 'Problema risolto',
    content: 'Siamo lieti di comunicarle che il problema segnalato è stato risolto. Può verificare e confermarci che tutto funziona correttamente? Grazie per la sua pazienza.',
  },
  {
    id: 5, team_id: 1, title: 'Reset password istruzioni',
    content: 'Per reimpostare la password acceda alla pagina di login e clicchi su "Password dimenticata". Riceverà un\'email con le istruzioni entro pochi minuti. Verifichi anche la cartella spam.',
  },
  {
    id: 6, team_id: 1, title: 'Richiesta log diagnostici',
    content: 'Per analizzare il problema tecnico abbiamo bisogno dei log di sistema. Acceda a Impostazioni > Log > Esporta e invii il file generato in risposta a questo ticket.',
  },
  {
    id: 7, team_id: 2, title: 'Procedura rimborso',
    content: 'La sua richiesta di rimborso è stata registrata correttamente. I tempi di elaborazione sono di 5-10 giorni lavorativi. Il rimborso verrà accreditato con lo stesso metodo di pagamento utilizzato.',
  },
  {
    id: 8, team_id: 2, title: 'Rinnovo abbonamento',
    content: 'Il suo abbonamento è impostato per il rinnovo automatico alla scadenza. Se desidera modificare il piano o annullare il rinnovo, può farlo dalla sezione "Abbonamento" del suo account.',
  },
  {
    id: 9, team_id: 3, title: 'Accesso VPN aziendale',
    content: 'Per accedere alla VPN aziendale utilizzi le sue credenziali Active Directory. Server: vpn.acme.io. In caso di problemi contatti l\'IT con il numero di matricola a portata di mano.',
  },
  {
    id: 10, team_id: 4, title: 'Benvenuto onboarding',
    content: 'Benvenuto in Acme! Il suo account è stato attivato con successo. A breve riceverà un\'email con le credenziali di accesso e le istruzioni per iniziare. Non esiti a contattarci per qualsiasi dubbio.',
  },
]

export function Macros() {
  const [macros, setMacros] = useState(MOCK_MACROS)
  const [teams, setTeams] = useState(MOCK_TEAMS)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    // Promise.all([
    //   api.getAdminMacros().catch(() => ({ data: null })),
    //   api.getAdminTeams().catch(() => ({ data: [] })),
    // ]).then(([m, t]) => {
    //   setMacros(m.data)
    //   setTeams(t.data)
    // })
  }, [])

  const teamName = (id) => teams.find((t) => t.id === id)?.name || '—'

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>
          Risposte preconfezionate disponibili per gli agenti (sola lettura)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {macros === null && [0, 1, 2].map((i) => (
          <Card key={i} style={{ padding: 20 }}>
            <Skeleton width={160} height={20} style={{ marginBottom: 12 }} />
            <Skeleton height={14} count={3} />
          </Card>
        ))}
        {macros && macros.map((m) => (
          <Card key={m.id} hoverable style={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{m.title}</h3>
              {m.team_id === null
                ? <Badge color="purple">Globale</Badge>
                : <Badge>{teamName(m.team_id)}</Badge>}
            </div>
            <p style={{
              margin: 0, fontSize: 13, lineHeight: 1.55, color: tokens.textMuted,
              display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              flex: 1,
            }}>"{m.content}"</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
