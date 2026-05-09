import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useQuery } from '@tanstack/react-query';
import { learning } from '@/lib/api';
import type { Lesson } from '@/types';
import { useProgress } from '@/store/progress';
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

          <NextLessonCard />
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
    <aside onMouseMove={onMove}
           className="crystal-card crystal-tall relative p-7 flex flex-col items-center text-center">
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
    </aside>
  );
}
