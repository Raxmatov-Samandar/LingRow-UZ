// =============================================================================
// LingRow i18n entry — react-i18next setup with EN + UZ.
// Detects saved preference from localStorage; falls back to UZ (primary user
// segment is Uzbek) when nothing is set.
// =============================================================================
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import { en } from './locales/en'
import { uz } from './locales/uz'

export type Lang = 'en' | 'uz'
export const SUPPORTED_LANGS: Lang[] = ['en', 'uz']
const STORAGE_KEY = 'lr-lang'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      uz: { translation: uz },
    },
    fallbackLng: 'uz',
    supportedLngs: SUPPORTED_LANGS,
    defaultNS: 'translation',
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
    returnNull: false,
  })

export default i18n

export function setLang(lang: Lang) {
  void i18n.changeLanguage(lang)
  try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* ignore */ }
}

export function getLang(): Lang {
  return (i18n.language as Lang) || 'uz'
}
