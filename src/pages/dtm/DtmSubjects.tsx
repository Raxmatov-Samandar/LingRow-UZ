// =============================================================================
// DTM subject pages — placeholder content (Grammar, Vocabulary, Reading,
// Listening, Mock Tests, Past Papers, Stats).
// Each page has the same shell: banner topbar + main panel with subject-specific
// teaser content. Real exercises will be wired in once content is ready.
// =============================================================================
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Cosmos } from '@/components/layout/Cosmos'
import { AppShell } from '@/components/layout/AppShell'
import { Topbar } from '@/components/layout/Topbar'

interface Topic { titleKey: string; descKey: string; count: number }

function Shell({ titleKey, subtitleKey, accent, emoji, topics, ctaTo, ctaKey }: {
  titleKey:    string
  subtitleKey: string
  accent:      string
  emoji:       string
  topics:      Topic[]
  ctaTo:       string
  ctaKey:      string
}) {
  const { t } = useTranslation()
  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle={t(titleKey)} bannerSubtitle={t(subtitleKey)} />

        <section className="flex-1 min-h-0 overflow-auto flex flex-col gap-5">
          {/* Hero */}
          <div className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center gap-5"
               style={{ background: `linear-gradient(120deg, ${accent}, transparent 70%)` }}>
            <div className="text-6xl">{emoji}</div>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-white">{t(titleKey)}</h2>
              <p className="mt-1.5 text-sm text-slate-300 leading-relaxed max-w-2xl">{t(subtitleKey)}</p>
            </div>
            <Link to={ctaTo} className="btn-mint shrink-0">{t(ctaKey)}</Link>
          </div>

          {/* Topics */}
          <div>
            <h3 className="text-base font-bold text-white mb-3">{t('dtm.shell.topics')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {topics.map((tp, i) => (
                <div key={i} className="glass-panel p-4 hover:bg-white/[0.05] transition group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">{t(tp.titleKey)}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cosmic-mint/15 text-cosmic-mint font-bold border border-cosmic-mint/30">
                      {tp.count}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11.5px] text-slate-400 leading-relaxed">{t(tp.descKey)}</p>
                  <div className="mt-3 h-1 rounded-full bg-white/8 overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-cosmic-mint to-cosmic-sky group-hover:w-1/4 transition-all duration-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic text-center mt-2">
            {t('dtm.shell.comingSoon')}
          </p>
        </section>
      </AppShell>
    </>
  )
}

// ───────────────────── Grammar ─────────────────────
export function DtmGrammar() {
  return (
    <Shell
      titleKey="dtm.grammar.title"
      subtitleKey="dtm.grammar.subtitle"
      emoji="📝"
      accent="rgba(90,169,255,0.10)"
      ctaTo="/dtm/grammar"
      ctaKey="dtm.grammar.startDrill"
      topics={[
        { titleKey: 'dtm.grammar.t.tenses',     descKey: 'dtm.grammar.t.tensesDesc',    count: 320 },
        { titleKey: 'dtm.grammar.t.articles',   descKey: 'dtm.grammar.t.articlesDesc',  count: 95  },
        { titleKey: 'dtm.grammar.t.modals',     descKey: 'dtm.grammar.t.modalsDesc',    count: 140 },
        { titleKey: 'dtm.grammar.t.conditionals', descKey: 'dtm.grammar.t.conditionalsDesc', count: 110 },
        { titleKey: 'dtm.grammar.t.passive',    descKey: 'dtm.grammar.t.passiveDesc',   count: 85  },
        { titleKey: 'dtm.grammar.t.reported',   descKey: 'dtm.grammar.t.reportedDesc',  count: 70  },
        { titleKey: 'dtm.grammar.t.prepositions', descKey: 'dtm.grammar.t.prepositionsDesc', count: 220 },
        { titleKey: 'dtm.grammar.t.phrasal',    descKey: 'dtm.grammar.t.phrasalDesc',   count: 200 },
      ]}
    />
  )
}

// ───────────────────── Vocabulary ─────────────────────
export function DtmVocabulary() {
  return (
    <Shell
      titleKey="dtm.vocab.title"
      subtitleKey="dtm.vocab.subtitle"
      emoji="📚"
      accent="rgba(126,247,211,0.10)"
      ctaTo="/dtm/vocabulary"
      ctaKey="dtm.vocab.startDrill"
      topics={[
        { titleKey: 'dtm.vocab.t.high',     descKey: 'dtm.vocab.t.highDesc',    count: 800 },
        { titleKey: 'dtm.vocab.t.synonyms', descKey: 'dtm.vocab.t.synonymsDesc', count: 600 },
        { titleKey: 'dtm.vocab.t.antonyms', descKey: 'dtm.vocab.t.antonymsDesc', count: 400 },
        { titleKey: 'dtm.vocab.t.collocations', descKey: 'dtm.vocab.t.collocationsDesc', count: 500 },
        { titleKey: 'dtm.vocab.t.idioms',   descKey: 'dtm.vocab.t.idiomsDesc',  count: 300 },
        { titleKey: 'dtm.vocab.t.confusable', descKey: 'dtm.vocab.t.confusableDesc', count: 400 },
      ]}
    />
  )
}

// ───────────────────── Reading ─────────────────────
export function DtmReading() {
  return (
    <Shell
      titleKey="dtm.reading.title"
      subtitleKey="dtm.reading.subtitle"
      emoji="📖"
      accent="rgba(167,139,250,0.10)"
      ctaTo="/dtm/reading"
      ctaKey="dtm.reading.startDrill"
      topics={[
        { titleKey: 'dtm.reading.t.short',   descKey: 'dtm.reading.t.shortDesc',   count: 60 },
        { titleKey: 'dtm.reading.t.cloze',   descKey: 'dtm.reading.t.clozeDesc',   count: 40 },
        { titleKey: 'dtm.reading.t.gist',    descKey: 'dtm.reading.t.gistDesc',    count: 35 },
        { titleKey: 'dtm.reading.t.detail',  descKey: 'dtm.reading.t.detailDesc',  count: 45 },
      ]}
    />
  )
}

// ───────────────────── Listening ─────────────────────
export function DtmListening() {
  return (
    <Shell
      titleKey="dtm.listening.title"
      subtitleKey="dtm.listening.subtitle"
      emoji="🎧"
      accent="rgba(252,165,165,0.10)"
      ctaTo="/dtm/listening"
      ctaKey="dtm.listening.startDrill"
      topics={[
        { titleKey: 'dtm.listening.t.dialogue',  descKey: 'dtm.listening.t.dialogueDesc',  count: 25 },
        { titleKey: 'dtm.listening.t.monologue', descKey: 'dtm.listening.t.monologueDesc', count: 20 },
        { titleKey: 'dtm.listening.t.gapfill',   descKey: 'dtm.listening.t.gapfillDesc',   count: 15 },
      ]}
    />
  )
}

// ───────────────────── Mock Tests ─────────────────────
export function DtmMock() {
  return (
    <Shell
      titleKey="dtm.mock.title"
      subtitleKey="dtm.mock.subtitle"
      emoji="🎯"
      accent="rgba(251,191,36,0.10)"
      ctaTo="/dtm/mock"
      ctaKey="dtm.mock.startDrill"
      topics={[
        { titleKey: 'dtm.mock.t.full',  descKey: 'dtm.mock.t.fullDesc',  count: 12 },
        { titleKey: 'dtm.mock.t.mini',  descKey: 'dtm.mock.t.miniDesc',  count: 24 },
        { titleKey: 'dtm.mock.t.timed', descKey: 'dtm.mock.t.timedDesc', count: 18 },
      ]}
    />
  )
}

// ───────────────────── Past Papers ─────────────────────
export function DtmPastPapers() {
  return (
    <Shell
      titleKey="dtm.past.title"
      subtitleKey="dtm.past.subtitle"
      emoji="🗂️"
      accent="rgba(148,163,184,0.10)"
      ctaTo="/dtm/past-papers"
      ctaKey="dtm.past.startDrill"
      topics={[
        { titleKey: 'dtm.past.t.y2024', descKey: 'dtm.past.t.yDesc', count: 4 },
        { titleKey: 'dtm.past.t.y2023', descKey: 'dtm.past.t.yDesc', count: 4 },
        { titleKey: 'dtm.past.t.y2022', descKey: 'dtm.past.t.yDesc', count: 4 },
        { titleKey: 'dtm.past.t.y2021', descKey: 'dtm.past.t.yDesc', count: 4 },
        { titleKey: 'dtm.past.t.y2020', descKey: 'dtm.past.t.yDesc', count: 4 },
      ]}
    />
  )
}

// ───────────────────── Stats ─────────────────────
export function DtmStats() {
  const { t } = useTranslation()
  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle={t('dtm.stats.title')} bannerSubtitle={t('dtm.stats.subtitle')} />
        <section className="flex-1 min-h-0 overflow-auto flex flex-col gap-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Tile label={t('dtm.stats.solved')}     value="0" />
            <Tile label={t('dtm.stats.accuracy')}   value="—" />
            <Tile label={t('dtm.stats.streak')}     value="0" />
            <Tile label={t('dtm.stats.predicted')}  value="—" />
          </div>
          <div className="glass-panel p-6 text-center text-sm text-slate-400">
            {t('dtm.stats.empty')}
          </div>
        </section>
      </AppShell>
    </>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-5">
      <p className="text-3xl font-extrabold text-white">{value}</p>
      <p className="text-xs uppercase tracking-wider text-cosmic-mint mt-1.5 font-bold">{label}</p>
    </div>
  )
}
