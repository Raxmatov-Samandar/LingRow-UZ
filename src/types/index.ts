// =============================================================
// LingRow — Type definitions (mirrors Plan v2 DB schema)
// =============================================================

export type UserRole = 'student' | 'adult' | 'dtm' | 'parent';

export type Plan = 'kids' | 'teen' | 'ielts' | 'dtm' | 'corporate' | 'family';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  age?: number;
  avatarUrl?: string;
  plan?: Plan;
  createdAt: string;
}

export interface OnboardingState {
  goal?: 'travel' | 'school' | 'ielts' | 'dtm' | 'work';
  level?: 'beginner' | 'intermediate' | 'advanced' | 'mastery';
  examDate?: string;          // ISO string for IELTS/DTM
  bandTarget?: number;        // 4.5 – 9
  dailyMinutes?: number;
}

export type LessonLevel = 'beginner' | 'intermediate' | 'advanced' | 'mastery';

export interface Lesson {
  id: string;
  title: string;
  level: LessonLevel;
  totalLessons: number;
  completedLessons: number;
  type: 'video' | 'reading' | 'speaking' | 'writing' | 'quiz';
  description?: string;
}

export interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  definition: string;
  example?: string;
  level: LessonLevel;
  /** SM-2 spaced-repetition fields */
  sm2: {
    easeFactor: number;
    interval: number;          // days
    repetitions: number;
    nextReview: string;        // ISO
  };
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

// ---------------- Parent module (Plan v2 §3) ----------------

export interface ParentChild {
  id: string;
  parentId: string;
  childId: string;
  name: string;
  age: number;
  linkedAt: string;
  isActive: boolean;
  avatarUrl?: string;
}

export interface ParentalControls {
  childId: string;
  dailyLimitMins: number;        // default 60
  allowedFrom: string;           // "15:00"
  allowedTo: string;             // "21:00"
  aiChatEnabled: boolean;
  leaderboardVisible: boolean;
  notifyDailySummary: boolean;
  notifyMissedSession: boolean;
  notifyNewBadge: boolean;
}

// ---------------- Billing ----------------

export interface Subscription {
  plan: Plan;
  currentPeriodEnd: string;   // ISO date
  cancelAtPeriodEnd: boolean;
}

export interface Invoice {
  id: string;
  date: string;               // ISO
  amountUzs: number;
  status: string;             // 'paid' | 'pending' | 'cancelled' | 'failed' | 'refunded'
}

export interface DailyReport {
  id: string;
  childId: string;
  date: string;                  // YYYY-MM-DD
  minutesSpent: number;
  lessonsDone: number;
  xpEarned: number;
  streakMaintained: boolean;
}

// ---------------- Gamification ----------------

export interface UserProgress {
  userId: string;
  xp: number;
  streak: number;
  badges: string[];
  level: number;
  lastActiveDate: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;                  // emoji or asset url
  unlocked: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  countryFlag: string;
  streak: number;
  level: number;
  isMe?: boolean;
}

// ---------------- Uzbek Error DNA ----------------

export type ErrorCategory = 'articles' | 'prepositions' | 'tense' | 'word_order' | 'vocabulary';

export interface ErrorCatalogEntry {
  id: string;
  category: ErrorCategory;
  wrongExample: string;
  correctExample: string;
  uzbekRootCause: string;
  explanation?: string;
}

export interface DiagnosticQuestion {
  id: string;
  category: ErrorCategory;
  prompt: string;
  options: string[];
}

/** Result of checking a single answer — only fetched after the learner
 *  answers that question, so the answer key never ships with the question set. */
export interface DiagnosticAnswerCheck {
  correct:      boolean;
  correctIndex: number;
  explanation:  string;
}

/** category → 0-100 mastery score (higher = stronger). */
export type DnaScores = Partial<Record<ErrorCategory, number>>;

/** One row of the admin retention dashboard — real per-user usage, not local-only stats. */
export interface RetentionRow {
  userId:          string;
  name:            string;
  email:           string | null;
  role:            UserRole;
  signedUpAt:      string;
  daysSinceSignup: number;
  lastActiveDate:  string | null;
  activeToday:     boolean;
  streak:          number;
  xp:              number;
}

/** One uploaded Listening audio file — stored in Supabase Storage + the
 *  listening_audio table, keyed by slot (matches the static /public/audio
 *  naming, e.g. 'c18-t1-p1') so real users on any device can hear it. */
export interface ListeningAudioRow {
  slot:       string;
  url:        string;
  filename:   string;
  sizeBytes:  number;
  uploadedAt: string;
}
