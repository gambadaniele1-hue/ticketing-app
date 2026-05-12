import { useState, useEffect, useRef } from 'react'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { api } from '../../lib/api'
import { tokens } from '../../lib/tokens'

const STAT_CARDS = [
  { key: 'open', label: 'Aperti', dot: '#F59E0B' },
  { key: 'in_progress', label: 'In lavorazione', dot: '#3B82F6' },
  { key: 'waiting', label: 'In attesa', dot: '#F97316' },
  { key: 'closed', label: 'Chiusi', dot: '#10B981' },
]

function TrendChart() {
  const data = [4, 7, 5, 9, 6, 11, 8]
  const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
  const max = Math.max(...data)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 180, paddingBottom: 24 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
            <div style={{
              width: '100%', height: `${(v / max) * 100}%`,
              background: `linear-gradient(180deg, ${tokens.accent} 0%, ${tokens.primary} 100%)`,
              borderRadius: '6px 6px 2px 2px',
              transition: 'height 600ms cubic-bezier(0.2, 0.9, 0.3, 1.1)',
              boxShadow: `0 -4px 12px ${tokens.primary}33`,
            }} />
          </div>
          <span style={{ fontSize: 11, color: tokens.textMuted, fontWeight: 500 }}>{days[i]}</span>
        </div>
      ))}
    </div>
  )
}

function DistributionBar({ stats }) {
  const total = Object.values(stats).reduce((a, b) => a + b, 0) || 1
  return (
    <div>
      <div style={{ height: 12, display: 'flex', borderRadius: 6, overflow: 'hidden', marginBottom: 20, background: tokens.inputBg }}>
        {STAT_CARDS.map((c) => (
          <div key={c.key} style={{ width: `${(stats[c.key] / total) * 100}%`, background: c.dot, transition: 'width 600ms ease' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {STAT_CARDS.map((c) => (
          <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
              <span style={{ color: tokens.textMuted }}>{c.label}</span>
            </div>
            <div>
              <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{stats[c.key]}</span>
              <span style={{ color: tokens.textMuted, marginLeft: 6 }}>
                {Math.round((stats[c.key] / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Dashboard() {
  const [stats, setStats] = useState(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    api.getAdminStats()
      .then((r) => setStats(r.data))
      .catch(() => {})
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>Panoramica generale dei ticket</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {STAT_CARDS.map((c) => (
          <Card key={c.key} hoverable style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%',
              background: `radial-gradient(circle, ${c.dot}33 0%, transparent 70%)`,
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, boxShadow: `0 0 8px ${c.dot}`, display: 'inline-block' }} />
                <span style={{ fontSize: 13, color: tokens.textMuted, fontWeight: 500 }}>{c.label}</span>
              </div>
              {stats === null ? (
                <Skeleton width={60} height={36} />
              ) : (
                <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {stats[c.key]}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <Card style={{ padding: 28 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Trend ultimi 7 giorni</h3>
          <p style={{ margin: '0 0 24px', color: tokens.textMuted, fontSize: 13 }}>Volume di nuovi ticket per giorno</p>
          <TrendChart />
        </Card>
        <Card style={{ padding: 28 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Distribuzione stati</h3>
          <p style={{ margin: '0 0 24px', color: tokens.textMuted, fontSize: 13 }}>
            Su totale {stats ? Object.values(stats).reduce((a, b) => a + b, 0) : '—'} ticket
          </p>
          {stats && <DistributionBar stats={stats} />}
        </Card>
      </div>
    </div>
  )
}
