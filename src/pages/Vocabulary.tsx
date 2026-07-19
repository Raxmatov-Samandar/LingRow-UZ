// =============================================================================
// Vocabulary page — Cambridge Dictionary-style premium UX.
// Layout: search list (left) + rich entry detail (right).
// Each entry shows: headword, CEFR, UK/US pronunciation, multiple senses with
// own POS/grammar/CEFR/register, examples (EN+UZ), synonyms, antonyms,
// collocations, word family, etymology, idioms, topics.
// =============================================================================
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useActivity } from '@/store/activity';
import { useMemoryLab } from '@/store/memoryLab';
import { learning } from '@/lib/api';
import {
  CAMBRIDGE_BANK, searchDictionary, ALL_CEFR, ALL_TOPICS,
  type DictEntry, type CEFR, type Sense,
} from '@/data/vocabulary/cambridge-bank';

const CEFR_COLORS: Record<CEFR, string> = {
  A1: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/40',
  A2: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
  B1: 'bg-cosmic-sky/15  text-cosmic-sky border-cosmic-sky/40',
  B2: 'bg-blue-500/15    text-blue-200 border-blue-500/40',
  C1: 'bg-violet-500/15  text-violet-200 border-violet-500/40',
  C2: 'bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/40',
};

export function Vocabulary() {
  const log = useActivity(s => s.log);

  const [query, setQuery]   = useState('');
  const [cefrFilter, setCefr] = useState<Set<CEFR>>(new Set());
  const [topicFilter, setTopic] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string>(CAMBRIDGE_BANK[0]?.id ?? '');
  const [saved, setSaved] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('lr-saved-words') ?? '[]')); }
    catch { return new Set(); }
  });

  // Persist saved words
  useEffect(() => {
    localStorage.setItem('lr-saved-words', JSON.stringify(Array.from(saved)));
  }, [saved]);

  const results = useMemo(() => {
    let list = searchDictionary(query);
    if (cefrFilter.size  > 0) list = list.filter(e => cefrFilter.has(e.cefr));
    if (topicFilter.size > 0) list = list.filter(e => (e.topics ?? []).some(t => topicFilter.has(t)));
    return list;
  }, [query, cefrFilter, topicFilter]);

  // Auto-select first result if current selection no longer matches
  useEffect(() => {
    if (results.length === 0) return;
    if (!results.find(r => r.id === selectedId)) setSelectedId(results[0].id);
  }, [results, selectedId]);

  const entry = useMemo(
    () => results.find(r => r.id === selectedId) ?? results[0],
    [results, selectedId]
  );

  function toggleCefr(c: CEFR) {
    const n = new Set(cefrFilter); n.has(c) ? n.delete(c) : n.add(c); setCefr(n);
  }
  function toggleTopic(t: string) {
    const n = new Set(topicFilter); n.has(t) ? n.delete(t) : n.add(t); setTopic(n);
  }
  function toggleSaved(id: string, headword: string) {
    const n = new Set(saved);
    if (n.has(id)) n.delete(id);
    else { n.add(id); log('vocab_reviewed', { word: headword, action: 'saved' }); }
    setSaved(n);
  }

  const wordOfTheDay = CAMBRIDGE_BANK[Math.floor((Date.now() / 86_400_000) % CAMBRIDGE_BANK.length)];

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="search" />

        {/* Filter toolbar */}
        <div className="glass-panel px-4 py-3 flex items-center gap-3 flex-wrap">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search English or O'zbekcha — try 'procrastinate' or 'qaror'…"
            className="input-glass max-w-xs flex-1"
          />

          <MemoryLabButton />
          <ReviewButton />
          <span className="text-slate-600 mx-1">·</span>

          <div className="flex gap-1.5">
            {ALL_CEFR.map(c => (
              <button key={c} onClick={() => toggleCefr(c)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition
                                  ${cefrFilter.has(c) ? CEFR_COLORS[c] : 'border-white/10 text-slate-400 hover:bg-white/[0.05]'}`}>
                {c}
              </button>
            ))}
          </div>

          <span className="text-slate-500 text-xs">·</span>

          <div className="flex gap-1.5 flex-wrap max-w-md">
            {ALL_TOPICS.map(t => (
              <button key={t} onClick={() => toggleTopic(t)}
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide transition
                                  ${topicFilter.has(t) ? 'bg-cosmic-mint/15 border border-cosmic-mint/45 text-cosmic-mint' : 'border border-white/8 text-slate-400 hover:bg-white/[0.05]'}`}>
                {t}
              </button>
            ))}
          </div>

          <span className="ml-auto text-xs text-slate-400">
            {results.length} word{results.length === 1 ? '' : 's'} · {saved.size} saved
          </span>
        </div>

        {/* Two-column: results + entry */}
        <section className="grid lg:grid-cols-[300px_1fr] grid-cols-1 gap-3 lg:gap-5 flex-1 min-h-0 lg:overflow-hidden overflow-y-auto">
          {/* Results list */}
          <aside className="glass-panel p-3 overflow-auto">
            {/* Word of the day */}
            {!query && cefrFilter.size === 0 && topicFilter.size === 0 && (
              <div className="rounded-2xl p-4 mb-3 border border-cosmic-mint/30 bg-cosmic-mint/[0.05]">
                <p className="text-[10px] tracking-[0.2em] text-cosmic-mint mb-1">WORD OF THE DAY</p>
                <button onClick={() => setSelectedId(wordOfTheDay.id)} className="text-left w-full">
                  <p className="text-2xl font-bold text-white">{wordOfTheDay.headword}</p>
                  <p className="text-xs text-slate-300 mt-0.5">{wordOfTheDay.uz}</p>
                  <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">{wordOfTheDay.senses[0].defEn}</p>
                </button>
              </div>
            )}

            <p className="text-[10px] tracking-[0.2em] text-slate-400 px-2 mb-2">RESULTS</p>
            <div className="flex flex-col gap-1">
              {results.map(e => (
                <button key={e.id} onClick={() => setSelectedId(e.id)}
                        className={`text-left rounded-xl p-2.5 transition
                                    ${e.id === selectedId
                                      ? 'bg-cosmic-mint/10 border border-cosmic-mint/40'
                                      : 'border border-transparent hover:bg-white/[0.04]'}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${CEFR_COLORS[e.cefr]}`}>{e.cefr}</span>
                    <span className="text-sm font-bold text-white truncate">{e.headword}</span>
                    {saved.has(e.id) && <span className="ml-auto text-yellow-300 text-xs">★</span>}
                  </div>
                  <p className="text-[11px] text-cosmic-mint truncate">{e.uz}</p>
                  <p className="text-[10px] text-slate-500 italic">{e.pron.uk}</p>
                </button>
              ))}
            </div>
          </aside>

          {/* Entry detail */}
          <div className="glass-panel p-7 overflow-auto">
            {entry ? <EntryDetail e={entry} saved={saved.has(entry.id)} onSave={() => toggleSaved(entry.id, entry.headword)} />
                   : <div className="grid place-items-center h-full text-slate-300">No matches.</div>}
          </div>
        </section>
      </AppShell>
    </>
  );
}

