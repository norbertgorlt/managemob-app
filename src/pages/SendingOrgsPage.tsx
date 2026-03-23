import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { SendingOrganisation } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'

function FR({ label, name, value, editing, type = 'text', onChange }: { label: string; name: string; value: string | null; editing: boolean; type?: string; onChange: (n: string, v: string) => void }) {
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      {editing ? <input className="form-input form-input-sm" type={type} value={value ?? ''} onChange={e => onChange(name, e.target.value)} /> : <div className="field-value">{value || '—'}</div>}
    </div>
  )
}

const EMPTY: Partial<SendingOrganisation> = { name: '', contact_person: '', email: '', phone: '', address: '', city: '', country: '' }

export default function SendingOrgsPage() {
  const [items, setItems] = useState<SendingOrganisation[]>([])
  const [selected, setSelected] = useState<SendingOrganisation | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<SendingOrganisation>>({})
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = async () => { setLoading(true); const { data } = await supabase.from('sending_organisations').select('*').order('name'); setItems(data || []); setLoading(false) }
  useEffect(() => { load() }, [])

  const filtered = items.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || (o.country || '').toLowerCase().includes(search.toLowerCase()))
  const select = (o: SendingOrganisation) => { setSelected(o); setEditing(false); setIsNew(false); setSaveError('') }
  const startNew = () => { setEditData({ ...EMPTY }); setSelected(null); setIsNew(true); setEditing(true); setSaveError('') }
  const startEdit = () => { setEditData({ ...selected }); setEditing(true); setSaveError('') }
  const cancel = () => { setEditing(false); setIsNew(false); setSaveError('') }
  const handleChange = (n: string, v: string) => setEditData(p => ({ ...p, [n]: v === '' ? null : v }))

  const handleSave = async () => {
    setSaving(true); setSaveError('')
    if (isNew) {
      const { error } = await supabase.from('sending_organisations').insert({ ...editData, id: `rec${Date.now()}` })
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('sending_organisations').update(editData).eq('id', selected!.id)
      if (error) { setSaveError(error.message); setSaving(false); return }
    }
    await load(); setEditing(false); setIsNew(false); setSaving(false)
  }

  const handleDelete = async () => { if (!selected) return; await supabase.from('sending_organisations').delete().eq('id', selected.id); setSelected(null); setShowConfirm(false); await load() }
  const v = (f: keyof SendingOrganisation) => editing ? (editData[f] as string ?? '') : (selected?.[f] as string ?? '')

  return (
    <div className="split-layout">
      {showConfirm && <ConfirmDialog message={`Eliminare "${selected?.name}"?`} onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />}
      <div className="split-left">
        <div className="split-header"><h2 className="split-title">Sending Organisations</h2><span className="badge-count">{filtered.length}</span></div>
        <div className="search-bar" style={{ display: 'flex', gap: 6 }}>
          <input type="text" className="form-input" placeholder="Cerca..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-accent btn-sm" onClick={startNew}>+</button>
        </div>
        {loading ? <div className="list-loading"><div className="spinner-sm"></div></div> : (
          <div className="participant-list">
            {filtered.map(o => (
              <div key={o.id} className={`participant-item ${selected?.id === o.id ? 'selected' : ''}`} onClick={() => select(o)}>
                <div className="participant-avatar" style={{ background: '#2D7A6F22', color: '#2D7A6F' }}>{o.name.charAt(0)}</div>
                <div className="participant-info"><div className="participant-name">{o.name}</div><div className="participant-meta">{o.city}{o.country ? ` · ${o.country}` : ''}</div></div>
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-state">Nessuna organizzazione trovata</div>}
          </div>
        )}
      </div>
      <div className="split-right">
        {(selected || isNew) ? (
          <div className="detail-panel">
            <div className="detail-action-bar">
              {editing
                ? <><span style={{ fontWeight: 600, color: '#2D7A6F' }}>{isNew ? 'Nuova Organizzazione' : 'Modifica'}</span><div className="action-bar-right">{saveError && <span className="save-error">{saveError}</span>}<button className="btn btn-secondary btn-sm" onClick={cancel}>Annulla</button><button className="btn btn-accent btn-sm" onClick={handleSave} disabled={saving}>{saving ? 'Salvo...' : '💾 Salva'}</button></div></>
                : <><span /><div className="action-bar-right"><button className="btn btn-edit btn-sm" onClick={startEdit}>✏️ Modifica</button><button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>🗑 Elimina</button></div></>}
            </div>
            {!isNew && selected && <div className="detail-name-header"><div className="detail-avatar" style={{ background: '#2D7A6F22', color: '#2D7A6F' }}>{selected.name.charAt(0)}</div><div><h2 className="detail-name">{selected.name}</h2><p className="detail-id">{selected.city}, {selected.country}</p></div></div>}
            {isNew && <div className="detail-name-header"><div className="detail-avatar" style={{ background: '#2D7A6F' }}>+</div><div><h2 className="detail-name">Nuova Organizzazione</h2></div></div>}
            <div className="detail-sections">
              <div className="detail-section-header">Dati Organizzazione</div>
              <div className="fields-grid">
                <FR label="Nome" name="name" value={v('name')} editing={editing} onChange={handleChange} />
                <FR label="Contatto" name="contact_person" value={v('contact_person')} editing={editing} onChange={handleChange} />
                <FR label="Email" name="email" value={v('email')} editing={editing} type="email" onChange={handleChange} />
                <FR label="Telefono" name="phone" value={v('phone')} editing={editing} onChange={handleChange} />
                <FR label="Indirizzo" name="address" value={v('address')} editing={editing} onChange={handleChange} />
                <FR label="Città" name="city" value={v('city')} editing={editing} onChange={handleChange} />
                <FR label="Paese" name="country" value={v('country')} editing={editing} onChange={handleChange} />
              </div>
            </div>
          </div>
        ) : (
          <div className="detail-empty"><div className="detail-empty-icon">🏛</div><p>Seleziona un'organizzazione o creane una nuova</p><button className="btn btn-accent" onClick={startNew} style={{ marginTop: 12 }}>+ Nuova Organizzazione</button></div>
        )}
      </div>
    </div>
  )
}
