// =============================================================================
// Per-word annotations the learner makes inside Reading passages.
// Stored in localStorage so they persist across sessions.
// =============================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WordNote {
  word:        string;        // canonical lowercase word
  translation: string;        // user-supplied UZ translation
  note:        string;        // free-form notes / mnemonic / context
  createdAt:   number;
  updatedAt:   number;
}

interface NotesState {
  notes: Record<string, WordNote>;     // key = word.toLowerCase()
  upsert: (word: string, patch: Partial<Pick<WordNote, 'translation' | 'note'>>) => void;
  remove: (word: string) => void;
  get:    (word: string) => WordNote | undefined;
  count:  () => number;
}

export const useWordNotes = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: {},

      upsert: (word, patch) => {
        const key  = word.toLowerCase();
        const prev = get().notes[key];
        const next: WordNote = {
          word:        key,
          translation: patch.translation ?? prev?.translation ?? '',
          note:        patch.note        ?? prev?.note        ?? '',
          createdAt:   prev?.createdAt ?? Date.now(),
          updatedAt:   Date.now(),
        };
        // Don't store empty notes
        if (!next.translation.trim() && !next.note.trim()) {
          const { [key]: _, ...rest } = get().notes;
          void _;
          set({ notes: rest });
          return;
        }
        set({ notes: { ...get().notes, [key]: next } });
      },

      remove: (word) => {
        const key = word.toLowerCase();
        const { [key]: _, ...rest } = get().notes;
        void _;
        set({ notes: rest });
      },

      get: (word) => get().notes[word.toLowerCase()],

      count: () => Object.keys(get().notes).length,
    }),
    { name: 'lr-word-notes' }
  )
);
