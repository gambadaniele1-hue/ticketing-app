import { useState, useEffect, useRef } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { Modal, ModalHeader } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { IconButton } from '../../components/IconButton'
import { api } from '../../lib/api'
import { tokens } from '../../lib/tokens'

const MOCK_AVAILABLE_TEAMS = [
  { id: 1, name: 'Supporto Tecnico'   },
  { id: 2, name: 'Assistenza Clienti' },
  { id: 3, name: 'IT Interno'         },
  { id: 4, name: 'Onboarding'         },
  { id: 5, name: 'Amministrazione'    },
  { id: 6, name: 'Commerciale'        },
  { id: 7, name: 'DevOps'             },
]

const MOCK_CATEGORIES = [
  { id: 1,  name: 'Problemi Tecnici',     parent_id: null, teams: [{ id: 1, name: 'Supporto Tecnico' }] },
  { id: 2,  name: 'Fatturazione',         parent_id: null, teams: [{ id: 5, name: 'Amministrazione' }]  },
  { id: 3,  name: 'Richieste Generali',   parent_id: null, teams: []                                     },
  { id: 4,  name: 'Account e Accessi',    parent_id: null, teams: []                                     },
  { id: 11, name: 'Connettività',         parent_id: 1,    teams: []                                     },
  { id: 12, name: 'Software',             parent_id: 1,    teams: []                                     },
  { id: 13, name: 'Hardware',             parent_id: 1,    teams: []                                     },
  { id: 21, name: 'Pagamenti',            parent_id: 2,    teams: []                                     },
  { id: 22, name: 'Rimborsi',             parent_id: 2,    teams: []                                     },
  { id: 31, name: 'Informazioni Prodotto',parent_id: 3,    teams: []                                     },
  { id: 32, name: 'Suggerimenti',         parent_id: 3,    teams: []                                     },
  { id: 41, name: 'Reset Password',       parent_id: 4,    teams: []                                     },
  { id: 42, name: 'Gestione Permessi',    parent_id: 4,    teams: []                                     },
]

function TeamChip({ team, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 6px 3px 10px',
      background: 'rgba(124, 58, 237, 0.1)',
      border: '1px solid rgba(124, 58, 237, 0.25)',
      borderRadius: 999, fontSize: 12, fontWeight: 600,
      color: tokens.primary, whiteSpace: 'nowrap',
    }}>
      {team.name}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        title="Rimuovi team"
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px',
          color: 'rgba(124,58,237,0.5)', display: 'flex', alignItems: 'center',
          lineHeight: 1, fontSize: 15, fontWeight: 700, borderRadius: 3,
          transition: 'color 150ms',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(124,58,237,0.5)')}
      >×</button>
    </span>
  )
}

function AddTeamInline({ catId, availableTeams, existingTeams, onAdd }) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [error, setError] = useState('')

  const options = availableTeams.filter((t) => !existingTeams.find((et) => et.id === t.id))

  const confirm = (e) => {
    e.stopPropagation()
    if (!selectedId) return
    const team = availableTeams.find((t) => t.id === Number(selectedId))
    if (!team) return
    const err = onAdd(catId, team)
    if (err) { setError(err); return }
    setOpen(false); setSelectedId(''); setError('')
  }

  const cancel = (e) => { e.stopPropagation(); setOpen(false); setSelectedId(''); setError('') }

  if (options.length === 0) return null

  if (!open) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 10px', borderRadius: 999,
          background: 'transparent',
          border: `1px dashed ${tokens.borderSoft}`,
          color: tokens.textMuted, fontSize: 12, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'border-color 200ms, color 200ms',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = tokens.primary; e.currentTarget.style.color = tokens.primary }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.borderSoft; e.currentTarget.style.color = tokens.textMuted }}
        title="Associa team"
      >
        + team
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={(e) => e.stopPropagation()}>
      <select
        autoFocus
        value={selectedId}
        onChange={(e) => { setSelectedId(e.target.value); setError('') }}
        style={{
          background: tokens.inputBg, border: `1px solid ${tokens.border}`,
          borderRadius: 7, padding: '5px 10px', color: tokens.text,
          fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
        }}
        onFocus={(e) => (e.target.style.borderColor = tokens.primary)}
        onBlur={(e) => (e.target.style.borderColor = tokens.border)}
      >
        <option value="">Seleziona team…</option>
        {options.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <IconButton onClick={confirm} title="Conferma" disabled={!selectedId}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </IconButton>
      <IconButton onClick={cancel} title="Annulla">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </IconButton>
      {error && <span style={{ fontSize: 12, color: '#EF4444', whiteSpace: 'nowrap' }}>{error}</span>}
    </div>
  )
}

