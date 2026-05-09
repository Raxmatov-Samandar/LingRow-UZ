// =============================================================================
// Memory Lab — neuroscience-backed 6-stage word mastery journey.
//
// Why this works:
//   • Multimodal encoding (Paivio) — see + hear + image + story = 5 retrieval paths
//   • Generation effect (Slamecka & Graf) — words YOU produce stick 40% better
//   • Emotional tagging (Cahill & McGaugh) — amygdala + hippocampus = stronger memory
//   • Active retrieval (Roediger & Karpicke) — testing > re-reading
// =============================================================================
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { CAMBRIDGE_BANK, type DictEntry } from '@/data/vocabulary/cambridge-bank';
import { useMemoryLab, STAGE_LABELS, EMOTION_SET, ANCHOR_EMOJIS, type Stage, type WordMastery } from '@/store/memoryLab';
import { useActivity } from '@/store/activity';

const SESSION_SIZE = 5;

export function MemoryLab() {
  const navigate = useNavigate();
  const log = useActivity(s => s.log);
  const masteryMap = useMemoryLab(s => s.mastery);
  const upsert = useMemoryLab(s => s.upsert);
  const isMastered = useMemoryLab(s => s.isMastered);

  // Build today's session — pick first SESSION_SIZE unmastered C1/C2 words
  const session = useMemo<DictEntry[]>(() => {
    const unmastered = CAMBRIDGE_BANK.filter(w => !isMastered(w.id));
    if (unmastered.length === 0) return CAMBRIDGE_BANK.slice(0, SESSION_SIZE);
    // Prioritise tougher words (B2+)
    const sorted = unmastered.sort((a, b) => b.cefr.localeCompare(a.cefr));
    return sorted.slice(0, SESSION_SIZE);
  }, [masteryMap]);

  const [wordIdx, setWordIdx] = useState(0);
  const [stage,   setStage]   = useState<Stage>(1);
  const [draft,   setDraft]   = useState<Partial<WordMastery>>({});
  const [done, setDone] = useState(false);

  const word = session[wordIdx];

  // Reset when word changes
  useEffect(() => {
    setStage(1);
    setDraft({ wordId: word?.id, word: word?.headword });
  }, [wordIdx, word?.id]);

  function nextStage() {
    if (stage < 6) {
      setStage((stage + 1) as Stage);
      return;
    }
    // Stage 6 → save mastery + go to next word (or finish)
    const record: WordMastery = {
      wordId:      word.id,
      word:        word.headword,
      imageAnchor: draft.imageAnchor ?? '',
      imageEmoji:  draft.imageEmoji  ?? '✨',
      story:       draft.story       ?? '',
      emotion:     draft.emotion     ?? '',
      used:        draft.used        ?? '',
      masteredAt:  Date.now(),
    };
    upsert(record);
    log('vocab_reviewed', { word: word.headword, mode: 'memory-lab', mastered: true });

    if (wordIdx + 1 < session.length) setWordIdx(wordIdx + 1);
    else                              setDone(true);
  }

  function prevStage() { if (stage > 1) setStage((stage - 1) as Stage); }

  if (!word) {
    return (
      <>
        <Cosmos />
        <AppShell>
          <Topbar variant="search" />
          <Loading />
        </AppShell>
      </>
    );
  }

  if (done) {
    return (
      <>
        <Cosmos />
        <AppShell>
          <Topbar variant="banner" bannerTitle="Memory Lab" bannerSubtitle="Session complete" />
          <SessionComplete count={session.length} navigate={navigate} />
        </AppShell>
      </>
    );
  }

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle="Memory Lab"
                bannerSubtitle="Reprogram your memory — 6 stages to master each word." />

        {/* Top toolbar — progress + close */}
        <div className="glass-panel px-4 py-3 flex items-center gap-4 flex-wrap">
          <Link to="/vocabulary"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-slate-300 hover:bg-white/[0.05] border border-white/10">
            ← Exit lab
          </Link>
          <span className="text-xs text-slate-400">Word <b className="text-white">{wordIdx + 1}</b> / {session.length}</span>
          <span className="text-slate-600 text-xs">·</span>
          <StageDots current={stage} />
          <span className="ml-auto text-xs text-slate-400">
            🌟 Mastered overall: <b className="text-cosmic-mint">{Object.values(masteryMap).filter(m => m.masteredAt).length}</b>
          </span>
        </div>

        {/* Stage card */}
        <section className="flex-1 grid place-items-center min-h-0 overflow-auto pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${word.id}-${stage}`}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit   ={{ opacity: 0, y: -14, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl glass-panel p-8"
            >
              {stage === 1 && <Stage1Exposure   word={word}   onNext={nextStage} />}
              {stage === 2 && <Stage2Image      word={word}   draft={draft} setDraft={setDraft} onNext={nextStage} onBack={prevStage} />}
              {stage === 3 && <Stage3Story      word={word}   draft={draft} setDraft={setDraft} onNext={nextStage} onBack={prevStage} />}
              {stage === 4 && <Stage4Emotion    word={word}   draft={draft} setDraft={setDraft} onNext={nextStage} onBack={prevStage} />}
              {stage === 5 && <Stage5Use        word={word}   draft={draft} setDraft={setDraft} onNext={nextStage} onBack={prevStage} />}
              {stage === 6 && <Stage6Master     word={word}   draft={draft}                       onNext={nextStage} onBack={prevStage} />}
            </motion.div>
          </AnimatePresence>
        </section>
      </AppShell>
    </>
  );
}

