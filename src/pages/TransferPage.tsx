import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n'
import type { TransferProvider } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'

function FR({ label, name, value, editing, type = 'text', onChange, empty }: { label: string; name: string; value: string | number | null; editing: boolean; type?: string; onChange: (n: string, v: string) => void; empty: string }) {
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      {editing ? <input className="form-input form-input-sm" type={type} value={value ?? ''} onChange={e => onChange(name, e.target.value)} /> : <div className="field-value">{value !== null && value !== '' ? String(value) : empty}</div>}
    </div>
  )
}

const EMPTY: Partial<TransferProvider> = { name: '', contact_person: '', phone: '', email: '', normal_price: null, notes: '' }

export default function TransferPage() {
  const { t } = useT()
  const [items, setItems] = useState<TransferProvider[]>([])
  const [selected, setSelected] = useState<TransferProvider | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<TransferProvider>>({})
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = async () => { setLoading(true); const { data } = await supabase.from('transfer_providers').select('*').order('name'); setItems(data || []); setLoading(false) }
  useEffect(() => { load() }, [])

  const filtered = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const select = (p: TransferProvider) => { setSelected(p); setEditing(false); setIsNew(false); setSaveError('') }
  const startNew = () => { setEditData({ ...EMPTY }); setSelected(null); setIsNew(true); setEditing(true); setSaveError('') }
  const startEdit = () => { setEditData({ ...selected }); setEditing(true); setSaveError('') }
  const cancel = () => { setEditing(false); setIsNew(false); setSaveError('') }
  const handleChange = (n: string, v: string) => setEditData(p => ({ ...p, [n]: v === '' ? null : v }))

  const handleSave = async () => {
    setSaving(true); setSaveError('')
    if (isNew) {
      const { error } = await supabase.from('transfer_providers').insert({ ...editData, id: `rec${Date.now()}` })
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('transfer_providers').update(editData).eq('id', selected!.id)
      if (error) { setSaveError(error.message); setSaving(false); return }
    }
    await load(); setEditing(false); setIsNew(false); setSaving(false)
  }

  const handleDelete = async () => { if (!selected) return; await supabase.from('transfer_providers').delete().eq('id', selected.id); setSelected(null); setShowConfirm(false); await load() }
  const v = (f: keyof TransferProvider) => editing ? (editData[f] as any ?? '') : (selected?.[f] as any ?? '')

  return (
    <div className="split-layout">
      {showConfirm && <ConfirmDialog message={`${t('confirm_delete')} "${selected?.name}"? ${t('confirm_irrev')}`} onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />}
      <div className="split-left">
        <div className="split-header"><h2 className="split-title">{t('page_transfer')}</h2><span className="badge-count">{filtered.length}</span></div>
        <div className="search-bar" style={{ display: 'flex', gap: 6 }}>
          <input type="text" className="form-input" placeholder={t('list_search')} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-accent btn-sm" onClick={startNew}>{t('btn_new')}</button>
        </div>
        {loading ? <div className="list-loading"><div className="spinner-sm"></div></div> : (
          <div className="participant-list">
            {filtered.map(p => (
              <div key={p.id} className={`participant-item ${selected?.id === p.id ? 'selected' : ''}`} onClick={() => select(p)}>
                <div className="participant-avatar" style={{ background: '#1D72B822', color: '#1D72B8' }}>🚌</div>
                <div className="participant-info"><div className="participant-name">{p.name}</div><div className="participant-meta">{p.contact_person || t('none')}{p.normal_price ? ` · €${p.normal_price}` : ''}</div></div>
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-state">{t('list_empty')}</div>}
          </div>
        )}
      </div>
      <div className="split-right">
        {(selected || isNew) ? (
          <div className="detail-panel">
            <div className="detail-action-bar">
              {editing
                ? <><span style={{ fontWeight: 600, color: '#2D7A6F' }}>{isNew ? t('detail_mode_new') : t('detail_mode_edit')}</span><div className="action-bar-right">{saveError && <span className="save-error">{saveError}</span>}<button className="btn btn-secondary btn-sm" onClick={cancel}>{t('btn_cancel')}</button><button className="btn btn-accent btn-sm" onClick={handleSave} disabled={saving}>{saving ? t('btn_saving') : t('btn_save')}</button></div></>
                : <><span /><div className="action-bar-right"><button className="btn btn-edit btn-sm" onClick={startEdit}>{t('btn_edit')}</button><button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>{t('btn_delete')}</button></div></>}
            </div>
            {!isNew && selected && <div className="detail-name-header"><div className="detail-avatar" style={{ background: '#1D72B822', color: '#1D72B8' }}>🚌</div><div><h2 className="detail-name">{selected.name}</h2></div></div>}
            {isNew && <div className="detail-name-header"><div className="detail-avatar" style={{ background: '#1D72B8' }}>+</div><div><h2 className="detail-name">{t('tr_new')}</h2></div></div>}
            <div className="detail-sections">
              <div className="detail-section-header">{t('page_transfer')}</div>
              <div className="fields-grid">
                <FR label={t('fld_transfer_prov')} name="name" value={v('name')} editing={editing} onChange={handleChange} empty={t('none')} />
                <FR label={t('fld_contact')} name="contact_person" value={v('contact_person')} editing={editing} onChange={handleChange} empty={t('none')} />
                <FR label={t('fld_phone')} name="phone" value={v('phone')} editing={editing} onChange={handleChange} empty={t('none')} />
                <FR label={t('fld_email')} name="email" value={v('email')} editing={editing} type="email" onChange={handleChange} empty={t('none')} />
                <FR label={t('fld_tr_price')} name="normal_price" value={v('normal_price')} editing={editing} type="number" onChange={handleChange} empty={t('none')} />
              </div>
              {(editing || selected?.notes) && (
                <>
                  <div className="detail-section-header">{t('fld_tr_notes')}</div>
                  <div className="field-row">
                    {editing ? <textarea className="form-input" rows={3} value={v('notes')} onChange={e => handleChange('notes', e.target.value)} style={{ resize: 'vertical' }} /> : <div className="field-value">{selected?.notes}</div>}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="detail-empty"><div className="detail-empty-icon">🚌</div><p>{t('tr_hint')}</p><button className="btn btn-accent" onClick={startNew} style={{ marginTop: 12 }}>{t('tr_new')}</button></div>
        )}
      </div>
    </div>
  )
}
