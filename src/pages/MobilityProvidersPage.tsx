import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { MobilityServiceProvider } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'

function FR({ label, name, value, editing, type = 'text', onChange }: { label: string; name: string; value: string | number | null; editing: boolean; type?: string; onChange: (n: string, v: string) => void }) {
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      {editing ? <input className="form-input form-input-sm" type={type} value={value ?? ''} onChange={e => onChange(name, e.target.value)} /> : <div className="field-value">{value !== null && value !== '' ? String(value) : '—'}</div>}
    </div>
  )
}

const EMPTY: Partial<MobilityServiceProvider> = {
  name: '', pic_number: '', address: '', postcode: '', city: '', country: '', website: '',
  email: '', phone: '', contact_person: '', contact_email: '', contact_phone: '',
  contact_comments: '', geographic_area: '', specialty_1: '', specialty_2: '', specialty_3: '', notes: '',
  placement_fees: ''
}

export default function MobilityProvidersPage() {
  const [items, setItems] = useState<MobilityServiceProvider[]>([])
  const [selected, setSelected] = useState<MobilityServiceProvider | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<MobilityServiceProvider>>({})
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = async () => { setLoading(true); const { data } = await supabase.from('mobility_service_providers').select('*').order('name'); setItems(data || []); setLoading(false) }
  useEffect(() => { load() }, [])

  const filtered = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.city || '').toLowerCase().includes(search.toLowerCase()) || (p.country || '').toLowerCase().includes(search.toLowerCase()))
  const select = (p: MobilityServiceProvider) => { setSelected(p); setEditing(false); setIsNew(false); setSaveError('') }
  const startNew = () => { setEditData({ ...EMPTY }); setSelected(null); setIsNew(true); setEditing(true); setSaveError('') }
  const startEdit = () => { setEditData({ ...selected }); setEditing(true); setSaveError('') }
  const cancel = () => { setEditing(false); setIsNew(false); setSaveError('') }
  const handleChange = (n: string, v: string) => setEditData(p => ({ ...p, [n]: v === '' ? null : v }))
  const handleNumChange = (n: string, v: string) => setEditData(p => ({ ...p, [n]: v === '' ? null : Number(v) }))

  const handleSave = async () => {
    setSaving(true); setSaveError('')
    if (isNew) {
      const { error } = await supabase.from('mobility_service_providers').insert({ ...editData, id: `rec${Date.now()}` })
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('mobility_service_providers').update(editData).eq('id', selected!.id)
      if (error) { setSaveError(error.message); setSaving(false); return }
    }
    await load(); setEditing(false); setIsNew(false); setSaving(false)
  }

  const handleDelete = async () => { if (!selected) return; await supabase.from('mobility_service_providers').delete().eq('id', selected.id); setSelected(null); setShowConfirm(false); await load() }
  const v = (f: keyof MobilityServiceProvider) => editing ? (editData[f] as string ?? '') : (selected?.[f] as string ?? '')

  return (
    <div className="split-layout">
      {showConfirm && <ConfirmDialog message={`Eliminare "${selected?.name}"?`} onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />}
      <div className="split-left">
        <div className="split-header"><h2 className="split-title">Mobility Service Providers</h2><span className="badge-count">{filtered.length}</span></div>
        <div className="search-bar" style={{ display: 'flex', gap: 6 }}>
          <input type="text" className="form-input" placeholder="Cerca..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-accent btn-sm" onClick={startNew}>+</button>
        </div>
        {loading ? <div className="list-loading"><div className="spinner-sm"></div></div> : (
          <div className="participant-list">
            {filtered.map(p => (
              <div key={p.id} className={`participant-item ${selected?.id === p.id ? 'selected' : ''}`} onClick={() => select(p)}>
                <div className="participant-avatar" style={{ background: '#38BDF822', color: '#0284C7' }}>{p.name.charAt(0)}</div>
                <div className="participant-info"><div className="participant-name">{p.name}</div><div className="participant-meta">{p.city}{p.country ? ` · ${p.country}` : ''}</div></div>
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-state">Nessun provider trovato</div>}
          </div>
        )}
      </div>
      <div className="split-right">
        {(selected || isNew) ? (
          <div className="detail-panel">
            <div className="detail-action-bar">
              {editing
                ? <><span style={{ fontWeight: 600, color: '#2D7A6F' }}>{isNew ? 'Nuovo Provider' : 'Modifica'}</span><div className="action-bar-right">{saveError && <span className="save-error">{saveError}</span>}<button className="btn btn-secondary btn-sm" onClick={cancel}>Annulla</button><button className="btn btn-accent btn-sm" onClick={handleSave} disabled={saving}>{saving ? 'Salvo...' : '💾 Salva'}</button></div></>
                : <><span /><div className="action-bar-right"><button className="btn btn-edit btn-sm" onClick={startEdit}>✏️ Modifica</button><button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>🗑 Elimina</button></div></>}
            </div>
            {!isNew && selected && <div className="detail-name-header"><div className="detail-avatar" style={{ background: '#38BDF822', color: '#0284C7' }}>{selected.name.charAt(0)}</div><div><h2 className="detail-name">{selected.name}</h2><p className="detail-id">Mobility Service Provider</p></div></div>}
            {isNew && <div className="detail-name-header"><div className="detail-avatar" style={{ background: '#0284C7' }}>+</div><div><h2 className="detail-name">Nuovo Provider</h2></div></div>}
            <div className="detail-sections">
              <div className="detail-section-header">Dati Organizzazione</div>
              <div className="fields-grid">
                <FR label="Nome" name="name" value={v('name')} editing={editing} onChange={handleChange} />
                <FR label="Codice PIC" name="pic_number" value={v('pic_number')} editing={editing} onChange={handleChange} />
                <FR label="Area Geografica" name="geographic_area" value={v('geographic_area')} editing={editing} onChange={handleChange} />
                <FR label="Website" name="website" value={v('website')} editing={editing} onChange={handleChange} />
                <FR label="Email" name="email" value={v('email')} editing={editing} type="email" onChange={handleChange} />
                <FR label="Telefono" name="phone" value={v('phone')} editing={editing} onChange={handleChange} />
              </div>
              <div className="detail-section-header">Indirizzo</div>
              <div className="fields-grid">
                <FR label="Indirizzo" name="address" value={v('address')} editing={editing} onChange={handleChange} />
                <FR label="CAP" name="postcode" value={v('postcode')} editing={editing} onChange={handleChange} />
                <FR label="Città" name="city" value={v('city')} editing={editing} onChange={handleChange} />
                <FR label="Paese" name="country" value={v('country')} editing={editing} onChange={handleChange} />
              </div>
              <div className="detail-section-header">Contatto Principale</div>
              <div className="fields-grid">
                <FR label="Persona di Contatto" name="contact_person" value={v('contact_person')} editing={editing} onChange={handleChange} />
                <FR label="Email Contatto" name="contact_email" value={v('contact_email')} editing={editing} type="email" onChange={handleChange} />
                <FR label="Tel. Contatto" name="contact_phone" value={v('contact_phone')} editing={editing} onChange={handleChange} />
                <FR label="Note Contatto" name="contact_comments" value={v('contact_comments')} editing={editing} onChange={handleChange} />
              </div>
              <div className="detail-section-header">Capacità e Specialità</div>
              <div className="fields-grid">
                <FR label="N. Uffici" name="num_offices" value={v('num_offices')} editing={editing} type="number" onChange={handleNumChange} />
                <FR label="N. Dipendenti" name="num_employees" value={v('num_employees')} editing={editing} type="number" onChange={handleNumChange} />
                <FR label="Capacità Placement" name="placement_capacity" value={v('placement_capacity')} editing={editing} type="number" onChange={handleNumChange} />
                <FR label="Tariffe Placement" name="placement_fees" value={v('placement_fees')} editing={editing} onChange={handleChange} />
                <FR label="Specialità 1" name="specialty_1" value={v('specialty_1')} editing={editing} onChange={handleChange} />
                <FR label="Specialità 2" name="specialty_2" value={v('specialty_2')} editing={editing} onChange={handleChange} />
                <FR label="Specialità 3" name="specialty_3" value={v('specialty_3')} editing={editing} onChange={handleChange} />
              </div>
              {(editing || selected?.notes) && (
                <>
                  <div className="detail-section-header">Note</div>
                  <div className="field-row">
                    {editing
                      ? <textarea className="form-input" rows={3} value={v('notes')} onChange={e => handleChange('notes', e.target.value)} style={{ resize: 'vertical' }} />
                      : <div className="field-value" style={{ whiteSpace: 'pre-wrap' }}>{selected?.notes}</div>}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="detail-empty"><div className="detail-empty-icon">🌐</div><p>Seleziona un provider o creane uno nuovo</p><button className="btn btn-accent" onClick={startNew} style={{ marginTop: 12 }}>+ Nuovo Provider</button></div>
        )}
      </div>
    </div>
  )
}
