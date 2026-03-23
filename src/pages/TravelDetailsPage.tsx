import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n'
import type { TravelDetail } from '../types'

interface Props { typology: 'Incoming' | 'Outgoing' }

export default function TravelDetailsPage({ typology }: Props) {
  const { t } = useT()
  const [details, setDetails] = useState<(TravelDetail & { participants?: { name: string; surname: string; mobility_typology: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('travel_details').select('*, participants(name,surname,mobility_typology)').then(({ data }) => {
      setDetails((data || []).filter((d: any) => d.participants?.mobility_typology === typology))
      setLoading(false)
    })
  }, [typology])

  const filtered = details.filter(d => {
    const q = search.toLowerCase()
    return `${d.participants?.name} ${d.participants?.surname}`.toLowerCase().includes(q) ||
      (d.transport_type || '').toLowerCase().includes(q) ||
      (d.flight_train_number || '').toLowerCase().includes(q)
  })

  const fmtDT = (d: string | null) => d ? new Date(d).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—'
  const fmtCur = (v: number | null) => v != null ? `€${v.toLocaleString()}` : '—'

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{t('page_travel')} — {typology}</h1>
        <span className="badge-count">{filtered.length}</span>
      </div>
      <div className="search-bar" style={{ marginBottom: 16 }}>
        <input type="text" className="form-input" placeholder={t('td_search')} value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 420 }} />
      </div>
      {loading ? <div className="page-loading"><div className="spinner"></div></div> : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('td_participant')}</th><th>{t('td_transport')}</th><th>{t('td_number')}</th>
                <th>{t('td_departure')}</th><th>{t('td_arrival')}</th><th>{t('td_price')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td>{d.participants ? `${d.participants.name} ${d.participants.surname}` : '—'}</td>
                  <td><span className="transport-badge">{d.transport_type === 'Airplane' ? '✈' : d.transport_type === 'Train' ? '🚆' : '🚗'} {d.transport_type || '—'}</span></td>
                  <td>{d.flight_train_number || '—'}</td>
                  <td>{fmtDT(d.departure_datetime)}</td>
                  <td>{fmtDT(d.arrival_datetime)}</td>
                  <td>{fmtCur(d.ticket_price)}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="empty-cell">{t('td_empty')}</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
