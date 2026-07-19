// =============================================================================
// Uzbek Error DNA — mock-mode persistence for diagnostic scores.
// Real mode reads/writes come from user_dna_scores via Supabase; this store
// only stands in for that table when VITE_USE_MOCK_API=true.
// =============================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DnaScores } from '@/types';

interface State {
  scores: DnaScores;
  attempts: number;
  recordAttempt: (newScores: DnaScores) => void;
}

export const useDna = create<State>()(
  persist(
    (set, get) => ({
      scores: {},
      attempts: 0,
      recordAttempt: (newScores) => set({ scores: { ...get().scores, ...newScores }, attempts: get().attempts + 1 }),
    }),
    { name: 'lr-error-dna' }
  )
);
