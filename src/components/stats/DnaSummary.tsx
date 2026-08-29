// =============================================================================
// DnaSummary — the Error DNA readout, on the stats page.
//
// Stats and Error DNA were two destinations answering halves of one question:
// stats say how much and how well, DNA says what is actually going wrong. The
// useful half was a navigation away from the evidence for it, so the diagnosis
// now sits under the numbers and the full page stays one tap deeper.
//
// Reads the same `dna.getScores()` the full page does rather than duplicating
// the computation, so the two can't disagree.
// =============================================================================
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dna } from '@/lib/api'
import { ERROR_CATEGORY_LABELS } from '@/data/errorDna'
import type { DnaScores, ErrorCategory } from '@/types'

/** Mastery runs 0–100 and higher is stronger, so the weakest category is the
 *  minimum — the one worth fixing first. */
function barColor(score: number) {
  if (score >= 75) return '#22C55E'
  if (score >= 50) return '#F59E0B'
  return '#ff453a'
}

export function DnaSummary() {
  const [scores, setScores] = useState<DnaScores | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    dna.getScores()
      .then(s => { if (alive) setScores(s) })
      .catch(() => { if (alive) setFailed(true) })
    return () => { alive = false }
  }, [])

  const entries = Object.entries(scores ?? {}) as [ErrorCategory, number][]
  const hasScores = entries.length > 0

  // Nothing to diagnose yet, and nothing useful to say about an empty result —
  // point at the diagnostic instead of showing five empty bars.
  if (failed || (scores !== null && !hasScores)) {
    return (
      <section className="glass-panel p-6">
        <h2 className="text-lg font-bold text-white">Xato DNA</h2>
        <p className="text-sm text-slate-300 mt-1">
          Diagnostikani topshirsangiz, qaysi mavzuda ko'proq xato qilishingiz shu yerda chiqadi.
        </p>
        <Link
          to="/dna/diagnostic"
          className="inline-block mt-3 px-4 py-2 rounded-full text-sm font-bold bg-cosmic-mint/15 border border-cosmic-mint/40 text-cosmic-mint"
        >
          Diagnostikani boshlash
        </Link>
      </section>
    )
  }

  if (!scores) {
    return <section className="glass-panel p-6 text-sm text-slate-400">Xato DNA yuklanmoqda…</section>
  }

  const sorted = [...entries].sort((a, b) => a[1] - b[1])
  const weakest = sorted[0]
  const overall = Math.round(entries.reduce((s, [, v]) => s + v, 0) / entries.length)

  return (
    <section className="glass-panel p-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-white">Xato DNA</h2>
        <Link to="/dna" className="text-xs text-cosmic-mint hover:underline">
          To'liq ko'rish →
        </Link>
      </div>

      <div className="flex items-baseline gap-2 mt-3">
        <span className="text-4xl font-extrabold text-white leading-none">{overall}</span>
        <span className="text-sm text-slate-400">/ 100 umumiy o'zlashtirish</span>
      </div>

      {/* The single most actionable line on the page, so it comes before the
          full breakdown rather than after it. */}
      <p className="text-sm text-slate-300 mt-2">
        Eng zaif tomon: <span className="text-white font-semibold">
          {ERROR_CATEGORY_LABELS[weakest[0]]}
        </span> — {weakest[1]}/100
      </p>

      <div className="flex flex-col gap-2.5 mt-5">
        {sorted.map(([cat, score]) => (
          <div key={cat}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">{ERROR_CATEGORY_LABELS[cat]}</span>
              <span className="text-slate-400 tabular-nums">{score}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(0, Math.min(100, score))}%`, background: barColor(score) }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
