// =============================================================================
// Speaking test page — full IELTS format with three parts.
//   Part 1 (4-5 min): Personal interview, multiple topics
//   Part 2 (3-4 min): 1-min prep + 2-min monologue from a cue card
//   Part 3 (4-5 min): Discussion related to Part 2 topic
// AI feedback per part via /functions/v1/grade-speaking (mock fallback).
// =============================================================================
import { useEffect, useRef, useState } from 'react';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { MetricRing } from '@/components/ui/MetricRing';
import { learning } from '@/lib/api';
import { useActivity } from '@/store/activity';
import { SPEAKING_TEST } from '@/data/speaking/test1';

type Part = 1 | 2 | 3;

interface PartFeedback {
  accuracy: number; fluency: number; pronunciation: number;
  tip: string; transcript?: string;
}

export function Speaking() {
  const log = useActivity(s => s.log);

  const [part, setPart] = useState<Part>(1);
  const [feedback, setFeedback] = useState<Record<Part, PartFeedback | null>>({ 1: null, 2: null, 3: null });
  const [loading,  setLoading]  = useState(false);

  async function submitPart(target: string) {
    setLoading(true);
    const fake = new Blob([], { type: 'audio/webm' });
    const r = await learning.gradeSpeaking(fake, target);
    const band = +((r.accuracy + r.fluency + r.pronunciation) / 300 * 9).toFixed(1);
    log('speaking_practiced', { part, band, ...r });
    setFeedback(prev => ({ ...prev, [part]: r }));
    setLoading(false);
  }

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle={SPEAKING_TEST.source} bannerSubtitle={`${SPEAKING_TEST.durationMin[0]}–${SPEAKING_TEST.durationMin[1]} minutes · 3 parts`} />

        {/* Part nav */}
        <div className="glass-panel px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex gap-1.5">
            {([1, 2, 3] as Part[]).map(p => (
              <button key={p} onClick={() => setPart(p)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition
                                  ${p === part
                                    ? 'bg-cosmic-mint/15 border border-cosmic-mint/45 text-cosmic-mint'
                                    : 'border border-white/10 text-slate-300 hover:bg-white/[0.05]'}`}>
                Part {p} {feedback[p] && '✓'}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-slate-400">
            {part === 1 && 'Introduction & familiar topics · ~4–5 min'}
            {part === 2 && 'Cue-card monologue · 1 min prep + 2 min talk'}
            {part === 3 && 'Discussion · ~4–5 min'}
          </span>
        </div>

        <section className="grid lg:grid-cols-[1fr_360px] grid-cols-1 gap-3 lg:gap-5 flex-1 min-h-0 lg:overflow-hidden overflow-y-auto">
          <div className="glass-panel p-6 overflow-auto">
            {part === 1 && <Part1 onPractice={submitPart} loading={loading} feedback={feedback[1]} />}
            {part === 2 && <Part2 onPractice={submitPart} loading={loading} feedback={feedback[2]} />}
            {part === 3 && <Part3 onPractice={submitPart} loading={loading} feedback={feedback[3]} />}
          </div>

          <aside className="glass-panel p-5 flex flex-col gap-4 overflow-auto">
            <header>
              <p className="text-[10px] tracking-[0.25em] text-slate-400 mb-1">AI ASSESSMENT</p>
              <p className="text-sm text-slate-300">Part {part} feedback from Professor Linguo</p>
            </header>

            {feedback[part] ? <FeedbackCard fb={feedback[part]!} /> : <Placeholder />}

            <div className="glass-soft rounded-2xl p-3 text-[11px] text-slate-400 mt-auto">
              💡 In the real exam, the examiner records your answers. Here, "Hold to Speak" simulates a 30-second take. The AI grades your delivery + word choice. With Anthropic API keys set up, you'll get live, personalised feedback.
            </div>
          </aside>
        </section>
      </AppShell>
    </>
  );
}

// ───────────────────────── Part 1 ─────────────────────────

function Part1({ onPractice, loading, feedback }: { onPractice(target: string): void; loading: boolean; feedback: PartFeedback | null }) {
  const [topicIdx, setTopicIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const topic = SPEAKING_TEST.part1[topicIdx];
  const question = topic.questions[qIdx];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap gap-1.5">
        {SPEAKING_TEST.part1.map((t, i) => (
          <button key={t.topic} onClick={() => { setTopicIdx(i); setQIdx(0); }}
                  className={`px-3 py-1.5 rounded-full text-[11px] transition
                              ${i === topicIdx
                                ? 'bg-cosmic-sky/15 border border-cosmic-sky/45 text-cosmic-sky'
                                : 'border border-white/10 text-slate-300 hover:bg-white/[0.05]'}`}>
            {t.topic}
          </button>
        ))}
      </div>

      <div className="glass-soft rounded-2xl p-6 flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-[10px] tracking-[0.25em] text-slate-400 mb-2">QUESTION {qIdx + 1} / {topic.questions.length}</p>
        <p className="text-2xl text-white font-bold leading-snug max-w-xl">{question}</p>

        <div className="flex gap-2 mt-6">
          <button onClick={() => setQIdx(i => Math.max(0, i - 1))} disabled={qIdx === 0}
                  className="btn-ghost disabled:opacity-40">← Prev</button>
          <HoldToSpeak onPractice={() => onPractice(question)} loading={loading} feedback={feedback} />
          <button onClick={() => setQIdx(i => Math.min(topic.questions.length - 1, i + 1))}
                  disabled={qIdx === topic.questions.length - 1}
                  className="btn-ghost disabled:opacity-40">Next →</button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Part 2 ─────────────────────────

function Part2({ onPractice, loading, feedback }: { onPractice(target: string): void; loading: boolean; feedback: PartFeedback | null }) {
  const p2 = SPEAKING_TEST.part2;
  const [phase, setPhase] = useState<'idle' | 'prep' | 'speak' | 'done'>('idle');
  const [seconds, setSeconds] = useState(p2.prepSec);

  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return;
    const id = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          if (phase === 'prep') { setPhase('speak'); return p2.speakSec; }
          setPhase('done');
          onPractice(p2.cueCard);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]); // eslint-disable-line

  function start() { setPhase('prep'); setSeconds(p2.prepSec); }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="rounded-2xl p-5 border-2 border-dashed border-cosmic-mint/40 bg-cosmic-mint/[0.04]">
        <p className="text-[10px] tracking-[0.25em] text-cosmic-mint mb-2">CUE CARD</p>
        <p className="text-xl font-bold text-white">{p2.cueCard}</p>
        <p className="mt-3 text-sm text-slate-300">You should say:</p>
        <ul className="mt-1 list-disc list-inside text-sm text-slate-200 space-y-0.5">
          {p2.bullets.map(b => <li key={b}>{b}</li>)}
        </ul>
        <p className="mt-2 text-sm text-slate-300">{p2.closing}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {phase === 'idle' && (
          <>
            <p className="text-slate-300 mb-4">You'll have <b>1 minute</b> to prepare, then <b>1–2 minutes</b> to speak.</p>
            <button className="btn-mint" onClick={start}>Start Part 2</button>
          </>
        )}
        {phase === 'prep' && (
          <>
            <p className="text-[10px] tracking-[0.25em] text-cosmic-sky mb-1">PREPARATION</p>
            <p className="text-6xl font-extrabold text-white tabular-nums">{seconds}</p>
            <p className="text-sm text-slate-400 mt-2">Take notes, plan the structure. Stay calm.</p>
          </>
        )}
        {phase === 'speak' && (
          <>
            <p className="text-[10px] tracking-[0.25em] text-cosmic-mint mb-1">SPEAK NOW</p>
            <p className="text-6xl font-extrabold text-cosmic-mint tabular-nums">{seconds}</p>
            <p className="text-sm text-slate-400 mt-2">Talk continuously, cover every bullet.</p>
            <button className="btn-ghost mt-4" onClick={() => { setPhase('done'); onPractice(p2.cueCard); }}>Finish early</button>
          </>
        )}
        {phase === 'done' && (
          <>
            <p className="text-3xl mb-2">🎤</p>
            <p className="text-white font-bold">Recording {loading ? 'sent for analysis…' : 'analysed.'}</p>
            {feedback && <p className="mt-2 text-sm text-slate-300">"{feedback.tip}"</p>}
            <button className="btn-ghost mt-4" onClick={() => { setPhase('idle'); setSeconds(p2.prepSec); }}>Try again</button>
          </>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── Part 3 ─────────────────────────

function Part3({ onPractice, loading, feedback }: { onPractice(target: string): void; loading: boolean; feedback: PartFeedback | null }) {
  const [qIdx, setQIdx] = useState(0);
  const p3 = SPEAKING_TEST.part3;
  const q = p3.questions[qIdx];
  return (
    <div className="flex flex-col gap-4 h-full">
      <p className="text-[10px] tracking-[0.25em] text-slate-400">DISCUSSION · {p3.theme}</p>
      <div className="glass-soft rounded-2xl p-6 flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-[10px] tracking-[0.25em] text-slate-400 mb-2">QUESTION {qIdx + 1} / {p3.questions.length}</p>
        <p className="text-xl text-white font-semibold leading-snug max-w-xl">{q}</p>

        <div className="flex gap-2 mt-6 flex-wrap justify-center">
          <button onClick={() => setQIdx(i => Math.max(0, i - 1))} disabled={qIdx === 0}
                  className="btn-ghost disabled:opacity-40">← Prev</button>
          <HoldToSpeak onPractice={() => onPractice(q)} loading={loading} feedback={feedback} />
          <button onClick={() => setQIdx(i => Math.min(p3.questions.length - 1, i + 1))} disabled={qIdx === p3.questions.length - 1}
                  className="btn-ghost disabled:opacity-40">Next →</button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Hold-to-speak orb ─────────────────────────

function HoldToSpeak({ onPractice, loading }: { onPractice(): void; loading: boolean; feedback: PartFeedback | null }) {
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<number | null>(null);
  function start() {
    setHolding(true);
    timerRef.current = window.setTimeout(() => { stop(); }, 30_000);
  }
  function stop() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHolding(false);
    onPractice();
  }
  return (
    <button
      onMouseDown={start} onMouseUp={stop} onMouseLeave={() => holding && stop()}
      onTouchStart={start} onTouchEnd={stop}
      disabled={loading}
      className={`relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-white font-bold border transition
                  ${holding ? 'border-cosmic-mint bg-cosmic-mint/20 scale-105' : 'border-cosmic-mint/50'}
                  shadow-[0_0_20px_rgba(126,247,211,0.3),inset_0_1px_0_rgba(255,255,255,0.18)]
                  hover:shadow-[0_0_30px_rgba(126,247,211,0.5)]`}
      style={{ background: 'linear-gradient(135deg, rgba(20,30,60,0.7), rgba(15,25,50,0.5))' }}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/>
      </svg>
      {loading ? 'Analysing…' : holding ? 'Recording…' : 'Hold to Speak'}
    </button>
  );
}

// ───────────────────────── Feedback card ─────────────────────────

function FeedbackCard({ fb }: { fb: PartFeedback }) {
  const band = +((fb.accuracy + fb.fluency + fb.pronunciation) / 300 * 9).toFixed(1);
  return (
    <>
      <div className="rounded-2xl p-4 border border-cosmic-mint/40 bg-cosmic-mint/10">
        <p className="text-xs text-slate-300/80">Estimated band</p>
        <p className="text-3xl font-extrabold text-white">{band.toFixed(1)}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <MetricRing value={fb.accuracy} label="Accuracy" color="blue" />
        <MetricRing value={fb.fluency} label="Fluency" color="green" />
        <MetricRing value={fb.pronunciation} label="Pronunciation" color="green" />
      </div>
      <div className="glass-soft rounded-2xl p-3 text-sm text-slate-200">
        <p className="font-bold text-white mb-1">Tip</p>
        {fb.tip}
      </div>
    </>
  );
}

function Placeholder() {
  return (
    <div className="rounded-2xl p-6 text-center text-slate-300/70 border border-white/8 bg-white/[0.03]">
      <p className="text-3xl mb-2">🎤</p>
      <p className="text-sm">Tap <b>Hold to Speak</b> to record up to 30 seconds.</p>
      <p className="text-xs text-slate-400 mt-2">Linguo will give per-axis scores and a coaching tip.</p>
    </div>
  );
}
