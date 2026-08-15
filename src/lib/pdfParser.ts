// =============================================================================
// PDF text extraction + heuristic Cambridge IELTS parser.
//
// Two layers:
//   1) extractPdfText(file)     — turn a PDF File into per-page plain text.
//   2) parseCambridgeReading()  — best-effort heuristic that takes the text and
//                                 produces a ReadingTest-ish structure (passages
//                                 + questions). It's a starter — Cambridge books
//                                 are messy and the AI parser will eventually
//                                 take over. For now, this gets ~60-80% of a
//                                 test parsed and falls back to raw text for
//                                 anything it can't recognise.
// =============================================================================
import * as pdfjsLib from 'pdfjs-dist'
// Vite-friendly worker import: bundles the worker as a URL.
// eslint-disable-next-line import/no-unresolved
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc as string

// ───────────────────────── extraction ─────────────────────────

export interface PdfPage {
  pageNum: number
  text:    string
}

export interface PdfExtraction {
  numPages: number
  pages:    PdfPage[]
  /** All pages joined with \f form-feed between them. */
  fullText: string
}

export async function extractPdfText(file: File): Promise<PdfExtraction> {
  const buf = await file.arrayBuffer()
  const doc = await pdfjsLib.getDocument({ data: buf }).promise
  const pages: PdfPage[] = []

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    // pdfjs returns items with str + position; we join with spaces and
    // approximate line breaks via Y-coord changes.
    let lastY: number | null = null
    let text = ''
    for (const item of content.items as Array<{ str: string; transform: number[] }>) {
      const y = item.transform?.[5]
      if (lastY !== null && y !== undefined && Math.abs(y - lastY) > 4) {
        text += '\n'
      }
      text += item.str + ' '
      if (y !== undefined) lastY = y
    }
    pages.push({ pageNum: i, text: text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim() })
  }

  return {
    numPages: doc.numPages,
    pages,
    fullText: pages.map(p => p.text).join('\n\f\n'),
  }
}

/** True when a PDF has essentially no embedded text layer -- a scanned
 *  photocopy/image book, or a photocopy with just a distributor watermark
 *  on each page (which is what "AFARINESH IELTS House" etc. turn out to
 *  be: a few real words per page, no actual book content). Real Cambridge
 *  text averages several hundred characters per page. */
export function looksScanned(extraction: PdfExtraction): boolean {
  if (extraction.numPages === 0) return false
  const avgCharsPerPage = extraction.fullText.length / extraction.numPages
  return avgCharsPerPage < 120
}

// ───────────────────────── OCR fallback ─────────────────────────
// Scanned PDFs have no text to extract -- extractPdfText() finds nothing to
// find. This renders each page to a canvas and runs Tesseract.js over the
// image instead. Client-side OCR is slow (multiple seconds per page), so
// callers should let the dev restrict it to a page range (e.g. just the
// Reading section) rather than defaulting to the whole book.

export interface OcrProgress {
  page:       number
  totalPages: number
  status:     'rendering' | 'recognizing'
}