// ───────────────────────── Stages ─────────────────────────

function Stage1Exposure({ word, onNext }: { word: DictEntry; onNext(): void }) {
  return (
    <div className="text-center">
      <StageHeader stage={1} />
      <h1 className="mt-6 text-6xl font-extrabold text-white tracking-tight">{word.headword}</h1>
      <p className="mt-2 text-lg text-slate-300 italic">{word.pron.uk}</p>
      <p className="mt-4 text-2xl text-cosmic-mint font-semibold">{word.uz}</p>

      <div className="mt-6 rounded-2xl p-5 bg-white/[0.04] border border-white/10 text-left">
        <p className="text-sm text-slate-200 leading-relaxed">{word.senses[0].defEn}</p>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          <span className="text-slate-500 font-mono text-[10px] mr-2">UZ</span>{word.senses[0].defUz}
        </p>
        {word.senses[0].examples[0] && (
          <p className="mt-3 text-[13px] text-slate-300 italic border-l-2 border-cosmic-sky/40 pl-3">
            "{word.senses[0].examples[0].en}"
          </p>
        )}
      </div>

      <button onClick={onNext} className="btn-mint mt-7 px-7 py-3">Got it — continue →</button>
      <p className="mt-3 text-[11px] text-slate-500">Read it twice. Say it once aloud. Then continue.</p>
    </div>
  );
}

function Stage2Image({ word, draft, setDraft, onNext, onBack }:
  { word: DictEntry; draft: Partial<WordMastery>; setDraft: (p: Partial<WordMastery>) => void; onNext(): void; onBack(): void }) {
  const ok = !!(draft.imageAnchor && draft.imageEmoji);
  return (
    <div>
      <StageHeader stage={2} />
      <p className="mt-3 text-lg text-slate-200 leading-relaxed">
        Close your eyes for 3 seconds. Picture <b className="text-cosmic-mint">{word.headword}</b> as a vivid, weird, even silly image.
      </p>
      <p className="mt-1 text-sm text-slate-400">The weirder, the stickier. (Method of Loci — Yates, 1966.)</p>

      <label className="block mt-5 text-xs uppercase tracking-wide text-slate-300 font-semibold">Pick an emoji anchor</label>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {ANCHOR_EMOJIS.map(e => (
          <button key={e} onClick={() => setDraft({ ...draft, imageEmoji: e })}
                  className={`w-11 h-11 rounded-xl text-2xl transition
                              ${draft.imageEmoji === e
                                ? 'bg-cosmic-mint/20 border-2 border-cosmic-mint scale-110'
                                : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]'}`}>
            {e}
          </button>
        ))}
      </div>

      <label className="block mt-5 text-xs uppercase tracking-wide text-slate-300 font-semibold">Describe your mental image (1–2 sentences)</label>
      <textarea value={draft.imageAnchor ?? ''}
                onChange={e => setDraft({ ...draft, imageAnchor: e.target.value })}
                rows={3}
                placeholder={`e.g. "A giant clock made of bees that 'mitigates' a forest fire by buzzing softly."`}
                className="input-glass mt-2 resize-none" />

      <NavRow onBack={onBack} onNext={onNext} disabled={!ok} hint="Need both an emoji and a short description." />
    </div>
  );
}

