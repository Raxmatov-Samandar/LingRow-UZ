import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/auth';
import { useUi } from '@/store/ui';
import { isDevUser } from '@/lib/dev';
import { cn } from '@/lib/cn';

const STUDENT_NAV = [
  { to: '/home',       labelKey: 'nav.dashboard',  icon: 'home'    },
  { to: '/tutor',      labelKey: 'nav.aiTutor',    icon: 'sparkle' },
  { to: '/lesson',     labelKey: 'nav.lesson',     icon: 'play'    },
  { to: '/listening',  labelKey: 'nav.listening',  icon: 'headphones' },
  { to: '/reading',    labelKey: 'nav.reading',    icon: 'book'    },
  { to: '/library',    labelKey: 'nav.library',    icon: 'news'    },
  { to: '/speaking',   labelKey: 'nav.speaking',   icon: 'mic'     },
  { to: '/writing',    labelKey: 'nav.writing',    icon: 'pen'     },
  { to: '/vocabulary', labelKey: 'nav.vocabulary', icon: 'cards'   },
  { to: '/dna',        labelKey: 'nav.errorDna',   icon: 'dna'     },
  { to: '/stats',      labelKey: 'nav.stats',      icon: 'chart'   },
];

const PARENT_NAV = [
  { to: '/parent',          labelKey: 'nav.dashboard', icon: 'home'  },
  { to: '/parent/reports',  labelKey: 'nav.reports',   icon: 'chart' },
  { to: '/parent/settings', labelKey: 'nav.controls',  icon: 'cog'   },
  { to: '/parent/billing',  labelKey: 'nav.billing',   icon: 'card'  },
];

// DTM English / DTM exam doesn't include a listening section — removed.
// Three core subjects per user request: Math, English, Native language.
const DTM_NAV = [
  { to: '/dtm/home',         labelKey: 'dtm.nav.dashboard',  icon: 'home'    },
  { to: '/dtm/math',         labelKey: 'dtm.nav.math',       icon: 'sigma'   },
  { to: '/dtm/english',      labelKey: 'dtm.nav.english',    icon: 'book'    },
  { to: '/dtm/native',       labelKey: 'dtm.nav.native',     icon: 'pen'     },
  { to: '/dtm/mock',         labelKey: 'dtm.nav.mock',       icon: 'target'  },
  { to: '/dtm/past-papers',  labelKey: 'dtm.nav.pastPapers', icon: 'archive' },
  { to: '/dtm/stats',        labelKey: 'dtm.nav.stats',      icon: 'chart'   },
];

