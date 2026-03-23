import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n'

const TEAL = '#2D7A6F', BLUE = '#1D72B8', CYAN = '#38BDF8'
const COLORS = [TEAL, BLUE, CYAN, '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
const fmt = (v: number) => new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)

export default function Dashboard() {
  const { t } = useT()
  const [stats, setStats] = useState({ totalParticipants: 0, incomingCount: 0, outgoingCount: 0, totalGrant: 0, totalMargin: 0, financialInfoCount: 0, countriesData: [] as { name: string; value: number }[], hostCompaniesCount: 0, accommodationCount: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [pRes, fRes, hRes, aRes] = await Promise.all([
        supabase.from('participants').select('id,mobility_typology,destination_country,grant_amount'),
        supabase.from('financial_info').select('grant_amount,margin'),
        supabase.from('host_companies').select('id', { count: 'exact', head: true }),
        supabase.from('accommodation').select('id', { count: 'exact', head: true }),
      ])
      const p = pRes.data || [], f = fRes.data || []
      const countryCount: Record<string, number> = {}
      p.forEach((x: any) => { const c = x.destination_country?.trim(); if (c) countryCount[c] = (countryCount[c] || 0) + 1 })
      setStats({
        totalParticipants: p.length,
        incomingCount: p.filter((x: any) => x.mobility_typology === 'Incoming').length,
        outgoingCount: p.filter((x: any) => x.mobility_typology === 'Outgoing').length,
        totalGrant: p.reduce((s: number, x: any) => s + (x.grant_amount || 0), 0),
        totalMargin: f.reduce((s: number, x: any) => s + (x.margin || 0), 0),
        financialInfoCount: f.length,
        countriesData: Object.entries(countryCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8),
        hostCompaniesCount: hRes.count || 0,
        accommodationCount: aRes.count || 0,
      })
      setLoading(false)
    })()
  }, [])

  if (loading) return <div className="page-loading"><div className="spinner"></div><p>{t('dash_loading')}</p></div>

  const mobilityData = [{ name: t('dash_incoming_label'), value: stats.incomingCount }, { name: t('dash_outgoing_label'), value: stats.outgoingCount }]

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">{t('dash_title')}</h1>
        <p className="page-subtitle">{t('dash_subtitle')}</p>
      </div>

      <div className="kpi-grid">
        {[
          { icon: '👤', value: stats.totalParticipants, label: t('dash_total_participants'), color: TEAL },
          { icon: '💶', value: fmt(stats.totalGrant), label: t('dash_total_grant'), color: BLUE },
          { icon: '📈', value: fmt(stats.totalMargin), label: t('dash_total_margin'), color: '#10B981' },
          { icon: '📋', value: stats.financialInfoCount, label: t('dash_financial_records'), color: '#0284C7' },
          { icon: '🏢', value: stats.hostCompaniesCount, label: t('dash_host_companies'), color: '#F59E0B' },
          { icon: '🏠', value: stats.accommodationCount, label: t('dash_accommodation'), color: '#8B5CF6' },
        ].map((kpi, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-icon" style={{ background: `${kpi.color}20`, color: kpi.color }}>{kpi.icon}</div>
            <div className="kpi-body"><div className="kpi-value">{kpi.value}</div><div className="kpi-label">{kpi.label}</div></div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">{t('dash_mobility_chart')}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={mobilityData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                {mobilityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} ${t('dash_participants_unit')}`, '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">{t('dash_countries_chart')}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.countriesData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill={TEAL} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="summary-row">
        {[
          { title: t('dash_incoming_label'), value: stats.incomingCount, color: TEAL },
          { title: t('dash_outgoing_label'), value: stats.outgoingCount, color: BLUE },
          { title: t('dash_avg_grant'), value: stats.totalParticipants > 0 ? fmt(stats.totalGrant / stats.totalParticipants) : '€0', color: '#10B981' },
        ].map((s, i) => (
          <div key={i} className="summary-card">
            <h4 className="summary-title">{s.title}</h4>
            <div className="summary-number" style={{ color: s.color }}>{s.value}</div>
            <div className="summary-sub">{i < 2 ? t('dash_participants_unit') : t('dash_per_participant')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