// ───────────────────────── Entry detail ─────────────────────────

function EntryDetail({ e, saved, onSave }: { e: DictEntry; saved: boolean; onSave(): void }) {
  return (
    <article className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <header>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-5xl font-extrabold text-white tracking-tight">{e.headword}</h1>
          <span className={`px-2 py-1 rounded text-[11px] font-bold border ${CEFR_COLORS[e.cefr]}`}>{e.cefr}</span>
          <button onClick={onSave}
                  className={`ml-auto px-3 py-1.5 rounded-full text-xs font-bold border transition
                              ${saved
                                ? 'bg-yellow-300/15 border-yellow-300/45 text-yellow-200'
                                : 'border-white/10 text-slate-300 hover:bg-white/[0.05]'}`}
                  title={saved ? 'Remove from saved' : 'Save word'}>
            {saved ? '★ Saved' : '☆ Save'}
          </button>
        </div>
        <p className="mt-2 text-xl text-cosmic-mint font-semibold">{e.uz}{e.uzAlt && e.uzAlt.length > 0 && <span className="text-slate-400 text-base"> · {e.uzAlt.join(', ')}</span>}</p>

        {/* Pronunciation */}
        <div className="mt-4 flex gap-4 flex-wrap">
          <PronGroup label="UK" ipa={e.pron.uk} audio={e.pron.audio?.uk} />
          <PronGroup label="US" ipa={e.pron.us} audio={e.pron.audio?.us} />
        </div>

        {/* Topics */}
        {e.topics && e.topics.length > 0 && (
          <div className="mt-3 flex gap-1.5 flex-wrap">
            {e.topics.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide bg-white/[0.04] border border-white/8 text-slate-300">{t}</span>
            ))}
          </div>
        )}
      </header>

      {/* Senses */}
      <div className="flex flex-col gap-4">
        {e.senses.map((s, i) => <SenseBlock key={i} s={s} idx={i + 1} />)}
      </div>

      {/* Word family */}
      {e.wordFamily && e.wordFamily.length > 0 && (
        <Section title="Word family">
          <div className="flex flex-wrap gap-2">
            {e.wordFamily.map((w, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm">
                <b className="text-white">{w.word}</b>
                <span className="text-slate-400 text-[11px] ml-1.5 italic">{w.pos}</span>
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Etymology */}
      {e.etymology && (
        <Section title="Etymology">
          <p className="text-[13px] text-slate-300 italic leading-relaxed">{e.etymology}</p>
        </Section>
      )}

      {/* Idioms */}
      {e.idioms && e.idioms.length > 0 && (
        <Section title="Idioms">
          <div className="flex flex-col gap-3">
            {e.idioms.map((id, i) => (
              <div key={i} className="rounded-xl p-4 border border-white/10 bg-white/[0.03]">
                <p className="font-bold text-white">{id.phrase}</p>
                <p className="text-[12px] text-slate-300 mt-1"><span className="text-slate-500 font-mono text-[10px] mr-2">EN</span>{id.meaningEn}</p>
                <p className="text-[12px] text-slate-300"><span className="text-slate-500 font-mono text-[10px] mr-2">UZ</span>{id.meaningUz}</p>
                {id.example && <p className="text-[11px] text-cosmic-mint italic mt-1.5">"{id.example}"</p>}
              </div>
            ))}
          </div>
        </Section>
      )}
    </article>
  );
}

function SenseBlock({ s, idx }: { s: Sense; idx: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      {/* tags row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="w-6 h-6 rounded-full bg-cosmic-mint/20 text-cosmic-mint text-xs font-bold grid place-items-center">{idx}</span>
        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-cosmic-sky bg-cosmic-sky/10 border border-cosmic-sky/30">{s.pos}</span>
        {s.grammar && <span className="text-[10px] text-slate-400 italic">{s.grammar}</span>}
        {s.cefr && <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${CEFR_COLORS[s.cefr]}`}>{s.cefr}</span>}
        {s.register && <span className="text-[10px] text-violet-300 italic">{s.register}</span>}
      </div>

      {/* Definitions */}
      <p className="text-base text-slate-100 leading-relaxed">{s.defEn}</p>
      <p className="mt-1.5 text-[13px] text-slate-300 leading-relaxed">
        <span className="text-slate-500 font-mono text-[10px] mr-2">UZ</span>{s.defUz}
      </p>

      {/* Examples */}
      {s.examples.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {s.examples.map((ex, i) => (
            <div key={i} className="rounded-lg p-3 border border-white/5 bg-black/15">
              <p className="text-[13px] text-slate-100 italic">"{ex.en}"</p>
              <p className="text-[12px] text-slate-400 mt-0.5">— {ex.uz}</p>
            </div>
          ))}
        </div>
      )}

      {/* Synonyms / Antonyms / Collocations */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
        {s.synonyms     && s.synonyms.length     > 0 && <Chips label="Synonyms"     color="emerald" items={s.synonyms} />}
        {s.antonyms     && s.antonyms.length     > 0 && <Chips label="Antonyms"     color="rose"    items={s.antonyms} />}
        {s.collocations && s.collocations.length > 0 && <Chips label="Collocations" color="sky"     items={s.collocations} />}
      </div>
    </div>
  );
}

function Chips({ label, items, color }: { label: string; items: string[]; color: 'emerald'|'rose'|'sky' }) {
  const cls = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
    rose:    'bg-rose-500/10 border-rose-500/30 text-rose-200',
    sky:     'bg-cosmic-sky/10 border-cosmic-sky/30 text-blue-200',
  }[color];
  return (
    <div>
      <p className="text-slate-400 mb-1.5 uppercase tracking-wide text-[10px]">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map(s => (
          <span key={s} className={`px-2 py-0.5 rounded-full border ${cls}`}>{s}</span>
        ))}
      </div>
    </div>
  );
}

