// =============================================================================
// SM-2 daily review — flashcard flow over words that are actually due.
// Was previously dead code: getVocab()/reviewVocab() existed but no page
// ever called them. This is that missing entry point.
// =============================================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { learning } from '@/lib/api';
import { useActivity } from '@/store/activity';
import type { VocabWord } from '@/types';

const RATINGS: { label: string; quality: 0 | 1 | 2 | 3 | 4 | 5; tint: string }[] = [
  { label: 'Again', quality: 0, tint: 'border-rose-400/40 text-rose-300 hover:bg-rose-400/10' },
  { label: 'Hard',  quality: 3, tint: 'border-amber-300/40 text-amber-200 hover:bg-amber-300/10' },
  { label: 'Good',  quality: 4, tint: 'border-cosmic-mint/40 text-cosmic-mint hover:bg-cosmic-mint/10' },
  { label: 'Easy',  quality: 5, tint: 'border-cosmic-sky/40 text-cosmic-sky hover:bg-cosmic-sky/10' },
];

export function VocabReview() {
  const log = useActivity(s => s.log);

  const [queue, setQueue]   = useState<VocabWord[] | null>(null);
  const [reviewed, setReviewed] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    learning.getDueVocab().then(setQueue);
  }, []);

  if (!queue) {
    return (
      <>
        <Cosmos />
        <AppShell>
          <Topbar variant="search" />
          <div className="grid place-items-center flex-1 text-slate-300">Loading…</div>
        </AppShell>
      </>
    );
  }

  const current = queue[0];

  async function rate(quality: 0 | 1 | 2 | 3 | 4 | 5) {
    await learning.reviewVocab(current.id, quality);
    log('vocab_reviewed', { word: current.word, quality });
    setReviewed(n => n + 1);
    setRevealed(false);
    setQueue(q => q!.slice(1));
  }

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerEmoji="📇" bannerTitle="Daily Review"
                bannerSubtitle="Spaced repetition — the words most likely to slip away, right when you're about to forget them." />

        <section className="glass-panel p-8 max-w-xl mx-auto w-full flex-1 min-h-0 flex flex-col overflow-auto">
          {queue.length === 0 ? (
            <div className="grid place-items-center flex-1 text-center gap-2">
              <p className="text-4xl mb-2">{reviewed > 0 ? '🌟' : '📭'}</p>
              <p className="text-xl font-bold text-white">
                {reviewed > 0 ? `${reviewed} word${reviewed === 1 ? '' : 's'} reviewed!` : 'Nothing due right now'}
              </p>
              <p className="text-sm text-slate-400 mb-4">
                {reviewed > 0 ? 'Come back later for the next batch.' : 'Check back later, or browse the dictionary instead.'}
              </p>
              <Link to="/vocabulary" className="px-5 py-2.5 rounded-full text-sm font-bold bg-cosmic-mint/15 border border-cosmic-mint/40 text-cosmic-mint hover:bg-cosmic-mint/25 transition">
                Back to Vocabulary
              </Link>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400 mb-6 tabular-nums">{queue.length} word{queue.length === 1 ? '' : 's'} left</p>

              <div className="flex-1 grid place-items-center text-center">
                <div>
                  <p className="text-4xl font-extrabold text-white mb-2">{current.word}</p>
                  <p className="text-slate-400 italic mb-6">{current.phonetic}</p>

                  {revealed ? (
                    <div className="max-w-sm">
                      <p className="text-slate-100">{current.definition}</p>
                      {current.example && <p className="text-sm text-cosmic-mint italic mt-3">"{current.example}"</p>}
                    </div>
                  ) : (
                    <button onClick={() => setRevealed(true)}
                            className="px-6 py-3 rounded-full text-sm font-bold border border-white/15 text-slate-200 hover:bg-white/[0.06] transition">
                      Show answer
                    </button>
                  )}
                </div>
              </div>

              {revealed && (
                <div className="grid grid-cols-4 gap-2 mt-6">
                  {RATINGS.map(r => (
                    <button key={r.label} onClick={() => rate(r.quality)}
                            className={`py-3 rounded-xl border text-sm font-bold transition active:scale-[0.97] ${r.tint}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </AppShell>
    </>
  );
}
