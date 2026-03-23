import { createContext, useContext, useState, type ReactNode } from 'react'
import type { TranslationKeys } from '../locales/en'
import en from '../locales/en'
import it from '../locales/it'
import fr from '../locales/fr'
import es from '../locales/es'
import de from '../locales/de'

export type Lang = 'en' | 'it' | 'fr' | 'es' | 'de'

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
]

const translations: Record<Lang, Record<TranslationKeys, string>> = { en, it, fr, es, de }

interface I18nContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKeys) => string
}

const I18nContext = createContext<I18nContextType>({
  lang: 'it',
  setLang: () => {},
  t: (k) => k,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('managemob_lang')
    return (saved as Lang) || 'it'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('managemob_lang', l)
  }

  const t = (key: TranslationKeys): string => translations[lang][key] ?? translations.en[key] ?? key

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useT() {
  return useContext(I18nContext)
}
