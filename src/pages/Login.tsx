import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useT, LANGUAGES } from '../lib/i18n'

export default function Login() {
  const { t, lang, setLang } = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setIsLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Language selector */}
        <div className="login-lang-selector">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              className={`lang-btn ${lang === l.code ? 'active' : ''}`}
              onClick={() => setLang(l.code)}
              title={l.label}
            >
              {l.flag}
            </button>
          ))}
        </div>

        <div className="login-header">
          <div className="login-logo">M</div>
          <h1 className="login-title">{t('login_title')}</h1>
          <p className="login-subtitle">{t('login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('login_email')}</label>
            <input id="email" type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">{t('login_password')}</label>
            <input id="password" type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? t('login_loading') : t('login_btn')}
          </button>
        </form>

        <div className="login-footer"><p>{t('login_footer')}</p></div>
      </div>
    </div>
  )
}
