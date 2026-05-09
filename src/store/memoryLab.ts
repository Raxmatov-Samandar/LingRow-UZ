// =============================================================================
// Memory Lab — 6-stage word mastery journey, neuroscience-backed.
// Stages: EXPOSURE → IMAGE → STORY → EMOTION → USE → MASTER
// =============================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Stage = 1 | 2 | 3 | 4 | 5 | 6;
export const STAGE_LABELS: Record<Stage, { name: string; emoji: string; sub: string }> = {
  1: { name: 'Exposure',    emoji: '👁',  sub: 'Meet the word' },
  2: { name: 'Image Anchor', emoji: '🎨', sub: 'Picture it vividly' },
  3: { name: 'Story Forge',  emoji: '✍',  sub: 'Write your own line' },
  4: { name: 'Emotion Tag',  emoji: '😊', sub: 'How did it feel?' },
  5: { name: 'Use Quest',    emoji: '🗣',  sub: 'Say or type it' },
  6: { name: 'Master',       emoji: '🌟', sub: 'Lock it in' },
};

export interface WordMastery {
  wordId:      string;
  word:        string;
  imageAnchor: string;          // free-form mental image
  imageEmoji:  string;          // 1 emoji
  story:       string;          // user's own example sentence
  emotion:     string;          // 1 emoji from emotion set
  used:        string;          // typed sentence used in real context
  masteredAt:  number;
}

interface State {
  mastery: Record<string, WordMastery>;
  /** Save (or update) a word's mastery record. */
  upsert: (m: WordMastery) => void;
  /** Remove a record (e.g. "I want to redo this"). */
  remove: (wordId: string) => void;
  /** Returns true once all 5 stages have content + masteredAt is set. */
  isMastered: (wordId: string) => boolean;
  count: () => number;
}

export const useMemoryLab = create<State>()(
  persist(
    (set, get) => ({
      mastery: {},
      upsert: (m) => set({ mastery: { ...get().mastery, [m.wordId]: m } }),
      remove: (id) => {
        const { [id]: _, ...rest } = get().mastery;
        void _;
        set({ mastery: rest });
      },
      isMastered: (id) => !!get().mastery[id]?.masteredAt,
      count: () => Object.values(get().mastery).filter(m => m.masteredAt).length,
    }),
    { name: 'lr-memory-lab' }
  )
);

export const EMOTION_SET = ['😱', '😂', '🤔', '❤️', '🔥', '💡', '🥲', '😎'];
export const ANCHOR_EMOJIS = ['🌟','🌊','🔥','🌳','🎯','💎','🦋','🚀','🌙','⚡','🗝','🎭','🧩','🪞','🦅','🌹'];
