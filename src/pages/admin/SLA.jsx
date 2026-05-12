import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { Modal, ModalHeader } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { IconButton } from '../../components/IconButton'
import { api } from '../../lib/api'
import { tokens } from '../../lib/tokens'

const PRIORITY_MAP = {
  low: { color: 'gray', label: 'Bassa' },
  medium: { color: 'blue', label: 'Media' },
  high: { color: 'orange', label: 'Alta' },
  critical: { color: 'red', label: 'Critica' },
}

export function SLA() {
  const [slas, setSlas] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', priority: 'medium', response_time_hours: 8, resolution_time_hours: 24 })

  useEffect(() => {
    api.getAdminSla().then((r) => setSlas(r.data)).catch(() => {})
  }, [])

  const openNew = () => {
    setEditingId(null)
    setForm({ name: '', priority: 'medium', response_time_hours: 8, resolution_time_hours: 24 })
    setModalOpen(true)
  }
  const openEdit = (s) => {
    setEditingId(s.id)
    setForm({ name: s.name, priority: s.priority, response_time_hours: s.response_time_hours, resolution_time_hours: s.resolution_time_hours })
    setModalOpen(true)
  }

  const save = () => {
    if (!form.name.trim()) return
    const payload = { ...form, response_time_hours: Number(form.response_time_hours), resolution_time_hours: Number(form.resolution_time_hours) }
    setSlas((ss) => {
      if (editingId) return ss.map((s) => s.id === editingId ? { ...s, ...payload } : s)
      return [...ss, { id: Date.now(), ...payload }]
    })
    setModalOpen(false)
  }

  const remove = (id) => { setSlas((ss) => ss.filter((s) => s.id !== id)) }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>
          Definisci i tempi di risposta e risoluzione per priorità
        </p>
        <Button onClick={openNew}>+ Nuova SLA</Button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'rgba(124, 58, 237, 0.05)' }}>
              {['Nome', 'Priorità', 'Tempo di risposta', 'Tempo di risoluzione', 'Azioni'].map((h) => (
                <th key={h} style={{
                  textAlign: 'left', padding: '14px 20px',
                  fontSize: 12, fontWeight: 600, color: tokens.textMuted,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  borderBottom: `1px solid ${tokens.borderSoft}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slas === null && [0, 1, 2].map((i) => (
              <tr key={i}>
                <td colSpan={5} style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.borderSoft}` }}>
                  <Skeleton height={18} />
                </td>
              </tr>
            ))}
            {slas && slas.map((s) => {
              const p = PRIORITY_MAP[s.priority] || { color: 'gray', label: s.priority }
              return (
                <tr key={s.id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  style={{ transition: 'background 200ms ease' }}>
                  <td style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.borderSoft}`, fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.borderSoft}` }}>
                    <Badge color={p.color}>{p.label}</Badge>
                  </td>
                  <td style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.borderSoft}`, fontVariantNumeric: 'tabular-nums' }}>
                    <span style={{ fontWeight: 700 }}>{s.response_time_hours}</span>
                    <span style={{ color: tokens.textMuted, marginLeft: 6 }}>ore</span>
                  </td>
                  <td style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.borderSoft}`, fontVariantNumeric: 'tabular-nums' }}>
                    <span style={{ fontWeight: 700 }}>{s.resolution_time_hours}</span>
                    <span style={{ color: tokens.textMuted, marginLeft: 6 }}>ore</span>
                  </td>
                  <td style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.borderSoft}` }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <IconButton onClick={() => openEdit(s)} title="Modifica">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </IconButton>
                      <IconButton danger onClick={() => remove(s.id)} title="Elimina">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      </IconButton>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} width={500}>
        <ModalHeader title={editingId ? 'Modifica SLA' : 'Nuova SLA'} onClose={() => setModalOpen(false)} />
        <div style={{ padding: '8px 32px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Nome" placeholder="Es. Standard" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select
            label="Priorità"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={Object.entries(PRIORITY_MAP).map(([v, { label }]) => ({ value: v, label }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input
              label="Tempo risposta (ore)"
              type="number" min="1"
              value={form.response_time_hours}
              onChange={(e) => setForm({ ...form, response_time_hours: e.target.value })}
            />
            <Input
              label="Tempo risoluzione (ore)"
              type="number" min="1"
              value={form.resolution_time_hours}
              onChange={(e) => setForm({ ...form, resolution_time_hours: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Annulla</Button>
            <Button onClick={save}>{editingId ? 'Salva' : 'Crea'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
