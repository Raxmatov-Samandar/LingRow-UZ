import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useQuery } from '@tanstack/react-query';
import { learning } from '@/lib/api';
import type { Lesson } from '@/types';
import { useProgress } from '@/store/progress';
import { useActivity } from '@/store/activity';
import { getTodaysArticle } from '@/data/articles/daily-articles';
import { useUserArticles } from '@/store/userArticles';

export function Dashboard() {
  const { t } = useTranslation();
  const { data: levels } = useQuery({ queryKey: ['levels'], queryFn: learning.getLevels });
  const xp = useProgress(s => s.xp);
  const streak = useProgress(s => s.streak);

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="search" />

        <section className="grid grid-cols-[1fr_320px] gap-5 flex-1 min-h-0 overflow-hidden">
          <div className="flex flex-col gap-5 min-w-0">
            <div className="px-1">
              <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">
                {t('dashboard.chooseLevel')}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {t('dashboard.chooseLevelSub')}
              </p>
              <div className="mt-3 flex gap-3 text-xs">
                <span className="px-3 py-1.5 rounded-full bg-cosmic-mint/15 border border-cosmic-mint/40 text-cosmic-mint">🔥 {t('dashboard.streak')}: {streak} {t('dashboard.daysSuffix')}</span>
                <span className="px-3 py-1.5 rounded-full bg-cosmic-sky/15 border border-cosmic-sky/40 text-cosmic-sky">⭐ {t('dashboard.xp')}: {xp.toLocaleString()}</span>
              </div>
            </div>

            <DailyArticleStrip />

            <div className="grid grid-cols-2 gap-7 px-3 pb-5 overflow-auto">
              {levels?.map(l => <LevelCard key={l.id} l={l} />)}
            </div>
          </div>

          <aside className="flex flex-col gap-4 min-h-0 overflow-y-auto pr-1 pb-2">
            <NextLessonCard />
            <ProgressMiniChart />
            <UpcomingLessonPreview />
            <MotivationalQuote />
          </aside>
        </section>
      </AppShell>
    </>
  );
}

function LevelCard({ l }: { l: Lesson }) {
  const { t } = useTranslation();
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.setProperty('--rx', (y * -8).toFixed(2) + 'deg');
    el.style.setProperty('--ry', (x *  10).toFixed(2) + 'deg');
    el.style.setProperty('--mx', (x * 100 + 50).toFixed(0) + '%');
    el.style.setProperty('--my', (y * 100 + 50).toFixed(0) + '%');
  }
  function onLeave(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }

  return (
    <div className="level-card relative min-h-[188px]" onMouseMove={onMove} onMouseLeave={onLeave}>
      {/* Ghost-stack sheets behind the main card */}
      <div className="crystal-stack" style={{ transform: 'rotate(-4deg) translate(-14px,-12px)', opacity: 0.55 }} />
      <div className="crystal-stack" style={{ transform: 'rotate(4deg) translate(14px,10px) scale(0.98)', opacity: 0.40 }} />

      <Link to="/lesson" className="crystal-card relative block p-5 min-h-[188px] flex flex-col justify-between">
        <span className="refract" />
        <span className="shine" />

        <div>
          <h3 className="text-2xl font-bold text-white">{t(`dashboard.${l.level}`)}</h3>
          <p className="text-xs text-slate-400 mt-1">{t('dashboard.levelDescription')}</p>
        </div>

        <div className="flex items-center justify-between mt-3 relative z-10">
          <span className="text-sm text-slate-200">{t('dashboard.learn')}</span>
          <span className="grid place-items-center w-14 h-10 rounded-2xl transition-transform group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #7ef7d3, #4fd6a6)',
                         boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 8px 22px rgba(80,220,170,0.35)' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0b1f1a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="M13 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </Link>
    </div>
  );
}

// ───────────────────────── Daily Article strip ─────────────────────────