export async function ocrPdfPages(
  file: File,
  opts: { fromPage?: number; toPage?: number; onProgress?: (p: OcrProgress) => void } = {}
): Promise<PdfExtraction> {
  const { createWorker } = await import('tesseract.js')
  const buf = await file.arrayBuffer()
  const doc = await pdfjsLib.getDocument({ data: buf }).promise
  const from = Math.max(1, opts.fromPage ?? 1)
  const to = Math.min(doc.numPages, opts.toPage ?? doc.numPages)

  const worker = await createWorker('eng')
  const pages: PdfPage[] = []
  try {
    for (let i = from; i <= to; i++) {
      opts.onProgress?.({ page: i, totalPages: to, status: 'rendering' })
      const page = await doc.getPage(i)
      const viewport = page.getViewport({ scale: 2.2 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      await page.render({ canvasContext: ctx, viewport, canvas }).promise

      opts.onProgress?.({ page: i, totalPages: to, status: 'recognizing' })
      const { data } = await worker.recognize(canvas)
      pages.push({ pageNum: i, text: data.text.trim() })
    }
  } finally {
    await worker.terminate()
  }

  return {
    // The book's true page count, not just how many were OCR'd -- a
    // restricted page range shouldn't make the card report a shorter book.
    numPages: doc.numPages,
    pages,
    fullText: pages.map(p => p.text).join('\n\f\n'),
  }
}

// ───────────────────────── heuristic parser ─────────────────────────

export type QuestionKind =
  | 'tfng' | 'paragraph_match' | 'note_completion' | 'table_completion'
  | 'heading_match' | 'summary_completion' | 'mcq' | 'unknown'

export interface ParsedQuestion {
  num:      number
  kind:     QuestionKind
  prompt:   string
  options?: string[]
  answers?: string[]
}

export interface ParsedPart {
  partNum:    number
  title:      string
  intro?:     string
  passage:    string
  questionRange?: [number, number]
  questions:  ParsedQuestion[]
}

export interface ParsedTest {
  source:    string
  module:    'GT' | 'AC' | 'unknown'
  parts:     ParsedPart[]
  /** Anything we couldn't classify — handy for the dev to inspect. */
  warnings:  string[]
}

const RE_PART = /(?:^|\n)\s*(?:SECTION|PART|READING\s+PASSAGE)\s+(\d+)\b[^\n]*/gi
const RE_QUESTIONS_BLOCK = /Questions?\s+(\d+)\s*[–\-to]+\s*(\d+)/i
const RE_QNUM = /^\s*(\d{1,2})[.)\s]+(.+)/

// A real Cambridge book PDF bundles all four skills. Listening also uses
// "Section 1-4" headings and Speaking also uses "Part 1-3" -- if RE_PART is
// run over the whole document, it happily matches those too and mixes
// other skills' text into what's supposed to be one skill's content. This
// isolates the text between a standalone skill heading (LISTENING/READING/
// WRITING/SPEAKING) and the next one before RE_PART ever runs. A book with
// multiple tests has multiple headings of each kind -- testIndex (1-based,
// matching the Dev Panel's Test 1-4 picker) selects which occurrence.
const RE_SKILL_HEADING = /(?:^|\n)\s*(LISTENING|READING|WRITING|SPEAKING)\s*(?:\n|$)/gi

export type Skill = 'READING' | 'LISTENING'

function isolateSkillZone(text: string, skill: Skill, testIndex: number): { zone: string; found: boolean } {
  const matches = [...text.matchAll(RE_SKILL_HEADING)]
  const headings = matches.filter(m => m[1].toUpperCase() === skill)
  const target = headings[testIndex - 1]
  if (!target || target.index === undefined) return { zone: text, found: false }

  const start = target.index + target[0].length
  const next = matches.find(m => m[1].toUpperCase() !== skill && (m.index ?? 0) > target.index!)
  const end = next?.index ?? text.length
  return { zone: text.slice(start, end), found: true }
}

/** Shared by parseCambridgeReading/parseCambridgeListening -- same
 *  zone-isolation + SECTION/PART splitting, only the target skill heading
 *  differs. Listening has no real "passage" (it's a question sheet read
 *  while listening to audio), but the same passage/questions shape still
 *  works fine: `passage` just ends up holding whatever instructional text
 *  sits above the "Questions N-M" line -- and `answers` is always empty
 *  for Listening since there's no printed answer key to extract either way. */
function parseCambridgeSkill(extraction: PdfExtraction, skill: Skill, testIndex = 1): ParsedTest {
  const warnings: string[] = []
  const fullText = extraction.fullText
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')

  const { zone, found } = isolateSkillZone(fullText, skill, testIndex)
  if (!found) {
    warnings.push(`Could not find a "${skill}" heading for Test ${testIndex} — scanning the whole document instead (other skills' text may leak into the parsed parts).`)
  }
  const text = zone

  // detect module -- title-page wording can sit outside the isolated
  // zone, so this still looks at the full document.
  const module: ParsedTest['module'] =
    /general\s*training/i.test(fullText) ? 'GT'
    : /academic/i.test(fullText)         ? 'AC'
    : 'unknown'

  // Split by SECTION/PART markers
  const parts: ParsedPart[] = []
  const matches = [...text.matchAll(RE_PART)]
  if (matches.length === 0) {
    warnings.push('No SECTION/PART markers found — falling back to single block.')
    parts.push(rawPart(1, text))
  } else {
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i]
      const start = m.index ?? 0
      const end = i + 1 < matches.length ? (matches[i + 1].index ?? text.length) : text.length
      const chunk = text.slice(start, end)
      const partNum = Number(m[1]) || i + 1
      parts.push(parsePart(partNum, chunk, warnings))
    }
  }

  return {
    source: detectSource(fullText),
    module,
    parts,
    warnings,
  }
}

