// =============================================================================
// Library categories — what content shows up depends on the learner's track.
// Three audiences:
//   • student   → 10–16, gamified, kid-friendly
//   • adult     → IELTS / general adult
//   • abituriyent → DTM (Uzbek university entrance) prep — separate sub-track
//                   inside the adult experience
// =============================================================================

export type LearnerTrack = 'student' | 'ielts' | 'abituriyent';

export type CategoryKind =
  | 'articles'
  | 'cambridge'
  | 'practice-tests'
  | 'writing-samples'
  | 'speaking-bank'
  | 'stories'
  | 'songs'
  | 'cartoons'
  | 'phonics'
  | 'vocab-games'
  | 'dtm-samples'
  | 'dtm-grammar'
  | 'dtm-vocab'
  | 'news';

export interface LibraryCategory {
  id:    CategoryKind;
  label: string;
  emoji: string;
  description: string;
}

export const ALL_CATEGORIES: Record<CategoryKind, LibraryCategory> = {
  // ── Shared ──
  articles:        { id: 'articles',        label: 'Articles',          emoji: '📰',
                     description: 'Daily reads to grow your academic vocabulary.' },
  news:            { id: 'news',            label: 'News for learners', emoji: '📡',
                     description: 'Real-world news, simplified for B1–C2.' },

  // ── IELTS / adult ──
  cambridge:       { id: 'cambridge',       label: 'Cambridge IELTS',   emoji: '🎓',
                     description: 'Authentic test books — Listening / Reading / Writing.' },
  'practice-tests':{ id: 'practice-tests',  label: 'Practice tests',    emoji: '📝',
                     description: 'Full mock tests with timer and band score.' },
  'writing-samples':{ id:'writing-samples', label: 'Writing samples',   emoji: '✍️',
                     description: 'Band 7 / 8 / 9 model answers for Task 1 & Task 2.' },
  'speaking-bank': { id: 'speaking-bank',   label: 'Speaking topics',   emoji: '🎤',
                     description: 'Cue cards + Part 3 discussion banks.' },

  // ── Student / kids ──
  stories:         { id: 'stories',         label: 'Stories',           emoji: '📚',
                     description: 'Illustrated short stories for young learners.' },
  songs:           { id: 'songs',           label: 'Songs',             emoji: '🎶',
                     description: 'Catchy songs to build pronunciation and rhythm.' },
  cartoons:        { id: 'cartoons',        label: 'Cartoons',          emoji: '📺',
                     description: 'Bite-sized cartoons with bilingual subtitles.' },
  phonics:         { id: 'phonics',         label: 'Phonics',           emoji: '🔤',
                     description: 'Sound-by-sound pronunciation practice.' },
  'vocab-games':   { id: 'vocab-games',     label: 'Vocab games',       emoji: '🎮',
                     description: 'Fun matching, memory and spelling drills.' },

  // ── Abituriyent / DTM ──
  'dtm-samples':   { id: 'dtm-samples',     label: 'DTM namunalari',    emoji: '📑',
                     description: 'O\'tgan yillar DTM ingliz tili variantlari.' },
  'dtm-grammar':   { id: 'dtm-grammar',     label: 'DTM Grammar',       emoji: '📐',
                     description: 'DTM uchun grammatik mavzular va testlar.' },
  'dtm-vocab':     { id: 'dtm-vocab',       label: 'DTM lug\'at',       emoji: '🗂',
                     description: 'DTM imtihoni mavzulari bo\'yicha lug\'at to\'plami.' },
};

/** Categories shown for each learner track, in order. */
export const TRACK_CATEGORIES: Record<LearnerTrack, CategoryKind[]> = {
  student: [
    'articles', 'stories', 'cartoons', 'songs', 'phonics', 'vocab-games',
  ],
  ielts: [
    'cambridge', 'practice-tests', 'articles', 'writing-samples', 'speaking-bank', 'news',
  ],
  abituriyent: [
    'dtm-samples', 'dtm-grammar', 'dtm-vocab', 'articles', 'cambridge',
  ],
};

/** Friendly label for the track switcher. */
export const TRACK_LABELS: Record<LearnerTrack, { label: string; emoji: string; sub: string }> = {
  student:     { label: 'Young Learner',  emoji: '🧒', sub: 'Ages 10–16 · gamified, fun-first' },
  ielts:       { label: 'IELTS Candidate', emoji: '🎓', sub: 'Cambridge tests + AI feedback' },
  abituriyent: { label: 'Abituriyent',    emoji: '📘', sub: 'DTM imtihoni uchun tayyorlov' },
};

export const ALL_TRACKS: LearnerTrack[] = ['student', 'ielts', 'abituriyent'];
