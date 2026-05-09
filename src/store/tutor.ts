import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TutorSection = 'general' | 'listening' | 'reading' | 'writing' | 'speaking';

export interface TutorMessage {
  id:       string;
  role:     'user' | 'assistant';
  content:  string;
  ts:       number;
  section?: TutorSection;
}

interface TutorState {
  messages: TutorMessage[];
  section:  TutorSection;
  isThinking: boolean;

  setSection: (s: TutorSection) => void;
  addMessage: (m: Omit<TutorMessage, 'id' | 'ts'>) => TutorMessage;
  setThinking: (v: boolean) => void;
  reset: () => void;
}

export const useTutor = create<TutorState>()(
  persist(
    (set, get) => ({
      messages: [],
      section:  'general',
      isThinking: false,

      setSection: (s) => set({ section: s }),
      addMessage: (m) => {
        const msg: TutorMessage = {
          ...m, id: crypto.randomUUID(), ts: Date.now(), section: m.section ?? get().section,
        };
        set({ messages: [...get().messages, msg] });
        return msg;
      },
      setThinking: (v) => set({ isThinking: v }),
      reset: () => set({ messages: [], isThinking: false }),
    }),
    { name: 'lr-tutor', partialize: (s) => ({ messages: s.messages, section: s.section }) }
  )
);
