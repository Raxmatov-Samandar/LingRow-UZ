import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingState, User, UserRole } from '@/types';
import { auth } from '@/lib/api';

interface AuthState {
  user: User | null;
  onboarding: OnboardingState;
  selectedRole: UserRole | null;

  setRole: (role: UserRole) => void;
  setOnboarding: (patch: Partial<OnboardingState>) => void;
  signIn: (email: string, password: string, role?: UserRole) => Promise<User>;
  signUp: (opts: { name: string; email: string; password: string; role: UserRole; age?: number }) => Promise<User>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      onboarding: {},
      selectedRole: null,

      setRole: role => set({ selectedRole: role }),
      setOnboarding: patch => set({ onboarding: { ...get().onboarding, ...patch } }),

      async signIn(email, password, role) {
        const user = await auth.signIn(email, password, role ?? get().selectedRole ?? 'student');
        set({ user });
        return user;
      },

      async signUp(opts) {
        const user = await auth.signUp(opts);
        set({ user });
        return user;
      },

      async signOut() {
        await auth.signOut();
        set({ user: null, onboarding: {}, selectedRole: null });
      },
    }),
    { name: 'lr-auth' }
  )
);
