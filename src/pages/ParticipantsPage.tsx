import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Participant, SendingOrganisation, HostCompany, InsuranceProvider, TransferProvider, LanguageCourseProvider, Accommodation } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'

interface ParticipantsPageProps {
  typology: 'Incoming' | 'Outgoing'
  groupView?: boolean
}

function Badge({ text, color }: { text: string; color: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: `${color}22`, color, border: `1px solid ${color}44` }}>{text}</span>
}

interface FRProps { label: string; name: string; value: string | number | null; editing: boolean; type?: string; onChange: (name: string, val: string) => void; options?: string[] }
function FR({ label, name, value, editing, type = 'text', onChange, options }: FRProps) {
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      {editing ? (
        options ? (
          <select className="form-input form-input-sm" value={value ?? ''} onChange={e => onChange(name, e.target.value)}>
            <option value="">—</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input className="form-input form-input-sm" type={type} value={value ?? ''} onChange={e => onChange(name, e.target.value)} />
        )
      ) : (
        <div className="field-value">{value || '—'}</div>
      )}
    </div>
  )
}

interface FRRefProps { label: string; name: string; valueId: string | null; valueName: string | null; editing: boolean; onChange: (name: string, val: string) => void; options: { id: string; name: string }[] }
function FRRef({ label, name, valueId, valueName, editing, onChange, options }: FRRefProps) {
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      {editing ? (
        <select className="form-input form-input-sm" value={valueId ?? ''} onChange={e => onChange(name, e.target.value)}>
          <option value="">—</option>
          {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      ) : (
        <div className="field-value">{valueName || '—'}</div>
      )}
    </div>
  )
}

const EMPTY_PARTICIPANT: Partial<Participant> = {
  name: '', surname: '', sex: '', status: '', nationality: '', marital_status: '',
  mobility_typology: '', indiv_group: 'Individual', email: '', phone: '', mobile_phone: '',
  address: '', postcode: '', city: '', country: '',
  destination_country: '', destination_city: '', program: '', group_name: '', project_name: '',
  grant_amount: null, lang_english: '', lang_spanish: '', lang_french: '', lang_german: '', lang_italian: '',
}

