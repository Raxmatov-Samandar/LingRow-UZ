// =============================================================================
// Library — categorised content hub.
// Categories shown depend on the learner's "track":
//   • student      → kid-friendly content (stories, songs, cartoons…)
//   • ielts        → Cambridge tests, articles, writing samples, speaking bank
//   • abituriyent  → DTM samples, grammar, vocab + general articles
// The track auto-defaults from the user role but can be switched manually.
// =============================================================================
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/store/auth';
import { useUserArticles } from '@/store/userArticles';
import { learning } from '@/lib/api';
import type { CambridgeBook } from '@/types';
import {
  ARTICLES, ALL_ARTICLE_TOPICS, getTodaysArticle, searchArticles, type Article,
} from '@/data/articles/daily-articles';
import { ALL_CEFR, type CEFR } from '@/data/vocabulary/cambridge-bank';
import {
  ALL_CATEGORIES, TRACK_CATEGORIES, TRACK_LABELS,
  type CategoryKind, type LearnerTrack,
} from '@/data/library/categories';

const CEFR_COLORS: Record<CEFR, string> = {
  A1: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/40',
  A2: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
  B1: 'bg-cosmic-sky/15 text-cosmic-sky border-cosmic-sky/40',
  B2: 'bg-blue-500/15 text-blue-200 border-blue-500/40',
  C1: 'bg-violet-500/15 text-violet-200 border-violet-500/40',
  C2: 'bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/40',
};

