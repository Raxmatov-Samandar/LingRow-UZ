// =============================================================================
// BottomTabBar — the five-slot bar from the design concept, on mobile only.
//
// Desktop keeps the sidebar: a persistent 11-item list is fine with a pointer
// and a wide window. On a phone it was a drawer you had to open before you
// could go anywhere, so the five destinations people actually use are now one
// thumb-reach away, and the drawer stays for the rest.
//
// Each tab owns a family of routes rather than a single path, so opening a
// lesson or a listening exercise doesn't leave the bar with nothing selected.
// =============================================================================
// Plain Link, not NavLink: NavLink writes `aria-current` from its own exact-path
// match and overrides whatever you pass. A tab here stays selected across a whole
// family of routes, so its own match disagrees — at /listening the bubble sat on
// Darslar while every tab reported itself as not current.
import { Link, useLocation } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

/** The motion the concept settled on: the reference curve at 0.8x, because past
 *  ~400ms a direct tap starts reading as sluggish. The slight overshoot is what
 *  gives the bubble its snap on arrival. */
const TRAVEL_MS = 440
const EASE = 'cubic-bezier(.68,-0.15,.25,1.25)'

const ICON_PROPS = {
  width: 24, height: 24, fill: 'none', stroke: 'currentColor',
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
}

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const p = { ...ICON_PROPS, strokeWidth: active ? 2.4 : 2 }
  switch (name) {
    case 'home':
      return <svg viewBox="0 0 24 24" {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>
    case 'lessons':
      return <svg viewBox="0 0 24 24" {...p}><path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5z" /><path d="M4 19a2 2 0 002 2h12" /></svg>
    case 'vocab':
      return <svg viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></svg>
    case 'stats':
      return <svg viewBox="0 0 24 24" {...p}><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M21 20H3" /></svg>
    case 'profile':
      return <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>
    default:
      return null
  }
}

interface Tab {
  key: string
  to: string
  labelKey: string
  icon: string
  /** Route prefixes this tab stays lit for. */
  owns: string[]
}

const TABS: Tab[] = [
  { key: 'home',    to: '/home',       labelKey: 'tabs.home',    icon: 'home',
    owns: ['/home'] },
  { key: 'lessons', to: '/lesson',     labelKey: 'tabs.lessons', icon: 'lessons',
    owns: ['/lesson', '/listening', '/reading', '/speaking', '/writing', '/library'] },
  { key: 'vocab',   to: '/vocabulary', labelKey: 'tabs.vocab',   icon: 'vocab',
    owns: ['/vocabulary'] },
  { key: 'stats',   to: '/stats',      labelKey: 'tabs.stats',   icon: 'stats',
    owns: ['/stats', '/dna'] },
  { key: 'profile', to: '/profile',    labelKey: 'tabs.profile', icon: 'profile',
    owns: ['/profile'] },
]

export function BottomTabBar() {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const reduced = useReducedMotion()

  const activeIndex = TABS.findIndex(tab =>
    tab.owns.some(base => pathname === base || pathname.startsWith(base + '/')),
  )

  return (
    <nav
      className="lg:hidden relative z-30 flex flex-none items-start justify-around border-t px-2 pt-2 backdrop-blur-2xl"
      style={{
        borderColor: 'rgba(255,255,255,0.08)',
        background: 'rgba(20,20,22,0.85)',
        height: 'calc(env(safe-area-inset-bottom, 0px) + 60px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label={t('tabs.ariaLabel')}
    >
      {/* The bubble travels on `transform`, not `left` — same motion, but it
          stays on the compositor instead of asking for layout every frame, and
          a percentage step survives any width with no measuring. Hidden when no
          tab owns the route, rather than parked on a tab you are not on. */}
      {activeIndex >= 0 && (
        <div className="pointer-events-none absolute inset-x-2 top-0" aria-hidden="true">
          <div
            className="flex justify-center"
            style={{
              width: `${100 / TABS.length}%`,
              transform: `translateX(${activeIndex * 100}%)`,
              transition: reduced ? 'none' : `transform ${TRAVEL_MS}ms ${EASE}`,
              willChange: 'transform',
            }}
          >
            <span
              className="block h-[42px] w-[42px] rounded-full"
              style={{
                marginTop: -10,
                background: 'linear-gradient(135deg, #2563EB, #8a4dff)',
                boxShadow: '0 6px 14px rgba(37,99,235,0.45), inset 0 1px 2px rgba(255,255,255,0.25)',
              }}
            />
          </div>
        </div>
      )}

      {TABS.map((tab, i) => {
        const isActive = i === activeIndex
        return (
          <Link
            key={tab.key}
            to={tab.to}
            aria-current={isActive ? 'page' : undefined}
            className="relative z-10 flex flex-1 flex-col items-center gap-0.5 pt-1 transition active:scale-95"
          >
            <span
              style={{
                // The active icon rises into the bubble; both move on the same
                // curve so they arrive together.
                display: 'block',
                transform: isActive ? 'translateY(-13px)' : 'none',
                transition: reduced ? 'none' : `transform ${TRAVEL_MS}ms ${EASE}`,
                color: isActive ? '#ffffff' : 'rgba(235,235,245,0.6)',
              }}
            >
              <TabIcon name={tab.icon} active={isActive} />
            </span>
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? '#5aa9ff' : 'rgba(235,235,245,0.6)' }}
            >
              {t(tab.labelKey)}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
