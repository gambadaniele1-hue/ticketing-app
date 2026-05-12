import { useState, useEffect, useRef } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { Modal, ModalHeader } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Input'
import { api } from '../../lib/api'
import { tokens } from '../../lib/tokens'

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Agent', label: 'Agent' },
  { value: 'Team Lead', label: 'Team Lead' },
  { value: 'Customer', label: 'Customer' },
]

function stateBadge(s) {
  const map = {
    accepted: <Badge color="green">Attivo</Badge>,
    pending: <Badge color="yellow">In attesa</Badge>,
    suspended: <Badge color="orange">Sospeso</Badge>,
    rejected: <Badge color="red">Rifiutato</Badge>,
  }
  return map[s] || <Badge>{s}</Badge>
}

function roleBadge(r) {
  const c = { Admin: 'purple', Agent: 'blue', 'Team Lead': 'orange', Customer: 'gray' }[r] || 'gray'
  return <Badge color={c}>{r}</Badge>
}

const COLS = ['Nome', 'Email', 'Ruolo', 'Team', 'Stato', 'Azioni']

export function Users() {
  const [users, setUsers] = useState(null)
  const [filter, setFilter] = useState('all')
  const [roleModal, setRoleModal] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [roleLoading, setRoleLoading] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    api.getAdminUsers()
      .then((r) => setUsers(r.data))
      .catch(() => {})
  }, [])

  const approve = (id) => {
    api.approveUser(id).catch(() => {})
    setUsers((us) => us.map((u) => u.id === id ? { ...u, state: 'accepted' } : u))
  }
  const reject = (id) => {
    api.rejectUser(id).catch(() => {})
    setUsers((us) => us.map((u) => u.id === id ? { ...u, state: 'rejected' } : u))
  }
  const suspend = (id) => {
    api.suspendUser(id).catch(() => {})
    setUsers((us) => us.map((u) => u.id === id ? { ...u, state: 'suspended' } : u))
  }
  const reactivate = (id) => {
    api.reactivateUser(id).catch(() => {})
    setUsers((us) => us.map((u) => u.id === id ? { ...u, state: 'accepted' } : u))
  }

  const openRoleModal = (u) => { setRoleModal({ id: u.id, name: u.name }); setSelectedRole(u.role) }
  const saveRole = async () => {
    if (!selectedRole || !roleModal) return
    setRoleLoading(true)
    try {
      await api.updateUserRole(roleModal.id, selectedRole).catch(() => {})
      setUsers((us) => us.map((u) => u.id === roleModal.id ? { ...u, role: selectedRole } : u))
      setRoleModal(null)
    } finally {
      setRoleLoading(false)
    }
  }

  const counts = (users || []).reduce((acc, u) => ({ ...acc, [u.state]: (acc[u.state] || 0) + 1 }), {})
  const filtered = (users || []).filter((u) => filter === 'all' ? true : u.state === filter)

  const filters = [
    { key: 'all', label: 'Tutti', count: users?.length || 0 },
    { key: 'pending', label: 'In attesa', count: counts.pending || 0 },
    { key: 'accepted', label: 'Attivi', count: counts.accepted || 0 },
    { key: 'suspended', label: 'Sospesi', count: counts.suspended || 0 },
    { key: 'rejected', label: 'Rifiutati', count: counts.rejected || 0 },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>
          Approva, sospendi e gestisci gli utenti del tuo workspace
        </p>
        <div title="Funzionalità in arrivo" style={{ cursor: 'not-allowed' }}>
          <Button variant="secondary" size="sm" disabled>+ Invita utente</Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map((f) => {
          const active = filter === f.key
          return (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: active ? tokens.primary : 'transparent',
              border: `1px solid ${active ? tokens.primary : tokens.border}`,
              color: active ? '#fff' : tokens.textMuted,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 200ms ease',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              {f.label}
              <span style={{
                fontSize: 11, padding: '1px 7px', borderRadius: 999,
                background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                color: active ? '#fff' : tokens.textMuted,
              }}>{f.count}</span>
            </button>
          )
        })}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 760 }}>
            <thead>
              <tr style={{ background: 'rgba(124, 58, 237, 0.05)' }}>
                {COLS.map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '14px 18px',
                    fontSize: 12, fontWeight: 600, color: tokens.textMuted,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    borderBottom: `1px solid ${tokens.borderSoft}`,
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users === null && [0, 1, 2].map((i) => (
                <tr key={i}>
                  <td colSpan={COLS.length} style={{ padding: '16px 18px', borderBottom: `1px solid ${tokens.borderSoft}` }}>
                    <Skeleton height={18} />
                  </td>
                </tr>
              ))}
              {users && filtered.map((u) => (
                <tr key={u.id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124,58,237,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  style={{ transition: 'background 200ms ease' }}>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${tokens.borderSoft}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 13,
                      }}>{u.name.charAt(0)}</div>
                      <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${tokens.borderSoft}`, color: tokens.textMuted, whiteSpace: 'nowrap' }}>{u.email}</td>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${tokens.borderSoft}` }}>{roleBadge(u.role)}</td>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${tokens.borderSoft}` }}>
                    {u.team
                      ? <span style={{ fontSize: 13, fontWeight: 500 }}>{u.team}</span>
                      : <span style={{ color: 'rgba(139,139,158,0.5)', fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${tokens.borderSoft}` }}>{stateBadge(u.state)}</td>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${tokens.borderSoft}` }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {u.state === 'pending' && (
                        <>
                          <Button size="sm" variant="success" onClick={() => approve(u.id)}>Approva</Button>
                          <Button size="sm" variant="danger" onClick={() => reject(u.id)}>Rifiuta</Button>
                        </>
                      )}
                      {u.state === 'accepted' && (
                        <>
                          <Button size="sm" variant="danger" onClick={() => suspend(u.id)}>Sospendi</Button>
                          <Button size="sm" variant="secondary" onClick={() => openRoleModal(u)}>Cambia ruolo</Button>
                        </>
                      )}
                      {u.state === 'suspended' && (
                        <>
                          <Button size="sm" variant="success" onClick={() => reactivate(u.id)}>Riattiva</Button>
                          <Button size="sm" variant="secondary" onClick={() => openRoleModal(u)}>Cambia ruolo</Button>
                        </>
                      )}
                      {u.state === 'rejected' && (
                        <span style={{ color: 'rgba(139,139,158,0.45)', fontSize: 12, fontStyle: 'italic' }}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users && filtered.length === 0 && (
                <tr>
                  <td colSpan={COLS.length} style={{ padding: '40px 18px', textAlign: 'center', color: tokens.textMuted }}>
                    Nessun utente in questa categoria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!roleModal} onClose={() => setRoleModal(null)} width={400}>
        <ModalHeader title="Cambia ruolo" onClose={() => setRoleModal(null)} />
        <div style={{ padding: '8px 32px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {roleModal && (
            <p style={{ margin: 0, fontSize: 14, color: tokens.textMuted }}>
              Stai modificando il ruolo di <strong style={{ color: tokens.text }}>{roleModal.name}</strong>
            </p>
          )}
          <Select
            label="Nuovo ruolo"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            options={ROLE_OPTIONS}
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="ghost" onClick={() => setRoleModal(null)}>Annulla</Button>
            <Button onClick={saveRole} loading={roleLoading}>Salva</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
