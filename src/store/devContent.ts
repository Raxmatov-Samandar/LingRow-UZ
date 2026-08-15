// =============================================================================
// Dev-uploaded content store. Holds:
//   • DTM PDFs (still base64-in-localStorage — see note below)
//
// Listening audio, lessons, and Cambridge books used to live here too (base64
// audio/PDFs, and local-only lists), but that had two real problems:
// localStorage caps out around 5-10MB, and it's per-browser, so an
// upload/publish never reached real users on other devices — Lesson.tsx,
// Listening.tsx and Reading.tsx read from this same local store, so content
// "published" from the founder's laptop was invisible everywhere else. All
// three moved to real Supabase tables (see admin.uploadListeningAudio /
// admin.publishLesson / admin.uploadCambridgeBook in lib/api.ts) — same
// trade-off still applies to the DTM PDFs below, not yet migrated.
//
// Articles already have their own store (useUserArticles).
// =============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DtmSubject = 'math' | 'english' | 'native'

export interface DtmDocument {
  id:          string
  subject:     DtmSubject
  title:       string
  /** Original PDF as data URL — same trade-off Cambridge books used to have. */
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
  dtm: DtmDocument[]

  addDtmDocument:    (d: Omit<DtmDocument, 'id' | 'uploadedAt'>) => DtmDocument
  removeDtmDocument: (id: string) => void

  clearAll: () => void
}

export const useDevContent = create<State>()(
  persist(
    (set, get) => ({
      dtm: [],

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

      clearAll: () => set({ dtm: [] }),
    }),
    { name: 'lr-dev-content' }
  )
)