const Icon = ({ name }: { name: string }) => {
  const props = { width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'home':    return <svg viewBox="0 0 24 24" {...props}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>;
    case 'play':    return <svg viewBox="0 0 24 24" {...props}><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z" fill="currentColor"/></svg>;
    case 'book':    return <svg viewBox="0 0 24 24" {...props}><path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5z"/><path d="M4 19a2 2 0 002 2h12"/></svg>;
    case 'mic':     return <svg viewBox="0 0 24 24" {...props}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/></svg>;
    case 'pen':     return <svg viewBox="0 0 24 24" {...props}><path d="M14 4l6 6-12 12H2v-6L14 4z"/></svg>;
    case 'cards':   return <svg viewBox="0 0 24 24" {...props}><rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 4h14v14"/></svg>;
    case 'chart':   return <svg viewBox="0 0 24 24" {...props}><path d="M3 21h18"/><path d="M6 17V9"/><path d="M11 17V5"/><path d="M16 17v-7"/><path d="M21 17v-3"/></svg>;
    case 'cog':     return <svg viewBox="0 0 24 24" {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8z"/></svg>;
    case 'card':    return <svg viewBox="0 0 24 24" {...props}><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>;
    case 'sparkle':    return <svg viewBox="0 0 24 24" {...props}><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/></svg>;
    case 'headphones': return <svg viewBox="0 0 24 24" {...props}><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1v-7h3v5zM3 19a2 2 0 002 2h1v-7H3v5z"/></svg>;
    case 'news':       return <svg viewBox="0 0 24 24" {...props}><path d="M4 4h13a2 2 0 012 2v12a2 2 0 002 2H6a2 2 0 01-2-2V4z"/><path d="M8 8h7M8 12h7M8 16h4"/></svg>;
    case 'wrench':     return <svg viewBox="0 0 24 24" {...props}><path d="M14.7 6.3a4 4 0 105.7 5.7l-7.7 7.7a4 4 0 11-5.7-5.7l7.7-7.7z"/><path d="M3 21l3-3"/></svg>;
    case 'target':     return <svg viewBox="0 0 24 24" {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>;
    case 'archive':    return <svg viewBox="0 0 24 24" {...props}><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a2 2 0 002 2h10a2 2 0 002-2V8"/><path d="M10 13h4"/></svg>;
    case 'sigma':      return <svg viewBox="0 0 24 24" {...props}><path d="M5 4h14M5 4l8 8-8 8M5 20h14"/></svg>;
    case 'dna':        return <svg viewBox="0 0 24 24" {...props}><path d="M7 3c0 6 10 6 10 12 0 3-2 5-2 5"/><path d="M17 21c0-6-10-6-10-12 0-3 2-5 2-5"/><path d="M8 8h8M7 12h10M8 16h8"/></svg>;
    default: return null;
  }
};

interface Props {
  /** Mobile drawer is an ephemeral overlay, not persistent chrome — the
   *  desktop "focus mode" collapse preference doesn't apply there, so the
   *  drawer always renders expanded regardless of the shared collapsed state. */
  forceExpanded?: boolean;
}

export function Sidebar({ forceExpanded }: Props = {}) {
  const user           = useAuth(s => s.user);
  const collapsedPref  = useUi(s => s.sidebarCollapsed);
  const collapsed      = forceExpanded ? false : collapsedPref;
  const toggle    = useUi(s => s.toggleSidebar);
  const setMobileNav = useUi(s => s.setMobileNav);
  const items     = user?.role === 'parent' ? PARENT_NAV
                  : user?.role === 'dtm'    ? DTM_NAV
                  : STUDENT_NAV;
  const { t }     = useTranslation();
  const isDev     = isDevUser(user);
  // Auto-close the mobile drawer on any nav click
  const closeDrawer = () => setMobileNav(false);

  return (
    <aside className="relative flex flex-col p-3 pb-5 overflow-hidden rounded-3xl sidebar-glass"
           style={{
             // Very thin glass: cosmos starfield must bleed through.
             background: 'linear-gradient(180deg, rgba(120,160,255,0.06) 0%, rgba(60,80,160,0.03) 50%, rgba(30,40,90,0.02) 100%)',
             backdropFilter: 'blur(14px) saturate(140%)',
             WebkitBackdropFilter: 'blur(14px) saturate(140%)',
             border: '1px solid rgba(180,210,255,0.18)',
             boxShadow:
               'inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 40px rgba(0,0,0,0.25)',
           }}>
      {/* inner highlight ring — adds depth without blocking the stars */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 80px 80px -60px rgba(150,180,255,0.10)',
            }} />
      {/* subtle radial glow at top-left so the logo area pops */}
      <span aria-hidden className="pointer-events-none absolute -top-10 -left-10 w-56 h-56 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(126,247,211,0.10) 0%, transparent 70%)',
            }} />
      {/* Collapse toggle — desktop focus-mode only, doesn't apply to the mobile drawer */}
      {!forceExpanded && (
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar (focus mode)'}
          className="absolute top-3 right-2 w-7 h-7 rounded-lg grid place-items-center text-slate-400 hover:bg-white/10 hover:text-white transition z-10"
        >
          <motion.svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <path d="M15 18l-6-6 6-6"/>
          </motion.svg>
        </button>
      )}

      {/* brand */}
      <div className={cn('flex items-center pt-1 pb-7', collapsed ? 'justify-center px-0 gap-0' : 'gap-3 px-1.5')}>
        <div className={cn('bg-no-repeat shrink-0 transition-all', collapsed ? 'w-10 h-10' : 'w-[60px] h-[60px]')}
             style={{
               backgroundImage: "url('/logo.png')",
               backgroundPosition: 'center',
               backgroundSize: '180% auto',
               filter: 'drop-shadow(0 0 14px rgba(126,247,180,0.40)) drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
             }} />
        {!collapsed && (
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">
            LingRow
          </h1>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(it => {
          const label = t(it.labelKey);
          return (
            <NavLink
              key={it.to}
              to={it.to}
              title={collapsed ? label : undefined}
              onClick={closeDrawer}
              className={({ isActive }) =>
                cn('nav-item', isActive && 'active', collapsed && 'justify-center px-2')
              }
            >
              <span className="opacity-90 shrink-0"><Icon name={it.icon} /></span>
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="mt-auto flex flex-col gap-1">
        {isDev && (
          <NavLink
            to="/dev"
            title={collapsed ? t('dev.panel') : undefined}
            className={({ isActive }) =>
              cn(
                'nav-item relative',
                isActive && 'active',
                collapsed && 'justify-center px-2',
                'border border-cosmic-mint/25 bg-cosmic-mint/[0.05]',
              )
            }
          >
            <span className="opacity-90 shrink-0 text-cosmic-mint"><Icon name="wrench" /></span>
            {!collapsed && (
              <>
                <span className="text-cosmic-mint">{t('dev.panel')}</span>
                <span className="ml-auto text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-cosmic-mint/20 text-cosmic-mint">
                  {t('dev.badge')}
                </span>
              </>
            )}
          </NavLink>
        )}

        <NavLink
          to="/profile"
          title={collapsed ? t('common.settings') : undefined}
          className={({ isActive }) => cn('nav-item', isActive && 'active', collapsed && 'justify-center px-2')}
        >
          <span className="opacity-90 shrink-0"><Icon name="cog" /></span>
          {!collapsed && <span>{t('common.settings')}</span>}
        </NavLink>
      </div>
    </aside>
  );
}
