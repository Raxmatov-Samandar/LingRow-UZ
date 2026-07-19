// =============================================================
// Mock data layer — replace with Supabase queries when DB is wired.
// =============================================================
import type {
  Lesson,
  VocabWord,
  QuizQuestion,
  Badge,
  LeaderboardEntry,
  ParentChild,
  DailyReport,
  ParentalControls,
} from '@/types';

export const LEVELS: Lesson[] = [
  { id: 'beginner',     title: 'Beginner',     level: 'beginner',     totalLessons: 30, completedLessons: 12, type: 'video',    description: 'Crystal glass texture' },
  { id: 'intermediate', title: 'Intermediate', level: 'intermediate', totalLessons: 40, completedLessons: 0,  type: 'video',    description: 'Crystal glass texture' },
  { id: 'advanced',     title: 'Advanced',     level: 'advanced',     totalLessons: 50, completedLessons: 0,  type: 'video',    description: 'Crystal glass texture' },
  { id: 'mastery',      title: 'Mastery',      level: 'mastery',      totalLessons: 60, completedLessons: 0,  type: 'video',    description: 'Crystal glass texture' },
];

export const VOCAB: VocabWord[] = [
  { id: 'v1', word: 'Hello',       phonetic: '/həˈloʊ/',          definition: 'A common greeting',           example: 'Hello, how are you?', level: 'beginner', sm2: { easeFactor: 2.5, interval: 1, repetitions: 0, nextReview: new Date().toISOString() } },
  { id: 'v2', word: 'Good morning',phonetic: '/ɡʊd ˈmɔːr.nɪŋ/',   definition: 'Morning greeting',            example: 'Good morning, teacher!', level: 'beginner', sm2: { easeFactor: 2.5, interval: 1, repetitions: 0, nextReview: new Date().toISOString() } },
  { id: 'v3', word: 'How are you?',phonetic: '/haʊ ɑːr juː/',     definition: 'A polite question',           example: 'Hi! How are you today?', level: 'beginner', sm2: { easeFactor: 2.5, interval: 1, repetitions: 0, nextReview: new Date().toISOString() } },
  { id: 'v4', word: 'Welcome',     phonetic: '/ˈwel.kəm/',         definition: 'To receive someone warmly',   example: 'Welcome to LingRow!',     level: 'beginner', sm2: { easeFactor: 2.5, interval: 1, repetitions: 0, nextReview: new Date().toISOString() } },
  { id: 'v5', word: 'Thank you',   phonetic: '/θæŋk juː/',         definition: 'Expression of gratitude',     example: 'Thank you for helping.',  level: 'beginner', sm2: { easeFactor: 2.5, interval: 1, repetitions: 0, nextReview: new Date().toISOString() } },
  { id: 'v6', word: 'Crucial',     phonetic: '/ˈkruː.ʃəl/',        definition: 'Of the greatest importance',  example: 'Practice is crucial.',    level: 'advanced', sm2: { easeFactor: 2.5, interval: 1, repetitions: 0, nextReview: new Date().toISOString() } },
  { id: 'v7', word: 'Pivotal',     phonetic: '/ˈpɪv.ə.t̬əl/',      definition: 'Of vital importance',         example: 'A pivotal moment.',        level: 'advanced', sm2: { easeFactor: 2.5, interval: 1, repetitions: 0, nextReview: new Date().toISOString() } },
];

export const QUIZ: QuizQuestion[] = [
  { id: 'q1', prompt: "According to the text, what was the author's initial focus?", options: ['Speaking', 'Vocabulary', 'Grammar', 'Listening'], correctIndex: 1, explanation: 'The text states early studies were focused on vocabulary.' },
  { id: 'q2', prompt: "What insight was described as 'crucial'?", options: ['That practice matters', 'That speaking and writing are crucial components', 'That grammar is overrated', 'That listening is enough'], correctIndex: 1 },
  { id: 'q3', prompt: 'What change happened next?', options: ['Stopped studying', 'Switched languages', 'Started practicing speaking and writing daily', 'Took a break'], correctIndex: 2 },
];