function CategoryRow({ cat, depth, children, allChildrenOf, onEdit, onDelete, onAddTeam, onRemoveTeam, availableTeams }) {
  return (
    <div>
      <div
        style={{
          paddingTop: 12, paddingBottom: 12,
          paddingLeft: 20 + depth * 28, paddingRight: 20,
          display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: `1px solid ${tokens.borderSoft}`,
          transition: 'background 200ms ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.04)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Name area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {depth > 0 && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: tokens.textMuted }}>
              <path d="M2 2V8a3 3 0 0 0 3 3h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </svg>
          )}
          <span style={{ fontSize: depth === 0 ? 18 : 15, opacity: depth === 0 ? 1 : 0.7 }}>{depth === 0 ? '📁' : '🏷️'}</span>
          <span style={{ fontWeight: depth === 0 ? 700 : 500, fontSize: 14, whiteSpace: 'nowrap' }}>{cat.name}</span>
          {depth === 0 && children.length > 0 && <Badge color="purple">{children.length} sotto</Badge>}
        </div>

        {/* Teams area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {(cat.teams || []).map((team) => (
            <TeamChip key={team.id} team={team} onRemove={() => onRemoveTeam(cat.id, team.id)} />
          ))}
          <AddTeamInline
            catId={cat.id}
            availableTeams={availableTeams}
            existingTeams={cat.teams || []}
            onAdd={onAddTeam}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <IconButton onClick={() => onEdit(cat)} title="Modifica">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </IconButton>
          <IconButton danger onClick={() => onDelete(cat.id)} title="Elimina">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </IconButton>
        </div>
      </div>

      {children.map((child) => (
        <CategoryRow
          key={child.id} cat={child} depth={depth + 1}
          children={allChildrenOf(child.id)}
          allChildrenOf={allChildrenOf}
          onEdit={onEdit} onDelete={onDelete}
          onAddTeam={onAddTeam} onRemoveTeam={onRemoveTeam}
          availableTeams={availableTeams}
        />
      ))}
    </div>
  )
}

export function Categories() {
  const [cats, setCats] = useState(MOCK_CATEGORIES)
  const [availableTeams] = useState(MOCK_AVAILABLE_TEAMS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', parent_id: '' })
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    // api.getAdminCategories().then((r) => setCats(r.data)).catch(() => {})
  }, [])

  const openNew = () => { setEditingId(null); setForm({ name: '', parent_id: '' }); setModalOpen(true) }
  const openEdit = (c) => { setEditingId(c.id); setForm({ name: c.name, parent_id: c.parent_id || '' }); setModalOpen(true) }

  const save = () => {
    if (!form.name.trim()) return
    const parent_id = form.parent_id ? Number(form.parent_id) : null
    setCats((cs) => {
      if (editingId) return cs.map((c) => c.id === editingId ? { ...c, name: form.name, parent_id } : c)
      return [...cs, { id: Date.now(), name: form.name, parent_id, teams: [] }]
    })
    setModalOpen(false)
  }

  const remove = (id) => { setCats((cs) => cs.filter((c) => c.id !== id && c.parent_id !== id)) }

  const addTeam = (catId, team) => {
    const cat = cats.find((c) => c.id === catId)
    if (cat?.teams?.find((t) => t.id === team.id)) return 'Questo team è già associato alla categoria'
    setCats((cs) => cs.map((c) => c.id === catId ? { ...c, teams: [...(c.teams || []), team] } : c))
    // api.addCategoryTeam(catId, team.id).catch(() => {})
    return null
  }

  const removeTeam = (catId, teamId) => {
    setCats((cs) => cs.map((c) => c.id === catId ? { ...c, teams: (c.teams || []).filter((t) => t.id !== teamId) } : c))
    // api.removeCategoryTeam(catId, teamId).catch(() => {})
  }

  const roots = (cats || []).filter((c) => c.parent_id === null)
  const childrenOf = (id) => (cats || []).filter((c) => c.parent_id === id)

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>
          Categorizza i ticket con una gerarchia di categorie e associa i team responsabili
        </p>
        <Button onClick={openNew}>+ Nuova Categoria</Button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {cats === null && <div style={{ padding: 20 }}><Skeleton height={20} count={4} /></div>}
        {cats && roots.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: tokens.textMuted }}>
            Nessuna categoria. Creane una per iniziare.
          </div>
        )}
        {cats && roots.map((root) => (
          <CategoryRow
            key={root.id} cat={root} depth={0}
            children={childrenOf(root.id)}
            allChildrenOf={childrenOf}
            onEdit={openEdit} onDelete={remove}
            onAddTeam={addTeam} onRemoveTeam={removeTeam}
            availableTeams={availableTeams}
          />
        ))}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} width={440}>
        <ModalHeader title={editingId ? 'Modifica categoria' : 'Nuova categoria'} onClose={() => setModalOpen(false)} />
        <div style={{ padding: '8px 32px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Nome categoria"
            placeholder="Es. Problemi Tecnici"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
          <Select
            label="Categoria padre (opzionale)"
            value={form.parent_id}
            onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
            options={[
              { value: '', label: 'Nessuna (categoria principale)' },
              ...(cats || []).filter((c) => c.parent_id === null && c.id !== editingId).map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Annulla</Button>
            <Button onClick={save}>{editingId ? 'Salva' : 'Crea'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