function PronGroup({ label, ipa, audio }: { label: string; ipa: string; audio?: string }) {
  function play() {
    if (!audio) return;
    new Audio(`/${audio}`).play().catch(() => { /* ignore */ });
  }
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10">
      <span className="text-[10px] tracking-widest text-slate-400">{label}</span>
      <span className="text-base text-slate-100 italic font-mono">{ipa}</span>
      <button onClick={play}
              title={audio ? 'Play pronunciation' : 'Audio not available'}
              className={`ml-1 w-7 h-7 rounded-full grid place-items-center transition
                          ${audio ? 'bg-cosmic-mint/20 text-cosmic-mint hover:bg-cosmic-mint/30' : 'bg-white/[0.04] text-slate-500 cursor-not-allowed'}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 4V5L7 9H3zm13 3a4 4 0 00-2-3.46v6.92A4 4 0 0016 12z"/>
        </svg>
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.25em] text-slate-400 mb-2 uppercase">{title}</p>
      {children}
    </div>
  );
}

// ───────────────────────── Memory Lab launcher ─────────────────────────

function ReviewButton() {
  const [due, setDue] = useState<number | null>(null);
  useEffect(() => { learning.getDueVocab().then(words => setDue(words.length)); }, []);

  return (
    <Link to="/vocabulary/review"
          title="Spaced-repetition review — words due right now."
          className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold
                     border border-white/12 text-slate-200
                     hover:bg-white/[0.06] hover:-translate-y-0.5 transition">
      <span className="text-base">📇</span>
      <span>Daily Review</span>
      {!!due && (
        <span className="px-1.5 py-0.5 rounded-full bg-cosmic-sky text-slate-900 text-[9px] tabular-nums">
          {due}
        </span>
      )}
    </Link>
  );
}

function MemoryLabButton() {
  const mastered = useMemoryLab(s => Object.values(s.mastery).filter(m => m.masteredAt).length);
  return (
    <Link to="/vocabulary/lab"
          title="Reprogram your memory through a 6-stage word mastery journey."
          className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold
                     bg-gradient-to-r from-cosmic-mint/25 to-cosmic-sky/25
                     border border-cosmic-mint/50 text-white
                     hover:from-cosmic-mint/40 hover:to-cosmic-sky/40 hover:-translate-y-0.5 transition
                     shadow-[0_0_16px_rgba(126,247,211,0.25)]">
      <span className="text-base">🧠</span>
      <span>Memory Lab</span>
      {mastered > 0 && (
        <span className="px-1.5 py-0.5 rounded-full bg-cosmic-mint text-slate-900 text-[9px] tabular-nums">
          🌟 {mastered}
        </span>
      )}
      <span className="absolute -inset-px rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition
                       bg-gradient-to-r from-cosmic-mint/30 to-cosmic-sky/30 blur-md -z-10" />
    </Link>
  );
}
