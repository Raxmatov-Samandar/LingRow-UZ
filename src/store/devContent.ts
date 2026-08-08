// =============================================================================
// Dev-uploaded content store. Holds:
//   • books / DTM PDFs (still base64-in-localStorage — see note below)
//
// Listening audio and lessons used to live here too (base64 audio, and a
// local-only DevLesson list), but that had two real problems: localStorage
// caps out around 5-10MB, and it's per-browser, so an upload/publish never
// reached real users on other devices — Lesson.tsx and Listening.tsx read
// from this same local store, so content "published" from the founder's
// laptop was invisible everywhere else. Both moved to real Supabase tables
// (see admin.uploadListeningAudio / admin.publishLesson in lib/api.ts) —
// same trade-off still applies to books/DTM PDFs below, not yet migrated.
//
// Articles already have their own store (useUserArticles).
// =============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BookKind = 'cambridge_ielts' | 'general' | 'other'

export interface DevBookQuestion {
  num:      number
  kind:     string
  prompt:   string
  options?: string[]
  answers?: string[]
}

export interface DevBookPart {
  partNum:       number
  title:         string
  intro?:        string
  passage:       string
  questionRange?: [number, number]
  questions:     DevBookQuestion[]
}

export interface DevBook {
  id:          string
  title:       string
  kind:        BookKind
  /** 'GT' | 'AC' | 'unknown' (Cambridge only). */
  module?:     string
  source?:     string
  /** Original PDF as data URL — kept so the dev can re-open or re-parse. */
  pdfDataUrl:  string
  pdfFilename: string
  pdfSize:     number
  numPages:    number
  /** Plain extracted text (per-page joined with \f). */
  rawText:     string
  /** Parsed structure if successful. Empty array = parse failed / not run. */
  parts:       DevBookPart[]
  warnings:    string[]
  uploadedAt:  string
}

export type DtmSubject = 'math' | 'english' | 'native'

export interface DtmDocument {
  id:          string
  subject:     DtmSubject
  title:       string
  /** Original PDF as data URL — same trade-off as DevBook: cheap, persistable. */
  pdfDataUrl:  string
  pdfFilename: string
  pdfSize:     number
  numPages:    number
  /** Plain extracted text. No structured parser exists for DTM content yet
   *  (math notation and Uzbek native-language text don't fit the Cambridge
   *  heuristic) — this is raw material for the dev to reference, not an
   *  auto-graded test. */
  rawText:     string
  uploadedAt:  string
}

interface State {
  books:   DevBook[]
  dtm:     DtmDocument[]

  addBook:     (b: Omit<DevBook, 'id' | 'uploadedAt'>) => DevBook
  updateBook:  (id: string, patch: Partial<DevBook>) => void
  removeBook:  (id: string) => void

  addDtmDocument:    (d: Omit<DtmDocument, 'id' | 'uploadedAt'>) => DtmDocument
  removeDtmDocument: (id: string) => void

  clearAll: () => void
}

export const useDevContent = create<State>()(
  persist(
    (set, get) => ({
      books: [],
      dtm: [],

      addBook: (b) => {
        const item: DevBook = {
          ...b,
          id: crypto.randomUUID(),
          uploadedAt: new Date().toISOString(),
        }
        set({ books: [item, ...get().books] })
        return item
      },
      updateBook: (id, patch) =>
        set({ books: get().books.map(b => (b.id === id ? { ...b, ...patch } : b)) }),
      removeBook: (id) => set({ books: get().books.filter(b => b.id !== id) }),

      addDtmDocument: (d) => {
        const item: DtmDocument = {
          ...d,
          id: crypto.randomUUID(),
          uploadedAt: new Date().toISOString(),
        }
        set({ dtm: [item, ...get().dtm] })
        return item
      },
      removeDtmDocument: (id) => set({ dtm: get().dtm.filter(d => d.id !== id) }),

      clearAll: () => set({ books: [], dtm: [] }),
    }),
    { name: 'lr-dev-content' }
  )
)
