// =============================================================================
// Uzbek Error DNA — profile dashboard.
// Shows the per-category "problem score" (0-100, higher = bigger problem),
// the single weakest category, and lessons the curriculum generator picked
// because they target that weakness.
// =============================================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { dna } from '@/lib/api';
import { ERROR_CATEGORY_LABELS, ERROR_CATEGORIES } from '@/data/errorDna';
import type { DnaScores, Lesson, ErrorCategory } from '@/types';

function barColor(score: number) {
  if (score >= 60) return 'from-rose-400 to-rose-500';
  if (score >= 35) return 'from-amber-300 to-orange-400';
  return 'from-cosmic-mint to-cosmic-sky';
}

export function ErrorDNA() {
  const [scores, setScores]     = useState<DnaScores | null>(null);
  const [lessons, setLessons]   = useState<Lesson[]>([]);

  useEffect(() => {
    dna.getScores().then(setScores);
    dna.getRecommendedLessons(5).then(setLessons);
  }, []);

  const hasScores = !!scores && Object.keys(scores).length > 0;
  const weakest: ErrorCategory | null = hasScores
    ? (Object.entries(scores!).reduce((a, b) => (b[1]! > a[1]! ? b : a)) as [ErrorCategory, number])[0]
    : null;

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerEmoji="🧬" bannerTitle="Error DNA"
                bannerSubtitle="Your personal map of where Uzbek→English mistakes hide." />

        <section className="grid lg:grid-cols-[1fr_320px] grid-cols-1 gap-5 flex-1">
          {/* Score bars */}
          <div className="glass-panel p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Your DNA profile</h2>
              <Link to="/dna/diagnostic"
                    className="px-4 py-2 rounded-full text-xs font-bold border border-cosmic-mint/40 text-cosmic-mint hover:bg-cosmic-mint/10 transition">
                {hasScores ? 'Retake diagnostic' : 'Start diagnostic'}
              </Link>
            </div>

            {!hasScores ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-4xl mb-3">🧬</p>
                <p className="text-slate-200 font-semibold mb-1">No diagnostic yet</p>
                <p className="text-sm text-slate-400">Take the 20-question test to see your Error DNA profile.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {ERROR_CATEGORIES.map(cat => {
                  const score = scores![cat] ?? 0;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-slate-100">{ERROR_CATEGORY_LABELS[cat]}</span>
                        <span className="text-xs tabular-nums text-slate-400">{score}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${barColor(score)} transition-all duration-500`}
                             style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weakest + recommended lessons */}
          <aside className="flex flex-col gap-4">
            {weakest && (
              <div className="glass-panel p-5 border border-rose-400/25">
                <p className="text-[10px] uppercase tracking-widest text-rose-300 mb-1">Focus area</p>
                <p className="text-lg font-bold text-white">{ERROR_CATEGORY_LABELS[weakest]}</p>
                <p className="text-xs text-slate-400 mt-1">Your biggest opportunity right now — the lessons below target it first.</p>
              </div>
            )}

            <div className="glass-panel p-5 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3">Recommended next</p>
              {lessons.length === 0 ? (
                <p className="text-sm text-slate-400">Take the diagnostic to unlock personalised recommendations.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {lessons.map(l => (
                    <Link key={l.id} to={`/lesson/${l.id}`}
                          className="px-3.5 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition">
                      <p className="text-sm font-semibold text-white truncate">{l.title}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{l.level} · {l.type}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </section>
      </AppShell>
    </>
  );
}
