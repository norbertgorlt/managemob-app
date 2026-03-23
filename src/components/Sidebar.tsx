import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useT, LANGUAGES } from '../lib/i18n'

interface SidebarProps {
  userName: string
  userEmail: string
  onLogout: () => void
}

export default function Sidebar({ userName, userEmail, onLogout }: SidebarProps) {
  const location = useLocation()
  const { t, lang, setLang } = useT()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    incoming: location.pathname.startsWith('/incoming'),
    outgoing: location.pathname.startsWith('/outgoing'),
  })
  const [showLangMenu, setShowLangMenu] = useState(false)

  const toggle = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }))

  const incomingItems = [
    { label: t('nav_individuals'), path: '/incoming/individuals' },
    { label: t('nav_travel'), path: '/incoming/travel' },
    { label: t('nav_transfer'), path: '/incoming/transfer' },
    { label: t('nav_sendingOrgs'), path: '/incoming/sending-orgs' },
    { label: t('nav_accommodation'), path: '/incoming/accommodation' },
    { label: t('nav_financial'), path: '/incoming/financial' },
    { label: t('nav_mobilityProviders'), path: '/incoming/mobility-providers' },
    { label: t('nav_groups'), path: '/incoming/groups' },
    { label: t('nav_hostCompanies'), path: '/incoming/host-companies' },
  ]

  const outgoingItems = [
    { label: t('nav_individuals'), path: '/outgoing/individuals' },
    { label: t('nav_travel'), path: '/outgoing/travel' },
    { label: t('nav_transfer'), path: '/outgoing/transfer' },
    { label: t('nav_sendingOrgs'), path: '/outgoing/sending-orgs' },
    { label: t('nav_accommodation'), path: '/outgoing/accommodation' },
    { label: t('nav_financial'), path: '/outgoing/financial' },
    { label: t('nav_mobilityProviders'), path: '/outgoing/mobility-providers' },
    { label: t('nav_groups'), path: '/outgoing/groups' },
    { label: t('nav_hostCompanies'), path: '/outgoing/host-companies' },
  ]

  const currentLang = LANGUAGES.find(l => l.code === lang)

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">M</div>
        <span className="sidebar-logo-text">Managemob</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <span className="sidebar-nav-icon">📊</span>
          <span>{t('nav_dashboard')}</span>
        </NavLink>

        {/* Incoming */}
        <div className="sidebar-section">
          <button className={`sidebar-section-header ${expanded.incoming ? 'expanded' : ''}`} onClick={() => toggle('incoming')}>
            <span className="sidebar-nav-icon">🌍</span>
            <span className="sidebar-section-label">{t('nav_incoming')}</span>
            <span className="sidebar-chevron">{expanded.incoming ? '▾' : '▸'}</span>
          </button>
          {expanded.incoming && (
            <div className="sidebar-section-items">
              {incomingItems.map(item => (
                <NavLink key={item.path} to={item.path} className={({ isActive }) => `sidebar-nav-item sub ${isActive ? 'active' : ''}`}>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing */}
        <div className="sidebar-section">
          <button className={`sidebar-section-header ${expanded.outgoing ? 'expanded' : ''}`} onClick={() => toggle('outgoing')}>
            <span className="sidebar-nav-icon">✈️</span>
            <span className="sidebar-section-label">{t('nav_outgoing')}</span>
            <span className="sidebar-chevron">{expanded.outgoing ? '▾' : '▸'}</span>
          </button>
          {expanded.outgoing && (
            <div className="sidebar-section-items">
              {outgoingItems.map(item => (
                <NavLink key={item.path} to={item.path} className={({ isActive }) => `sidebar-nav-item sub ${isActive ? 'active' : ''}`}>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Language selector */}
      <div className="sidebar-lang" style={{ position: 'relative' }}>
        <button className="sidebar-lang-btn" onClick={() => setShowLangMenu(p => !p)}>
          <span>{currentLang?.flag}</span>
          <span className="sidebar-lang-label">{currentLang?.label}</span>
          <span style={{ opacity: 0.6, fontSize: 10 }}>▾</span>
        </button>
        {showLangMenu && (
          <div className="lang-menu">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                className={`lang-menu-item ${lang === l.code ? 'active' : ''}`}
                onClick={() => { setLang(l.code); setShowLangMenu(false) }}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{userName.charAt(0).toUpperCase()}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-email">{userEmail}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={onLogout} title={t('btn_signout')}>↩</button>
      </div>
    </aside>
  )
}
