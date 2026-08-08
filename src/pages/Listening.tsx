// =============================================================================
// Listening test page — Cambridge IELTS 18 GT Test 1.
// Layout: audio player on top, scenario + group title, then question form.
// 4 parts × 10 questions, 40 total. ~30 min audio + 10 min transfer in real test.
// =============================================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useActivity } from '@/store/activity';
import { learning } from '@/lib/api';
import { LIST_TEST, type ListeningQuestion, type ListeningPart } from '@/data/listening/cambridge18-test1';

export function Listening() {
  const log = useActivity(s => s.log);

  const [partIdx,   setPartIdx]   = useState(0);
  const [answers,   setAnswers]   = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(LIST_TEST.durationMin * 60);
  const [running,   setRunning]   = useState(false);                  // manual start
  const [audioMap,  setAudioMap]  = useState<Record<string, string>>({});

  useEffect(() => { learning.getListeningAudioMap().then(setAudioMap); }, []);

  const part = LIST_TEST.parts[partIdx];
  // part.audioSrc is like 'audio/c18-t1-p1.mp3' — the slot key the Dev Panel
  // audio uploader asks for is the basename without extension. Prefer a
  // Supabase-hosted upload for that slot; fall back to the static
  // /public/audio/... path (works pre-upload / in mock mode).
  const partSlot = part.audioSrc?.split('/').pop()?.replace(/\.mp3$/i, '') ?? '';
  const partAudioUploaded = !!audioMap[partSlot];
  const partAudioSrc = audioMap[partSlot] ?? (part.audioSrc ? `/${part.audioSrc}` : undefined);

  // Countdown — only when running
  useEffect(() => {
    if (!running || submitted) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setRunning(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, submitted]);
  useEffect(() => { if (timeLeft === 0 && !submitted) handleSubmit(); }, [timeLeft]); // eslint-disable-line

  function resetTimer() {
    setRunning(false);
    setTimeLeft(LIST_TEST.durationMin * 60);
  }

  const allQuestions = useMemo(() => LIST_TEST.parts.flatMap(p => p.questions), []);
  function isCorrect(q: ListeningQuestion, given: string) {
    if (!given) return false;
    const norm = given.trim().toLowerCase();
    return q.answers.some(a => a.toLowerCase() === norm);
  }
  const correct = useMemo(
    () => allQuestions.filter(q => isCorrect(q, answers[q.num] ?? '')).length,
    [allQuestions, answers]
  );
  const total = allQuestions.length;
  const band  = bandFromScore(correct);

  function handleSubmit() {
    setSubmitted(true);
    log('quiz_submitted', { lesson: 'cambridge-18-listening-test1', score: Math.round((correct / total) * 100), correct, total });
  }

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle={LIST_TEST.source} bannerSubtitle="Approx. 30 minutes · 4 parts · 40 questions" />

        {/* Part nav + timer */}
        <div className="glass-panel px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex gap-1.5">
            {LIST_TEST.parts.map((p, i) => (
              <button key={p.partNum}
                      onClick={() => setPartIdx(i)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition
                                  ${i === partIdx
                                    ? 'bg-cosmic-mint/15 border border-cosmic-mint/45 text-cosmic-mint'
                                    : 'border border-white/10 text-slate-300 hover:bg-white/[0.05]'}`}>
                Part {p.partNum}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className={`text-xs font-mono tabular-nums ${timeLeft < 300 ? 'text-rose-300' : 'text-slate-300'}`}>
              ⏱ {fmt(timeLeft)}
            </span>

            <button
              onClick={() => setRunning(r => !r)}
              disabled={timeLeft === 0 || submitted}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition disabled:opacity-50
                          ${running
                            ? 'bg-rose-400/15 border border-rose-400/45 text-rose-300 hover:bg-rose-400/25'
                            : 'bg-cosmic-mint/15 border border-cosmic-mint/45 text-cosmic-mint hover:bg-cosmic-mint/25'}`}
              title={running ? 'Pause timer' : 'Start timer'}>
              {running ? '❚❚ Pause' : timeLeft < LIST_TEST.durationMin * 60 ? '▶ Resume' : '▶ Start'}
            </button>
            <button onClick={resetTimer}
                    disabled={timeLeft === LIST_TEST.durationMin * 60 || submitted}
                    title="Reset timer"
                    className="px-2.5 py-1 rounded-full text-[11px] border border-white/10 text-slate-400 hover:bg-white/[0.05] disabled:opacity-40">
              ↻
            </button>

            <span className="text-xs text-slate-400 ml-2">
              Answered: <b className="text-white">{Object.keys(answers).length}</b>/{total}
            </span>
            <button onClick={handleSubmit}
                    disabled={submitted}
                    className="btn-primary text-xs px-4 py-1.5 disabled:opacity-50">
              {submitted ? `Band ${band.toFixed(1)} · ${correct}/${total}` : 'Submit'}
            </button>
          </div>
        </div>

        {/* Audio + Questions — PAPER STYLE */}
        <section className="grid lg:grid-cols-[1.05fr_1fr] grid-cols-1 gap-3 lg:gap-5 flex-1 min-h-0 lg:overflow-hidden overflow-y-auto">
          <div className="paper-panel flex flex-col gap-5 overflow-auto">
            <header>
              <p className="text-[10px] tracking-[0.25em] text-slate-500 mb-1">{part.title}</p>
              <h2 className="text-xl font-bold text-slate-900">{part.groupTitle}</h2>
              {part.scenario && <p className="text-sm text-slate-700 italic mt-1">{part.scenario}</p>}
            </header>

            <AudioPlayer src={partAudioSrc} label={`Part ${part.partNum} audio`} />

            {part.intro && (
              <div className="rounded-xl px-4 py-3 bg-white/70 border border-slate-300 text-[13px] text-slate-800 leading-relaxed">
                {part.intro}
              </div>
            )}

            <div className="text-[12px] text-slate-600 leading-6">
              <p className="mb-1"><b className="text-slate-800">Tip:</b> press play, then answer in real-time. Pause if you need a moment.</p>
              <p>
                {partAudioUploaded
                  ? 'Audio uploaded via Dev Panel.'
                  : <>No audio uploaded for this part yet (Dev Panel → Audio → slot <code className="text-blue-700 bg-white/60 px-1 rounded">{partSlot}</code>). The player will be silent — answers are still graded.</>}
              </p>
            </div>
          </div>

          <aside className="paper-panel overflow-auto flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.25em] text-slate-500">
              QUESTIONS {part.questions[0].num}–{part.questions[part.questions.length - 1].num}
            </p>
            {part.questions.map(q => (
              <QItem key={q.num} q={q}
                     value={answers[q.num] ?? ''}
                     onChange={(v) => setAnswers({ ...answers, [q.num]: v })}
                     submitted={submitted}
                     correct={submitted && isCorrect(q, answers[q.num] ?? '')} />
            ))}

            {submitted && <ScoreBox part={part} correct={correct} total={total} band={band} answers={answers} />}
          </aside>
        </section>
      </AppShell>
    </>
  );
}

// ───────────────────────── Audio player ─────────────────────────

function AudioPlayer({ src, label }: { src?: string; label: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time,    setTime]    = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded,  setLoaded]  = useState(false);
  const [err,     setErr]     = useState<string | null>(null);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    setPlaying(false); setTime(0); setDuration(0); setLoaded(false); setErr(null);
    const onLoaded = () => { setDuration(a.duration); setLoaded(true); setErr(null); };
    const onTime   = () => setTime(a.currentTime);
    const onPlay   = () => setPlaying(true);
    const onPause  = () => setPlaying(false);
    const onError  = () => setErr('Audio file not found. Upload it via Dev Panel → Audio.');
    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('timeupdate',     onTime);
    a.addEventListener('play',           onPlay);
    a.addEventListener('pause',          onPause);
    a.addEventListener('error',          onError);
    return () => {
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('timeupdate',     onTime);
      a.removeEventListener('play',           onPlay);
      a.removeEventListener('pause',          onPause);
      a.removeEventListener('error',          onError);
    };
  }, [src]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => setErr('Browser blocked autoplay or file missing.'));
    else          a.pause();
  }
  function seek(pct: number) {
    const a = audioRef.current;
    if (!a || !duration) return;
    a.currentTime = duration * pct;
  }

  return (
    <div className="rounded-2xl p-4 bg-white/70 border border-slate-300">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-3">
        <button onClick={toggle}
                className="w-12 h-12 rounded-full grid place-items-center bg-blue-600 shadow-[0_4px_14px_rgba(37,99,235,0.4)] text-white">
          {playing
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between text-[10px] text-slate-600 mb-1">
            <span>{label}</span>
            <span className="font-mono tabular-nums">{fmt(Math.floor(time))} / {duration ? fmt(Math.floor(duration)) : '--:--'}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-300 cursor-pointer relative"
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 seek((e.clientX - rect.left) / rect.width);
               }}>
            <div className="h-full rounded-full bg-blue-600"
                 style={{ width: duration ? `${(time / duration) * 100}%` : '0%' }} />
          </div>
        </div>
      </div>
      {!loaded && err && (
        <p className="mt-2 text-[11px] text-rose-700">⚠ {err}</p>
      )}
    </div>
  );
}

