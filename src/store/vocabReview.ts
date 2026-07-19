// =============================================================================
// SM-2 spaced repetition — mock-mode persistence.
// Mirrors the real sm2_review() Postgres function's formula exactly, so mock
// mode and a wired backend behave the same way. Real mode stores this state
// in user_vocab and updates it via the sm2_review RPC instead.
// =============================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Sm2State {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string; // ISO
}

interface State {
  overrides: Record<string, Sm2State>;
  review: (wordId: string, quality: 0 | 1 | 2 | 3 | 4 | 5, prev: Sm2State) => Sm2State;
}

function sm2(quality: number, prev: Sm2State): Sm2State {
  let ef       = prev.easeFactor;
  let interval = prev.interval;
  let reps     = prev.repetitions;

  if (quality < 3) {
    reps = 0;
    interval = 1;
    ef = Math.max(1.3, ef - 0.2);
  } else {
    reps += 1;
    interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(interval * ef);
    ef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }

  return {
    easeFactor: ef,
    interval,
    repetitions: reps,
    nextReview: new Date(Date.now() + interval * 86_400_000).toISOString(),
  };
}

export const useVocabReview = create<State>()(
  persist(
    (set, get) => ({
      overrides: {},
      review: (wordId, quality, prev) => {
        const next = sm2(quality, prev);
        set({ overrides: { ...get().overrides, [wordId]: next } });
        return next;
      },
    }),
    { name: 'lr-vocab-review' }
  )
);
