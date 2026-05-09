import { useEffect, useMemo, useRef, useState } from 'react';
import { Cosmos }   from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar }   from '@/components/layout/Topbar';
import { tutor }    from '@/lib/api';
import { useTutor, type TutorSection } from '@/store/tutor';
import { useActivity, computeWeeklyStats, summaryForAi as buildSummary } from '@/store/activity';

const SECTIONS: { id: TutorSection; label: string; emoji: string }[] = [
  { id: 'general',   label: 'General',   emoji: '✨' },
  { id: 'listening', label: 'Listening', emoji: '🎧' },
  { id: 'reading',   label: 'Reading',   emoji: '📖' },
  { id: 'writing',   label: 'Writing',   emoji: '✍️' },
  { id: 'speaking',  label: 'Speaking',  emoji: '🎤' },
];

const QUICK_PROMPTS: Record<TutorSection, string[]> = {
  general:   ['What\'s my realistic Band target in 3 months?', 'Build me a weekly study plan', 'Why am I stuck at Band 5.5?'],
  listening: ['Help me with Section 4 paraphrase traps', 'How do I stop missing the first answer?', 'Map labelling tips'],
  reading:   ['True / False / Not Given strategy', 'How to skim 2,800 words in 60 minutes', 'Matching headings drill'],
  writing:   ['Grade my Task 2 essay', 'Improve my introduction paragraph', 'Show me a Band 9 model intro'],
  speaking:  ['Give me a Part 2 cue card', 'Examiner mode — Part 1 about hometown', 'Why is my fluency 6 not 7?'],
};

