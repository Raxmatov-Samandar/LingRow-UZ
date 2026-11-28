import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingState, User, UserRole } from '@/types';
import { auth } from '@/lib/api';

interface AuthState {
  user: User | null;
  onboarding: OnboardingState;
  selectedRole: UserRole | null;
  /** True only between a fresh sign-up and finishing the onboarding questions. */
  needsOnboarding: boolean;

  setRole: (role: UserRole) => void;
  setOnboarding: (patch: Partial<OnboardingState>) => void;
  finishOnboarding: (answers: OnboardingState) => void;
  signIn: (email: string, password: string, role?: UserRole) => Promise<User>;
  signUp: (opts: { name: string; email: string; password: string; role: UserRole; age?: number }) => Promise<User>;
  signOut: () => Promise<void>;
  /** Dev-only: locally override the signed-in user's role to preview another
   *  panel (student / adult / dtm / parent). Client-side only — never touches
   *  the real profile in Supabase. Guarded in the UI by the Dev Panel. */
  previewRole: (role: UserRole) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      onboarding: {},
      selectedRole: null,
      needsOnboarding: false,

      setRole: role => set({ selectedRole: role }),
      setOnboarding: patch => set({ onboarding: { ...get().onboarding, ...patch } }),
      finishOnboarding: answers => {
        set({ onboarding: answers, needsOnboarding: false });
        const user = get().user;
        if (user) void auth.saveOnboarding(user.id, answers);
      },

      async signIn(email, password, role) {
        const user = await auth.signIn(email, password, role ?? get().selectedRole ?? 'student');
        const saved = await auth.loadOnboarding(user.id).catch(() => null);
        set({ user, needsOnboarding: false, ...(saved ? { onboarding: saved } : {}) });
        return user;
      },

      async signUp(opts) {
        const user = await auth.signUp(opts);
        set({ user, onboarding: {}, needsOnboarding: true });
        return user;
      },

      async signOut() {
        await auth.signOut();
        set({ user: null, onboarding: {}, selectedRole: null, needsOnboarding: false });
      },

      previewRole(role) {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, role } });
      },
    }),
    { name: 'lr-auth' }
  )
);