function DailyArticleStrip() {
  const { t } = useTranslation();
  const userList = useUserArticles(s => s.list);
  const a = getTodaysArticle(userList);
  return (
    <Link to={`/library/${a.id}`}
          className="group glass-panel mx-1 flex items-center gap-3 px-3 py-2 hover:-translate-y-0.5 transition">
      {a.cover && (
        <img src={a.cover} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10" />
      )}
      <span className="px-1.5 py-0.5 rounded-full bg-cosmic-mint text-slate-900 text-[8px] font-bold tracking-widest uppercase whitespace-nowrap">📰 {t('dashboard.todayBadge')}</span>
      <span className="px-1 py-0.5 rounded text-[9px] font-bold border bg-blue-500/15 text-blue-200 border-blue-500/40">{a.cefr}</span>
      <span className="text-[10px] text-slate-400 whitespace-nowrap">{a.readingMin} {t('dashboard.minRead')}</span>
      <h3 className="text-sm font-bold text-white truncate flex-1 min-w-0 group-hover:text-cosmic-mint transition">{a.title}</h3>
      <span className="text-cosmic-mint text-xs font-bold whitespace-nowrap shrink-0">{t('dashboard.readArrow')}</span>
    </Link>
  );
}

function NextLessonCard() {
  const { t } = useTranslation();
  function onMove(e: React.MouseEvent<HTMLElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.setProperty('--mx', (x * 100 + 50).toFixed(0) + '%');
    el.style.setProperty('--my', (y * 100 + 50).toFixed(0) + '%');
  }

  return (
    <div onMouseMove={onMove}
           className="crystal-card relative p-6 flex flex-col items-center text-center">
      <span className="refract" />
      <span className="shine" />

      <div className="w-full text-left mb-4 relative z-10">
        <p className="text-sm text-slate-300/80">{t('dashboard.nextLessonNum')}</p>
        <h3 className="text-3xl font-extrabold text-white leading-none tracking-tight">{t('dashboard.nextLessonTitle')}</h3>
        <p className="text-sm text-slate-300/70 mt-2">{t('dashboard.lessonsCount')}</p>
      </div>

      <Link to="/lesson" className="relative w-[168px] h-[168px] my-3 grid place-items-center hover:scale-105 transition">
        <span className="absolute -inset-2 rounded-full animate-glowPulse"
              style={{ background: 'radial-gradient(circle, rgba(80,150,255,0.55) 0%, rgba(60,120,255,0.25) 35%, transparent 60%)',
                       filter: 'blur(14px)' }} />
        <span className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55), rgba(150,200,255,0.15) 35%, transparent 55%),
                             radial-gradient(circle at 50% 60%, rgba(60,120,230,0.55), rgba(30,60,150,0.4) 65%, rgba(20,40,100,0.5) 100%)`,
                border: '1px solid rgba(255,255,255,0.30)',
                boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.55), inset 0 -14px 28px rgba(20,40,120,0.55), 0 0 50px rgba(80,150,255,0.55)',
                backdropFilter: 'blur(6px)',
              }} />
        <span className="relative w-[92px] h-[92px] rounded-full grid place-items-center"
              style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), rgba(255,255,255,0.10) 60%, rgba(200,220,255,0.05) 100%)',
                       border: '1px solid rgba(255,255,255,0.45)',
                       boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.65), 0 8px 22px rgba(0,0,0,0.35)' }}>
          <svg viewBox="0 0 24 24" width="34" height="34" fill="#fff" style={{ transform: 'translateX(2px)' }}>
            <path d="M8 5.5v13l11-6.5z"/>
          </svg>
        </span>
      </Link>

      <p className="text-sm text-slate-300/80 mt-1">1 / 30</p>
    </div>
  );
}

// ────────────────────── Progress mini chart ──────────────────────
// Compact 7-day bar chart of lessons completed. Reads activity events.

function ProgressMiniChart() {
  const { t } = useTranslation();
  const events = useActivity(s => s.events);

  const data = useMemo(() => {
    const days: { label: string; count: number; date: Date }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const count = events.filter(e =>
        e.kind === 'lesson_completed' && e.ts >= d.getTime() && e.ts < next.getTime()
      ).length;
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
        count,
        date: d,
      });
    }
    return days;
  }, [events]);

  const max = Math.max(1, ...data.map(d => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);
  const todayIdx = data.length - 1;

  return (
    <div className="glass-panel p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h4 className="text-sm font-bold text-white">{t('dashboard.progress7d')}</h4>
        <span className="text-[11px] text-slate-400">
          {total} {t('dashboard.progress7dLessons')}
        </span>
      </div>

      <div className="flex items-end gap-1.5 h-20">
        {data.map((d, i) => {
          const heightPct = (d.count / max) * 100;
          const isToday = i === todayIdx;
          const filled = d.count > 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-md transition-all duration-500 ease-out"
                  style={{
                    height: filled ? `${Math.max(heightPct, 12)}%` : '4%',
                    background: isToday
                      ? 'linear-gradient(180deg, #7ef7d3 0%, #4fd6a6 100%)'
                      : filled
                        ? 'linear-gradient(180deg, rgba(126,247,211,0.55) 0%, rgba(79,214,166,0.4) 100%)'
                        : 'rgba(255,255,255,0.07)',
                    boxShadow: isToday ? '0 4px 14px rgba(80,220,170,0.35)' : undefined,
                  }}
                  title={`${d.count} lessons`}
                />
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-wide ${isToday ? 'text-cosmic-mint font-bold' : 'text-slate-500'}`}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────── Upcoming lesson preview ──────────────────────

