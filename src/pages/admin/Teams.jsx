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

const GRADIENTS = [
  'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
  'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
  'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
]

const TEAM_ROLES = [
  { value: 'Agent', label: 'Agent' },
  { value: 'Team Lead', label: 'Team Lead' },
]

export function Teams() {
  const [teams, setTeams] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [nameModalOpen, setNameModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formName, setFormName] = useState('')
  const [membersModal, setMembersModal] = useState(null)
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [pendingRoles, setPendingRoles] = useState({})
  const [addUserId, setAddUserId] = useState('')
  const [addRole, setAddRole] = useState('Agent')
  const [saving, setSaving] = useState(false)
  const [tlWarning, setTlWarning] = useState(null)

  useEffect(() => {
    api.getAdminTeams().then((r) => setTeams(r.data)).catch(() => {})
    api.getAdminUsers().then((r) => setAllUsers(r.data)).catch(() => {})
  }, [])

  const openMembersModal = (team) => {
    setMembersModal({ team })
    setMembers([]); setAddUserId(''); setAddRole('Agent'); setPendingRoles({})
    setMembersLoading(true)
    api.getTeamMembers(team.id)
      .then((r) => setMembers(r.data))
      .catch(() => {})
      .finally(() => setMembersLoading(false))
  }

  const closeMembersModal = () => { setMembersModal(null); setMembers([]); setTlWarning(null) }

  const onRoleChange = (userId, role) => {
    setPendingRoles((p) => ({ ...p, [userId]: role }))
    setMembers((ms) => ms.map((m) => m.id === userId ? { ...m, role } : m))
  }

  const requestRemove = (userId) => {
    const teamLeads = members.filter((m) => m.role === 'Team Lead')
    const target = members.find((m) => m.id === userId)
    if (target?.role === 'Team Lead' && teamLeads.length === 1) {
      setTlWarning(userId)
    } else {
      doRemove(userId)
    }
  }

  const doRemove = async (userId) => {
    setTlWarning(null)
    await api.removeTeamMember(membersModal.team.id, userId).catch(() => {})
    const next = members.filter((m) => m.id !== userId)
    setMembers(next)
    setTeams((ts) => ts.map((t) => t.id === membersModal.team.id ? { ...t, members_count: next.length } : t))
  }

  const saveChanges = async () => {
    if (!membersModal) return
    setSaving(true)
    try {
      await Promise.all(
        Object.entries(pendingRoles).map(([uid, role]) =>
          api.updateTeamMemberRole(membersModal.team.id, Number(uid), role).catch(() => {})
        )
      )
      if (addUserId) {
        await api.addTeamMember(membersModal.team.id, Number(addUserId)).catch(() => {})
        const user = allUsers.find((u) => u.id === Number(addUserId))
        if (user) {
          const nextMembers = [...members, { id: user.id, name: user.name, email: user.email, role: addRole }]
          setMembers(nextMembers)
          setTeams((ts) => ts.map((t) => t.id === membersModal.team.id ? { ...t, members_count: nextMembers.length } : t))
        }
        setAddUserId('')
      }
      setPendingRoles({})
      closeMembersModal()
    } finally {
      setSaving(false)
    }
  }

  const openNew = () => { setEditingId(null); setFormName(''); setNameModalOpen(true) }
  const openEdit = (t, e) => { e.stopPropagation(); setEditingId(t.id); setFormName(t.name); setNameModalOpen(true) }
  const saveName = () => {
    if (!formName.trim()) return
    setTeams((ts) => {
      if (editingId) return ts.map((t) => t.id === editingId ? { ...t, name: formName } : t)
      return [...ts, { id: Date.now(), name: formName, members_count: 0 }]
    })
    setNameModalOpen(false)
  }
  const removeTeam = (id, e) => { e.stopPropagation(); setTeams((ts) => ts.filter((t) => t.id !== id)) }

  const availableUsers = allUsers.filter((u) => u.state === 'accepted' && !members.find((m) => m.id === u.id))

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>
          Organizza il tuo staff in team specializzati. Clicca su un team per gestire i membri.
        </p>
        <Button onClick={openNew}>+ Nuovo Team</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
        {teams === null && [0, 1, 2].map((i) => (
          <Card key={i} style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <Skeleton width={52} height={52} style={{ borderRadius: 14, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skeleton width={120} height={18} style={{ marginBottom: 8 }} />
                <Skeleton width={72} height={13} />
              </div>
            </div>
            <Skeleton width="100%" height={36} />
          </Card>
        ))}
        {teams && teams.map((t, idx) => {
          const grad = GRADIENTS[idx % GRADIENTS.length]
          return (
            <div key={t.id} onClick={() => openMembersModal(t)} style={{
              background: tokens.surface, border: `1px solid ${tokens.borderSoft}`,
              borderRadius: 14, padding: 24, cursor: 'pointer',
              transition: 'transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
              boxShadow: tokens.cardShadow, position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.14)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = tokens.borderSoft; e.currentTarget.style.boxShadow = tokens.cardShadow }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: grad, borderRadius: '14px 14px 0 0' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, paddingTop: 4 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: grad, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 22,
                  boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
                }}>{t.name.charAt(0)}</div>
                <div style={{ display: 'flex', gap: 2 }}>
                  <IconButton onClick={(e) => openEdit(t, e)} title="Rinomina">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </IconButton>
                  <IconButton danger onClick={(e) => removeTeam(t.id, e)} title="Elimina team">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  </IconButton>
                </div>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>{t.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex' }}>
                  {Array.from({ length: Math.min(t.members_count, 3) }).map((_, i) => (
                    <div key={i} style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: GRADIENTS[(idx + i + 1) % GRADIENTS.length],
                      border: `2px solid ${tokens.surface}`, marginLeft: i === 0 ? 0 : -8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#fff', fontWeight: 700,
                      position: 'relative', zIndex: 3 - i,
                    }}>{String.fromCharCode(65 + (idx + i) % 26)}</div>
                  ))}
                  {t.members_count === 0 && <span style={{ fontSize: 12, color: tokens.textMuted, fontStyle: 'italic' }}>Nessun membro</span>}
                </div>
                <Badge color="purple">{t.members_count} {t.members_count === 1 ? 'membro' : 'membri'}</Badge>
              </div>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${tokens.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: tokens.textMuted }}>Gestisci membri</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tokens.textMuted} strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </div>
          )
        })}
      </div>

      {/* Members modal */}
      <Modal open={!!membersModal} onClose={closeMembersModal} width={600}>
        {membersModal && (
          <>
            <ModalHeader title={`Team: ${membersModal.team.name}`} onClose={closeMembersModal} />
            <div style={{ padding: '0 32px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: tokens.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  Membri ({members.length})
                </div>
                {membersLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[0, 1].map((i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                        <Skeleton width={36} height={36} style={{ borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <Skeleton width={120} height={14} style={{ marginBottom: 6 }} />
                          <Skeleton width={160} height={11} />
                        </div>
                        <Skeleton width={110} height={36} style={{ borderRadius: 7 }} />
                      </div>
                    ))}
                  </div>
                )}
                {!membersLoading && members.length === 0 && (
                  <div style={{ padding: '28px 0', textAlign: 'center', border: `1px dashed ${tokens.borderSoft}`, borderRadius: 10, color: tokens.textMuted, fontSize: 14 }}>
                    Nessun membro nel team. Aggiungine uno qui sotto.
                  </div>
                )}
                {!membersLoading && members.length > 0 && (
                  <div style={{ border: `1px solid ${tokens.borderSoft}`, borderRadius: 10, overflow: 'hidden' }}>
                    {members.map((m, idx) => (
                      <div key={m.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                        borderBottom: idx < members.length - 1 ? `1px solid ${tokens.borderSoft}` : 'none',
                        transition: 'background 180ms ease',
                      }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124,58,237,0.04)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: GRADIENTS[idx % GRADIENTS.length],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 14,
                        }}>{m.name.charAt(0)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                          <div style={{ fontSize: 12, color: tokens.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.email}</div>
                        </div>
                        <select
                          value={m.role}
                          onChange={(e) => onRoleChange(m.id, e.target.value)}
                          style={{
                            background: tokens.inputBg, border: `1px solid ${tokens.border}`,
                            borderRadius: 7, padding: '6px 26px 6px 10px', color: tokens.text,
                            fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238b8b9e' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
                            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
                            minWidth: 110,
                          }}
                          onFocus={(e) => (e.target.style.borderColor = tokens.primary)}
                          onBlur={(e) => (e.target.style.borderColor = tokens.border)}
                        >
                          {TEAM_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <IconButton danger onClick={() => requestRemove(m.id)} title="Rimuovi dal team">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </IconButton>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(124,58,237,0.04)', border: `1px solid ${tokens.borderSoft}` }}>
                <div style={{ fontSize: 12, color: tokens.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  Aggiungi membro
                </div>
                {availableUsers.length === 0 ? (
                  <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, fontStyle: 'italic' }}>Tutti gli utenti attivi sono già nel team</p>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <Select
                        value={addUserId}
                        onChange={(e) => setAddUserId(e.target.value)}
                        options={[
                          { value: '', label: 'Seleziona utente...' },
                          ...availableUsers.map((u) => ({ value: u.id, label: `${u.name} (${u.role})` })),
                        ]}
                      />
                    </div>
                    <div style={{ width: 130 }}>
                      <Select value={addRole} onChange={(e) => setAddRole(e.target.value)} options={TEAM_ROLES} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={closeMembersModal}>Annulla</Button>
                <Button onClick={saveChanges} loading={saving}>Salva modifiche</Button>
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* Team Lead warning */}
      <Modal open={!!tlWarning} onClose={() => setTlWarning(null)} width={440}>
        <div style={{ padding: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700 }}>Unico Team Lead</h3>
          <p style={{ color: tokens.textMuted, fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
            Attenzione: questo è l'unico Team Lead del team. Rimuovendolo il team resterà senza supervisore. Vuoi continuare?
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setTlWarning(null)}>Annulla</Button>
            <Button variant="danger" onClick={() => doRemove(tlWarning)}>Rimuovi comunque</Button>
          </div>
        </div>
      </Modal>

      {/* Create/rename modal */}
      <Modal open={nameModalOpen} onClose={() => setNameModalOpen(false)} width={440}>
        <ModalHeader title={editingId ? 'Rinomina team' : 'Nuovo team'} onClose={() => setNameModalOpen(false)} />
        <div style={{ padding: '8px 32px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Nome team"
            placeholder="Es. Supporto Tecnico"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setNameModalOpen(false)}>Annulla</Button>
            <Button onClick={saveName}>{editingId ? 'Salva' : 'Crea'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
