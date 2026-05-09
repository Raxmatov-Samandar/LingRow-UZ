// =============================================================================
// User-created articles — persisted in localStorage so anyone can upload
// their own daily reading material.
// =============================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Article } from '@/data/articles/daily-articles';

interface UserArticlesState {
  list: Article[];
  add:  (a: Omit<Article, 'id' | 'publishedAt'> & { id?: string; publishedAt?: string }) => Article;
  update: (id: string, patch: Partial<Article>) => void;
  remove: (id: string) => void;
  get:    (id: string) => Article | undefined;
}

export const useUserArticles = create<UserArticlesState>()(
  persist(
    (set, get) => ({
      list: [],

      add: (a) => {
        const article: Article = {
          ...a,
          id:          a.id          ?? `user-${crypto.randomUUID().slice(0, 8)}`,
          publishedAt: a.publishedAt ?? new Date().toISOString().slice(0, 10),
        };
        set({ list: [article, ...get().list] });
        return article;
      },

      update: (id, patch) => {
        set({
          list: get().list.map(a => (a.id === id ? { ...a, ...patch } : a)),
        });
      },

      remove: (id) => {
        set({ list: get().list.filter(a => a.id !== id) });
      },

      get: (id) => get().list.find(a => a.id === id),
    }),
    { name: 'lr-user-articles' }
  )
);
