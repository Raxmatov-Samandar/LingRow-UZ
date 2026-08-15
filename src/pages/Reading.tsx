// =============================================================================
// Reading test page — driven by real Cambridge IELTS 18 GT Test 1 content by
// default, or a Cambridge-style PDF the dev has uploaded + parsed in
// /dev (Books tab). Layout follows the official format: passage on the left,
// questions on the right, section + part navigation, 60-min countdown,
// end-of-test scoring.
// =============================================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useActivity } from '@/store/activity';
import { useWordNotes } from '@/store/wordNotes';
import { learning } from '@/lib/api';
import type { CambridgeBook } from '@/types';
import { AnnotatedText } from '@/components/ui/AnnotatedText';
import {
  TEST, type ReadingTest, type ReadingSection, type ReadingPart,
  type ReadingQuestion, type QuestionKind,
} from '@/data/reading/cambridge18-test1';

const VALID_KINDS = new Set<QuestionKind>([
  'tfng', 'paragraph_match', 'note_completion', 'table_completion', 'heading_match', 'summary_completion', 'mcq',
]);

/**
 * Turns a dev-uploaded, heuristically-parsed Cambridge PDF into the same
 * shape Reading.tsx already renders. The parser is a best-effort text
 * extraction (see src/lib/pdfParser.ts) — it does NOT extract an answer key
 * (Cambridge books print those in a separate appendix this parser doesn't
 * read), so `answers` on parsed questions is almost always empty. Those
 * questions are rendered but excluded from auto-grading below instead of
 * being silently — and incorrectly — marked wrong.
 */
function devBookToReadingTest(book: CambridgeBook): ReadingTest {
  const sections: ReadingSection[] = book.parts.map((p, i) => ({
    num: (Math.min(i + 1, 3) as 1 | 2 | 3),
    title: `Section ${i + 1}`,
    parts: [{
      partNum: p.partNum,
      title: p.title,
      intro: p.intro,
      passage: p.passage || '(No passage text was extracted from this page range.)',
      questions: p.questions.map((q): ReadingQuestion => ({
        num: q.num,
        kind: VALID_KINDS.has(q.kind as QuestionKind) ? (q.kind as QuestionKind) : 'mcq',
        prompt: q.prompt,
        options: q.options,
        answers: q.answers ?? [],
      })),
    }],
  }));

  return {
    id: book.id,
    source: book.source || book.title,
    module: book.module === 'AC' ? 'AC' : 'GT',
    durationMin: 60,
    sections: sections.length > 0 ? sections : [{ num: 1, title: 'Section 1', parts: [{ partNum: 1, title: book.title, passage: '(Nothing was parsed from this PDF.)', questions: [] }] }],
  };
}