function Stage3Story({ word, draft, setDraft, onNext, onBack }:
  { word: DictEntry; draft: Partial<WordMastery>; setDraft: (p: Partial<WordMastery>) => void; onNext(): void; onBack(): void }) {
  const wc = (draft.story ?? '').trim().split(/\s+/).filter(Boolean).length;
  const ok = (draft.story ?? '').toLowerCase().includes(word.headword.toLowerCase()) && wc >= 6;
  return (
    <div>
      <StageHeader stage={3} />
      <p className="mt-3 text-lg text-slate-200 leading-relaxed">
        Write a <b className="text-cosmic-mint">personal</b> example sentence using <b className="text-cosmic-mint">{word.headword}</b>.
      </p>
      <p className="mt-1 text-sm text-slate-400">
        Tie it to your own life — your school, your sister, last Tuesday. Words you generate stick 40% better. (Slamecka & Graf, 1978.)
      </p>

      <textarea value={draft.story ?? ''}
                onChange={e => setDraft({ ...draft, story: e.target.value })}
                rows={5}
                placeholder={`Write a real moment from your life that uses "${word.headword}". Min 6 words.`}
                className="input-glass mt-4 resize-none text-base" />

      <p className="mt-2 text-xs text-slate-500">
        {wc} words · {ok ? '✓ looks good' : `Use the word "${word.headword}" and write at least 6 words.`}
      </p>

      <NavRow onBack={onBack} onNext={onNext} disabled={!ok} hint={ok ? '' : "The sentence must contain the word and be at least 6 words."} />
    </div>
  );
}

function Stage4Emotion({ word, draft, setDraft, onNext, onBack }:
  { word: DictEntry; draft: Partial<WordMastery>; setDraft: (p: Partial<WordMastery>) => void; onNext(): void; onBack(): void }) {
  const ok = !!draft.emotion;
  return (
    <div className="text-center">
      <StageHeader stage={4} />
      <p className="mt-4 text-lg text-slate-200 leading-relaxed">
        How did <b className="text-cosmic-mint">{word.headword}</b> make you feel?
      </p>
      <p className="mt-1 text-sm text-slate-400">
        Words tagged with emotion are stored deeper. (Cahill & McGaugh, amygdala-hippocampus binding.)
      </p>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {EMOTION_SET.map(e => (
          <button key={e} onClick={() => setDraft({ ...draft, emotion: e })}
                  className={`w-16 h-16 rounded-2xl text-3xl transition
                              ${draft.emotion === e
                                ? 'bg-cosmic-mint/20 border-2 border-cosmic-mint scale-110'
                                : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]'}`}>
            {e}
          </button>
        ))}
      </div>

      <NavRow onBack={onBack} onNext={onNext} disabled={!ok} hint="Pick one emotion." />
    </div>
  );
}

function Stage5Use({ word, draft, setDraft, onNext, onBack }:
  { word: DictEntry; draft: Partial<WordMastery>; setDraft: (p: Partial<WordMastery>) => void; onNext(): void; onBack(): void }) {
  const ok = (draft.used ?? '').trim().split(/\s+/).filter(Boolean).length >= 4;
  return (
    <div>
      <StageHeader stage={5} />
      <p className="mt-3 text-lg text-slate-200 leading-relaxed">
        Now <b className="text-cosmic-mint">use</b> the word in a <em>different</em> sentence — speak it aloud first, then type it here.
      </p>
      <p className="mt-1 text-sm text-slate-400">
        Hearing your own voice produce the word activates motor + auditory cortex together. Active retrieval beats re-reading 5x.
      </p>

      <div className="mt-5 rounded-2xl p-4 bg-cosmic-sky/10 border border-cosmic-sky/30">
        <p className="text-xs uppercase tracking-wide text-cosmic-sky mb-1.5 font-semibold">Speak it 3 times</p>
        <p className="text-sm text-slate-200 leading-relaxed">
          Say <b className="text-cosmic-mint text-lg">{word.headword}</b> aloud — pause — say a sentence with it — pause — say it once more.
        </p>
      </div>

      <textarea value={draft.used ?? ''}
                onChange={e => setDraft({ ...draft, used: e.target.value })}
                rows={3}
                placeholder={`Type a NEW sentence (different from Stage 3) using "${word.headword}".`}
                className="input-glass mt-4 resize-none" />

      <NavRow onBack={onBack} onNext={onNext} disabled={!ok} hint={ok ? '' : 'At least 4 words.'} />
    </div>
  );
}

