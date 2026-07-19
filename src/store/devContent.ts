// =============================================================================
// Dev-uploaded content store. Holds:
//   • audio assets (uploaded MP3s for Listening tests)
//   • lessons (custom video / reading / speaking / writing materials)
//
// Persisted to localStorage so the dev can manage content while the
// Supabase Storage backend is still being wired. When the real backend
// goes live, swap this store with a Supabase-backed query layer — the
// component contracts won't have to change.
//
// Articles already have their own store (useUserArticles).
// =============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LessonKind = 'video' | 'reading' | 'speaking' | 'writing' | 'quiz'
export type LessonLevel = 'beginner' | 'intermediate' | 'advanced' | 'mastery'

export interface DevAudio {
  id:        string
  /** Slot key e.g. 'c18-t1-p1', 'c18-t2-p3' — what the test page asks for. */
  slot:      string
  filename:  string
  mime:      string
  /** base64-data: URL. Cheap, persistable, fine for moderate file sizes. */
  dataUrl:   string
  sizeBytes: number
  uploadedAt: string
}

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
  audio:   DevAudio[]
  books:   DevBook[]
  lessons: DevLesson[]
  dtm:     DtmDocument[]

  addAudio:    (a: Omit<DevAudio, 'id' | 'uploadedAt'>) => DevAudio
  removeAudio: (id: string) => void

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
      audio: [],
      books: [],
      lessons: [],
      dtm: [],

      addAudio: (a) => {
        const item: DevAudio = {
          ...a,
          id: crypto.randomUUID(),
          uploadedAt: new Date().toISOString(),
        }
        // Replace any existing entry with the same slot — last upload wins
        const next = [item, ...get().audio.filter(x => x.slot !== a.slot)]
        set({ audio: next })
        return item
      },
      removeAudio: (id) => set({ audio: get().audio.filter(a => a.id !== id) }),

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

      clearAll: () => set({ audio: [], books: [], lessons: [], dtm: [] }),
    }),
    { name: 'lr-dev-content' }
  )
)