// ───────────────────────── Question item ─────────────────────────

function QItem({
  q, value, onChange, submitted, correct,
}: { q: ListeningQuestion; value: string; onChange(v: string): void; submitted: boolean; correct: boolean }) {
  const wrong = submitted && value && !correct;
  const right = submitted && correct;
  return (
    <div className={`rounded-xl p-3 border transition
                     ${right ? 'border-emerald-500/60 bg-emerald-500/10'
                       : wrong ? 'border-rose-500/60 bg-rose-500/10'
                       : 'border-slate-300 bg-white/60'}`}>
      <p className="text-[12.5px] text-slate-800 mb-2">
        <b className="text-slate-900 mr-2">{q.num}.</b>{q.prompt}
      </p>

      {q.kind === 'fill_in' && (
        <input value={value} onChange={e => onChange(e.target.value)} disabled={submitted}
               placeholder={q.wordLimit ? `≤ ${q.wordLimit} word${q.wordLimit > 1 ? 's' : ''}` : 'answer'}
               className="paper-input" />
      )}

      {(q.kind === 'mcq' || q.kind === 'matching') && q.options && (
        <div className={`flex gap-1.5 ${q.kind === 'mcq' ? 'flex-col' : 'flex-wrap'}`}>
          {q.options.map(opt => {
            const letter = opt.match(/^([A-Z])\b/)?.[1] ?? opt[0];
            return (
              <button key={opt} disabled={submitted}
                      onClick={() => onChange(letter)}
                      className={`text-left rounded-lg px-3 py-1.5 text-[12px] transition
                                  ${q.kind === 'mcq' ? 'w-full' : ''}
                                  ${value.toUpperCase() === letter
                                    ? 'bg-blue-600 border border-blue-700 text-white'
                                    : 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-100'}`}>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {q.kind === 'pick_two' && q.options && (
        <PickTwo options={q.options} value={value} onChange={onChange} disabled={submitted} />
      )}

      {submitted && !correct && (
        <p className="text-[11px] text-rose-700 mt-2">Correct: <b>{q.answers.join(' / ')}</b></p>
      )}
    </div>
  );
}

function PickTwo({ options, value, onChange, disabled }: { options: string[]; value: string; onChange(v: string): void; disabled: boolean }) {
  const picked = new Set(value.split(',').map(s => s.trim()).filter(Boolean));
  function toggle(letter: string) {
    if (disabled) return;
    if (picked.has(letter))      picked.delete(letter);
    else if (picked.size < 2)    picked.add(letter);
    else { picked.clear(); picked.add(letter); }
    onChange(Array.from(picked).join(','));
  }
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(opt => {
        const letter = opt.match(/^([A-Z])\b/)?.[1] ?? opt[0];
        return (
          <button key={opt} disabled={disabled}
                  onClick={() => toggle(letter)}
                  className={`rounded-lg px-3 py-1.5 text-[12px] transition
                              ${picked.has(letter)
                                ? 'bg-blue-600 border border-blue-700 text-white'
                                : 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-100'}`}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ───────────────────────── Score box ─────────────────────────

function ScoreBox({ part, correct, total, band, answers }: { part: ListeningPart; correct: number; total: number; band: number; answers: Record<number, string> }) {
  const partRight = part.questions.filter(q =>
    q.answers.some(a => a.toLowerCase() === (answers[q.num] ?? '').toLowerCase())).length;
  return (
    <div className="rounded-2xl p-4 border-2 border-emerald-500/50 bg-emerald-500/10 mt-1">
      <p className="text-sm font-bold text-emerald-700 mb-1">Test complete</p>
      <p className="text-[13px] text-slate-800">Overall: <b className="text-slate-900">{correct}/{total}</b> · band <b className="text-slate-900">{band.toFixed(1)}</b></p>
      <p className="text-[11px] text-slate-600 mt-1">This part: {partRight}/{part.questions.length}</p>
    </div>
  );
}

function fmt(s: number): string {
  const m = Math.floor(s / 60); const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

/** Cambridge GT Listening band conversion (rough). */
function bandFromScore(c: number): number {
  if (c >= 39) return 9.0;
  if (c >= 37) return 8.5;
  if (c >= 35) return 8.0;
  if (c >= 32) return 7.5;
  if (c >= 30) return 7.0;
  if (c >= 26) return 6.5;
  if (c >= 23) return 6.0;
  if (c >= 18) return 5.5;
  if (c >= 16) return 5.0;
  if (c >= 12) return 4.5;
  return 4.0;
}