export function parseCambridgeReading(extraction: PdfExtraction, testIndex = 1): ParsedTest {
  return parseCambridgeSkill(extraction, 'READING', testIndex)
}

/** Extracts Listening question text (no audio, no answer key -- see
 *  parseCambridgeSkill's note above). Stored separately from Reading's
 *  `parts` so re-parsing one skill never clobbers the other. */
export function parseCambridgeListening(extraction: PdfExtraction, testIndex = 1): ParsedTest {
  return parseCambridgeSkill(extraction, 'LISTENING', testIndex)
}

function detectSource(text: string): string {
  const m = text.match(/Cambridge\s+IELTS\s+(\d+)/i)
  if (m) return `Cambridge IELTS ${m[1]}`
  return 'Unknown source'
}

function rawPart(partNum: number, chunk: string): ParsedPart {
  return {
    partNum,
    title: `Part ${partNum}`,
    passage: chunk.trim(),
    questions: [],
  }
}

function parsePart(partNum: number, chunk: string, warnings: string[]): ParsedPart {
  // First non-empty line after the SECTION marker is often the title.
  const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean)
  const title = lines[1] ?? `Part ${partNum}`

  // Question range
  const rangeMatch = chunk.match(RE_QUESTIONS_BLOCK)
  const questionRange: [number, number] | undefined = rangeMatch
    ? [Number(rangeMatch[1]), Number(rangeMatch[2])]
    : undefined

  // Try to split passage from questions: heuristic — passage ends at the
  // first "Questions N–M" instructions block.
  let passage = chunk
  let qBlock = ''
  if (rangeMatch && rangeMatch.index !== undefined) {
    passage = chunk.slice(0, rangeMatch.index).trim()
    qBlock = chunk.slice(rangeMatch.index)
  } else {
    warnings.push(`Part ${partNum}: no "Questions N–M" header found.`)
  }

  // Walk question lines and bucket numbered prompts.
  const questions: ParsedQuestion[] = []
  if (qBlock) {
    const qLines = qBlock.split('\n')
    let current: ParsedQuestion | null = null
    let kind: QuestionKind = 'unknown'

    for (const raw of qLines) {
      const line = raw.trim()
      if (!line) continue

      // Detect a new question kind from instructional phrasing
      if (/true\s*\/?\s*false\s*\/?\s*not\s*given/i.test(line)) kind = 'tfng'
      else if (/choose\s+the\s+correct\s+letter/i.test(line))    kind = 'mcq'
      else if (/match\s+each\s+statement|paragraph\s+contains/i.test(line)) kind = 'paragraph_match'
      else if (/list\s+of\s+headings|choose\s+the\s+correct\s+heading/i.test(line)) kind = 'heading_match'
      else if (/no\s+more\s+than\s+\w+\s+words?/i.test(line))    kind = (current as ParsedQuestion | null)?.kind ?? 'note_completion'

      const m = line.match(RE_QNUM)
      if (m) {
        if (current) questions.push(current)
        current = {
          num:    Number(m[1]),
          kind,
          prompt: m[2].trim(),
        }
      } else if (current) {
        current.prompt += ' ' + line
      }
    }
    if (current) questions.push(current)
  }

  return {
    partNum,
    title,
    intro: rangeMatch?.[0],
    passage: passage.trim(),
    questionRange,
    questions,
  }
}
