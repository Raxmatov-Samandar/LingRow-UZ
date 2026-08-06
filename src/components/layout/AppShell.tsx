// =============================================================================
// AppShell — top-level layout that hosts the sidebar + main scrollable area.
//
// Desktop (≥ 1024px): persistent sidebar + main content, grid layout.
// Mobile (< 1024px):  sidebar becomes a slide-in drawer, page gets a small
//                     floating menu button to open it; safe-area-inset is
//                     applied at the body level (see globals.css).
// =============================================================================
import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { FloatingTutor } from '@/components/ui/FloatingTutor'
import { useUi } from '@/store/ui'

interface Props { children: ReactNode }

export function AppShell({ children }: Props) {
  const collapsed     = useUi(s => s.sidebarCollapsed)
  const mobileNavOpen = useUi(s => s.mobileNavOpen)
  const setMobileNav  = useUi(s => s.setMobileNav)

  // Close drawer when the viewport grows past lg
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setMobileNav(false)
    }
    onChange(mq)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [setMobileNav])

  // Lock body scroll while drawer is open on mobile
  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [mobileNavOpen])

  return (
    <div className="h-[100dvh] grid lg:p-[18px] p-2 lg:gap-[18px] gap-0"
         style={{
           // Desktop: grid with sidebar. Mobile: single column (sidebar is overlay).
           gridTemplateColumns:
             typeof window !== 'undefined' && window.innerWidth >= 1024
               ? (collapsed ? '76px 1fr' : '260px 1fr')
               : '1fr',
         }}>
      {/* Sidebar — desktop persistent */}
      <div className="hidden lg:block">
        <motion.div
          animate={{ width: collapsed ? 76 : 260 }}
          transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          className="h-full"
        >
          <Sidebar />
        </motion.div>
      </div>

      {/* Sidebar — mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              key="drawer-backdrop"
              className="lg:hidden fixed inset-0 bg-black/55 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setMobileNav(false)}
            />
            <motion.div
              key="drawer"
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] z-50 p-3"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            >
              <Sidebar forceExpanded />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="relative flex flex-col gap-3 lg:gap-5 min-w-0 overflow-hidden">
        {/* Mobile hamburger — floats top-left, hidden on lg */}
        <button
          onClick={() => setMobileNav(true)}
          className="lg:hidden absolute top-2 left-2 z-30 w-10 h-10 grid place-items-center rounded-xl bg-white/8 backdrop-blur-md border border-white/15 text-white active:scale-95 transition-transform"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        {/* Main content wrapper — push down on mobile to clear the hamburger */}
        <div className="flex flex-col gap-3 lg:gap-5 flex-1 min-h-0 overflow-hidden lg:pt-0 pt-12">
          {children}
        </div>
      </main>

      <FloatingTutor />
    </div>
  )
}
