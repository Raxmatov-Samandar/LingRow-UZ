// =============================================================================
// Dev-uploaded content store. Holds:
//   • lessons (custom video / reading / speaking / writing materials)
//   • books / DTM PDFs (still base64-in-localStorage — see note below)
//
// Listening audio used to live here as base64 data URLs too, but that had
// two real problems: localStorage caps out around 5-10MB (a couple of MP3s
// and it breaks), and it's per-browser, so an upload never reached real
// users on other devices. It's been moved to Supabase Storage + the
// listening_audio table (see admin.uploadListeningAudio in lib/api.ts) —
// same trade-off still applies to books/DTM PDFs below, not yet migrated.
//
// Articles already have their own store (useUserArticles).
// =============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LessonKind = 'video' | 'reading' | 'speaking' | 'writing' | 'quiz'
export type LessonLevel = 'beginner' | 'intermediate' | 'advanced' | 'mastery'

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

export interface DevLesson {
  id:          string
  title:       string
  level:       LessonLevel
  kind:        LessonKind
  description?: string
  /** Free-form body — markdown / passage / cue card. */
  body:        string
  /** Optional URL or data-URL for video / audio asset. */
  mediaUrl?:   string
  durationMin?: number
  createdAt:   string
}

interface State {
  books:   DevBook[]
  lessons: DevLesson[]
  dtm:     DtmDocument[]

  addBook:     (b: Omit<DevBook, 'id' | 'uploadedAt'>) => DevBook
  updateBook:  (id: string, patch: Partial<DevBook>) => void
  removeBook:  (id: string) => void

  addLesson:    (l: Omit<DevLesson, 'id' | 'createdAt'>) => DevLesson
  updateLesson: (id: string, patch: Partial<DevLesson>) => void
  removeLesson: (id: string) => void

  addDtmDocument:    (d: Omit<DtmDocument, 'id' | 'uploadedAt'>) => DtmDocument
  removeDtmDocument: (id: string) => void

  clearAll: () => void
}

export const useDevContent = create<State>()(
  persist(
    (set, get) => ({
      books: [],
      lessons: [],
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

      addLesson: (l) => {
        const item: DevLesson = {
          ...l,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set({ lessons: [item, ...get().lessons] })
        return item
      },
      updateLesson: (id, patch) =>
        set({ lessons: get().lessons.map(l => (l.id === id ? { ...l, ...patch } : l)) }),
      removeLesson: (id) => set({ lessons: get().lessons.filter(l => l.id !== id) }),

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

      clearAll: () => set({ books: [], lessons: [], dtm: [] }),
    }),
    { name: 'lr-dev-content' }
  )
)
