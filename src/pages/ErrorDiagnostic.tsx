// =============================================================================
// Uzbek Error DNA — 20-question diagnostic test.
// One question at a time, 5 categories x 4 questions. Grading (and the real
// answer key) lives server-side; this page only collects the answers and
// submits them once at the end via api.dna.submitDiagnostic().
// =============================================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { dna } from '@/lib/api';
import { useActivity } from '@/store/activity';
import type { DiagnosticQuestion } from '@/types';

export function ErrorDiagnostic() {
  const log = useActivity(s => s.log);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<DiagnosticQuestion[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dna.getQuestions().then(setQuestions);
  }, []);

  if (!questions) {
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

  const question = questions[idx];
  const progress = Math.round((idx / questions.length) * 100);

  async function choose(selectedIndex: number) {
    const next = [...answers, { questionId: question.id, selectedIndex }];
    setAnswers(next);

    if (idx + 1 < questions!.length) {
      setIdx(idx + 1);
      return;
    }

    setSubmitting(true);
    const result = await dna.submitDiagnostic(next);
    log('dna_diagnostic_completed', { weakestCategory: result.weakestCategory });
    setSubmitting(false);
    navigate('/dna', { state: { justCompleted: true } });
  }

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerEmoji="🧬" bannerTitle="Error DNA Diagnostic"
                bannerSubtitle="20 quick questions — find out exactly where Uzbek→English mistakes hide for you." />

        <section className="glass-panel p-8 max-w-2xl mx-auto w-full flex-1 flex flex-col">
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cosmic-mint to-cosmic-sky transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs tabular-nums text-slate-400">{idx + 1} / {questions.length}</span>
          </div>

          {submitting ? (
            <div className="grid place-items-center flex-1 text-slate-200">
              <div className="text-4xl mb-3">🧬</div>
              <p>Calculating your DNA profile…</p>
            </div>
          ) : (
            <>
              <span className="inline-block mb-3 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-cosmic-mint/10 border border-cosmic-mint/30 text-cosmic-mint w-fit">
                {question.category.replace('_', ' ')}
              </span>
              <h1 className="text-2xl font-bold text-white mb-6 leading-snug">{question.prompt}</h1>

              <div className="flex flex-col gap-3">
                {question.options.map((opt, i) => (
                  <button key={i} onClick={() => choose(i)}
                          className="text-left px-5 py-4 rounded-2xl border border-white/10 bg-white/[0.03]
                                     hover:bg-cosmic-mint/10 hover:border-cosmic-mint/40 hover:-translate-y-0.5
                                     transition-all duration-200 active:scale-[0.98] text-slate-100">
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      </AppShell>
    </>
  );
}
