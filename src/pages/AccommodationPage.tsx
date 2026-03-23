import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Accommodation } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'

const typologyColors: Record<string, string> = { 'Hostel': '#2D7A6F', 'Hotel': '#1D72B8', 'B&B': '#F59E0B', 'Host Family': '#10B981', 'Shared Flat': '#8B5CF6', 'Lodger': '#EC4899' }
const TYPOLOGIES = ['Hostel', 'Hotel', 'B&B', 'Host Family', 'Shared Flat', 'Lodger']
const BOARD_OPTIONS = ['Bed and Breakfast (B&B)', 'Half-Board', 'Full-Board', 'Self-catering']

function FR({ label, name, value, editing, type = 'text', onChange, options }: { label: string; name: string; value: string | number | null; editing: boolean; type?: string; onChange: (n: string, v: string) => void; options?: string[] }) {
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      {editing
        ? options
          ? <select className="form-input form-input-sm" value={value ?? ''} onChange={e => onChange(name, e.target.value)}><option value="">—</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
          : <input className="form-input form-input-sm" type={type} value={value ?? ''} onChange={e => onChange(name, e.target.value)} />
        : <div className="field-value">{value !== null && value !== '' ? String(value) : '—'}</div>}
    </div>
  )
}

function FRBool({ label, name, value, editing, onChange }: { label: string; name: string; value: boolean | null; editing: boolean; onChange: (n: string, v: string) => void }) {
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      {editing
        ? <select className="form-input form-input-sm" value={value === true ? 'true' : value === false ? 'false' : ''} onChange={e => onChange(name, e.target.value)}><option value="">—</option><option value="true">Sì</option><option value="false">No</option></select>
        : <div className="field-value">{value === true ? 'Sì' : value === false ? 'No' : '—'}</div>}
    </div>
  )
}

const EMPTY: Partial<Accommodation> = { name: '', typology: '', contact_person: '', email: '', phone: '', address: '', postcode: '', city: '', country: '' }

