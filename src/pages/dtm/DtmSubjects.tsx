// =============================================================================
// DTM subject pages — three core subjects per Uzbekistan university entrance
// exam: Mathematics, English, Native language (Ona tili va Adabiyot).
// Plus Mock Tests, Past Papers and personal Stats.
//
// Each subject page follows the same shell. Real exercises will be wired in
// once content (PDFs, structured questions) is uploaded via Dev Panel.
// =============================================================================
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Cosmos } from '@/components/layout/Cosmos'
import { AppShell } from '@/components/layout/AppShell'
import { Topbar } from '@/components/layout/Topbar'

interface Topic { titleKey: string; descKey: string; count: number }

function Shell({ titleKey, subtitleKey, accent, emoji, image, topics, ctaTo, ctaKey }: {
  titleKey:    string
  subtitleKey: string
  accent:      string
  emoji:       string
  image?:      string
  topics:      Topic[]
  ctaTo:       string
  ctaKey:      string
}) {
  const { t } = useTranslation()
  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner"
                bannerImage={image}
                bannerEmoji={image ? undefined : emoji}
                bannerTitle={t(titleKey)} bannerSubtitle={t(subtitleKey)} />

        <section className="flex-1 min-h-0 overflow-auto flex flex-col gap-5">
          {/* Hero */}
          <div className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center gap-5"
               style={{ background: `linear-gradient(120deg, ${accent}, transparent 70%)` }}>
            {image ? (
              <img src={image} alt="" className="w-24 h-24 rounded-2xl object-cover border border-white/12 shrink-0" />
            ) : (
              <div className="text-6xl">{emoji}</div>
            )}
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

// ───────────────────── Mathematics ─────────────────────
export function DtmMath() {
  return (
    <Shell
      titleKey="dtm.math.title"
      subtitleKey="dtm.math.subtitle"
      emoji="🔢"
      image="/icons/dtm/math.avif"
      accent="rgba(90,169,255,0.10)"
      ctaTo="/dtm/math"
      ctaKey="dtm.math.startDrill"
      topics={[
        { titleKey: 'dtm.math.t.algebra',   descKey: 'dtm.math.t.algebraDesc',   count: 0 },
        { titleKey: 'dtm.math.t.functions', descKey: 'dtm.math.t.functionsDesc', count: 0 },
        { titleKey: 'dtm.math.t.geometry',  descKey: 'dtm.math.t.geometryDesc',  count: 0 },
        { titleKey: 'dtm.math.t.trig',      descKey: 'dtm.math.t.trigDesc',      count: 0 },
        { titleKey: 'dtm.math.t.progression', descKey: 'dtm.math.t.progressionDesc', count: 0 },
        { titleKey: 'dtm.math.t.equations', descKey: 'dtm.math.t.equationsDesc', count: 0 },
        { titleKey: 'dtm.math.t.inequalities', descKey: 'dtm.math.t.inequalitiesDesc', count: 0 },
        { titleKey: 'dtm.math.t.combinatorics', descKey: 'dtm.math.t.combinatoricsDesc', count: 0 },
        { titleKey: 'dtm.math.t.probability', descKey: 'dtm.math.t.probabilityDesc', count: 0 },
      ]}
    />
  )
}

// ───────────────────── English ─────────────────────
export function DtmEnglish() {
  return (
    <Shell
      titleKey="dtm.english.title"
      subtitleKey="dtm.english.subtitle"
      emoji="📖"
      image="/icons/dtm/english.webp"
      accent="rgba(126,247,211,0.10)"
      ctaTo="/dtm/english"
      ctaKey="dtm.english.startDrill"
      topics={[
        { titleKey: 'dtm.english.t.grammar',     descKey: 'dtm.english.t.grammarDesc',     count: 0 },
        { titleKey: 'dtm.english.t.vocabulary',  descKey: 'dtm.english.t.vocabularyDesc',  count: 0 },
        { titleKey: 'dtm.english.t.reading',     descKey: 'dtm.english.t.readingDesc',     count: 0 },
        { titleKey: 'dtm.english.t.cloze',       descKey: 'dtm.english.t.clozeDesc',       count: 0 },
        { titleKey: 'dtm.english.t.tenses',      descKey: 'dtm.english.t.tensesDesc',      count: 0 },
        { titleKey: 'dtm.english.t.phrasal',     descKey: 'dtm.english.t.phrasalDesc',     count: 0 },
      ]}
    />
  )
}

// ───────────────────── Native (Ona tili) ─────────────────────
export function DtmNative() {
  return (
    <Shell
      titleKey="dtm.native.title"
      subtitleKey="dtm.native.subtitle"
      emoji="✍️"
      image="/icons/dtm/native.jpg"
      accent="rgba(167,139,250,0.10)"
      ctaTo="/dtm/native"
      ctaKey="dtm.native.startDrill"
      topics={[
        { titleKey: 'dtm.native.t.fonetika',   descKey: 'dtm.native.t.fonetikaDesc',   count: 0 },
        { titleKey: 'dtm.native.t.leksika',    descKey: 'dtm.native.t.leksikaDesc',    count: 0 },
        { titleKey: 'dtm.native.t.morfologiya', descKey: 'dtm.native.t.morfologiyaDesc', count: 0 },
        { titleKey: 'dtm.native.t.sintaksis',  descKey: 'dtm.native.t.sintaksisDesc',  count: 0 },
        { titleKey: 'dtm.native.t.imlo',       descKey: 'dtm.native.t.imloDesc',       count: 0 },
        { titleKey: 'dtm.native.t.uslubiyat',  descKey: 'dtm.native.t.uslubiyatDesc',  count: 0 },
        { titleKey: 'dtm.native.t.adabiyot',   descKey: 'dtm.native.t.adabiyotDesc',   count: 0 },
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
      image="/icons/dtm/mock.png"
      accent="rgba(251,191,36,0.10)"
      ctaTo="/dtm/mock"
      ctaKey="dtm.mock.startDrill"
      topics={[
        { titleKey: 'dtm.mock.t.full',  descKey: 'dtm.mock.t.fullDesc',  count: 0 },
        { titleKey: 'dtm.mock.t.mini',  descKey: 'dtm.mock.t.miniDesc',  count: 0 },
        { titleKey: 'dtm.mock.t.timed', descKey: 'dtm.mock.t.timedDesc', count: 0 },
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
        { titleKey: 'dtm.past.t.y2025', descKey: 'dtm.past.t.yDesc', count: 0 },
        { titleKey: 'dtm.past.t.y2024', descKey: 'dtm.past.t.yDesc', count: 0 },
        { titleKey: 'dtm.past.t.y2023', descKey: 'dtm.past.t.yDesc', count: 0 },
        { titleKey: 'dtm.past.t.y2022', descKey: 'dtm.past.t.yDesc', count: 0 },
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
        <Topbar variant="banner" bannerEmoji="📊" bannerTitle={t('dtm.stats.title')} bannerSubtitle={t('dtm.stats.subtitle')} />
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