export function Library() {
  const user       = useAuth(s => s.user);
  const onboarding = useAuth(s => s.onboarding);

  // Track is fully derived from the role + onboarding goal — no manual switcher.
  const track: LearnerTrack = useMemo(() => {
    if (user?.role === 'student') return 'student';
    if (onboarding?.goal === 'dtm') return 'abituriyent';
    return 'ielts';
  }, [user?.role, onboarding?.goal]);

  const categories = TRACK_CATEGORIES[track];
  const [activeCat, setActiveCat] = useState<CategoryKind>(categories[0]);

  // Reset when track changes (rare — only after a profile update)
  useEffect(() => { setActiveCat(categories[0]); }, [track]); // eslint-disable-line

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle="Library" bannerSubtitle="Reading & study materials, organised for your track." />

        {/* Category tabs + auto-detected track badge */}
        <div className="glass-panel px-3 py-2 flex items-center gap-1.5 flex-wrap overflow-x-auto">
          <Link to="/profile"
                title="Track is set automatically from your profile. Click to change."
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
                           bg-cosmic-mint/15 border border-cosmic-mint/45 text-cosmic-mint hover:bg-cosmic-mint/25 transition">
            <span>{TRACK_LABELS[track].emoji}</span>
            <span>{TRACK_LABELS[track].label}</span>
          </Link>
          <span className="text-slate-600 mx-1">·</span>
          {categories.map(cId => {
            const c = ALL_CATEGORIES[cId];
            const active = cId === activeCat;
            return (
              <button key={cId} onClick={() => setActiveCat(cId)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition
                                  ${active
                                    ? 'bg-white/10 text-white border border-white/15'
                                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
                <span>{c.emoji}</span>
                <span className="font-semibold">{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active category content */}
        <section className="flex-1 min-h-0 overflow-auto">
          <CategorySection cat={activeCat} track={track} />
        </section>
      </AppShell>
    </>
  );
}

// ───────────────────────── Per-category content ─────────────────────────

function CategorySection({ cat, track }: { cat: CategoryKind; track: LearnerTrack }) {
  const meta = ALL_CATEGORIES[cat];
  return (
    <div className="flex flex-col gap-4">
      <header className="px-1">
        <p className="text-[10px] tracking-[0.25em] text-slate-400">{TRACK_LABELS[track].label.toUpperCase()}</p>
        <h2 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">{meta.emoji} {meta.label}</h2>
        <p className="text-sm text-slate-300 mt-1">{meta.description}</p>
      </header>

      {cat === 'articles'        && <ArticlesList />}
      {cat === 'cambridge'       && <CambridgeMaterials />}
      {cat === 'practice-tests'  && <PracticeTests />}
      {cat === 'writing-samples' && <PlaceholderGrid items={WRITING_SAMPLES_PLACEHOLDER} />}
      {cat === 'speaking-bank'   && <PlaceholderGrid items={SPEAKING_BANK_PLACEHOLDER} />}
      {cat === 'stories'         && <PlaceholderGrid items={STORIES_PLACEHOLDER} />}
      {cat === 'songs'           && <PlaceholderGrid items={SONGS_PLACEHOLDER} />}
      {cat === 'cartoons'        && <PlaceholderGrid items={CARTOONS_PLACEHOLDER} />}
      {cat === 'phonics'         && <PlaceholderGrid items={PHONICS_PLACEHOLDER} />}
      {cat === 'vocab-games'     && <PlaceholderGrid items={VOCAB_GAMES_PLACEHOLDER} />}
      {cat === 'dtm-samples'     && <PlaceholderGrid items={DTM_SAMPLES_PLACEHOLDER} />}
      {cat === 'dtm-grammar'     && <PlaceholderGrid items={DTM_GRAMMAR_PLACEHOLDER} />}
      {cat === 'dtm-vocab'       && <PlaceholderGrid items={DTM_VOCAB_PLACEHOLDER} />}
      {cat === 'news'            && <PlaceholderGrid items={NEWS_PLACEHOLDER} />}
    </div>
  );
}

// ───────────────────────── Articles (live data) ─────────────────────────

function ArticlesList() {
  const userList = useUserArticles(s => s.list);
  const [query, setQuery] = useState('');
  const [cefrFilter, setCefr] = useState<Set<string>>(new Set());
  const [topicFilter, setTopic] = useState<Set<string>>(new Set());

  const today = getTodaysArticle(userList);
  const filtered = useMemo(
    () => searchArticles(query, cefrFilter, topicFilter, userList).filter(a => a.id !== today.id),
    [query, cefrFilter, topicFilter, today.id, userList]
  );
  const allTopics = useMemo(() => {
    const set = new Set<string>(ALL_ARTICLE_TOPICS);
    userList.forEach(a => a.topics.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [userList]);

  function toggle<T>(set: Set<T>, value: T, setter: (s: Set<T>) => void) {
    const n = new Set(set);
    n.has(value) ? n.delete(value) : n.add(value);
    setter(n);
  }

  return (
    <>
      <div className="flex justify-end -mb-1">
        <Link to="/library/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold
                         bg-cosmic-mint/15 border border-cosmic-mint/45 text-cosmic-mint hover:bg-cosmic-mint/25 transition">
          ＋ New article
        </Link>
      </div>

      <FeaturedCard article={today} />

      <div className="glass-panel px-4 py-3 flex items-center gap-3 flex-wrap">
        <input value={query} onChange={e => setQuery(e.target.value)}
               placeholder="Search articles…"
               className="input-glass max-w-xs flex-1" />

        <div className="flex gap-1.5">
          {ALL_CEFR.map(c => (
            <button key={c} onClick={() => toggle(cefrFilter, c, setCefr)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition
                                ${cefrFilter.has(c) ? CEFR_COLORS[c] : 'border-white/10 text-slate-400 hover:bg-white/[0.05]'}`}>
              {c}
            </button>
          ))}
        </div>

        <span className="text-slate-600 text-xs">·</span>

        <div className="flex gap-1.5 flex-wrap">
          {allTopics.map(t => (
            <button key={t} onClick={() => toggle(topicFilter, t, setTopic)}
                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide transition
                                ${topicFilter.has(t)
                                  ? 'bg-cosmic-mint/15 border border-cosmic-mint/45 text-cosmic-mint'
                                  : 'border border-white/8 text-slate-400 hover:bg-white/[0.05]'}`}>
              {t}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-slate-400">
          {filtered.length} article{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        {filtered.length === 0
          ? <div className="col-span-full glass-panel p-8 text-center text-slate-300">
              <p className="text-3xl mb-2">📭</p>
              <p>No articles match your filters.</p>
            </div>
          : filtered.map(a => <ArchiveCard key={a.id} a={a} />)}
      </div>
    </>
  );
}

function FeaturedCard({ article }: { article: Article }) {
  return (
    <Link to={`/library/${article.id}`}
          className="glass-panel p-0 overflow-hidden block group hover:-translate-y-0.5 transition">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr]">
        {article.cover && (
          <div className="relative h-44 md:h-auto bg-slate-900">
            <img src={article.cover} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-cosmic-mint text-slate-900 text-[10px] font-bold tracking-wider uppercase">
              📰 Today's read
            </span>
          </div>
        )}
        <div className="p-6 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${CEFR_COLORS[article.cefr]}`}>{article.cefr}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/8 text-[10px] text-slate-300">{article.readingMin} min read</span>
            {article.topics.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide bg-white/[0.04] border border-white/8 text-slate-300">{t}</span>
            ))}
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight group-hover:text-cosmic-mint transition">
            {article.title}
          </h2>
          {article.subtitle && <p className="text-sm text-slate-300 leading-relaxed">{article.subtitle}</p>}
          <span className="mt-auto inline-flex items-center gap-1.5 text-cosmic-mint text-sm font-bold">
            Read now <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArchiveCard({ a }: { a: Article }) {
  return (
    <Link to={`/library/${a.id}`}
          className="glass-panel p-0 overflow-hidden block group hover:-translate-y-0.5 transition">
      {a.cover && (
        <div className="relative h-32 bg-slate-900 overflow-hidden">
          <img src={a.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${CEFR_COLORS[a.cefr]}`}>{a.cefr}</span>
          <span className="text-[10px] text-slate-400">{a.readingMin} min</span>
          <span className="text-slate-600">·</span>
          {a.topics.slice(0, 2).map(t => <span key={t} className="text-[10px] text-slate-400 uppercase tracking-wide">{t}</span>)}
        </div>
        <h3 className="text-base font-bold text-white leading-snug group-hover:text-cosmic-mint transition">{a.title}</h3>
        {a.subtitle && <p className="text-xs text-slate-400 line-clamp-2">{a.subtitle}</p>}
      </div>
    </Link>
  );
}

// ───────────────────────── Cambridge materials (live) ─────────────────────────

function CambridgeMaterials() {
  // First 4 cards are the always-on built-in Test 1 content. The rest are
  // real Cambridge Reading PDFs the dev has uploaded + parsed in /dev
  // (Books tab) — read from Supabase so they show up for every real user,
  // not just the founder's own browser.
  const [books, setBooks] = useState<CambridgeBook[]>([]);
  useEffect(() => {
    learning.getCambridgeBooksList().then(list =>
      setBooks(list.filter(b => b.kind === 'cambridge_ielts' && b.parts.length > 0))
    );
  }, []);

  const items = [
    { to: '/listening', emoji: '🎧', title: 'Cambridge IELTS 18 — Listening',  desc: '4 parts · 40 questions · ~30 minutes', badge: 'Test 1 ready' },
    { to: '/reading',   emoji: '📖', title: 'Cambridge IELTS 18 — Reading',    desc: '3 sections · 40 questions · 60 minutes', badge: 'Test 1 ready' },
    { to: '/writing',   emoji: '✍️', title: 'Cambridge IELTS 18 — Writing',    desc: 'Task 1 (letter) + Task 2 (essay) · 60 min', badge: 'AI graded' },
    { to: '/speaking',  emoji: '🎤', title: 'Speaking — full mock',            desc: '3 parts · cue card · AI feedback', badge: 'AI graded' },
    ...books.map(b => {
      const totalQ = b.parts.reduce((s, p) => s + p.questions.length, 0);
      return {
        to: `/reading?test=${b.id}`,
        emoji: '📘',
        title: b.testNumber != null ? `${b.title} — Test ${b.testNumber}` : b.title,
        desc: `${b.parts.length} section${b.parts.length === 1 ? '' : 's'} · ${totalQ} questions · Reading`,
        badge: b.module && b.module !== 'unknown' ? b.module : 'live',
      };
    }),
  ];
  return <LinkGrid items={items} />;
}

function PracticeTests() {
  const items = [
    { to: '/listening', emoji: '🎧', title: 'Listening — full mock',  desc: '40 questions · timer · band', badge: 'live' },
    { to: '/reading',   emoji: '📖', title: 'Reading — full mock',    desc: '40 questions · 60 min · band', badge: 'live' },
    { to: '/writing',   emoji: '✍️', title: 'Writing — full mock',    desc: 'Task 1 + 2 · 60 min · AI', badge: 'live' },
    { to: '/speaking',  emoji: '🎤', title: 'Speaking — full mock',   desc: '3 parts · AI grading', badge: 'live' },
  ];
  return <LinkGrid items={items} />;
}

// ───────────────────────── Reusable link grid ─────────────────────────

function LinkGrid({ items }: { items: { to: string; emoji: string; title: string; desc: string; badge?: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
      {items.map((it, i) => (
        <Link key={i} to={it.to}
              className={`glass-panel p-5 group flex flex-col gap-2 transition
                          ${it.to === '#' ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'hover:-translate-y-0.5'}`}>
          <div className="flex items-center justify-between">
            <span className="text-3xl">{it.emoji}</span>
            {it.badge && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border
                               ${it.badge === 'live' ? 'bg-cosmic-mint/15 border-cosmic-mint/45 text-cosmic-mint'
                                 : it.badge === 'soon' ? 'bg-white/[0.04] border-white/10 text-slate-400'
                                 : 'bg-cosmic-sky/15 border-cosmic-sky/45 text-cosmic-sky'}`}>
                {it.badge}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-white leading-snug group-hover:text-cosmic-mint transition">{it.title}</h3>
          <p className="text-xs text-slate-400">{it.desc}</p>
        </Link>
      ))}
    </div>
  );
}

// ───────────────────────── Placeholder grid (coming-soon items) ─────────────────────────

interface PlaceholderItem { emoji: string; title: string; desc: string; }

function PlaceholderGrid({ items }: { items: PlaceholderItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
      {items.map((it, i) => (
        <div key={i}
             className="glass-panel p-5 opacity-80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-3xl">{it.emoji}</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/[0.04] border border-white/10 text-slate-400">soon</span>
          </div>
          <h3 className="text-base font-bold text-white leading-snug">{it.title}</h3>
          <p className="text-xs text-slate-400">{it.desc}</p>
        </div>
      ))}
      <div className="glass-panel p-5 border-dashed border-2 border-white/10 grid place-items-center text-center text-slate-400 min-h-[140px]">
        <div>
          <p className="text-2xl mb-1">＋</p>
          <p className="text-xs">More content coming soon — or upload your own.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Static placeholder lists per category ──────────────────────────────────────

const STORIES_PLACEHOLDER: PlaceholderItem[] = [
  { emoji: '🐰', title: 'The Tortoise and the Hare', desc: 'A1 · classic moral story · 5 min' },
  { emoji: '🦁', title: 'The Lion and the Mouse',     desc: 'A1 · about kindness · 4 min' },
  { emoji: '🐺', title: 'The Boy Who Cried Wolf',     desc: 'A2 · honesty · 6 min' },
  { emoji: '🌳', title: 'The Giving Tree',            desc: 'A2 · friendship · 7 min' },
  { emoji: '🧚', title: 'Cinderella',                  desc: 'A2 · fairy tale · 10 min' },
];
const SONGS_PLACEHOLDER: PlaceholderItem[] = [
  { emoji: '🎵', title: 'Old MacDonald Had a Farm', desc: 'A1 · animals · 2 min' },
  { emoji: '🎵', title: 'If You\'re Happy and You Know It', desc: 'A1 · feelings · 2 min' },
  { emoji: '🎵', title: 'Twinkle Twinkle Little Star', desc: 'A1 · classic · 2 min' },
  { emoji: '🎵', title: 'Head, Shoulders, Knees and Toes', desc: 'A1 · body parts · 2 min' },
];
const CARTOONS_PLACEHOLDER: PlaceholderItem[] = [
  { emoji: '🎬', title: 'Peppa Pig — Muddy Puddles', desc: 'A1 · everyday English · 5 min' },
  { emoji: '🎬', title: 'Bluey — Magic Xylophone',   desc: 'A2 · imagination · 7 min' },
  { emoji: '🎬', title: 'Adventure Time — clip pack', desc: 'B1 · humour · 4 min' },
];
const PHONICS_PLACEHOLDER: PlaceholderItem[] = [
  { emoji: '🅰️', title: 'Short vowel sounds — a, e, i, o, u', desc: 'A1 · 10 min drill' },
  { emoji: '🔤', title: 'Tricky pairs: /θ/ vs /s/',           desc: 'A2 · L1 issue for Uzbek learners' },
  { emoji: '🗣', title: 'Final consonant clusters',           desc: 'B1 · "asks", "lists", "didn\'t"' },
];
const VOCAB_GAMES_PLACEHOLDER: PlaceholderItem[] = [
  { emoji: '🎮', title: 'Word match — animals',     desc: 'A1 · 30 cards' },
  { emoji: '🧩', title: 'Memory — colours & shapes', desc: 'A1 · 24 cards' },
  { emoji: '🎯', title: 'Spelling Bee',              desc: 'A2 · timed challenge' },
];
const WRITING_SAMPLES_PLACEHOLDER: PlaceholderItem[] = [
  { emoji: '✍️', title: 'Task 1 — Letter to a friend (Band 8)', desc: 'GT · model answer' },
  { emoji: '✍️', title: 'Task 1 — Complaint letter (Band 7)',    desc: 'GT · model answer' },
  { emoji: '✍️', title: 'Task 2 — Education essay (Band 9)',     desc: 'Both · model answer' },
  { emoji: '✍️', title: 'Task 2 — Technology essay (Band 8)',    desc: 'Both · model answer' },
];
const SPEAKING_BANK_PLACEHOLDER: PlaceholderItem[] = [
  { emoji: '🎤', title: 'Cue card bank — 50 topics', desc: 'Part 2 · 2025 update' },
  { emoji: '🎤', title: 'Part 1 — Hometown',          desc: '15 questions' },
  { emoji: '🎤', title: 'Part 3 — Travel & Culture',  desc: '12 discussion questions' },
];
const DTM_SAMPLES_PLACEHOLDER: PlaceholderItem[] = [
  { emoji: '📄', title: 'DTM 2024 — Ingliz tili variant 1', desc: 'To\'liq variant · javoblar bilan' },
  { emoji: '📄', title: 'DTM 2024 — Ingliz tili variant 2', desc: 'To\'liq variant · javoblar bilan' },
  { emoji: '📄', title: 'DTM 2023 — Tahliliy savollar',     desc: 'Eng qiyin savollar tahlili' },
];
const DTM_GRAMMAR_PLACEHOLDER: PlaceholderItem[] = [
  { emoji: '📐', title: 'Tenses — Present / Past / Future', desc: '20 ta DTM uslubidagi test' },
  { emoji: '📐', title: 'Modal verbs — must / should / can', desc: '15 ta savol' },
  { emoji: '📐', title: 'Conditionals — 0/1/2/3',            desc: '20 ta savol' },
  { emoji: '📐', title: 'Articles — a / an / the',           desc: 'Eng tipik xatolar' },
];
const DTM_VOCAB_PLACEHOLDER: PlaceholderItem[] = [
  { emoji: '🗂', title: 'DTM 1000 — eng tez-tez uchraydigan so\'zlar', desc: 'Bilingual flashcards' },
  { emoji: '🗂', title: 'Phrasal verbs — DTM uchun',                  desc: 'Top 100' },
  { emoji: '🗂', title: 'Synonim juftliklari',                         desc: 'Test javoblari uchun' },
];
const NEWS_PLACEHOLDER: PlaceholderItem[] = [
  { emoji: '📰', title: 'BBC Learning English — 6 Minute',  desc: 'B2 · weekly · with transcript' },
  { emoji: '📰', title: 'Voice of America — Special English', desc: 'B1 · slower delivery' },
  { emoji: '📰', title: 'Breaking News English — daily',     desc: 'B1–C1 · short reads' },
];
