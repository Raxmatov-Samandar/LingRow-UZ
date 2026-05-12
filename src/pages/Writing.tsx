// =============================================================================
// Writing test page — Cambridge IELTS 18 GT Test 1.
// Two tasks: Task 1 (letter, 20 min, ≥150 words) + Task 2 (essay, 40 min, ≥250).
// AI feedback per task via /functions/v1/grade-writing (mock fallback).
// =============================================================================
import { useEffect, useMemo, useState } from 'react';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { MetricRing } from '@/components/ui/MetricRing';
import { learning } from '@/lib/api';
import { useActivity } from '@/store/activity';
import { WRITING_TEST, type WritingTask } from '@/data/writing/cambridge18-test1';

interface TaskState {
  text:       string;
  submitted:  boolean;
  result:     null | { score: number; feedback: string[]; accuracy: number; fluency: number; pronunciation: number };
  loading:    boolean;
}

const initial: TaskState = { text: '', submitted: false, result: null, loading: false };

export function Writing() {
  const log = useActivity(s => s.log);

  const [taskIdx, setTaskIdx] = useState<0 | 1>(0);
  const [t1, setT1] = useState<TaskState>(initial);
  const [t2, setT2] = useState<TaskState>(initial);
  const [timeLeft, setTimeLeft] = useState(WRITING_TEST.durationMin * 60);
  const [running, setRunning]   = useState(false);          // ← manual start

  const task = WRITING_TEST.tasks[taskIdx];
  const state = taskIdx === 0 ? t1 : t2;
  const setState = (next: TaskState) => (taskIdx === 0 ? setT1(next) : setT2(next));

  // Master timer (60 min) — only ticks while `running` is true.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setRunning(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function resetTimer() {
    setRunning(false);
    setTimeLeft(WRITING_TEST.durationMin * 60);
  }

  const wordCount = useMemo(() => state.text.trim().split(/\s+/).filter(Boolean).length, [state.text]);
  const meetsMin  = wordCount >= task.minWords;

  async function submit() {
    setState({ ...state, loading: true });
    const r = await learning.gradeWriting(state.text, task.prompt);
    const band = +(4.5 + (r.score / 100) * 4.5).toFixed(1);
    log('writing_submitted', { task: task.taskNum, score: r.score, band, words: wordCount });
    setState({ text: state.text, submitted: true, result: r, loading: false });
  }

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle={WRITING_TEST.source} bannerSubtitle="60-minute Writing test · 2 tasks" />

        {/* Task tabs + master timer */}
        <div className="glass-panel px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex gap-1.5">
            {WRITING_TEST.tasks.map((t, i) => (
              <button key={t.taskNum} onClick={() => setTaskIdx(i as 0 | 1)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition
                                  ${i === taskIdx
                                    ? 'bg-cosmic-mint/15 border border-cosmic-mint/45 text-cosmic-mint'
                                    : 'border border-white/10 text-slate-300 hover:bg-white/[0.05]'}`}>
                Task {t.taskNum} · {t.durationMin}m · ≥{t.minWords}w
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-xs font-mono tabular-nums ${timeLeft < 600 ? 'text-rose-300' : 'text-slate-300'}`}>
              ⏱ {fmt(timeLeft)}
            </span>

            <button
              onClick={() => setRunning(r => !r)}
              disabled={timeLeft === 0}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition disabled:opacity-50
                          ${running
                            ? 'bg-rose-400/15 border border-rose-400/45 text-rose-300 hover:bg-rose-400/25'
                            : 'bg-cosmic-mint/15 border border-cosmic-mint/45 text-cosmic-mint hover:bg-cosmic-mint/25'}`}
              title={running ? 'Pause timer' : 'Start timer'}
            >
              {running ? '❚❚ Pause' : timeLeft < WRITING_TEST.durationMin * 60 ? '▶ Resume' : '▶ Start'}
            </button>

            <button
              onClick={resetTimer}
              disabled={timeLeft === WRITING_TEST.durationMin * 60}
              className="px-2.5 py-1 rounded-full text-[11px] border border-white/10 text-slate-400 hover:bg-white/[0.05] disabled:opacity-40"
              title="Reset timer"
            >
              ↻
            </button>

            <span className="text-xs text-slate-400 ml-2">
              Words: <b className={meetsMin ? 'text-cosmic-mint' : 'text-rose-300'}>{wordCount}</b> / {task.minWords}
            </span>
          </div>
        </div>

        <section className="grid lg:grid-cols-[1fr_420px] grid-cols-1 gap-3 lg:gap-5 flex-1 min-h-0 lg:overflow-hidden overflow-y-auto">
          {/* Paper editor */}
          <article className="rounded-3xl p-7 min-h-[460px] flex flex-col gap-4 relative overflow-auto"
                   style={{ background: 'linear-gradient(180deg,#f5efe1 0%,#ede5d2 100%)', color: '#1a1f3a',
                            border: '1px solid rgba(255,255,255,0.18)',
                            boxShadow: '0 18px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5)' }}>
            <header>
              <p className="text-[10px] tracking-[0.25em] text-slate-600 mb-1">WRITING TASK {task.taskNum}</p>
              <p className="text-sm text-slate-700 mb-3">You should spend about <b>{task.durationMin} minutes</b> on this task. Write at least <b>{task.minWords}</b> words.</p>

              <div className="rounded-xl p-4 bg-white/70 border border-black/5 mb-4">
                <h3 className="font-bold text-slate-900 mb-2">{task.title}</h3>
                <p className="text-sm whitespace-pre-line leading-relaxed">{task.prompt}</p>
                {task.bullets && task.bullets.length > 0 && (
                  <>
                    <p className="mt-3 text-xs font-bold text-slate-700">In your letter:</p>
                    <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                      {task.bullets.map(b => <li key={b}>{b}</li>)}
                    </ul>
                  </>
                )}
                {task.hints && (
                  <ul className="mt-3 text-xs text-slate-600 list-disc list-inside space-y-0.5">
                    {task.hints.map(h => <li key={h}>{h}</li>)}
                  </ul>
                )}
              </div>
            </header>

            <textarea
              value={state.text}
              onChange={e => setState({ ...state, text: e.target.value })}
              disabled={state.submitted}
              placeholder={task.starter ?? 'Start writing here…'}
              className="flex-1 min-h-[220px] bg-transparent border-0 outline-none resize-none text-[15px] leading-7 px-2"
            />

            <div className="flex justify-end">
              <button onClick={submit}
                      disabled={state.loading || state.submitted || !state.text.trim()}
                      className="rounded-full px-7 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(180deg, #2c6cf2, #1f4dc7)',
                               boxShadow: '0 8px 22px rgba(44,108,242,0.4)' }}>
                {state.loading ? 'Grading…' : state.submitted ? 'Submitted ✓' : `Submit Task ${task.taskNum}`}
              </button>
            </div>
          </article>

          {/* Feedback */}
          <aside className="flex flex-col gap-3.5 overflow-auto pr-1">
            {state.result ? (
              <>
                <div className="glass-panel p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Overall Score</p>
                    <p className="text-4xl font-extrabold text-white">{state.result.score}%</p>
                    <p className="text-[11px] text-cosmic-mint mt-0.5">≈ Band {(4.5 + state.result.score / 100 * 4.5).toFixed(1)}</p>
                  </div>
                  <div className="flex gap-2">
                    <MetricRing value={state.result.accuracy} label="Accuracy" color="blue" />
                    <MetricRing value={state.result.fluency} label="Fluency" color="green" />
                    <MetricRing value={state.result.pronunciation} label="Style" color="green" />
                  </div>
                </div>

                {state.result.feedback.map((line, i) => (
                  <div key={i} className="glass-panel p-3.5">
                    <h5 className="text-xs font-bold text-cosmic-mint mb-1">AI Feedback #{i + 1}</h5>
                    <p className="text-[12.5px] text-slate-200 leading-relaxed">{line}</p>
                  </div>
                ))}
              </>
            ) : (
              <div className="glass-panel p-6 text-center text-slate-300/80">
                <p className="text-3xl mb-2">✍️</p>
                <p className="text-sm">Write your {task.taskNum === 1 ? 'letter' : 'essay'} on the left.</p>
                <p className="text-xs text-slate-400 mt-2">Hit <b>Submit Task {task.taskNum}</b> when done — Professor Linguo will grade your work using IELTS band descriptors.</p>
              </div>
            )}

            {!state.result && (
              <div className="glass-panel p-4">
                <p className="text-xs text-slate-400 mb-2">📝 Quick checklist</p>
                <ul className="text-[12px] text-slate-300 space-y-1">
                  <li>• {task.taskNum === 1 ? 'Address all three bullet points' : 'Take a clear position'}</li>
                  <li>• Use paragraphs (intro / body / conclusion)</li>
                  <li>• Mix simple and complex sentences</li>
                  <li>• Avoid repeating the same word — paraphrase</li>
                  <li>• Aim for at least <b>{task.minWords}</b> words</li>
                </ul>
              </div>
            )}
          </aside>
        </section>
      </AppShell>
    </>
  );
}

function fmt(s: number): string {
  const m = Math.floor(s / 60); const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}