export function AiTutor() {
  const { messages, section, isThinking, setSection, addMessage, setThinking, reset } = useTutor();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const events      = useActivity(s => s.events);
  const logActivity = useActivity(s => s.log);
  const stats       = useMemo(() => computeWeeklyStats(events), [events]);

  // Greet on first visit
  useEffect(() => {
    if (messages.length === 0) {
      // Personalised opener if we already have activity data
      const hasActivity =
        stats.lessonsDone + stats.vocabReviewed + stats.quizzesTaken +
        stats.writingsGraded + stats.speakingsPractised > 0;

      const greeting = hasActivity
        ? `G'day! 👋 I'm **Professor Linguo** — and I've already peeked at your activity. *Tut-tut, no privacy in this classroom.* 😏\n\n` +
          `**This week so far:** ${stats.lessonsDone} lessons, ${stats.vocabReviewed} vocab reviews, ${stats.quizzesTaken} quizzes` +
          (stats.avgQuizScore != null ? ` (avg **${stats.avgQuizScore}%**)` : '') +
          (stats.bestBand != null ? `, best estimated band **${stats.bestBand.toFixed(1)}**` : '') + `.\n\n` +
          `Want me to **diagnose your weakest area**, **build a 7-day plan**, or just **chat**? Pick a quick prompt on the left or ask me anything.`
        : `G'day! I'm **Professor Linguo** — your IELTS coach. 👋\n\n` +
          `I scored Band 9.0 across all four sections (yes, it's annoying, I know).\n\n` +
          `Pick a section above, paste an essay, ask why your last test went sideways, or just say *"surprise me"*. We'll get you to that target band.\n\n` +
          `What are we working on today?`;

      addMessage({ role: 'assistant', content: greeting });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One-shot prompt from FloatingTutor popover
  useEffect(() => {
    const shot = sessionStorage.getItem('lr-tutor-shot');
    if (shot) {
      sessionStorage.removeItem('lr-tutor-shot');
      // Tiny delay so the greeting renders first
      setTimeout(() => send(shot), 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;
    addMessage({ role: 'user', content: trimmed });
    logActivity('tutor_message', { len: trimmed.length });
    setInput('');
    setThinking(true);
    try {
      // Inject the latest activity summary as a hidden system-style message so
      // Prof. Linguo can give personalised, data-aware advice.
      const summary = buildSummary(useActivity.getState().events);
      const contextMsg = { role: 'user' as const,
        content: `[CONTEXT — not visible to the learner]\n${summary}\n\nUse this when relevant; otherwise ignore.` };

      const history = [contextMsg, ...useTutor.getState().messages]
        .map(m => ({ role: m.role, content: m.content }));

      const res = await tutor.chat(history, section === 'general' ? undefined : section);
      addMessage({ role: 'assistant', content: res.reply });
    } catch (e) {
      addMessage({ role: 'assistant', content: `Hmm, I lost my train of thought (${(e as Error).message}). Try again in a moment.` });
    } finally {
      setThinking(false);
    }
  }

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle="Professor Linguo" bannerSubtitle="Your AI IELTS coach — Band 9.0, all 4 sections" />

        <section className="flex-1 grid grid-cols-[280px_1fr] gap-5 min-h-0 overflow-hidden">
          {/* Left rail — sections + quick prompts */}
          <aside className="glass-panel p-4 flex flex-col gap-3 overflow-auto">
            <p className="text-[11px] tracking-[0.2em] text-slate-400 px-1">SECTION</p>
            <div className="flex flex-col gap-1.5">
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => setSection(s.id)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition
                                    ${section === s.id
                                      ? 'bg-cosmic-mint/15 border border-cosmic-mint/40 text-cosmic-mint'
                                      : 'border border-white/5 text-slate-300 hover:bg-white/[0.04]'}`}>
                  <span className="text-base">{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>

            <p className="text-[11px] tracking-[0.2em] text-slate-400 px-1 mt-2">QUICK PROMPTS</p>
            <div className="flex flex-col gap-1.5">
              {QUICK_PROMPTS[section].map(q => (
                <button key={q} onClick={() => send(q)}
                        className="text-left text-xs text-slate-300 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] hover:text-white transition">
                  {q}
                </button>
              ))}
            </div>

            <button onClick={reset}
                    className="mt-auto text-xs text-slate-400 hover:text-rose-300 transition">
              ↻ Clear conversation
            </button>
          </aside>

          {/* Chat column */}
          <div className="glass-panel flex flex-col min-h-0 overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-auto p-6 flex flex-col gap-4">
              {messages.map(m => <Bubble key={m.id} role={m.role} content={m.content} />)}
              {isThinking && <Thinking />}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="border-t border-white/8 p-4 bg-black/15"
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
                  }}
                  rows={2}
                  placeholder={`Ask Prof. Linguo about ${section === 'general' ? 'IELTS' : section}…  (Enter to send · Shift+Enter for newline)`}
                  className="flex-1 resize-none bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-cosmic-mint/50 focus:ring-2 focus:ring-cosmic-mint/20"
                />
                <button type="submit"
                        disabled={!input.trim() || isThinking}
                        className="btn-mint h-12 px-6 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
                  {isThinking ? '…' : 'Send →'}
                </button>
              </div>
              <p className="mt-2 text-[10px] text-slate-500 text-center">
                AI replies can be wrong. Always cross-check band predictions with a real Cambridge mock.
              </p>
            </form>
          </div>
        </section>
      </AppShell>
    </>
  );
}

// ───────────────────────── helpers ─────────────────────────

function Bubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed
                        bg-cosmic-sky/15 border border-cosmic-sky/40 text-white">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <ProfAvatar />
      <div className="max-w-[78%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed
                      bg-white/[0.05] border border-white/10 text-slate-100 whitespace-pre-wrap">
        {renderRich(content)}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex gap-3">
      <ProfAvatar />
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white/[0.05] border border-white/10 text-slate-300 text-sm flex items-center gap-1.5">
        <Dot delay="0s" /><Dot delay=".15s" /><Dot delay=".3s" />
        <span className="ml-1 text-xs text-slate-400 italic">Prof. Linguo is thinking…</span>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span className="w-1.5 h-1.5 rounded-full bg-cosmic-mint inline-block animate-pulse"
          style={{ animationDelay: delay, animationDuration: '0.9s' }} />
  );
}

function ProfAvatar() {
  return (
    <div className="w-10 h-10 shrink-0 rounded-2xl grid place-items-center text-base
                    bg-gradient-to-br from-cosmic-mint to-cosmic-sky border border-white/20"
         style={{ boxShadow: '0 6px 16px rgba(126,247,211,0.35), inset 0 1px 0 rgba(255,255,255,0.4)' }}>
      🎓
    </div>
  );
}

/** Lightweight markdown-ish renderer for **bold**, *italic*, lists. */
function renderRich(text: string) {
  // Split by lines, render bullet lists & paragraphs
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      return <div key={i} className="ml-4">• {inline(trimmed.slice(2))}</div>;
    }
    if (trimmed.startsWith('> ')) {
      return <blockquote key={i} className="border-l-2 border-cosmic-mint pl-3 italic text-slate-200 my-1">{inline(trimmed.slice(2))}</blockquote>;
    }
    if (!trimmed) return <div key={i} className="h-2" />;
    return <p key={i}>{inline(line)}</p>;
  });
}
function inline(text: string) {
  // Replace **bold** and *italic* — naive but safe.
  const parts: (string | { tag: 'b' | 'i'; t: string })[] = [];
  let rest = text;
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIdx = 0; let m: RegExpExecArray | null;
  while ((m = re.exec(rest))) {
    if (m.index > lastIdx) parts.push(rest.slice(lastIdx, m.index));
    if (m[2]) parts.push({ tag: 'b', t: m[2] });
    else if (m[3]) parts.push({ tag: 'i', t: m[3] });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < rest.length) parts.push(rest.slice(lastIdx));
  return parts.map((p, i) => {
    if (typeof p === 'string') return <span key={i}>{p}</span>;
    if (p.tag === 'b') return <strong key={i} className="text-white">{p.t}</strong>;
    return <em key={i}>{p.t}</em>;
  });
}
