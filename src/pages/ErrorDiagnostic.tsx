// =============================================================================
// Uzbek Error DNA — 20-question diagnostic test.
// 4 questions per category, freshly resampled from an 8-per-category bank
// each attempt. Grading (and the real answer key) lives server-side; this
// page collects answers, reveals correct/incorrect + a Uzbek explanation
// after each one (the "aha moment" worth sharing), then submits at the end.
// =============================================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { dna } from '@/lib/api';
import { useActivity } from '@/store/activity';
import type { DiagnosticQuestion, DiagnosticAnswerCheck } from '@/types';

export function ErrorDiagnostic() {
  const log = useActivity(s => s.log);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<DiagnosticQuestion[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [check, setCheck] = useState<DiagnosticAnswerCheck | null>(null);
  const [checking, setChecking] = useState(false);
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
  const isLast = idx + 1 >= questions.length;

  async function choose(selectedIndex: number) {
    if (check) return; // already answered — ignore further clicks until "Next"
    setSelected(selectedIndex);
    setChecking(true);
    const result = await dna.checkAnswer(question.id, selectedIndex);
    setCheck(result);
    setChecking(false);
  }

  async function next() {
    const nextAnswers = [...answers, { questionId: question.id, selectedIndex: selected! }];
    setAnswers(nextAnswers);
    setSelected(null);
    setCheck(null);

    if (!isLast) {
      setIdx(idx + 1);
      return;
    }

    setSubmitting(true);
    const result = await dna.submitDiagnostic(nextAnswers);
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
                {question.options.map((opt, i) => {
                  const isPicked  = selected === i;
                  const isRight   = check && i === check.correctIndex;
                  const isWrongPick = check && isPicked && !check.correct;
                  return (
                    <button key={i} onClick={() => choose(i)} disabled={!!check || checking}
                            className={`text-left px-5 py-4 rounded-2xl border transition-all duration-200
                                        ${isRight ? 'border-cosmic-mint/60 bg-cosmic-mint/10 text-white'
                                          : isWrongPick ? 'border-rose-400/60 bg-rose-400/10 text-white'
                                          : 'border-white/10 bg-white/[0.03] text-slate-100 hover:bg-cosmic-mint/10 hover:border-cosmic-mint/40 hover:-translate-y-0.5 active:scale-[0.98]'}
                                        ${check ? 'cursor-default' : ''}`}>
                      {opt}
                      {isRight && <span className="float-right">✅</span>}
                      {isWrongPick && <span className="float-right">❌</span>}
                    </button>
                  );
                })}
              </div>

              {checking && <p className="text-xs text-slate-400 mt-4">Tekshirilmoqda…</p>}

              {check && (
                <div className={`mt-5 rounded-2xl p-4 border ${check.correct ? 'border-cosmic-mint/30 bg-cosmic-mint/[0.05]' : 'border-amber-300/30 bg-amber-300/[0.05]'}`}>
                  <p className="text-sm font-bold mb-1.5">
                    {check.correct ? '✅ To\'g\'ri!' : '❌ Noto\'g\'ri'}
                  </p>
                  <p className="text-sm text-slate-200 leading-relaxed">💡 {check.explanation}</p>
                  <button onClick={next}
                          className="mt-4 btn-mint text-sm px-5 py-2">
                    {isLast ? 'Natijalarni ko\'rish →' : 'Keyingi savol →'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </AppShell>
    </>
  );
}
