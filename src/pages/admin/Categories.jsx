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

function CategoryRow({ cat, depth, children, allChildrenOf, onEdit, onDelete }) {
  return (
    <div>
      <div style={{
        padding: '14px 20px', paddingLeft: 20 + depth * 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${tokens.borderSoft}`,
        transition: 'background 200ms ease',
      }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.04)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {depth > 0 && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: tokens.textMuted }}>
              <path d="M2 2V8a3 3 0 0 0 3 3h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </svg>
          )}
          <span style={{ fontSize: 18, opacity: depth === 0 ? 1 : 0.7 }}>{depth === 0 ? '📁' : '🏷️'}</span>
          <span style={{ fontWeight: depth === 0 ? 700 : 500, fontSize: 14 }}>{cat.name}</span>
          {depth === 0 && children.length > 0 && <Badge color="purple">{children.length} sotto</Badge>}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
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
        />
      ))}
    </div>
  )
}

export function Categories() {
  const [cats, setCats] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', parent_id: '' })
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    api.getAdminCategories().then((r) => setCats(r.data)).catch(() => {})
  }, [])

  const openNew = () => { setEditingId(null); setForm({ name: '', parent_id: '' }); setModalOpen(true) }
  const openEdit = (c) => { setEditingId(c.id); setForm({ name: c.name, parent_id: c.parent_id || '' }); setModalOpen(true) }

  const save = () => {
    if (!form.name.trim()) return
    const parent_id = form.parent_id ? Number(form.parent_id) : null
    setCats((cs) => {
      if (editingId) return cs.map((c) => c.id === editingId ? { ...c, name: form.name, parent_id } : c)
      return [...cs, { id: Date.now(), name: form.name, parent_id }]
    })
    setModalOpen(false)
  }

  const remove = (id) => { setCats((cs) => cs.filter((c) => c.id !== id && c.parent_id !== id)) }

  const roots = (cats || []).filter((c) => c.parent_id === null)
  const childrenOf = (id) => (cats || []).filter((c) => c.parent_id === id)

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <p style={{ color: tokens.textMuted, fontSize: 14, margin: 0 }}>
          Categorizza i ticket con una gerarchia di categorie
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
        {cats && roots.map((root, idx) => (
          <CategoryRow
            key={root.id} cat={root} depth={0}
            isLast={idx === roots.length - 1}
            children={childrenOf(root.id)}
            allChildrenOf={childrenOf}
            onEdit={openEdit} onDelete={remove}
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