export function Reading() {
  const log = useActivity(s => s.log);
  const [searchParams] = useSearchParams();
  const [devBooks, setDevBooks] = useState<CambridgeBook[]>([]);

  useEffect(() => {
    learning.getCambridgeBooksList().then(books =>
      setDevBooks(books.filter(b => b.kind === 'cambridge_ielts' && b.parts.length > 0))
    );
  }, []);

  const availableTests = useMemo<ReadingTest[]>(
    () => [TEST, ...devBooks.map(devBookToReadingTest)],
    [devBooks]
  );

  const [testId, setTestId] = useState(searchParams.get('test') ?? TEST.id);
  const activeTest = availableTests.find(t => t.id === testId) ?? TEST;

  const [sectionIdx, setSectionIdx] = useState(0);
  const [partIdx,    setPartIdx]    = useState(0);
  const [answers,    setAnswers]    = useState<Record<number, string>>({});
  const [submitted,  setSubmitted]  = useState(false);
  const [timeLeft,   setTimeLeft]   = useState(activeTest.durationMin * 60);
  const [running,    setRunning]    = useState(false);                      // manual start
  const passageRef = useRef<HTMLDivElement>(null);

  function selectTest(id: string) {
    setTestId(id);
    setSectionIdx(0);
    setPartIdx(0);
    setAnswers({});
    setSubmitted(false);
    setRunning(false);
    const t = availableTests.find(x => x.id === id);
    setTimeLeft((t?.durationMin ?? 60) * 60);
  }

  const section = activeTest.sections[Math.min(sectionIdx, activeTest.sections.length - 1)];
  const part    = section.parts[Math.min(partIdx, section.parts.length - 1)];
  const hasQuestions = part.questions.length > 0;

  // ── Countdown — only when running ───────────────────────────────────────
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
    setTimeLeft(activeTest.durationMin * 60);
  }

  // log opening on mount
  useEffect(() => { log('reading_completed', { passage: activeTest.source }); }, [activeTest.id]); // eslint-disable-line

  // Reset scroll on section change
  useEffect(() => { passageRef.current?.scrollTo({ top: 0 }); }, [sectionIdx, partIdx]);

  // ── Score ──────────────────────────────────────────────────────────────
  // Questions with no extracted answer key (heuristic PDF parse) are shown
  // but excluded from grading — they'd otherwise always score as "wrong".
  const allQuestions = useMemo(
    () => activeTest.sections.flatMap(s => s.parts.flatMap(p => p.questions)),
    [activeTest]
  );
  const gradableQuestions = useMemo(() => allQuestions.filter(q => q.answers.length > 0), [allQuestions]);

  function isCorrect(q: ReadingQuestion, given: string): boolean | null {
    if (q.answers.length === 0) return null; // ungraded — no answer key available
    if (!given) return false;
    const norm = given.trim().toLowerCase();
    return q.answers.some(a => a.toLowerCase() === norm);
  }
  const correct = useMemo(
    () => gradableQuestions.filter(q => isCorrect(q, answers[q.num] ?? '') === true).length,
    [gradableQuestions, answers]
  );
  const total = gradableQuestions.length;
  const band  = bandFromScore(correct);

  function handleSubmit() {
    setSubmitted(true);
    log('quiz_submitted', { lesson: activeTest.id, score: total > 0 ? Math.round((correct / total) * 100) : 0, correct, total });
  }

  // ── UI ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle={activeTest.source} bannerSubtitle={`${activeTest.durationMin}-minute ${activeTest.module === 'AC' ? 'Academic' : 'General Training'} Reading practice`} />

        {/* Test selector — default Cambridge test + any dev-uploaded books */}
        {availableTests.length > 1 && (
          <div className="glass-panel px-4 py-2.5 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] tracking-[0.2em] text-slate-400">TEST</span>
            <select
              value={testId}
              onChange={e => selectTest(e.target.value)}
              className="input-glass text-xs py-1.5 px-2.5 w-auto"
            >
              {availableTests.map(t => (
                <option key={t.id} value={t.id}>{t.source}</option>
              ))}
            </select>
          </div>
        )}

        {/* Section / part navigator + timer */}
        <div className="glass-panel px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex gap-1.5">
            {activeTest.sections.map((s, i) => (
              <button key={i}
                      onClick={() => { setSectionIdx(i); setPartIdx(0); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition
                                  ${i === sectionIdx
                                    ? 'bg-cosmic-mint/15 border border-cosmic-mint/45 text-cosmic-mint'
                                    : 'border border-white/10 text-slate-300 hover:bg-white/[0.05]'}`}>
                Section {s.num}
              </button>
            ))}
          </div>

          {section.parts.length > 1 && (
            <>
              <span className="text-slate-600">·</span>
              <div className="flex gap-1.5">
                {section.parts.map((p, i) => (
                  <button key={i}
                          onClick={() => setPartIdx(i)}
                          className={`px-2.5 py-1 rounded-full text-[11px] transition
                                      ${i === partIdx
                                        ? 'bg-cosmic-sky/15 border border-cosmic-sky/45 text-cosmic-sky'
                                        : 'border border-white/8 text-slate-400 hover:bg-white/[0.05]'}`}>
                    Part {p.partNum}
                  </button>
                ))}
              </div>
            </>
          )}

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
              {running ? '❚❚ Pause' : timeLeft < activeTest.durationMin * 60 ? '▶ Resume' : '▶ Start'}
            </button>
            <button onClick={resetTimer}
                    disabled={timeLeft === activeTest.durationMin * 60 || submitted}
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
              {submitted ? (total > 0 ? `Band ${band.toFixed(1)} · ${correct}/${total}` : 'Submitted') : 'Submit'}
            </button>
          </div>
        </div>

        {/* Two-column passage / questions — PAPER STYLE for focus */}
        <section className="grid lg:grid-cols-2 grid-cols-1 gap-5 flex-1 min-h-0 lg:overflow-hidden overflow-y-auto">
          <article className="paper-panel overflow-auto" ref={passageRef}>
            <p className="text-[10px] tracking-[0.25em] text-slate-500 mb-1">{section.title}</p>
            {part.intro && <p className="text-xs text-slate-600 italic mb-4">{part.intro}</p>}
            <h2 className="text-xl font-bold text-slate-900 mb-1">{part.title}</h2>
            {part.subtitle && <p className="text-sm text-slate-700 italic mb-3">{part.subtitle}</p>}

            <div className="text-[14px] leading-7 text-slate-800">
              {Array.isArray(part.passage)
                ? part.passage.map(p => (
                    <div key={p.label} className="mb-4">
                      <p>
                        <span className="inline-block w-6 h-6 mr-2 rounded-md bg-slate-900/10 text-slate-900 text-center font-bold">{p.label}</span>
                        {p.title && <b className="text-slate-900">{p.title}</b>}
                      </p>
                      <div className="mt-1"><AnnotatedText>{p.text}</AnnotatedText></div>
                    </div>
                  ))
                : <AnnotatedText>{part.passage}</AnnotatedText>}
            </div>
            <NotesSummary />
          </article>

          <aside className="paper-panel overflow-auto flex flex-col gap-4">
            {hasQuestions ? (
              <>
                <p className="text-[10px] tracking-[0.25em] text-slate-500">
                  QUESTIONS {part.questions[0].num}–{part.questions[part.questions.length - 1].num}
                </p>
                {part.questions.map(q => (
                  <QuestionItem key={q.num} q={q}
                                value={answers[q.num] ?? ''}
                                onChange={(v) => setAnswers({ ...answers, [q.num]: v })}
                                submitted={submitted}
                                gradeState={submitted ? isCorrect(q, answers[q.num] ?? '') : null} />
                ))}
              </>
            ) : (
              <p className="text-sm text-slate-600 italic">No questions were parsed for this part — check the raw text in the Dev Panel and re-upload if needed.</p>
            )}

            {submitted && <ScoreSummary correct={correct} total={total} band={band} />}
          </aside>
        </section>
      </AppShell>
    </>
  );
}

// ───────────────────────── Question rendering ─────────────────────────

function QuestionItem({
  q, value, onChange, submitted, gradeState,
}: {
  q: ReadingQuestion;
  value: string;
  onChange: (v: string) => void;
  submitted: boolean;
  /** true = correct, false = incorrect, null = no answer key to grade against */
  gradeState: boolean | null;
}) {
  const ungraded = submitted && gradeState === null;
  const wrong = submitted && gradeState === false && value;
  const right = submitted && gradeState === true;

  return (
    <div className={`rounded-xl p-3.5 border transition
                     ${right ? 'border-emerald-500/60 bg-emerald-500/10'
                       : wrong ? 'border-rose-500/60 bg-rose-500/10'
                       : 'border-slate-300 bg-white/60'}`}>
      <p className="text-[13px] text-slate-800 mb-2 leading-snug">
        <b className="text-slate-900 mr-2">{q.num}.</b>
        {q.prompt}
      </p>

      {q.kind === 'tfng' && (
        <div className="flex gap-1.5 flex-wrap">
          {['True', 'False', 'Not Given'].map(opt => (
            <Choice key={opt} text={opt}
                    selected={value.toLowerCase() === opt.toLowerCase()}
                    onClick={() => onChange(opt)}
                    disabled={submitted} />
          ))}
        </div>
      )}

      {(q.kind === 'paragraph_match' || q.kind === 'mcq' || q.kind === 'heading_match') && q.options && (
        <div className={`flex gap-1.5 flex-wrap ${q.kind === 'mcq' ? 'flex-col' : ''}`}>
          {q.options.map((opt) => {
            const optLetter = opt.match(/^([A-Z]|i{1,3}|iv|v|vi{1,3}|ix|x)\b/)?.[1] ?? opt;
            const display = q.kind === 'mcq' ? opt : opt.length <= 3 ? opt : opt;
            return (
              <Choice key={opt}
                      text={display}
                      selected={value.toLowerCase() === optLetter.toLowerCase()}
                      onClick={() => onChange(optLetter)}
                      disabled={submitted}
                      wide={q.kind === 'mcq'} />
            );
          })}
        </div>
      )}

      {(q.kind === 'note_completion' || q.kind === 'table_completion' || q.kind === 'summary_completion') && (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={submitted}
          placeholder={`Type answer (${q.wordLimit ? `≤ ${q.wordLimit} word${q.wordLimit > 1 ? 's' : ''}` : ''})`}
          className="paper-input"
        />
      )}

      {ungraded && (
        <p className="text-[11px] text-slate-500 mt-2 italic">Not auto-graded — no answer key was extracted for this question.</p>
      )}
      {wrong && (
        <p className="text-[11px] text-rose-700 mt-2">
          Correct: <b>{q.answers.join(' / ')}</b>
        </p>
      )}
    </div>
  );
}

// ───────────────────────── Saved word notes summary ─────────────────────────

function NotesSummary() {
  const notes = useWordNotes(s => s.notes);
  const remove = useWordNotes(s => s.remove);
  const list = Object.values(notes);
  if (list.length === 0) return null;

  return (
    <details className="mt-6 border-t border-slate-300 pt-4">
      <summary className="text-[11px] uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-700">
        📒 Your saved words ({list.length})
      </summary>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {list.map(n => (
          <div key={n.word}
               className="rounded-lg p-2.5 bg-amber-50 border border-amber-200 text-[12px] flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 lowercase">{n.word}</p>
              {n.translation && <p className="text-slate-700">{n.translation}</p>}
              {n.note && <p className="text-slate-500 italic mt-0.5">— {n.note}</p>}
            </div>
            <button onClick={() => remove(n.word)}
                    className="text-slate-400 hover:text-rose-600 leading-none text-base"
                    title="Delete">×</button>
          </div>
        ))}
      </div>
    </details>
  );
}

function Choice({
  text, selected, onClick, disabled, wide,
}: { text: string; selected: boolean; onClick(): void; disabled: boolean; wide?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
            className={`text-left rounded-lg px-3 py-1.5 text-[12px] transition
                        ${wide ? 'w-full' : ''}
                        ${selected
                          ? 'bg-blue-600 border border-blue-700 text-white'
                          : 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-100'}
                        disabled:opacity-80 disabled:cursor-default`}>
      {text}
    </button>
  );
}

function ScoreSummary({ correct, total, band }: { correct: number; total: number; band: number }) {
  return (
    <div className="rounded-2xl p-4 border-2 border-emerald-500/50 bg-emerald-500/10 mt-2">
      <p className="text-sm font-bold text-emerald-700 mb-1">Test complete</p>
      {total > 0 ? (
        <p className="text-[13px] text-slate-800">
          Overall: <b className="text-slate-900">{correct}/{total}</b> · estimated band <b className="text-slate-900">{band.toFixed(1)}</b>
        </p>
      ) : (
        <p className="text-[13px] text-slate-800">No auto-gradable questions in this test — answer key wasn't available.</p>
      )}
    </div>
  );
}

// ───────────────────────── helpers ─────────────────────────

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Cambridge GT Reading band conversion (rough approximation of public chart). */
function bandFromScore(correct: number): number {
  if (correct >= 40) return 9.0;
  if (correct >= 39) return 8.5;
  if (correct >= 37) return 8.0;
  if (correct >= 36) return 7.5;
  if (correct >= 34) return 7.0;
  if (correct >= 32) return 6.5;
  if (correct >= 30) return 6.0;
  if (correct >= 27) return 5.5;
  if (correct >= 23) return 5.0;
  if (correct >= 19) return 4.5;
  if (correct >= 15) return 4.0;
  if (correct >= 12) return 3.5;
  return 3.0;
}
