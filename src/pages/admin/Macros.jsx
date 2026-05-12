import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { api } from '../../lib/api'
import { tokens } from '../../lib/tokens'

export function Macros() {
  const [macros, setMacros] = useState(null)
  const [teams, setTeams] = useState([])

  useEffect(() => {
    Promise.all([
      api.getAdminMacros().catch(() => ({ data: null })),
      api.getAdminTeams().catch(() => ({ data: [] })),
    ]).then(([m, t]) => {
      setMacros(m.data)
      setTeams(t.data)
    })
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