function UpcomingLessonPreview() {
  const { t } = useTranslation();
  // Static for now — would read from a real lessons table later.
  const upcoming = [
    { num: 2, titleKey: 'dashboard.upcoming.numbers',  emoji: '🔢', mins: 8  },
    { num: 3, titleKey: 'dashboard.upcoming.family',   emoji: '👨‍👩‍👧', mins: 10 },
    { num: 4, titleKey: 'dashboard.upcoming.food',     emoji: '🍎', mins: 7  },
  ];
  return (
    <div className="glass-panel p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h4 className="text-sm font-bold text-white">{t('dashboard.upNext')}</h4>
        <span className="text-[10px] uppercase tracking-wider text-cosmic-mint font-bold">{t('dashboard.upcomingBadge')}</span>
      </div>
      <div className="flex flex-col gap-2">
        {upcoming.map((u, i) => (
          <Link key={u.num} to="/lesson"
                className="group flex items-center gap-3 rounded-xl p-2.5 border border-white/8 bg-white/[0.03] hover:bg-white/[0.07] hover:border-cosmic-mint/30 transition">
            <div className="w-9 h-9 rounded-lg grid place-items-center bg-white/[0.08] text-lg shrink-0">
              {u.emoji}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] text-slate-400 leading-none">
                {t('dashboard.lessonShort')} {u.num}
              </p>
              <p className="text-sm font-bold text-white truncate">
                {t(u.titleKey)}
              </p>
            </div>
            <span className="text-[10px] text-slate-500 shrink-0">{u.mins} {t('dashboard.minShort')}</span>
            <span className="text-cosmic-mint opacity-0 group-hover:opacity-100 transition shrink-0">
              {i === 0 ? '▶' : '→'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ────────────────────── Motivational quote ──────────────────────
// Rotates daily — same quote stays for 24h so it doesn't feel random.

const QUOTES: { textKey: string; authorKey: string }[] = [
  { textKey: 'dashboard.quotes.q1.text', authorKey: 'dashboard.quotes.q1.author' },
  { textKey: 'dashboard.quotes.q2.text', authorKey: 'dashboard.quotes.q2.author' },
  { textKey: 'dashboard.quotes.q3.text', authorKey: 'dashboard.quotes.q3.author' },
  { textKey: 'dashboard.quotes.q4.text', authorKey: 'dashboard.quotes.q4.author' },
  { textKey: 'dashboard.quotes.q5.text', authorKey: 'dashboard.quotes.q5.author' },
  { textKey: 'dashboard.quotes.q6.text', authorKey: 'dashboard.quotes.q6.author' },
  { textKey: 'dashboard.quotes.q7.text', authorKey: 'dashboard.quotes.q7.author' },
];

function MotivationalQuote() {
  const { t } = useTranslation();
  const dayOfYear = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / 86_400_000);
  }, []);
  const q = QUOTES[dayOfYear % QUOTES.length];

  return (
    <div className="glass-panel p-5 relative overflow-hidden">
      <span aria-hidden
            className="absolute -top-3 -left-1 text-7xl font-serif text-cosmic-mint/15 leading-none select-none pointer-events-none">
        “
      </span>
      <div className="relative z-10">
        <p className="text-[13px] text-slate-100 leading-relaxed font-medium italic">
          {t(q.textKey)}
        </p>
        <p className="mt-2 text-[11px] text-cosmic-mint font-semibold">
          — {t(q.authorKey)}
        </p>
      </div>
    </div>
  );
}
