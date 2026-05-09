// =============================================================================
// User activity log — every meaningful action is recorded here.
// The AI Tutor reads from this store to give personalised, context-aware advice.
// =============================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActivityKind =
  | 'lesson_started'
  | 'lesson_completed'
  | 'vocab_reviewed'
  | 'reading_completed'
  | 'article_read'
  | 'quiz_submitted'
  | 'writing_submitted'
  | 'speaking_practiced'
  | 'tutor_message';

export interface ActivityEvent {
  id:    string;
  kind:  ActivityKind;
  ts:    number;
  meta?: Record<string, unknown>;
}

export interface WeeklyStats {
  lessonsDone:        number;
  vocabReviewed:      number;
  quizzesTaken:       number;
  writingsGraded:     number;
  speakingsPractised: number;
  tutorMessages:      number;
  avgQuizScore:       number | null;
  bestBand:           number | null;
  weakestSection:     'listening' | 'reading' | 'writing' | 'speaking' | null;
}

interface ActivityState {
  events: ActivityEvent[];
  log: (kind: ActivityKind, meta?: Record<string, unknown>) => void;
  reset: () => void;
}

const MAX_EVENTS = 200;

export const useActivity = create<ActivityState>()(
  persist(
    (set, get) => ({
      events: [],
      log: (kind, meta) => {
        const event: ActivityEvent = { id: crypto.randomUUID(), kind, ts: Date.now(), meta };
        const next = [...get().events, event];
        if (next.length > MAX_EVENTS) next.splice(0, next.length - MAX_EVENTS);
        set({ events: next });
      },
      reset: () => set({ events: [] }),
    }),
    { name: 'lr-activity' }
  )
);

// ─── Pure helpers (call from useMemo so they don't break Zustand equality) ───

export function computeWeeklyStats(events: ActivityEvent[]): WeeklyStats {
  const week = events.filter(e => e.ts >= Date.now() - 7 * 86_400_000);
  const by = (k: ActivityKind) => week.filter(e => e.kind === k);

  const quizScores = by('quiz_submitted')
    .map(e => e.meta?.score as number)
    .filter(n => typeof n === 'number');
  const avgQuizScore = quizScores.length
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
    : null;

  const bands = [
    ...by('writing_submitted').map(e => e.meta?.band as number),
    ...by('speaking_practiced').map(e => e.meta?.band as number),
  ].filter(n => typeof n === 'number');
  const bestBand = bands.length ? +Math.max(...bands).toFixed(1) : null;

  const sectionScore = {
    listening: by('reading_completed').length,
    reading:   by('reading_completed').length,
    writing:   by('writing_submitted').length,
    speaking:  by('speaking_practiced').length,
  };
  const sortedSections = Object.entries(sectionScore).sort((a, b) => a[1] - b[1]);
  const weakestSection = (sortedSections[0]?.[0] ?? null) as WeeklyStats['weakestSection'];

  return {
    lessonsDone:        by('lesson_completed').length,
    vocabReviewed:      by('vocab_reviewed').length,
    quizzesTaken:       by('quiz_submitted').length,
    writingsGraded:     by('writing_submitted').length,
    speakingsPractised: by('speaking_practiced').length,
    tutorMessages:      by('tutor_message').length,
    avgQuizScore,
    bestBand,
    weakestSection,
  };
}

export function summaryForAi(events: ActivityEvent[]): string {
  const stats = computeWeeklyStats(events);
  const recent24 = events.filter(e => e.ts >= Date.now() - 24 * 3600_000);
  const lines: string[] = [];

  lines.push('## Learner activity (last 7 days)');
  lines.push(`- Lessons completed: ${stats.lessonsDone}`);
  lines.push(`- Vocabulary reviews: ${stats.vocabReviewed}`);
  lines.push(`- Quizzes taken: ${stats.quizzesTaken}` + (stats.avgQuizScore != null ? ` (avg ${stats.avgQuizScore}%)` : ''));
  lines.push(`- Writing submissions: ${stats.writingsGraded}`);
  lines.push(`- Speaking practice: ${stats.speakingsPractised}`);
  if (stats.bestBand != null) lines.push(`- Best estimated band so far: ${stats.bestBand.toFixed(1)}`);
  if (stats.weakestSection)   lines.push(`- Section with lowest practice: ${stats.weakestSection}`);

  if (recent24.length) {
    const lastWords = recent24
      .filter(e => e.kind === 'vocab_reviewed')
      .slice(-5).map(e => e.meta?.word).filter(Boolean);
    if (lastWords.length) lines.push(`- Words just studied: ${lastWords.join(', ')}`);
  } else {
    lines.push('- No activity in the last 24h.');
  }
  return lines.join('\n');
}
