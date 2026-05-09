// =============================================================================
// Language switcher — minimal globe button with dropdown.
// Avoids the duplicate "UZ UZ" / "GB EN" look. Single button shows the active
// language; clicking opens a popover with full names + flags + checkmark.
// =============================================================================
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { setLang, type Lang } from '@/i18n'
import { cn } from '@/lib/cn'

const LANGS: { code: Lang; name: string; flag: string }[] = [
  { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
  { code: 'en', name: 'English',   flag: '🇬🇧' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current: Lang = (i18n.language as Lang).startsWith('uz') ? 'uz' : 'en'
  const active = LANGS.find(l => l.code === current) ?? LANGS[0]

  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Close on outside click + Escape
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', onDown)
      document.addEventListener('keydown', onKey)
    }
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={active.name}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 h-9 rounded-full transition border',
          'bg-white/[0.04] border-white/10 text-slate-200 hover:bg-white/[0.08] hover:border-white/20',
          open && 'bg-white/[0.08] border-white/25 text-white',
        )}
      >
        {/* Globe icon — neutral, language-agnostic */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
        </svg>
        <span className="text-[11px] font-bold tracking-wider">{active.code.toUpperCase()}</span>
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
          className={cn('transition-transform', open && 'rotate-180')}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-11 z-50 min-w-[170px] p-1
                       rounded-2xl border border-white/15 bg-[rgba(8,12,30,0.92)] backdrop-blur-xl
                       shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
          >
            {LANGS.map(l => {
              const isActive = l.code === current
              return (
                <li key={l.code}>
                  <button
                    role="option"
                    aria-selected={isActive}
                    onClick={() => { setLang(l.code); setOpen(false) }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition',
                      isActive
                        ? 'bg-cosmic-mint/12 text-cosmic-mint'
                        : 'text-slate-200 hover:bg-white/[0.06] hover:text-white',
                    )}
                  >
                    <span className="text-base leading-none">{l.flag}</span>
                    <span className="flex-1 text-sm font-medium">{l.name}</span>
                    {isActive && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