export const BADGES: Badge[] = [
  { id: 'b1', name: 'English Master', description: 'Complete 100 lessons', icon: '🏆', unlocked: true },
  { id: 'b2', name: 'Polyglot',       description: 'Learn 500 words',     icon: '🪶', unlocked: true },
  { id: 'b3', name: 'Perfect Score',  description: '100% on a quiz',      icon: '🧭', unlocked: true },
  { id: 'b4', name: 'Locked',         description: 'Keep going to unlock', icon: '🔒', unlocked: false },
  { id: 'b5', name: 'Streak 7',       description: '7-day streak',         icon: '🔥', unlocked: true },
  { id: 'b6', name: 'Streak 30',      description: '30-day streak',        icon: '💎', unlocked: false },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { userId: 'u1', name: 'Jackson R.',     countryFlag: '🇺🇸', streak: 27, level: 2500 },
  { userId: 'u2', name: 'You',            countryFlag: '🇺🇿', streak: 24, level: 2000, isMe: true },
  { userId: 'u3', name: 'Mary J.',        countryFlag: '🇬🇧', streak: 16, level: 1700 },
  { userId: 'u4', name: 'Emma',           countryFlag: '🇮🇹', streak: 6,  level: 1500 },
  { userId: 'u5', name: 'Akira',          countryFlag: '🇯🇵', streak: 12, level: 1450 },
];

// ---------- Parent demo data ----------

export const PARENT_CHILDREN: ParentChild[] = [
  { id: 'pc1', parentId: 'p1', childId: 'c1', name: 'Alibek',  age: 12, linkedAt: '2026-04-01', isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=160&q=80' },
  { id: 'pc2', parentId: 'p1', childId: 'c2', name: 'Malika',  age: 14, linkedAt: '2026-04-12', isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&q=80' },
];

export const PARENTAL_CONTROLS: Record<string, ParentalControls> = {
  c1: { childId: 'c1', dailyLimitMins: 45, allowedFrom: '15:00', allowedTo: '20:00', aiChatEnabled: false, leaderboardVisible: true,
        notifyDailySummary: true, notifyMissedSession: true, notifyNewBadge: true },
  c2: { childId: 'c2', dailyLimitMins: 60, allowedFrom: '14:00', allowedTo: '21:00', aiChatEnabled: true,  leaderboardVisible: true,
        notifyDailySummary: true, notifyMissedSession: false, notifyNewBadge: true },
};

// Relative to "today" so the parent dashboard demo shows real-looking recent
// activity instead of a permanently stale, fixed calendar date.
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

export const DAILY_REPORTS: DailyReport[] = [
  { id: 'r1', childId: 'c1', date: daysAgo(4), minutesSpent: 38, lessonsDone: 3, xpEarned: 120, streakMaintained: true },
  { id: 'r2', childId: 'c1', date: daysAgo(3), minutesSpent: 42, lessonsDone: 4, xpEarned: 180, streakMaintained: true },
  { id: 'r3', childId: 'c1', date: daysAgo(2), minutesSpent: 0,  lessonsDone: 0, xpEarned: 0,   streakMaintained: false },
  { id: 'r4', childId: 'c1', date: daysAgo(1), minutesSpent: 50, lessonsDone: 5, xpEarned: 220, streakMaintained: true },
  { id: 'r5', childId: 'c1', date: daysAgo(0), minutesSpent: 22, lessonsDone: 2, xpEarned: 90,  streakMaintained: true },
  { id: 'r6', childId: 'c2', date: daysAgo(1), minutesSpent: 65, lessonsDone: 6, xpEarned: 280, streakMaintained: true },
];

export const SUBTITLE_CARDS = [
  { num: 1, en: 'Hello',          ipa: '/həˈloʊ/',         hint: 'Greeting' },
  { num: 2, en: 'Good morning',   ipa: '/ɡʊd ˈmɔːr.nɪŋ/',  hint: 'Morning greeting' },
  { num: 3, en: 'How are you?',   ipa: '/haʊ ɑːr juː/',    hint: 'Polite question' },
  { num: 4, en: 'Nice to meet you', ipa: '/naɪs tuː miːt juː/', hint: 'Introduction' },
  { num: 5, en: 'Goodbye',        ipa: '/ˌɡʊdˈbaɪ/',       hint: 'Farewell' },
];
