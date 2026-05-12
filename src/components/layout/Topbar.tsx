import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/auth';
import { useActivity, type ActivityEvent } from '@/store/activity';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import type { User } from '@/types';

interface Props {
  variant?: 'search' | 'banner';
  bannerTitle?: string;
  bannerSubtitle?: string;
  /** Emoji to show as the banner avatar (preferred). Mutually exclusive with bannerImage. */
  bannerEmoji?: string;
  /** Custom image URL for the banner avatar. Falls back to a default photo if omitted. */
  bannerImage?: string;
  /** Tailwind-friendly background gradient class for the emoji bubble. */
  bannerTint?: string;
}

const DEFAULT_BANNER_IMAGE = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80';

export function Topbar({
  variant = 'search', bannerTitle, bannerSubtitle,
  bannerEmoji, bannerImage, bannerTint,
}: Props) {
  const user = useAuth(s => s.user);
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between gap-2 lg:gap-4 lg:pl-0 pl-12 pt-1 relative z-30">
      {variant === 'search' ? (
        <div className="glass-soft flex-1 max-w-[520px] flex items-center gap-2.5 px-4 py-3 rounded-full text-slate-300">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <input className="bg-transparent border-0 outline-none text-white w-full text-sm placeholder:text-slate-400" placeholder={t('topbar.searchPlaceholder')} />
        </div>
      ) : (
        <div className="glass-soft flex-1 max-w-[720px] flex items-center gap-3.5 pl-2 pr-4 py-2 rounded-2xl">
          {bannerEmoji ? (
            <div className="w-14 h-14 rounded-xl grid place-items-center text-3xl shrink-0 border border-white/12"
                 style={{ background: bannerTint ?? 'linear-gradient(135deg, rgba(126,247,211,0.18), rgba(90,169,255,0.10))' }}>
              {bannerEmoji}
            </div>
          ) : (
            <img className="w-14 h-14 rounded-xl object-cover"
                 src={bannerImage ?? DEFAULT_BANNER_IMAGE} alt="" />
          )}
          <div className="text-left">
            <h3 className="text-lg font-bold text-white">{bannerTitle ?? t('stats.title')}</h3>
            <p className="text-xs text-slate-400">{bannerSubtitle ?? t('stats.subtitle')}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3.5">
        <LanguageSwitcher />
        <AppsButton />
        <NotificationsButton />
        <AvatarMenu user={user} />
      </div>
    </header>
  );
}

// ─────────────────────────────── Apps menu ───────────────────────────────

const SHORTCUTS = [
  { to: '/home',       labelKey: 'nav.dashboard',  icon: '🏠' },
  { to: '/tutor',      labelKey: 'nav.aiTutor',    icon: '🎓' },
  { to: '/lesson',     labelKey: 'nav.lesson',     icon: '🎬' },
  { to: '/reading',    labelKey: 'nav.reading',    icon: '📖' },
  { to: '/speaking',   labelKey: 'nav.speaking',   icon: '🎤' },
  { to: '/writing',    labelKey: 'nav.writing',    icon: '✍️' },
  { to: '/vocabulary', labelKey: 'nav.vocabulary', icon: '🗂' },
  { to: '/stats',      labelKey: 'nav.stats',      icon: '📊' },
];

function AppsButton() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useOutsideClick(wrapRef, () => setOpen(false));
  const { t } = useTranslation();

  return (
    <div ref={wrapRef} className="relative">
      <button onClick={() => setOpen(o => !o)}
              aria-label={t('topbar.appsLabel')}
              className={`w-10 h-10 grid place-items-center rounded-xl transition
                          ${open ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3"  width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <Popover>
            <p className="text-[10px] tracking-[0.2em] text-slate-400 mb-2">{t('topbar.shortcuts')}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {SHORTCUTS.map(s => (
                <Link key={s.to} to={s.to} onClick={() => setOpen(false)}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-white/[0.06] transition group">
                  <span className="text-xl group-hover:scale-110 transition">{s.icon}</span>
                  <span className="text-[10px] text-slate-300 group-hover:text-white">{t(s.labelKey)}</span>
                </Link>
              ))}
            </div>
          </Popover>
        )}
      </AnimatePresence>
    </div>
  );
}

// ───────────────────────────── Notifications ─────────────────────────────

function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useOutsideClick(wrapRef, () => setOpen(false));
  const { t } = useTranslation();

  const events = useActivity(s => s.events);
  const recent = useMemo(
    () => [...events].sort((a, b) => b.ts - a.ts).slice(0, 12),
    [events]
  );
  const hasNew = recent.some(e => Date.now() - e.ts < 2 * 60_000);

  return (
    <div ref={wrapRef} className="relative">
      <button onClick={() => setOpen(o => !o)}
              aria-label={t('topbar.notifications')}
              className={`relative w-10 h-10 grid place-items-center rounded-xl transition
                          ${open ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8z"/><path d="M10 21a2 2 0 004 0"/>
        </svg>
        {hasNew && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#5fe7a4] animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <Popover wide>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-white">{t('topbar.notifications')}</p>
              <span className="text-[10px] text-slate-400">{recent.length} {t('topbar.recent')}</span>
            </div>

            {recent.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                <p className="text-2xl mb-2">🌙</p>
                {t('topbar.nothing')}
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto pr-1">
                {recent.map(e => <NotificationRow key={e.id} e={e} />)}
              </div>
            )}
          </Popover>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationRow({ e }: { e: ActivityEvent }) {
  const { icon, title, sub } = describe(e);
  const ago = timeAgo(e.ts);
  return (
    <div className="flex items-start gap-3 px-2.5 py-2 rounded-lg hover:bg-white/[0.04]">
      <span className="text-base mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-white truncate">{title}</p>
        {sub && <p className="text-[11px] text-slate-400 truncate">{sub}</p>}
      </div>
      <span className="text-[10px] text-slate-500 whitespace-nowrap">{ago}</span>
    </div>
  );
}

function describe(e: ActivityEvent): { icon: string; title: string; sub?: string } {
  switch (e.kind) {
    case 'lesson_started':     return { icon: '▶️', title: 'Lesson started',     sub: String(e.meta?.lesson ?? '') };
    case 'lesson_completed':   return { icon: '✅', title: 'Lesson completed',   sub: String(e.meta?.lesson ?? '') };
    case 'vocab_reviewed':     return { icon: '🗂', title: `Reviewed "${e.meta?.word}"`, sub: `Difficulty: ${e.meta?.quality}` };
    case 'reading_completed':  return { icon: '📖', title: 'Reading finished',   sub: String(e.meta?.passage ?? '') };
    case 'quiz_submitted':     return { icon: '📝', title: 'Quiz submitted',     sub: `Score: ${e.meta?.score}% (${e.meta?.correct}/${e.meta?.total})` };
    case 'writing_submitted':  return { icon: '✍️', title: 'Writing graded',    sub: `Band: ${e.meta?.band} · ${e.meta?.score}%` };
    case 'speaking_practiced': return { icon: '🎤', title: 'Speaking practised', sub: `Band: ${e.meta?.band}` };
    case 'tutor_message':      return { icon: '🎓', title: 'Asked Prof. Linguo' };
    default:                   return { icon: '✨', title: 'Activity' };
  }
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000)        return 'now';
  if (diff < 3_600_000)     return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)    return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ──────────────────────────────── Avatar menu ────────────────────────────

function AvatarMenu({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useOutsideClick(wrapRef, () => setOpen(false));
  const navigate = useNavigate();
  const signOut = useAuth(s => s.signOut);
  const { t } = useTranslation();

  return (
    <div ref={wrapRef} className="relative">
      <button onClick={() => setOpen(o => !o)}
              aria-label="Account menu"
              className="relative w-11 h-11 rounded-full overflow-hidden border border-white/15 grid place-items-center bg-gradient-to-br from-blue-400 to-violet-400 cursor-pointer">
        {user?.avatarUrl
          ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
          : <span className="text-white font-bold text-lg">{user?.name?.[0]?.toUpperCase() ?? 'U'}</span>}
        <div className="absolute -inset-[3px] rounded-full -z-10 animate-spin360 opacity-65"
             style={{ background: 'conic-gradient(from 0deg, #7ef7d3, #5aa9ff, #b69dff, #7ef7d3)', filter: 'blur(2px)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <Popover>
            {/* User card */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/15 grid place-items-center bg-gradient-to-br from-blue-400 to-violet-400 shrink-0">
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt=""/>
                  : <span className="text-white font-bold text-lg">{user?.name?.[0]?.toUpperCase() ?? 'U'}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{user?.name ?? 'Guest'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email ?? '—'}</p>
                <p className="text-[10px] text-cosmic-mint mt-0.5 capitalize">
                  {user?.role} · {user?.plan ?? 'free'}
                </p>
              </div>
            </div>

            <MenuLink to="/profile" icon="👤" label={t('nav.profile')} onClick={() => setOpen(false)} />
            <MenuLink to="/stats"   icon="📊" label={t('nav.stats')}   onClick={() => setOpen(false)} />
            <MenuLink to="/tutor"   icon="🎓" label={t('nav.aiTutor')} onClick={() => setOpen(false)} />

            <div className="my-2 h-px bg-white/10" />

            <button onClick={async () => { setOpen(false); await signOut(); navigate('/login'); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/10 transition">
              <span>🚪</span> {t('common.signOut')}
            </button>
          </Popover>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({ to, icon, label, onClick }: { to: string; icon: string; label: string; onClick(): void }) {
  return (
    <Link to={to} onClick={onClick}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/[0.05] hover:text-white transition">
      <span>{icon}</span> {label}
    </Link>
  );
}

// ─────────────────────────── Shared bits ───────────────────────────

function Popover({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit   ={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute right-0 top-12 z-50 glass-panel p-3 ${wide ? 'w-80' : 'w-64'}`}
    >
      {children}
    </motion.div>
  );
}

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [ref, onOutside]);
}