function Stage6Master({ word, draft, onNext, onBack }:
  { word: DictEntry; draft: Partial<WordMastery>; onNext(): void; onBack(): void }) {
  return (
    <div className="text-center">
      <StageHeader stage={6} />
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6 text-7xl">{draft.imageEmoji ?? '🌟'}</motion.div>
      <h2 className="mt-3 text-3xl font-extrabold text-white">{word.headword}</h2>
      <p className="text-sm text-cosmic-mint">{word.uz}</p>

      <div className="mt-6 grid gap-2 text-left text-[13px]">
        <SummaryRow label="Image"   value={draft.imageAnchor ?? ''} />
        <SummaryRow label="Story"   value={draft.story ?? ''} />
        <SummaryRow label="Emotion" value={draft.emotion ?? ''} />
        <SummaryRow label="Use"     value={draft.used ?? ''} />
      </div>

      <p className="mt-5 text-sm text-slate-300">Five neural pathways. One word. Locked.</p>

      <div className="flex justify-center gap-2 mt-6">
        <button onClick={onBack} className="btn-ghost px-5">← Back</button>
        <button onClick={onNext} className="btn-mint px-7 py-3 text-base">🌟 Master this word</button>
      </div>
    </div>
  );
}

// ───────────────────────── Helpers ─────────────────────────

function StageHeader({ stage }: { stage: Stage }) {
  const s = STAGE_LABELS[stage];
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl grid place-items-center text-2xl bg-cosmic-mint/15 border border-cosmic-mint/40">
        {s.emoji}
      </div>
      <div>
        <p className="text-[10px] tracking-[0.25em] text-slate-400">STAGE {stage}/6</p>
        <p className="text-xl font-bold text-white">{s.name}</p>
        <p className="text-xs text-slate-400">{s.sub}</p>
      </div>
    </div>
  );
}

function StageDots({ current }: { current: Stage }) {
  return (
    <div className="flex gap-1">
      {([1,2,3,4,5,6] as Stage[]).map(s => (
        <span key={s}
              className={`h-1.5 rounded-full transition-all
                          ${s < current  ? 'w-6 bg-cosmic-mint'
                            : s === current ? 'w-10 bg-cosmic-mint shadow-[0_0_8px_#7ef7d3]'
                            : 'w-3 bg-white/15'}`} />
      ))}
    </div>
  );
}

function NavRow({ onBack, onNext, disabled, hint }:
  { onBack(): void; onNext(): void; disabled: boolean; hint?: string }) {
  return (
    <>
      <div className="flex justify-between gap-2 mt-6">
        <button onClick={onBack} className="btn-ghost px-5">← Back</button>
        <button onClick={onNext} disabled={disabled}
                className="btn-mint px-7 py-3 disabled:opacity-40 disabled:cursor-not-allowed">
          Next →
        </button>
      </div>
      {hint && disabled && <p className="text-[11px] text-slate-500 text-right mt-1.5">{hint}</p>}
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg px-3 py-2 bg-white/[0.03] border border-white/8 flex items-baseline gap-2">
      <span className="text-[10px] uppercase tracking-wider text-slate-400 w-16 shrink-0">{label}</span>
      <span className="text-slate-200 flex-1">{value || <em className="text-slate-500">— skipped</em>}</span>
    </div>
  );
}

function SessionComplete({ count, navigate }: { count: number; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="flex-1 grid place-items-center">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-3">🌟</div>
        <h2 className="text-3xl font-extrabold text-white">Session complete</h2>
        <p className="mt-2 text-slate-300">You just locked <b className="text-cosmic-mint">{count} new words</b> through 5 neural pathways.</p>
        <p className="mt-4 text-xs text-slate-500 max-w-xs mx-auto">
          Tip: Review them tonight just before sleep — REM consolidation will move them to long-term memory.
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <button onClick={() => navigate('/vocabulary')} className="btn-ghost px-5">Back to dictionary</button>
          <button onClick={() => location.reload()} className="btn-mint px-5">Run another session</button>
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return <div className="flex-1 grid place-items-center text-slate-300">Loading your session…</div>;
}