export default function AccommodationPage() {
  const [items, setItems] = useState<Accommodation[]>([])
  const [selected, setSelected] = useState<Accommodation | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Accommodation>>({})
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = async () => { setLoading(true); const { data } = await supabase.from('accommodation').select('*').order('name'); setItems(data || []); setLoading(false) }
  useEffect(() => { load() }, [])

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || (i.city || '').toLowerCase().includes(search.toLowerCase()) || (i.typology || '').toLowerCase().includes(search.toLowerCase()))

  const select = (a: Accommodation) => { setSelected(a); setEditing(false); setIsNew(false); setSaveError('') }
  const startNew = () => { setEditData({ ...EMPTY }); setSelected(null); setIsNew(true); setEditing(true); setSaveError('') }
  const startEdit = () => { setEditData({ ...selected }); setEditing(true); setSaveError('') }
  const cancel = () => { setEditing(false); setIsNew(false); setSaveError('') }

  const handleChange = (n: string, v: string) => {
    setEditData(p => {
      if (n === 'has_desk' || n === 'has_internet' || n === 'has_washing_machine' || n === 'has_pets' || n === 'has_air_conditioning' || n === 'has_heating') {
        return { ...p, [n]: v === '' ? null : v === 'true' }
      }
      return { ...p, [n]: v === '' ? null : v }
    })
  }

  const handleSave = async () => {
    setSaving(true); setSaveError('')
    const payload = { ...editData }
    if (isNew) {
      const { error } = await supabase.from('accommodation').insert({ ...payload, id: `rec${Date.now()}` })
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('accommodation').update(payload).eq('id', selected!.id)
      if (error) { setSaveError(error.message); setSaving(false); return }
    }
    await load(); setEditing(false); setIsNew(false); setSaving(false)
  }

  const handleDelete = async () => { if (!selected) return; await supabase.from('accommodation').delete().eq('id', selected.id); setSelected(null); setShowConfirm(false); await load() }

  const color = (typology: string | null) => typologyColors[typology || ''] || '#6B7280'
  const v = (f: keyof Accommodation) => editing ? (editData[f] as any ?? '') : (selected?.[f] as any ?? '')
  const vb = (f: keyof Accommodation) => editing ? (editData[f] as boolean | null ?? null) : (selected?.[f] as boolean | null ?? null)

  return (
    <div className="split-layout">
      {showConfirm && <ConfirmDialog message={`Eliminare "${selected?.name}"?`} onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />}
      <div className="split-left">
        <div className="split-header"><h2 className="split-title">Accommodation</h2><span className="badge-count">{filtered.length}</span></div>
        <div className="search-bar" style={{ display: 'flex', gap: 6 }}>
          <input type="text" className="form-input" placeholder="Cerca..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-accent btn-sm" onClick={startNew}>+</button>
        </div>
        {loading ? <div className="list-loading"><div className="spinner-sm"></div></div> : (
          <div className="participant-list">
            {filtered.map(a => (
              <div key={a.id} className={`participant-item ${selected?.id === a.id ? 'selected' : ''}`} onClick={() => select(a)}>
                <div className="participant-avatar" style={{ background: `${color(a.typology)}22`, color: color(a.typology), fontSize: 11, fontWeight: 700 }}>{(a.typology || '?').slice(0, 2).toUpperCase()}</div>
                <div className="participant-info"><div className="participant-name">{a.name}</div><div className="participant-meta">{a.typology}{a.city ? ` · ${a.city}` : ''}</div></div>
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-state">Nessun alloggio trovato</div>}
          </div>
        )}
      </div>

      <div className="split-right">
        {(selected || isNew) ? (
          <div className="detail-panel">
            <div className="detail-action-bar">
              {editing
                ? <><span style={{ fontWeight: 600, color: '#2D7A6F' }}>{isNew ? 'Nuovo Alloggio' : 'Modifica'}</span><div className="action-bar-right">{saveError && <span className="save-error">{saveError}</span>}<button className="btn btn-secondary btn-sm" onClick={cancel}>Annulla</button><button className="btn btn-accent btn-sm" onClick={handleSave} disabled={saving}>{saving ? 'Salvo...' : '💾 Salva'}</button></div></>
                : <><span /><div className="action-bar-right"><button className="btn btn-edit btn-sm" onClick={startEdit}>✏️ Modifica</button><button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>🗑 Elimina</button></div></>}
            </div>
            {!isNew && selected && <div className="detail-name-header"><div className="detail-avatar" style={{ background: `${color(selected.typology)}22`, color: color(selected.typology) }}>{(selected.typology || '?').charAt(0)}</div><div><h2 className="detail-name">{selected.name}</h2><p className="detail-id">{selected.typology} · {selected.city}</p></div></div>}
            {isNew && <div className="detail-name-header"><div className="detail-avatar" style={{ background: '#1D72B822', color: '#1D72B8' }}>+</div><div><h2 className="detail-name">Nuovo Alloggio</h2></div></div>}
            <div className="detail-sections">
              <div className="detail-section-header">Informazioni Base</div>
              <div className="fields-grid">
                <FR label="Nome" name="name" value={v('name')} editing={editing} onChange={handleChange} />
                <FR label="Tipologia" name="typology" value={v('typology')} editing={editing} onChange={handleChange} options={TYPOLOGIES} />
                <FR label="Contatto" name="contact_person" value={v('contact_person')} editing={editing} onChange={handleChange} />
                <FR label="Email" name="email" value={v('email')} editing={editing} type="email" onChange={handleChange} />
                <FR label="Telefono" name="phone" value={v('phone')} editing={editing} onChange={handleChange} />
                <FR label="Cellulare" name="mobile_phone" value={v('mobile_phone')} editing={editing} onChange={handleChange} />
              </div>
              <div className="detail-section-header">Indirizzo</div>
              <div className="fields-grid">
                <FR label="Indirizzo" name="address" value={v('address')} editing={editing} onChange={handleChange} />
                <FR label="CAP" name="postcode" value={v('postcode')} editing={editing} onChange={handleChange} />
                <FR label="Città" name="city" value={v('city')} editing={editing} onChange={handleChange} />
                <FR label="Paese" name="country" value={v('country')} editing={editing} onChange={handleChange} />
              </div>
              <div className="detail-section-header">Caratteristiche</div>
              <div className="fields-grid">
                <FR label="N. camere" name="num_bedrooms" value={v('num_bedrooms')} editing={editing} type="number" onChange={handleChange} />
                <FR label="Dimensione (m²)" name="size_m2" value={v('size_m2')} editing={editing} type="number" onChange={handleChange} />
                <FRBool label="Scrivania" name="has_desk" value={vb('has_desk')} editing={editing} onChange={handleChange} />
                <FRBool label="Internet" name="has_internet" value={vb('has_internet')} editing={editing} onChange={handleChange} />
                <FRBool label="Lavatrice" name="has_washing_machine" value={vb('has_washing_machine')} editing={editing} onChange={handleChange} />
                <FR label="Bagni" name="bathrooms_type" value={v('bathrooms_type')} editing={editing} onChange={handleChange} options={['Private Bathrooms', 'Shared Bathrooms']} />
                <FRBool label="Animali" name="has_pets" value={vb('has_pets')} editing={editing} onChange={handleChange} />
                <FRBool label="Aria condizionata" name="has_air_conditioning" value={vb('has_air_conditioning')} editing={editing} onChange={handleChange} />
                <FRBool label="Riscaldamento" name="has_heating" value={vb('has_heating')} editing={editing} onChange={handleChange} />
              </div>
              <div className="detail-section-header">Opzioni Pensione</div>
              <div className="fields-grid">
                <FR label="Opzione 1" name="board_option_1" value={v('board_option_1')} editing={editing} onChange={handleChange} options={BOARD_OPTIONS} />
                <FR label="Prezzo/sett. 1" name="price_week_option_1" value={v('price_week_option_1')} editing={editing} type="number" onChange={handleChange} />
                <FR label="Opzione 2" name="board_option_2" value={v('board_option_2')} editing={editing} onChange={handleChange} options={BOARD_OPTIONS} />
                <FR label="Prezzo/sett. 2" name="price_week_option_2" value={v('price_week_option_2')} editing={editing} type="number" onChange={handleChange} />
                <FR label="Opzione 3" name="board_option_3" value={v('board_option_3')} editing={editing} onChange={handleChange} options={BOARD_OPTIONS} />
                <FR label="Prezzo/sett. 3" name="price_week_option_3" value={v('price_week_option_3')} editing={editing} type="number" onChange={handleChange} />
              </div>
              <div className="detail-section-header">Banca</div>
              <div className="fields-grid">
                <FR label="IBAN" name="iban" value={v('iban')} editing={editing} onChange={handleChange} />
                <FR label="SWIFT" name="swift" value={v('swift')} editing={editing} onChange={handleChange} />
              </div>
              {(editing || selected?.family_rules) && (
                <>
                  <div className="detail-section-header">Regole Casa</div>
                  <div className="field-row">
                    {editing
                      ? <textarea className="form-input" rows={3} value={v('family_rules')} onChange={e => handleChange('family_rules', e.target.value)} style={{ resize: 'vertical' }} />
                      : <div className="field-value" style={{ whiteSpace: 'pre-wrap' }}>{selected?.family_rules}</div>}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="detail-empty"><div className="detail-empty-icon">🏠</div><p>Seleziona un alloggio o creane uno nuovo</p><button className="btn btn-accent" onClick={startNew} style={{ marginTop: 12 }}>+ Nuovo Alloggio</button></div>
        )}
      </div>
    </div>
  )
}
