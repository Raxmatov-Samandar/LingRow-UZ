import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  xp: number;
  streak: number;
  level: number;
  lastActiveDate: string;
  addXp: (n: number) => void;
  pingActive: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: 965,
      streak: 7,
      level: 4,
      lastActiveDate: new Date().toISOString().slice(0, 10),

      addXp: (n) => set({ xp: get().xp + n }),

      pingActive: () => {
        const today = new Date().toISOString().slice(0, 10);
        const last  = get().lastActiveDate;
        if (last === today) return;
        const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
        set({
          lastActiveDate: today,
          streak: last === yesterday ? get().streak + 1 : 1,
        });
      },
    }),
    { name: 'lr-progress' }
  )
);