export default function ParticipantsPage({ typology, groupView = false }: ParticipantsPageProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selected, setSelected] = useState<Participant | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Participant>>({})
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Reference data for dropdowns
  const [sendingOrgs, setSendingOrgs] = useState<SendingOrganisation[]>([])
  const [hostCompanies, setHostCompanies] = useState<HostCompany[]>([])
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([])
  const [transferProviders, setTransferProviders] = useState<TransferProvider[]>([])
  const [langCourseProviders, setLangCourseProviders] = useState<LanguageCourseProvider[]>([])
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])

  useEffect(() => {
    loadParticipants()
    loadRefs()
  }, [typology])

  const loadRefs = async () => {
    const [so, hc, ins, tr, lcp, acc] = await Promise.all([
      supabase.from('sending_organisations').select('*').order('name'),
      supabase.from('host_companies').select('*').order('name'),
      supabase.from('insurance_providers').select('*').order('name'),
      supabase.from('transfer_providers').select('*').order('name'),
      supabase.from('language_course_providers').select('*').order('name'),
      supabase.from('accommodation').select('*').order('name'),
    ])
    setSendingOrgs(so.data || [])
    setHostCompanies(hc.data || [])
    setInsuranceProviders(ins.data || [])
    setTransferProviders(tr.data || [])
    setLangCourseProviders(lcp.data || [])
    setAccommodations(acc.data || [])
  }

  const loadParticipants = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('participants')
      .select(`*, sending_organisations(id,name), host_companies(id,name,address,city,sector,tutor,tutor_phone,tutor_email), insurance_providers(id,name), transfer_providers(id,name), language_course_providers(id,name), accommodation_1:accommodation!participants_accommodation_1_id_fkey(id,name,typology,address,city,country), accommodation_2:accommodation!participants_accommodation_2_id_fkey(id,name,typology,address,city,country)`)
      .eq('mobility_typology', typology)
      .order('surname', { ascending: true })
    if (error) console.error(error)
    else setParticipants((data as unknown as Participant[]) || [])
    setLoading(false)
  }

  const filtered = participants.filter(p => {
    const q = search.toLowerCase()
    return `${p.name} ${p.surname}`.toLowerCase().includes(q) ||
      (p.sending_organisations?.name || '').toLowerCase().includes(q) ||
      (p.nationality || '').toLowerCase().includes(q)
  })

  const grouped: Record<string, Participant[]> = {}
  filtered.forEach(p => {
    const org = p.sending_organisations?.name || 'No Organisation'
    if (!grouped[org]) grouped[org] = []
    grouped[org].push(p)
  })

  const selectParticipant = (p: Participant) => {
    setSelected(p)
    setEditing(false)
    setIsNew(false)
    setSaveError('')
  }

  const startEdit = () => {
    setEditData({ ...selected })
    setEditing(true)
    setSaveError('')
  }

  const startNew = () => {
    const newP: Partial<Participant> = { ...EMPTY_PARTICIPANT, mobility_typology: typology }
    setEditData(newP)
    setSelected(null)
    setIsNew(true)
    setEditing(true)
    setSaveError('')
  }

  const cancelEdit = () => {
    setEditing(false)
    setIsNew(false)
    setSaveError('')
  }

  const handleChange = (name: string, val: string) => {
    setEditData(prev => ({ ...prev, [name]: val === '' ? null : val }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    const payload = { ...editData }
    // Remove joined fields
    delete (payload as any).sending_organisations
    delete (payload as any).host_companies
    delete (payload as any).insurance_providers
    delete (payload as any).transfer_providers
    delete (payload as any).language_course_providers
    delete (payload as any).accommodation_1
    delete (payload as any).accommodation_2

    if (isNew) {
      const id = `rec${Date.now()}`
      const { error } = await supabase.from('participants').insert({ ...payload, id })
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('participants').update(payload).eq('id', selected!.id)
      if (error) { setSaveError(error.message); setSaving(false); return }
    }
    await loadParticipants()
    setEditing(false)
    setIsNew(false)
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selected) return
    await supabase.from('participants').delete().eq('id', selected.id)
    setSelected(null)
    setShowConfirm(false)
    await loadParticipants()
  }

  const pdfBase = 'https://pdf.managemob.app/pdf-viewer'
  const profLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

  return (
    <div className="split-layout">
      {showConfirm && (
        <ConfirmDialog
          message={`Eliminare ${selected?.name} ${selected?.surname}? L'operazione non è reversibile.`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Left */}
      <div className="split-left">
        <div className="split-header">
          <h2 className="split-title">{groupView ? 'Groups & Participants' : 'Individuals'} — {typology}</h2>
          <span className="badge-count">{filtered.length}</span>
        </div>
        <div className="search-bar" style={{ display: 'flex', gap: 6 }}>
          <input type="text" className="form-input" placeholder="Cerca..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-accent btn-sm" onClick={startNew} title="Nuovo partecipante">+</button>
        </div>
        {loading ? <div className="list-loading"><div className="spinner-sm"></div></div> : (
          <div className="participant-list">
            {Object.entries(grouped).map(([org, members]) => (
              <div key={org} className="org-group">
                <div className="org-group-header"><span>{org}</span><span className="org-count">{members.length}</span></div>
                {members.map(p => (
                  <div key={p.id} className={`participant-item ${selected?.id === p.id ? 'selected' : ''}`} onClick={() => selectParticipant(p)}>
                    <div className="participant-avatar">{(p.name || '?').charAt(0)}{(p.surname || '').charAt(0)}</div>
                    <div className="participant-info">
                      <div className="participant-name">{p.name} {p.surname}</div>
                      <div className="participant-meta">{p.nationality}{p.destination_city ? ` · ${p.destination_city}` : ''}</div>
                    </div>
                    <Badge text={p.indiv_group || 'Individual'} color={p.indiv_group === 'Group' ? '#8B5CF6' : '#2D7A6F'} />
                  </div>
                ))}
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-state">Nessun partecipante trovato</div>}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="split-right">
        {(selected || isNew) ? (
          <div className="detail-panel">
            {/* Action bar */}
            {!editing ? (
              <div className="detail-action-bar">
                <div className="action-bar-left">
                  <Badge text={selected?.mobility_typology || typology} color="#2D7A6F" />
                  <Badge text={selected?.indiv_group || 'Individual'} color="#1D72B8" />
                </div>
                <div className="action-bar-right">
                  {selected && <>
                    <a href={`${pdfBase}/${selected.id}/participants`} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-sm">Info Voucher</a>
                    <a href={`${pdfBase}/${selected.id}/financial-report`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Financial Report</a>
                    <a href={`${pdfBase}/${selected.id}/certificate`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">Certificate</a>
                  </>}
                  <button className="btn btn-edit btn-sm" onClick={startEdit}>✏️ Modifica</button>
                  {selected && <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>🗑 Elimina</button>}
                </div>
              </div>
            ) : (
              <div className="detail-action-bar">
                <span style={{ fontWeight: 600, color: '#2D7A6F' }}>{isNew ? 'Nuovo Partecipante' : 'Modalità Modifica'}</span>
                <div className="action-bar-right">
                  {saveError && <span className="save-error">{saveError}</span>}
                  <button className="btn btn-secondary btn-sm" onClick={cancelEdit} disabled={saving}>Annulla</button>
                  <button className="btn btn-accent btn-sm" onClick={handleSave} disabled={saving}>{saving ? 'Salvo...' : '💾 Salva'}</button>
                </div>
              </div>
            )}

            {/* Name header */}
            {!isNew && selected && (
              <div className="detail-name-header">
                <div className="detail-avatar">{(selected.name || '?').charAt(0)}{(selected.surname || '').charAt(0)}</div>
                <div>
                  <h2 className="detail-name">{selected.name} {selected.surname}</h2>
                  <p className="detail-id">{selected.id_formattato} · Record #{selected.record_number}</p>
                </div>
              </div>
            )}
            {isNew && (
              <div className="detail-name-header">
                <div className="detail-avatar" style={{ background: '#1D72B8' }}>+</div>
                <div><h2 className="detail-name">Nuovo Partecipante</h2></div>
              </div>
            )}

            <div className="detail-sections">
              <div className="detail-section-header">Informazioni Personali</div>
              <div className="fields-grid">
                <FR label="Nome" name="name" value={editing ? editData.name ?? '' : selected?.name ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Cognome" name="surname" value={editing ? editData.surname ?? '' : selected?.surname ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Sesso" name="sex" value={editing ? editData.sex ?? '' : selected?.sex ?? ''} editing={editing} onChange={handleChange} options={['Male', 'Female', 'Other']} />
                <FR label="Status" name="status" value={editing ? editData.status ?? '' : selected?.status ?? ''} editing={editing} onChange={handleChange} options={['Student', 'Teacher', 'Job seeker', 'Worker', 'Other']} />
                <FR label="Data di nascita" name="date_of_birth" value={editing ? editData.date_of_birth ?? '' : selected?.date_of_birth ?? ''} editing={editing} type="date" onChange={handleChange} />
                <FR label="Luogo di nascita" name="place_of_birth" value={editing ? editData.place_of_birth ?? '' : selected?.place_of_birth ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Nazionalità" name="nationality" value={editing ? editData.nationality ?? '' : selected?.nationality ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Stato civile" name="marital_status" value={editing ? editData.marital_status ?? '' : selected?.marital_status ?? ''} editing={editing} onChange={handleChange} options={['Single', 'Married', 'Divorced', 'Widowed']} />
                <FR label="Patente" name="driving_licence" value={editing ? editData.driving_licence ?? '' : selected?.driving_licence ?? ''} editing={editing} onChange={handleChange} options={['Yes', 'No']} />
              </div>

              <div className="detail-section-header">Indirizzo</div>
              <div className="fields-grid">
                <FR label="Via" name="address" value={editing ? editData.address ?? '' : selected?.address ?? ''} editing={editing} onChange={handleChange} />
                <FR label="CAP" name="postcode" value={editing ? editData.postcode ?? '' : selected?.postcode ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Città" name="city" value={editing ? editData.city ?? '' : selected?.city ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Paese" name="country" value={editing ? editData.country ?? '' : selected?.country ?? ''} editing={editing} onChange={handleChange} />
              </div>

              <div className="detail-section-header">Contatti</div>
              <div className="fields-grid">
                <FR label="Email" name="email" value={editing ? editData.email ?? '' : selected?.email ?? ''} editing={editing} type="email" onChange={handleChange} />
                <FR label="Telefono" name="phone" value={editing ? editData.phone ?? '' : selected?.phone ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Cellulare" name="mobile_phone" value={editing ? editData.mobile_phone ?? '' : selected?.mobile_phone ?? ''} editing={editing} onChange={handleChange} />
              </div>

              <div className="detail-section-header">Passaporto</div>
              <div className="fields-grid">
                <FR label="N. Passaporto" name="passport_number" value={editing ? editData.passport_number ?? '' : selected?.passport_number ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Scadenza" name="passport_expiring_date" value={editing ? editData.passport_expiring_date ?? '' : selected?.passport_expiring_date ?? ''} editing={editing} type="date" onChange={handleChange} />
              </div>

              <div className="detail-section-header">Lingue</div>
              <div className="fields-grid">
                <FR label="Inglese" name="lang_english" value={editing ? editData.lang_english ?? '' : selected?.lang_english ?? ''} editing={editing} onChange={handleChange} options={profLevels} />
                <FR label="Spagnolo" name="lang_spanish" value={editing ? editData.lang_spanish ?? '' : selected?.lang_spanish ?? ''} editing={editing} onChange={handleChange} options={profLevels} />
                <FR label="Francese" name="lang_french" value={editing ? editData.lang_french ?? '' : selected?.lang_french ?? ''} editing={editing} onChange={handleChange} options={profLevels} />
                <FR label="Tedesco" name="lang_german" value={editing ? editData.lang_german ?? '' : selected?.lang_german ?? ''} editing={editing} onChange={handleChange} options={profLevels} />
                <FR label="Italiano" name="lang_italian" value={editing ? editData.lang_italian ?? '' : selected?.lang_italian ?? ''} editing={editing} onChange={handleChange} options={profLevels} />
                <FR label="Altro" name="lang_other" value={editing ? editData.lang_other ?? '' : selected?.lang_other ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Test validato" name="language_test_validated" value={editing ? editData.language_test_validated ?? '' : selected?.language_test_validated ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Punteggio test" name="language_test_score" value={editing ? editData.language_test_score ?? '' : selected?.language_test_score ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Certificato" name="language_test_certificate" value={editing ? editData.language_test_certificate ?? '' : selected?.language_test_certificate ?? ''} editing={editing} onChange={handleChange} />
              </div>

              <div className="detail-section-header">Istruzione</div>
              <div className="fields-grid">
                <FR label="Ultimo diploma" name="last_diploma" value={editing ? editData.last_diploma ?? '' : selected?.last_diploma ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Anno ottenuto" name="year_obtained" value={editing ? editData.year_obtained ?? '' : selected?.year_obtained ?? ''} editing={editing} onChange={handleChange} />
              </div>

              <div className="detail-section-header">Conto Bancario</div>
              <div className="fields-grid">
                <FR label="SWIFT" name="swift_code" value={editing ? editData.swift_code ?? '' : selected?.swift_code ?? ''} editing={editing} onChange={handleChange} />
                <FR label="IBAN" name="iban" value={editing ? editData.iban ?? '' : selected?.iban ?? ''} editing={editing} onChange={handleChange} />
              </div>

              <div className="detail-section-header">Dettagli Mobilità</div>
              <div className="fields-grid">
                <FR label="Tipologia" name="mobility_typology" value={editing ? editData.mobility_typology ?? '' : selected?.mobility_typology ?? ''} editing={editing} onChange={handleChange} options={['Incoming', 'Outgoing']} />
                <FR label="Individuale/Gruppo" name="indiv_group" value={editing ? editData.indiv_group ?? '' : selected?.indiv_group ?? ''} editing={editing} onChange={handleChange} options={['Individual', 'Group']} />
                <FR label="Paese destinazione" name="destination_country" value={editing ? editData.destination_country ?? '' : selected?.destination_country ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Città destinazione" name="destination_city" value={editing ? editData.destination_city ?? '' : selected?.destination_city ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Data arrivo" name="arrival_date" value={editing ? editData.arrival_date ?? '' : selected?.arrival_date ?? ''} editing={editing} type="date" onChange={handleChange} />
                <FR label="Data partenza" name="departure_date" value={editing ? editData.departure_date ?? '' : selected?.departure_date ?? ''} editing={editing} type="date" onChange={handleChange} />
                <FR label="Programma" name="program" value={editing ? editData.program ?? '' : selected?.program ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Progetto" name="project_name" value={editing ? editData.project_name ?? '' : selected?.project_name ?? ''} editing={editing} onChange={handleChange} />
                <FR label="Nome gruppo" name="group_name" value={editing ? editData.group_name ?? '' : selected?.group_name ?? ''} editing={editing} onChange={handleChange} />
              </div>

              <div className="detail-section-header">Organizzazioni & Provider</div>
              <div className="fields-grid">
                <FRRef label="Organizzazione mittente" name="sending_organisation_id" valueId={editing ? editData.sending_organisation_id ?? null : selected?.sending_organisation_id ?? null} valueName={selected?.sending_organisations?.name ?? null} editing={editing} onChange={handleChange} options={sendingOrgs} />
                <FRRef label="Host Company" name="host_company_id" valueId={editing ? editData.host_company_id ?? null : selected?.host_company_id ?? null} valueName={selected?.host_companies?.name ?? null} editing={editing} onChange={handleChange} options={hostCompanies} />
                <FRRef label="Assicurazione" name="insurance_provider_id" valueId={editing ? editData.insurance_provider_id ?? null : selected?.insurance_provider_id ?? null} valueName={selected?.insurance_providers?.name ?? null} editing={editing} onChange={handleChange} options={insuranceProviders} />
                <FRRef label="Transfer" name="transfer_provider_id" valueId={editing ? editData.transfer_provider_id ?? null : selected?.transfer_provider_id ?? null} valueName={selected?.transfer_providers?.name ?? null} editing={editing} onChange={handleChange} options={transferProviders} />
                <FRRef label="Corso di lingua" name="language_course_provider_id" valueId={editing ? editData.language_course_provider_id ?? null : selected?.language_course_provider_id ?? null} valueName={selected?.language_course_providers?.name ?? null} editing={editing} onChange={handleChange} options={langCourseProviders} />
              </div>

              <div className="detail-section-header">Corso di Lingua</div>
              <div className="fields-grid">
                <FR label="Inizio" name="language_course_start_date" value={editing ? editData.language_course_start_date ?? '' : selected?.language_course_start_date ?? ''} editing={editing} type="date" onChange={handleChange} />
                <FR label="Fine" name="language_course_end_date" value={editing ? editData.language_course_end_date ?? '' : selected?.language_course_end_date ?? ''} editing={editing} type="date" onChange={handleChange} />
                <FR label="Settimane" name="language_course_weeks" value={editing ? editData.language_course_weeks ?? '' : selected?.language_course_weeks ?? ''} editing={editing} type="number" onChange={handleChange} />
              </div>

              <div className="detail-section-header">Stage / Tirocinio</div>
              <div className="fields-grid">
                <FR label="Inizio" name="internship_start_date" value={editing ? editData.internship_start_date ?? '' : selected?.internship_start_date ?? ''} editing={editing} type="date" onChange={handleChange} />
                <FR label="Fine" name="internship_end_date" value={editing ? editData.internship_end_date ?? '' : selected?.internship_end_date ?? ''} editing={editing} type="date" onChange={handleChange} />
                <FR label="Settimane" name="internship_weeks" value={editing ? editData.internship_weeks ?? '' : selected?.internship_weeks ?? ''} editing={editing} type="number" onChange={handleChange} />
              </div>

              <div className="detail-section-header">Alloggio</div>
              <div className="fields-grid">
                <FRRef label="Alloggio 1" name="accommodation_1_id" valueId={editing ? editData.accommodation_1_id ?? null : selected?.accommodation_1_id ?? null} valueName={selected?.accommodation_1?.name ?? null} editing={editing} onChange={handleChange} options={accommodations} />
                <FR label="Inizio alloggio 1" name="accommodation_1_start_date" value={editing ? editData.accommodation_1_start_date ?? '' : selected?.accommodation_1_start_date ?? ''} editing={editing} type="date" onChange={handleChange} />
                <FR label="Fine alloggio 1" name="accommodation_1_end_date" value={editing ? editData.accommodation_1_end_date ?? '' : selected?.accommodation_1_end_date ?? ''} editing={editing} type="date" onChange={handleChange} />
                <FR label="Settimane alloggio 1" name="accommodation_1_weeks" value={editing ? editData.accommodation_1_weeks ?? '' : selected?.accommodation_1_weeks ?? ''} editing={editing} type="number" onChange={handleChange} />
                <FR label="Costo alloggio 1" name="accommodation_1_cost" value={editing ? editData.accommodation_1_cost ?? '' : selected?.accommodation_1_cost ?? ''} editing={editing} type="number" onChange={handleChange} />
                <FRRef label="Alloggio 2" name="accommodation_2_id" valueId={editing ? editData.accommodation_2_id ?? null : selected?.accommodation_2_id ?? null} valueName={selected?.accommodation_2?.name ?? null} editing={editing} onChange={handleChange} options={accommodations} />
                <FR label="Inizio alloggio 2" name="accommodation_2_start_date" value={editing ? editData.accommodation_2_start_date ?? '' : selected?.accommodation_2_start_date ?? ''} editing={editing} type="date" onChange={handleChange} />
                <FR label="Fine alloggio 2" name="accommodation_2_end_date" value={editing ? editData.accommodation_2_end_date ?? '' : selected?.accommodation_2_end_date ?? ''} editing={editing} type="date" onChange={handleChange} />
                <FR label="Settimane alloggio 2" name="accommodation_2_weeks" value={editing ? editData.accommodation_2_weeks ?? '' : selected?.accommodation_2_weeks ?? ''} editing={editing} type="number" onChange={handleChange} />
                <FR label="Costo alloggio 2" name="accommodation_2_cost" value={editing ? editData.accommodation_2_cost ?? '' : selected?.accommodation_2_cost ?? ''} editing={editing} type="number" onChange={handleChange} />
              </div>

              <div className="detail-section-header">Finanze</div>
              <div className="fields-grid">
                <FR label="Grant amount" name="grant_amount" value={editing ? editData.grant_amount ?? '' : selected?.grant_amount ?? ''} editing={editing} type="number" onChange={handleChange} />
                <FR label="Trasporto internazionale" name="international_transport_cost" value={editing ? editData.international_transport_cost ?? '' : selected?.international_transport_cost ?? ''} editing={editing} type="number" onChange={handleChange} />
                <FR label="Trasporto locale" name="local_transport_cost" value={editing ? editData.local_transport_cost ?? '' : selected?.local_transport_cost ?? ''} editing={editing} type="number" onChange={handleChange} />
                <FR label="Indennità vitto" name="food_allowance_cost" value={editing ? editData.food_allowance_cost ?? '' : selected?.food_allowance_cost ?? ''} editing={editing} type="number" onChange={handleChange} />
                <FR label="Costo assicurazione" name="insurance_cost" value={editing ? editData.insurance_cost ?? '' : selected?.insurance_cost ?? ''} editing={editing} type="number" onChange={handleChange} />
                <FR label="Transfer" name="transfer_cost" value={editing ? editData.transfer_cost ?? '' : selected?.transfer_cost ?? ''} editing={editing} type="number" onChange={handleChange} />
                <FR label="Altre spese" name="other_expenses" value={editing ? editData.other_expenses ?? '' : selected?.other_expenses ?? ''} editing={editing} type="number" onChange={handleChange} />
                <FR label="Note altre spese" name="note_other_expenses" value={editing ? editData.note_other_expenses ?? '' : selected?.note_other_expenses ?? ''} editing={editing} onChange={handleChange} />
              </div>

              {/* Read-only joined info when not editing */}
              {!editing && selected?.host_companies && (
                <>
                  <div className="detail-section-header">Host Company (dettaglio)</div>
                  <div className="fields-grid">
                    <div className="field-row"><div className="field-label">Azienda</div><div className="field-value">{selected.host_companies.name}</div></div>
                    <div className="field-row"><div className="field-label">Città</div><div className="field-value">{selected.host_companies.city || '—'}</div></div>
                    <div className="field-row"><div className="field-label">Settore</div><div className="field-value">{selected.host_companies.sector || '—'}</div></div>
                    <div className="field-row"><div className="field-label">Tutor</div><div className="field-value">{selected.host_companies.tutor || '—'}</div></div>
                    <div className="field-row"><div className="field-label">Tutor Tel.</div><div className="field-value">{selected.host_companies.tutor_phone || '—'}</div></div>
                    <div className="field-row"><div className="field-label">Tutor Email</div><div className="field-value">{selected.host_companies.tutor_email || '—'}</div></div>
                  </div>
                </>
              )}

              {!editing && selected && (
                <div style={{ padding: '16px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href={`${pdfBase}/${selected.id}/participants`} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-sm">📄 Info Voucher</a>
                  <a href={`${pdfBase}/${selected.id}/financial-report`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">📊 Financial Report</a>
                  <a href={`${pdfBase}/${selected.id}/certificate`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">🎓 Certificate</a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="detail-empty">
            <div className="detail-empty-icon">👤</div>
            <p>Seleziona un partecipante o crea un nuovo record</p>
            <button className="btn btn-accent" onClick={startNew} style={{ marginTop: 12 }}>+ Nuovo Partecipante</button>
          </div>
        )}
      </div>
    </div>
  )
}
