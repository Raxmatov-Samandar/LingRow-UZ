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

export function parseCambridgeReading(extraction: PdfExtraction): ParsedTest {
  const warnings: string[] = []
  const text = extraction.fullText
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')

  // detect module
  const module: ParsedTest['module'] =
    /general\s*training/i.test(text) ? 'GT'
    : /academic/i.test(text)         ? 'AC'
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
    source: detectSource(text),
    module,
    parts,
    warnings,
  }
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
