import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebar: (v: boolean) => void;
  /** Mobile-only: drawer overlay open/closed. Not persisted. */
  mobileNavOpen: boolean;
  toggleMobileNav: () => void;
  setMobileNav: (v: boolean) => void;
}

export const useUi = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setSidebar:    (v) => set({ sidebarCollapsed: v }),

      mobileNavOpen: false,
      toggleMobileNav: () => set({ mobileNavOpen: !get().mobileNavOpen }),
      setMobileNav:    (v) => set({ mobileNavOpen: v }),
    }),
    {
      name: 'lr-ui',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }), // don't persist drawer
    }
  )
);
