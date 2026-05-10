// =============================================================================
// DTM Home — dashboard for Uzbekistan university entrance exam (DTM) track.
// Different from regular /home: emphasizes English DTM-style preparation
// (grammar MCQ, cloze, vocabulary, past-paper drills) rather than IELTS skills.
// =============================================================================
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Cosmos } from '@/components/layout/Cosmos'
import { AppShell } from '@/components/layout/AppShell'
import { Topbar } from '@/components/layout/Topbar'
import { useAuth } from '@/store/auth'

export function DtmHome() {
  const { t } = useTranslation()
  const user = useAuth(s => s.user)

  // Static dashboard numbers — wire to real progress store later.
  const heroStats = [
    { label: t('dtm.home.stats.target'),   value: '70+',     hint: t('dtm.home.stats.targetHint') },
    { label: t('dtm.home.stats.solved'),   value: '0',       hint: t('dtm.home.stats.solvedHint') },
    { label: t('dtm.home.stats.accuracy'), value: '—',       hint: t('dtm.home.stats.accuracyHint') },
    { label: t('dtm.home.stats.daysLeft'), value: '—',       hint: t('dtm.home.stats.daysLeftHint') },
  ]

  const subjects = [
    { to: '/dtm/grammar',     emoji: '📝', titleKey: 'dtm.subjects.grammar.title',     descKey: 'dtm.subjects.grammar.desc',     count: 1240 },
    { to: '/dtm/vocabulary',  emoji: '📚', titleKey: 'dtm.subjects.vocabulary.title',  descKey: 'dtm.subjects.vocabulary.desc',  count: 3000 },
    { to: '/dtm/reading',     emoji: '📖', titleKey: 'dtm.subjects.reading.title',     descKey: 'dtm.subjects.reading.desc',     count: 180 },
    { to: '/dtm/listening',   emoji: '🎧', titleKey: 'dtm.subjects.listening.title',   descKey: 'dtm.subjects.listening.desc',   count: 60 },
    { to: '/dtm/mock',        emoji: '🎯', titleKey: 'dtm.subjects.mock.title',        descKey: 'dtm.subjects.mock.desc',        count: 12 },
    { to: '/dtm/past-papers', emoji: '🗂️', titleKey: 'dtm.subjects.pastPapers.title', descKey: 'dtm.subjects.pastPapers.desc',  count: 8  },
  ]

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner"
                bannerTitle={t('dtm.home.title')}
                bannerSubtitle={t('dtm.home.subtitle', { name: user?.name?.split(' ')[0] ?? '' })} />

        <section className="flex-1 min-h-0 overflow-auto flex flex-col gap-5">
          {/* Hero stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {heroStats.map(s => (
              <div key={s.label} className="glass-panel p-4">
                <p className="text-3xl font-extrabold text-white leading-none">{s.value}</p>
                <p className="mt-1.5 text-xs uppercase tracking-wider text-cosmic-mint font-bold">{s.label}</p>
                <p className="mt-1 text-[11px] text-slate-400 leading-snug">{s.hint}</p>
              </div>
            ))}
          </div>

          {/* Today's focus card */}
          <div className="glass-panel p-5 flex flex-col md:flex-row gap-4 items-start md:items-center"
               style={{ background: 'linear-gradient(120deg, rgba(126,247,211,0.08), rgba(90,169,255,0.04))' }}>
            <div className="text-5xl">🎯</div>
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-cosmic-mint font-bold">{t('dtm.home.todayLabel')}</p>
              <h3 className="mt-1 text-xl font-bold text-white">{t('dtm.home.todayTitle')}</h3>
              <p className="mt-1 text-sm text-slate-300">{t('dtm.home.todayDesc')}</p>
            </div>
            <Link to="/dtm/grammar" className="btn-mint">{t('dtm.home.startBtn')}</Link>
          </div>

          {/* Subjects grid */}
          <div>
            <h3 className="text-base font-bold text-white mb-3">{t('dtm.home.subjectsTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(s => (
                <Link key={s.to} to={s.to}
                      className="glass-panel p-5 group hover:-translate-y-1 transition-all duration-200 hover:shadow-[0_18px_40px_-12px_rgba(126,247,211,0.35)]">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{s.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-white leading-tight">{t(s.titleKey)}</p>
                      <p className="mt-1 text-[11.5px] text-slate-400 leading-relaxed">{t(s.descKey)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{s.count.toLocaleString()} {t('dtm.home.itemsAvailable')}</span>
                    <span className="text-cosmic-mint group-hover:translate-x-1 transition">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </AppShell>
    </>
  )
}
