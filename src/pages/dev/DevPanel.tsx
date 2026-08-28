// =============================================================================
// Dev Panel — single-account content admin.
// Tabs:
//   • Audio    — upload Listening MP3s, mapped by slot key (c18-t1-p1)
//   • Articles — link to the existing public article editor
//   • Lessons  — create/edit custom lessons stored in localStorage
//   • Stats    — content counts + storage usage
// =============================================================================
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Cosmos } from '@/components/layout/Cosmos'
import { AppShell } from '@/components/layout/AppShell'
import { Topbar } from '@/components/layout/Topbar'
import { useAuth } from '@/store/auth'
import { useDevContent, type DtmSubject, type DtmDocument } from '@/store/devContent'
import { useUserArticles } from '@/store/userArticles'
import { isDevUser, DEV_EMAIL } from '@/lib/dev'
import { cn } from '@/lib/cn'
import { extractPdfText, parseCambridgeReading, parseCambridgeListening, looksScanned, ocrPdfPages, type OcrProgress, type PdfExtraction, type ParsedPart } from '@/lib/pdfParser'
import { MediaPlayer } from '@/components/ui/MediaPlayer'
import { admin, learning, isMockMode } from '@/lib/api'
import { detectMedia } from '@/lib/media'
import type { RetentionRow, UserRole, ListeningAudioRow, LessonDetail, LessonLevel, LessonKind, CambridgeBook, BookKind, TranscriptCue } from '@/types'

type Tab = 'panels' | 'audio' | 'articles' | 'cambridge' | 'books' | 'dtm' | 'lessons' | 'stats' | 'retention'

export function DevPanel() {
  const { t } = useTranslation()
  const user = useAuth(s => s.user)
  const [tab, setTab] = useState<Tab>('panels')

  if (!isDevUser(user)) {
    // Block non-dev users
    return <Navigate to="/home" replace />
  }

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerEmoji="🛠️" bannerTitle={t('dev.panel')} bannerSubtitle={t('dev.panelSub')} />

        {/* Tabs */}
        <div className="glass-panel px-4 py-3 flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cosmic-mint/20 text-cosmic-mint border border-cosmic-mint/40 mr-2">{t('dev.badge')}</span>
          {([
            ['panels',   '🧭', t('dev.tabs.panels')],
            ['audio',    '🎧', t('dev.tabs.audio')],
            ['articles', '📰', t('dev.tabs.articles')],
            ['cambridge', '📘', t('dev.tabs.cambridge')],
            ['books',    '📚', t('dev.tabs.books')],
            ['dtm',      '🎓', t('dev.tabs.dtm')],
            ['lessons',  '🎬', t('dev.tabs.lessons')],
            ['stats',    '📊', t('dev.tabs.stats')],
            ['retention', '📈', t('dev.tabs.retention')],
          ] as const).map(([id, emoji, label]) => (
            <button key={id} onClick={() => setTab(id as Tab)}
                    className={cn('px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5',
                      tab === id
                        ? 'bg-cosmic-mint/15 border border-cosmic-mint/45 text-cosmic-mint'
                        : 'border border-white/10 text-slate-300 hover:bg-white/[0.05]')}>
              <span>{emoji}</span>{label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-slate-500 font-mono">
            {DEV_EMAIL}
          </span>
        </div>

        <section className="flex-1 min-h-0 overflow-auto">
          {tab === 'panels'   && <PanelsTab />}
          {tab === 'audio'    && <AudioTab />}
          {tab === 'articles' && <ArticlesTab />}
          {tab === 'cambridge' && <CambridgeTab />}
          {tab === 'books'    && <BooksTab />}
          {tab === 'dtm'      && <DtmTab />}
          {tab === 'lessons'  && <LessonsTab />}
          {tab === 'stats'    && <StatsTab />}
          {tab === 'retention' && <RetentionTab />}
        </section>
      </AppShell>
    </>
  )
}

// ───────────────────────── Panels (role switcher) ─────────────────────────
// Lets the single dev/founder account preview each role's panel without
// creating separate accounts. previewRole() overrides the role locally only
// (client-side) — the real profile in Supabase is untouched.

const PANEL_ROLES: {
  role: UserRole
  emoji: string
  name: string
  desc: string
  home: string
  nav: string[]
  accent: string
}[] = [
  {
    role: 'student', emoji: '👦', name: 'Student panel', home: '/home',
    desc: 'Umumiy ingliz tili — darslar, lug‘at, Error DNA, statistika.',
    nav: ['Dashboard', 'AI Tutor', 'Lesson', 'Listening', 'Reading', 'Speaking', 'Writing', 'Vocabulary', 'Error DNA', 'Stats'],
    accent: 'from-cosmic-mint/20 to-cosmic-sky/10 border-cosmic-mint/40',
  },
  {
    role: 'adult', emoji: '🎓', name: 'Adult / IELTS panel', home: '/home',
    desc: 'Kattalar / IELTS yo‘nalishi — bir xil o‘quv oqimi, IELTS urg‘usi bilan.',
    nav: ['Dashboard', 'AI Tutor', 'Lesson', 'Listening', 'Reading', 'Speaking', 'Writing', 'Vocabulary', 'Error DNA', 'Stats'],
    accent: 'from-violet-400/20 to-blue-500/10 border-violet-300/40',
  },
  {
    role: 'dtm', emoji: '🎯', name: 'DTM panel', home: '/dtm/home',
    desc: 'O‘zbekiston DTM tayyorgarligi — Matematika, Ingliz tili, Ona tili, Mock, Past Papers.',
    nav: ['DTM Home', 'Mathematics', 'English', 'Native language', 'Mock Tests', 'Past Papers', 'My Progress'],
    accent: 'from-emerald-400/20 to-teal-500/10 border-emerald-300/40',
  },
  {
    role: 'parent', emoji: '👨‍👩‍👧', name: 'Parent panel', home: '/parent',
    desc: 'Ota-ona nazorati — farzand progressi, hisobotlar, nazorat sozlamalari, billing.',
    nav: ['Dashboard', 'Reports', 'Controls', 'Billing'],
    accent: 'from-amber-300/20 to-orange-500/10 border-amber-300/40',
  },
]

function PanelsTab() {
  const user = useAuth(s => s.user)
  const previewRole = useAuth(s => s.previewRole)
  const navigate = useNavigate()
  const activeRole = user?.role

  function switchTo(role: UserRole, home: string) {
    previewRole(role)
    navigate(home)
  }

  return (
    <div className="flex flex-col gap-5 p-1">
      <div className="glass-panel p-5">
        <h3 className="text-lg font-bold text-white">Panellar (rol almashtirish)</h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Bitta dev akkaunt bilan har bir foydalanuvchi panelini ko‘rib chiqing. Faqat lokal
          ko‘rinishni o‘zgartiradi — Supabase’dagi haqiqiy profil (<span className="font-mono">{user?.role}</span>) o‘zgarmaydi.
          Dev Panel har doim ochiq qoladi, shuning uchun istalgan vaqtda qaytishingiz mumkin.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PANEL_ROLES.map(p => {
          const isActive = activeRole === p.role
          return (
            <div key={p.role}
                 className={cn('glass-panel p-5 flex flex-col gap-3 border bg-gradient-to-br',
                   isActive ? p.accent : 'from-white/[0.02] to-white/[0.01] border-white/10')}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl grid place-items-center text-2xl border border-white/12 bg-white/[0.04] shrink-0">
                  {p.emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-white truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">role: {p.role}</p>
                </div>
                {isActive && (
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-cosmic-mint/20 text-cosmic-mint border border-cosmic-mint/40 shrink-0">
                    HOZIRGI
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>

              <div className="flex flex-wrap gap-1.5">
                {p.nav.map(n => (
                  <span key={n} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-slate-400">{n}</span>
                ))}
              </div>

              <button
                onClick={() => switchTo(p.role, p.home)}
                disabled={isActive}
                className={cn('mt-auto w-full py-2.5 rounded-xl text-sm font-bold transition active:scale-[0.98]',
                  isActive
                    ? 'bg-white/[0.04] border border-white/10 text-slate-500 cursor-default'
                    : 'btn-mint')}>
                {isActive ? 'Hozir shu panel' : `${p.name}ga o‘tish →`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ───────────────────────── Audio ─────────────────────────

function AudioTab() {
  const { t } = useTranslation()

  const [audio, setAudio] = useState<ListeningAudioRow[]>([])
  const [loading, setLoading] = useState(true)
  const [slot, setSlot] = useState('')
  const [picked, setPicked] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const ok = slot.trim().length >= 3 && !!picked && !isMockMode

  function refresh() {
    setLoading(true)
    admin.listListeningAudio().then(setAudio).finally(() => setLoading(false))
  }
  useEffect(refresh, [])

  async function upload() {
    if (!ok || !picked) return
    setUploading(true)
    setError(null)
    try {
      await admin.uploadListeningAudio(slot.trim(), picked)
      setSlot('')
      setPicked(null)
      if (fileRef.current) fileRef.current.value = ''
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setUploading(false)
    }
  }

  async function remove(s: string) {
    try {
      await admin.removeListeningAudio(s)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5 p-1">
      {/* Upload card */}
      <div className="glass-panel p-5 flex flex-col gap-3 h-fit">
        <header>
          <h3 className="text-lg font-bold text-white">{t('dev.audio.title')}</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t('dev.audio.sub')}</p>
        </header>

        {isMockMode && (
          <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5">
            {t('dev.audio.mockNotice')}
          </p>
        )}

        <label className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
          {t('dev.audio.slotLabel')}
        </label>
        <input value={slot} onChange={e => setSlot(e.target.value)}
               placeholder={t('dev.audio.slotPlaceholder')}
               className="input-glass font-mono text-sm" />

        <label className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold mt-2">
          MP3
        </label>
        <button type="button" onClick={() => fileRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-white/15 hover:border-cosmic-mint/50 hover:bg-white/[0.03] transition px-4 py-6 text-center">
          <p className="text-2xl mb-1">🎧</p>
          {picked
            ? <p className="text-sm text-cosmic-mint font-semibold truncate">{picked.name}</p>
            : <p className="text-xs text-slate-400">{t('dev.audio.drop')}</p>}
          {picked && <p className="text-[10px] text-slate-500 mt-1">{formatBytes(picked.size)}</p>}
        </button>
        <input ref={fileRef} type="file" accept="audio/mpeg,audio/mp3,audio/*"
               className="hidden"
               onChange={e => setPicked(e.target.files?.[0] ?? null)} />

        <button onClick={upload} disabled={!ok || uploading}
                className="btn-mint disabled:opacity-40 disabled:cursor-not-allowed">
          {uploading ? '…' : t('dev.audio.uploadBtn')}
        </button>

        {error && (
          <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2">
            {error}
          </p>
        )}
      </div>

      {/* Existing list */}
      <div className="glass-panel p-5">
        <h4 className="text-sm font-bold text-white mb-3">{t('dev.audio.uploaded')} ({audio.length})</h4>
        {loading ? (
          <p className="text-xs text-slate-400 italic">…</p>
        ) : audio.length === 0
          ? <p className="text-xs text-slate-400 italic">{t('dev.audio.noneYet')}</p>
          : (
            <div className="flex flex-col gap-2 max-h-[480px] overflow-auto pr-1">
              {audio.map(a => (
                <div key={a.slot} className="rounded-xl p-3 bg-white/[0.03] border border-white/8">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cosmic-sky/15 text-cosmic-sky border border-cosmic-sky/30 font-mono">{a.slot}</span>
                    <span className="text-xs text-white truncate flex-1 min-w-0">{a.filename}</span>
                    <span className="text-[10px] text-slate-500">{formatBytes(a.sizeBytes)}</span>
                  </div>
                  <audio controls preload="metadata" className="w-full mt-2 h-8" src={a.url} />
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{new Date(a.uploadedAt).toLocaleString()}</span>
                    <button onClick={() => remove(a.slot)}
                            className="text-rose-300 hover:text-rose-400">
                      {t('dev.audio.remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}

// ───────────────────────── Articles ─────────────────────────

function ArticlesTab() {
  const { t } = useTranslation()
  const list = useUserArticles(s => s.list)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5 p-1">
      <div className="glass-panel p-6 flex flex-col gap-3">
        <h3 className="text-lg font-bold text-white">{t('dev.articles.title')}</h3>
        <p className="text-sm text-slate-300 leading-relaxed">{t('dev.articles.sub')}</p>
        <Link to="/library/new" className="btn-mint w-fit">{t('dev.articles.open')}</Link>
        <p className="text-xs text-slate-400 italic mt-2">{t('dev.articles.manage')}</p>
      </div>

      <div className="glass-panel p-5">
        <h4 className="text-sm font-bold text-white mb-3">{list.length} {t('dev.tabs.articles')}</h4>
        <div className="flex flex-col gap-2 max-h-[480px] overflow-auto pr-1">
          {list.map(a => (
            <Link key={a.id} to={`/library/${a.id}`}
                  className="rounded-xl p-3 bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] transition">
              <p className="text-sm font-bold text-white">{a.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{a.cefr} · {a.readingMin} min · {a.topics.join(', ')}</p>
            </Link>
          ))}
          {list.length === 0 && <p className="text-xs text-slate-400 italic">—</p>}
        </div>
      </div>
    </div>
  )
}

// ───────────────────────── Cambridge Materials / Books (PDF) ─────────────────────────
// Both tabs share one backend (the cambridge_books table) and split purely by
// `kind`: 'cambridge_ielts' is official Cambridge Press content with its own
// dedicated tab (more kinds of Cambridge Press material land here over time);
// 'general' / 'other' are everything else, kept under the plain Books tab.

function CambridgeTab() {
  return <BookManager scope="cambridge" />
}

function BooksTab() {
  return <BookManager scope="other" />
}

function BookManager({ scope }: { scope: 'cambridge' | 'other' }) {
  const { t } = useTranslation()
  const kindOptions: BookKind[] = scope === 'cambridge' ? ['cambridge_ielts'] : ['general', 'other']

  const [books, setBooks] = useState<CambridgeBook[]>([])
  const [loading, setLoading] = useState(true)
  const [picked, setPicked] = useState<File | null>(null)
  const [kind, setKind] = useState<BookKind>(kindOptions[0])
  const [testNumber, setTestNumber] = useState<number | undefined>(scope === 'cambridge' ? 1 : undefined)
  const [skillTarget, setSkillTarget] = useState<'reading' | 'listening'>('reading')
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ocrFrom, setOcrFrom] = useState('')
  const [ocrTo, setOcrTo] = useState('')
  const [ocrProgress, setOcrProgress] = useState<OcrProgress | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const ok = !!picked && title.trim().length >= 2 && !busy && !isMockMode

  function refresh() {
    setLoading(true)
    admin.listCambridgeBooks()
      .then(all => setBooks(all.filter(b => (b.kind === 'cambridge_ielts') === (scope === 'cambridge'))))
      .finally(() => setLoading(false))
  }
  useEffect(refresh, []) // eslint-disable-line

  /** Falls back to OCR when the PDF has no real text layer (scanned/photocopied
   *  book) -- extractPdfText finds nothing to find in that case. OCR is slow
   *  client-side, so an optional page range keeps it fast when the dev only
   *  needs one section (e.g. just the Reading pages) rather than the whole book. */
  async function resolveExtraction(file: File): Promise<{ extraction: PdfExtraction; usedOcr: boolean }> {
    const extraction = await extractPdfText(file)
    if (!looksScanned(extraction)) return { extraction, usedOcr: false }

    setOcrProgress({ page: 0, totalPages: 0, status: 'rendering' })
    try {
      const ocred = await ocrPdfPages(file, {
        fromPage: ocrFrom ? Number(ocrFrom) : undefined,
        toPage: ocrTo ? Number(ocrTo) : undefined,
        onProgress: setOcrProgress,
      })
      return { extraction: ocred, usedOcr: true }
    } finally {
      setOcrProgress(null)
    }
  }

  function mapParsedParts(parts: ParsedPart[]) {
    return parts.map(p => ({
      partNum: p.partNum,
      title: p.title,
      intro: p.intro,
      passage: p.passage,
      questionRange: p.questionRange,
      questions: p.questions.map(q => ({
        num: q.num, kind: q.kind, prompt: q.prompt,
        options: q.options, answers: q.answers,
      })),
    }))
  }

  async function uploadAndParse() {
    if (!picked || !ok) return
    setBusy(true)
    setError(null)
    try {
      const { extraction, usedOcr } = await resolveExtraction(picked)
      const parseFn = skillTarget === 'listening' ? parseCambridgeListening : parseCambridgeReading
      const parsed = kind === 'cambridge_ielts'
        ? parseFn(extraction, testNumber ?? 1)
        : { source: '', module: 'unknown' as const, parts: [], warnings: ['Auto-parse skipped for non-Cambridge book.'] }
      if (usedOcr) {
        parsed.warnings = [
          'This PDF had no text layer -- OCR was used instead. Double-check the parsed passages/questions for recognition errors.',
          ...parsed.warnings,
        ]
      }

      const mappedParts = mapParsedParts(parsed.parts)
      await admin.uploadCambridgeBook({
        title: title.trim(),
        kind,
        module: parsed.module,
        source: parsed.source || undefined,
        testNumber,
        file: picked,
        numPages: extraction.numPages,
        rawText: extraction.fullText,
        parts: skillTarget === 'reading' ? mappedParts : [],
        warnings: skillTarget === 'reading' ? parsed.warnings : [],
        listeningParts: skillTarget === 'listening' ? mappedParts : undefined,
        listeningWarnings: skillTarget === 'listening' ? parsed.warnings : undefined,
      })

      setPicked(null)
      setTitle('')
      if (fileRef.current) fileRef.current.value = ''
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function reparse(book: CambridgeBook) {
    setBusy(true)
    setError(null)
    try {
      // Re-extract from the public PDF URL (bucket is public, so a plain fetch works).
      const blob = await (await fetch(book.pdfUrl)).blob()
      const file = new File([blob], book.pdfFilename, { type: 'application/pdf' })
      const { extraction, usedOcr } = await resolveExtraction(file)
      const parseFn = skillTarget === 'listening' ? parseCambridgeListening : parseCambridgeReading
      const parsed = parseFn(extraction, book.testNumber ?? 1)
      if (usedOcr) {
        parsed.warnings = [
          'This PDF had no text layer -- OCR was used instead. Double-check the parsed passages/questions for recognition errors.',
          ...parsed.warnings,
        ]
      }
      await admin.updateCambridgeBook(book.id, skillTarget, {
        rawText: extraction.fullText,
        numPages: extraction.numPages,
        module: parsed.module,
        source: parsed.source || undefined,
        parts: mapParsedParts(parsed.parts),
        warnings: parsed.warnings,
      })
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    try {
      await admin.removeCambridgeBook(id)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-5 p-1">
      {/* Upload card */}
      <div className="glass-panel p-5 flex flex-col gap-3 h-fit">
        <header>
          <h3 className="text-lg font-bold text-white">
            {scope === 'cambridge' ? t('dev.cambridge.title') : t('dev.books.title')}
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {scope === 'cambridge' ? t('dev.cambridge.sub') : t('dev.books.sub')}
          </p>
        </header>

        {isMockMode && (
          <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5">
            {scope === 'cambridge' ? t('dev.cambridge.mockNotice') : t('dev.books.mockNotice')}
          </p>
        )}

        <Field label={t('dev.lessons.lessonTitle')}>
          <input className="input-glass" value={title}
                 onChange={e => setTitle(e.target.value)}
                 placeholder={scope === 'cambridge' ? 'Cambridge IELTS 18 — GT' : 'My reading workbook'} />
        </Field>

        {kindOptions.length > 1 ? (
          <Field label={t('dev.books.pickKind')}>
            <select className="input-glass" value={kind} onChange={e => setKind(e.target.value as BookKind)}>
              {kindOptions.map(k => (
                <option key={k} value={k} className="bg-slate-900 text-white">
                  {t(`dev.books.kinds.${k}`)}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label={t('dev.books.pickKind')}>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cosmic-mint/15 text-cosmic-mint border border-cosmic-mint/30 w-fit">
              {t(`dev.books.kinds.${kindOptions[0]}`)}
            </span>
          </Field>
        )}

        {scope === 'cambridge' && (
          <Field label={t('dev.cambridge.testNumber')}>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(n => (
                <button key={n} type="button" onClick={() => setTestNumber(n)}
                        className={cn('flex-1 py-1.5 rounded-lg text-sm font-bold border transition',
                          testNumber === n
                            ? 'bg-cosmic-mint/15 border-cosmic-mint/45 text-cosmic-mint'
                            : 'border-white/10 text-slate-400 hover:bg-white/[0.05]')}>
                  {n}
                </button>
              ))}
            </div>
          </Field>
        )}

        {scope === 'cambridge' && (
          <Field label={t('dev.cambridge.skillTarget')}>
            <div className="flex gap-1.5">
              {(['reading', 'listening'] as const).map(s => (
                <button key={s} type="button" onClick={() => setSkillTarget(s)}
                        className={cn('flex-1 py-1.5 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5',
                          skillTarget === s
                            ? 'bg-cosmic-mint/15 border-cosmic-mint/45 text-cosmic-mint'
                            : 'border-white/10 text-slate-400 hover:bg-white/[0.05]')}>
                  <span>{s === 'reading' ? '📖' : '🎧'}</span>
                  {t(`dev.cambridge.skill.${s}`)}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">{t('dev.cambridge.skillTargetHint')}</p>
          </Field>
        )}

        <button type="button" onClick={() => fileRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-white/15 hover:border-cosmic-mint/50 hover:bg-white/[0.03] transition px-4 py-6 text-center mt-1">
          <p className="text-2xl mb-1">{scope === 'cambridge' ? '📘' : '📚'}</p>
          {picked
            ? <p className="text-sm text-cosmic-mint font-semibold truncate">{picked.name}</p>
            : <p className="text-xs text-slate-400">{t('dev.books.drop')}</p>}
          {picked && <p className="text-[10px] text-slate-500 mt-1">{formatBytes(picked.size)}</p>}
        </button>
        <input ref={fileRef} type="file" accept="application/pdf,.pdf"
               className="hidden"
               onChange={e => setPicked(e.target.files?.[0] ?? null)} />

        <Field label={t('dev.books.ocrRange')}>
          <div className="flex items-center gap-2">
            <input className="input-glass w-20" type="number" min={1} placeholder={t('dev.books.ocrFrom')}
                   value={ocrFrom} onChange={e => setOcrFrom(e.target.value)} />
            <span className="text-slate-500 text-xs">–</span>
            <input className="input-glass w-20" type="number" min={1} placeholder={t('dev.books.ocrTo')}
                   value={ocrTo} onChange={e => setOcrTo(e.target.value)} />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{t('dev.books.ocrRangeHint')}</p>
        </Field>

        <button onClick={uploadAndParse} disabled={!ok}
                className="btn-mint disabled:opacity-40 disabled:cursor-not-allowed">
          {ocrProgress
            ? `OCR: ${ocrProgress.page}/${ocrProgress.totalPages} (${ocrProgress.status === 'recognizing' ? t('dev.books.ocrRecognizing') : t('dev.books.ocrRendering')})…`
            : busy ? t('dev.books.parsing') : t('dev.books.uploadBtn')}
        </button>

        {error && (
          <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2">
            {error}
          </p>
        )}
      </div>

      {/* Existing books */}
      <div className="glass-panel p-5">
        <h4 className="text-sm font-bold text-white mb-3">
          {t('dev.books.uploaded')} ({books.length})
        </h4>
        {loading ? (
          <p className="text-xs text-slate-400 italic">…</p>
        ) : books.length === 0
          ? <p className="text-xs text-slate-400 italic">{t('dev.books.noneYet')}</p>
          : (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-auto pr-1">
              {books.map(b => <BookCard key={b.id} book={b}
                                        onRemove={() => remove(b.id)}
                                        onReparse={() => reparse(b)}
                                        busy={busy}
                                        ocrProgress={ocrProgress}
                                        showAudio={scope === 'cambridge'} />)}
            </div>
          )}
      </div>
    </div>
  )
}

function BookCard({ book, onRemove, onReparse, busy, ocrProgress, showAudio }: {
  book: CambridgeBook
  onRemove: () => void
  onReparse: () => void
  busy: boolean
  ocrProgress?: OcrProgress | null
  showAudio?: boolean
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [openListening, setOpenListening] = useState(false)
  const totalQ = book.parts.reduce((s, p) => s + p.questions.length, 0)

  return (
    <div className="rounded-xl p-3 bg-white/[0.03] border border-white/8">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cosmic-sky/15 text-cosmic-sky border border-cosmic-sky/30">
          {book.kind === 'cambridge_ielts' ? 'CAMB' : book.kind.toUpperCase()}
        </span>
        {book.module && book.module !== 'unknown' && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cosmic-mint/15 text-cosmic-mint border border-cosmic-mint/30">
            {book.module}
          </span>
        )}
        {book.testNumber != null && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-400/15 text-violet-300 border border-violet-400/30">
            {t('dev.cambridge.testBadge', { n: book.testNumber })}
          </span>
        )}
        <p className="text-sm font-bold text-white truncate flex-1 min-w-0">{book.title}</p>
      </div>
      <p className="text-[10px] text-slate-500 mt-1 truncate">{book.pdfFilename} · {formatBytes(book.pdfSize)}</p>

      <div className="grid grid-cols-3 gap-2 mt-2">
        <Stat n={book.numPages} l={t('dev.books.pages')} />
        <Stat n={book.parts.length} l={t('dev.books.parts')} />
        <Stat n={totalQ} l={t('dev.books.questions')} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        <button onClick={() => setOpen(o => !o)}
                className="px-2.5 py-1 rounded-md border border-white/15 text-slate-200 hover:bg-white/[0.05]">
          {open ? '▼' : '▶'} {t('dev.books.preview')}
        </button>
        {showAudio && (
          <button onClick={() => setOpenListening(o => !o)}
                  className="px-2.5 py-1 rounded-md border border-white/15 text-slate-200 hover:bg-white/[0.05]">
            {openListening ? '▼' : '▶'} 🎧 {t('dev.cambridge.listeningQuestions')} ({book.listeningParts.reduce((s, p) => s + p.questions.length, 0)})
          </button>
        )}
        <button onClick={onReparse} disabled={busy}
                className="px-2.5 py-1 rounded-md border border-cosmic-mint/40 text-cosmic-mint hover:bg-cosmic-mint/10 disabled:opacity-40">
          {busy && ocrProgress
            ? `OCR: ${ocrProgress.page}/${ocrProgress.totalPages}…`
            : t('dev.books.reparse')}
        </button>
        <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer"
           className="px-2.5 py-1 rounded-md border border-white/15 text-slate-200 hover:bg-white/[0.05]">
          PDF ↗
        </a>
        <button onClick={onRemove}
                className="ml-auto text-rose-300 hover:text-rose-400 px-2 py-1">
          {t('dev.books.remove')}
        </button>
      </div>

      {showAudio && <BookAudioPanel bookId={book.id} />}

      {book.warnings.length > 0 && (
        <details className="mt-2">
          <summary className="text-[10px] text-amber-300 cursor-pointer">
            ⚠ {t('dev.books.warnings')} ({book.warnings.length})
          </summary>
          <ul className="text-[10px] text-amber-200/80 mt-1 list-disc list-inside">
            {book.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </details>
      )}

      {open && (
        <div className="mt-3 border-t border-white/8 pt-3 flex flex-col gap-3">
          {book.parts.map(p => (
            <div key={p.partNum} className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
              <p className="text-xs font-bold text-cosmic-sky">Part {p.partNum} · {p.title}</p>
              <p className="text-[11px] text-slate-300 mt-1.5 line-clamp-4 whitespace-pre-line">{p.passage}</p>
              {p.questions.length > 0 && (
                <details className="mt-2">
                  <summary className="text-[10px] text-slate-400 cursor-pointer">
                    {p.questions.length} {t('dev.books.questions')}
                  </summary>
                  <ol className="text-[11px] text-slate-200 mt-1.5 space-y-1 pl-4 list-decimal">
                    {p.questions.slice(0, 20).map(q => (
                      <li key={q.num}>
                        <span className="text-[9px] text-slate-500 mr-1">[{q.kind}]</span>
                        {q.prompt}
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </div>
          ))}
          <details>
            <summary className="text-[10px] text-slate-500 cursor-pointer">{t('dev.books.raw')}</summary>
            <pre className="text-[10px] text-slate-400 mt-1 max-h-60 overflow-auto whitespace-pre-wrap">{book.rawText.slice(0, 5000)}{book.rawText.length > 5000 ? '\n…' : ''}</pre>
          </details>
        </div>
      )}

      {openListening && (
        <div className="mt-3 border-t border-white/8 pt-3 flex flex-col gap-3">
          {book.listeningWarnings.length > 0 && (
            <p className="text-[10px] text-amber-300">⚠ {book.listeningWarnings.join(' ')}</p>
          )}
          {book.listeningParts.length === 0
            ? <p className="text-[11px] text-slate-400 italic">{t('dev.cambridge.noListeningYet')}</p>
            : book.listeningParts.map(p => (
                <div key={p.partNum} className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                  <p className="text-xs font-bold text-cosmic-sky">Part {p.partNum} · {p.title}</p>
                  {p.questions.length > 0 && (
                    <ol className="text-[11px] text-slate-200 mt-1.5 space-y-1 pl-4 list-decimal">
                      {p.questions.slice(0, 20).map(q => (
                        <li key={q.num}>{q.prompt}</li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
        </div>
      )}
    </div>
  )
}

// Per-book Listening audio — 4 sections (matches Cambridge's fixed 4-part
// Listening format). One physical Cambridge book = one row per test here
// (Test 1, Test 2, ...), so a book with 4 tests means 4 rows x 4 slots =
// 16 audio files total, uploaded 4-at-a-time per test. Reuses the same
// listening_audio table/bucket as the Audio tab (migration 0016) -- just a
// different slot naming scheme (`<bookId>-p<n>`) so it doesn't collide with
// the built-in Cambridge 18 Test 1 demo content's `c18-t1-p<n>` slots.
const AUDIO_SECTIONS = [1, 2, 3, 4] as const

function BookAudioPanel({ bookId }: { bookId: string }) {
  const { t } = useTranslation()
  const [audio, setAudio] = useState<ListeningAudioRow[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingPart, setUploadingPart] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})

  function refresh() {
    setLoading(true)
    admin.listListeningAudio()
      .then(all => setAudio(all.filter(a => a.slot.startsWith(`${bookId}-p`))))
      .finally(() => setLoading(false))
  }
  useEffect(refresh, []) // eslint-disable-line

  async function upload(part: number, file: File) {
    setUploadingPart(part)
    setError(null)
    try {
      await admin.uploadListeningAudio(`${bookId}-p${part}`, file)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setUploadingPart(null)
    }
  }

  async function remove(slot: string) {
    try {
      await admin.removeListeningAudio(slot)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const bySlot = new Map(audio.map(a => [a.slot, a]))

  return (
    <div className="mt-3 border-t border-white/8 pt-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
        🎧 {t('dev.cambridge.audioTitle')}
      </p>
      {loading ? (
        <p className="text-[11px] text-slate-500 italic">…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AUDIO_SECTIONS.map(part => {
            const slot = `${bookId}-p${part}`
            const row = bySlot.get(slot)
            return (
              <div key={part} className="rounded-lg bg-white/[0.02] border border-white/5 p-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cosmic-sky">{part}-{t('dev.cambridge.section')}</span>
                  {row && (
                    <button onClick={() => remove(slot)} className="text-[9px] text-rose-300 hover:text-rose-400">
                      {t('dev.books.remove')}
                    </button>
                  )}
                </div>
                {row ? (
                  <audio controls preload="metadata" className="w-full h-7" src={row.url} />
                ) : (
                  <>
                    <input ref={el => { fileRefs.current[part] = el }} type="file" accept="audio/mpeg,audio/mp3,audio/*"
                           className="hidden"
                           onChange={e => { const f = e.target.files?.[0]; if (f) upload(part, f) }} />
                    <button onClick={() => fileRefs.current[part]?.click()} disabled={uploadingPart === part}
                            className="text-[10px] px-2 py-1.5 rounded-md border border-dashed border-white/15 text-slate-400 hover:border-cosmic-mint/50 hover:text-cosmic-mint transition disabled:opacity-40">
                      {uploadingPart === part ? '…' : t('dev.cambridge.uploadAudio')}
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
      {error && <p className="text-[10px] text-rose-300 mt-2">{error}</p>}
    </div>
  )
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="rounded-md bg-white/[0.03] border border-white/8 px-2 py-1.5 text-center">
      <p className="text-base font-bold text-white leading-tight">{n}</p>
      <p className="text-[9px] uppercase tracking-wide text-slate-500">{l}</p>
    </div>
  )
}

// ───────────────────────── DTM ─────────────────────────

const DTM_SUBJECTS: DtmSubject[] = ['math', 'english', 'native']

function DtmTab() {
  const { t } = useTranslation()
  const docs = useDevContent(s => s.dtm)
  const addDtmDocument = useDevContent(s => s.addDtmDocument)
  const removeDtmDocument = useDevContent(s => s.removeDtmDocument)

  const [picked, setPicked] = useState<File | null>(null)
  const [subject, setSubject] = useState<DtmSubject>('math')
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const ok = !!picked && title.trim().length >= 2 && !busy

  async function upload() {
    if (!picked || !ok) return
    setBusy(true)
    setError(null)
    try {
      const dataUrl = await fileToDataUrl(picked)
      const extraction = await extractPdfText(picked)
      addDtmDocument({
        subject,
        title: title.trim(),
        pdfDataUrl: dataUrl,
        pdfFilename: picked.name,
        pdfSize: picked.size,
        numPages: extraction.numPages,
        rawText: extraction.fullText,
      })
      setPicked(null)
      setTitle('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-5 p-1">
      {/* Upload card */}
      <div className="glass-panel p-5 flex flex-col gap-3 h-fit">
        <header>
          <h3 className="text-lg font-bold text-white">{t('dev.dtm.title')}</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t('dev.dtm.sub')}</p>
        </header>

        <Field label={t('dev.lessons.lessonTitle')}>
          <input className="input-glass" value={title}
                 onChange={e => setTitle(e.target.value)}
                 placeholder="DTM 2024 — Algebra past paper" />
        </Field>

        <Field label={t('dev.dtm.subject')}>
          <select className="input-glass" value={subject} onChange={e => setSubject(e.target.value as DtmSubject)}>
            {DTM_SUBJECTS.map(s => (
              <option key={s} value={s} className="bg-slate-900 text-white">{t(`dev.dtm.subjects.${s}`)}</option>
            ))}
          </select>
        </Field>

        <button type="button" onClick={() => fileRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-white/15 hover:border-cosmic-mint/50 hover:bg-white/[0.03] transition px-4 py-6 text-center mt-1">
          <p className="text-2xl mb-1">🎓</p>
          {picked
            ? <p className="text-sm text-cosmic-mint font-semibold truncate">{picked.name}</p>
            : <p className="text-xs text-slate-400">{t('dev.dtm.drop')}</p>}
          {picked && <p className="text-[10px] text-slate-500 mt-1">{formatBytes(picked.size)}</p>}
        </button>
        <input ref={fileRef} type="file" accept="application/pdf,.pdf"
               className="hidden"
               onChange={e => setPicked(e.target.files?.[0] ?? null)} />

        <button onClick={upload} disabled={!ok}
                className="btn-mint disabled:opacity-40 disabled:cursor-not-allowed">
          {busy ? t('dev.dtm.uploading') : t('dev.dtm.uploadBtn')}
        </button>

        {error && (
          <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2">
            {error}
          </p>
        )}
      </div>

      {/* Existing documents, grouped by subject */}
      <div className="glass-panel p-5">
        <h4 className="text-sm font-bold text-white mb-3">
          {t('dev.dtm.uploaded')} ({docs.length})
        </h4>
        {docs.length === 0
          ? <p className="text-xs text-slate-400 italic">{t('dev.dtm.noneYet')}</p>
          : (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-auto pr-1">
              {DTM_SUBJECTS.map(s => {
                const subjectDocs = docs.filter(d => d.subject === s)
                if (subjectDocs.length === 0) return null
                return (
                  <div key={s}>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">{t(`dev.dtm.subjects.${s}`)}</p>
                    <div className="flex flex-col gap-2">
                      {subjectDocs.map(d => (
                        <DtmDocCard key={d.id} doc={d} onRemove={() => removeDtmDocument(d.id)} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      </div>
    </div>
  )
}

function DtmDocCard({ doc, onRemove }: { doc: DtmDocument; onRemove: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="rounded-xl p-3 bg-white/[0.03] border border-white/8">
      <p className="text-sm font-bold text-white truncate">{doc.title}</p>
      <p className="text-[10px] text-slate-500 mt-1 truncate">{doc.pdfFilename} · {formatBytes(doc.pdfSize)} · {doc.numPages} {t('dev.books.pages')}</p>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <a href={doc.pdfDataUrl} target="_blank" rel="noopener noreferrer"
           className="px-2.5 py-1 rounded-md border border-white/15 text-slate-200 hover:bg-white/[0.05]">
          PDF ↗
        </a>
        <button onClick={onRemove} className="text-rose-300 hover:text-rose-400 px-2 py-1">
          {t('dev.books.remove')}
        </button>
      </div>
    </div>
  )
}

// ───────────────────────── Lessons ─────────────────────────

const LEVELS: LessonLevel[] = ['beginner', 'intermediate', 'advanced', 'mastery']
const KINDS:  LessonKind[]  = ['video', 'reading', 'speaking', 'writing', 'quiz']

function LessonsTab() {
  const { t } = useTranslation()

  const [lessons, setLessons] = useState<LessonDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState<LessonLevel>('beginner')
  const [kind,  setKind]  = useState<LessonKind>('video')
  const [desc,  setDesc]  = useState('')
  const [body,  setBody]  = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [cues, setCues] = useState<TranscriptCue[]>([])
  const [duration, setDuration] = useState<number | ''>('')
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function refresh() {
    setLoading(true)
    learning.getLessonsList().then(setLessons).finally(() => setLoading(false))
  }
  useEffect(refresh, [])

  async function publish() {
    if (!title.trim() || !body.trim() || isMockMode) return
    setPublishing(true)
    setError(null)
    try {
      await admin.publishLesson({
        title: title.trim(), level, kind,
        description: desc.trim() || undefined,
        body: body.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
        durationMin: typeof duration === 'number' ? duration : undefined,
        cues: cues.length ? cues : undefined,
      })
      setTitle(''); setDesc(''); setBody(''); setMediaUrl(''); setDuration(''); setCues([])
      setAdding(false)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setPublishing(false)
    }
  }

  async function remove(id: string) {
    try {
      await admin.removeLesson(id)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5 p-1">
      <div className="glass-panel p-5">
        <header className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-white">{t('dev.lessons.title')}</h3>
            <p className="text-xs text-slate-400 mt-1">{t('dev.lessons.sub')}</p>
          </div>
          {!adding && (
            <button onClick={() => setAdding(true)} className="btn-mint text-xs">{t('dev.lessons.addBtn')}</button>
          )}
        </header>

        {isMockMode && (
          <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 mb-3">
            {t('dev.lessons.mockNotice')}
          </p>
        )}

        {adding && (
          <div className="rounded-2xl p-4 bg-white/[0.03] border border-cosmic-mint/30 flex flex-col gap-2 mb-4">
            <Field label={t('dev.lessons.lessonTitle')}>
              <input className="input-glass" value={title} onChange={e => setTitle(e.target.value)} />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label={t('dev.lessons.level')}>
                <select className="input-glass" value={level} onChange={e => setLevel(e.target.value as LessonLevel)}>
                  {LEVELS.map(l => <option key={l} value={l} className="bg-slate-900 text-white">{l}</option>)}
                </select>
              </Field>
              <Field label={t('dev.lessons.kind')}>
                <select className="input-glass" value={kind} onChange={e => setKind(e.target.value as LessonKind)}>
                  {KINDS.map(k => <option key={k} value={k} className="bg-slate-900 text-white">{k}</option>)}
                </select>
              </Field>
              <Field label={t('dev.lessons.duration')}>
                <input type="number" className="input-glass" min={1} max={120}
                       value={duration} onChange={e => setDuration(e.target.value ? Number(e.target.value) : '')} />
              </Field>
            </div>
            <Field label={t('dev.lessons.desc')}>
              <input className="input-glass" value={desc} onChange={e => setDesc(e.target.value)} />
            </Field>
            <Field label={t('dev.lessons.bodyLabel')}>
              <textarea rows={5} className="input-glass resize-none" value={body} onChange={e => setBody(e.target.value)} />
            </Field>
            <Field label={t('dev.lessons.mediaUrl')}>
              <input className="input-glass" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)}
                     placeholder="YouTube / Vimeo / mp3 / mp4 URL" />
              <MediaPreview url={mediaUrl} />
            </Field>

            <TranscriptField
              mediaUrl={mediaUrl}
              cues={cues}
              setCues={setCues}
            />
            <div className="flex gap-2 justify-end mt-1">
              <button onClick={() => setAdding(false)} className="btn-ghost px-4 py-2 text-xs">×</button>
              <button onClick={publish} disabled={!title.trim() || !body.trim() || publishing || isMockMode}
                      className="btn-mint text-xs disabled:opacity-40">
                {publishing ? '…' : t('dev.lessons.save')}
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2">
                {error}
              </p>
            )}
          </div>
        )}

        {loading ? (
          <p className="text-xs text-slate-400 italic">…</p>
        ) : lessons.length === 0 && !adding
          ? <p className="text-xs text-slate-400 italic">{t('dev.lessons.noneYet')}</p>
          : (
            <div className="flex flex-col gap-2 max-h-[480px] overflow-auto pr-1">
              {lessons.map(l => (
                <div key={l.id} className="rounded-xl p-3 bg-white/[0.03] border border-white/8 group">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cosmic-sky/15 text-cosmic-sky border border-cosmic-sky/30 capitalize">{l.level}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/[0.06] text-slate-300 border border-white/10 capitalize">{l.kind}</span>
                    {l.durationMin && <span className="text-[10px] text-slate-500">{l.durationMin} min</span>}
                    <button onClick={() => remove(l.id)}
                            className="ml-auto text-rose-300 hover:text-rose-400 text-xs opacity-0 group-hover:opacity-100 transition">
                      ×
                    </button>
                  </div>
                  <p className="text-sm font-bold text-white">{l.title}</p>
                  {l.description && <p className="text-[11px] text-slate-300 mt-0.5">{l.description}</p>}
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{l.body}</p>
                  {l.mediaUrl && <MediaPreview url={l.mediaUrl} compact />}
                </div>
              ))}
            </div>
          )}
      </div>

      <div className="glass-panel p-5 h-fit">
        <h4 className="text-sm font-bold text-white mb-2">📘 Quick reference</h4>
        <ul className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
          <li>• <b className="text-white">video</b> — paste mediaUrl + transcript in body</li>
          <li>• <b className="text-white">reading</b> — passage text in body, mediaUrl optional</li>
          <li>• <b className="text-white">speaking</b> — cue card / prompts in body</li>
          <li>• <b className="text-white">writing</b> — task description in body</li>
          <li>• <b className="text-white">quiz</b> — questions JSON in body</li>
        </ul>
      </div>
    </div>
  )
}

// ───────────────────────── Stats ─────────────────────────

function StatsTab() {
  const { t } = useTranslation()
  const dtm = useDevContent(s => s.dtm)
  const articles = useUserArticles(s => s.list)
  const [audio, setAudio] = useState<ListeningAudioRow[]>([])
  const [lessons, setLessons] = useState<LessonDetail[]>([])
  const [books, setBooks] = useState<CambridgeBook[]>([])

  useEffect(() => { admin.listListeningAudio().then(setAudio) }, [])
  useEffect(() => { learning.getLessonsList().then(setLessons) }, [])
  useEffect(() => { admin.listCambridgeBooks().then(setBooks) }, [])

  const totalSize = useMemo(
    () => audio.reduce((sum, a) => sum + a.sizeBytes, 0)
        + dtm.reduce((sum, d) => sum + d.pdfSize, 0)
        + books.reduce((sum, b) => sum + b.pdfSize, 0),
    [audio, dtm, books]
  )

  const cambridgeCount = books.filter(b => b.kind === 'cambridge_ielts').length
  const otherBookCount = books.length - cambridgeCount

  return (
    <div className="grid grid-cols-2 lg:grid-cols-7 gap-5 p-1">
      <StatCard label={t('dev.stats.audio')}    value={audio.length}    emoji="🎧" />
      <StatCard label={t('dev.tabs.cambridge')} value={cambridgeCount}  emoji="📘" />
      <StatCard label={t('dev.tabs.books')}     value={otherBookCount}  emoji="📚" />
      <StatCard label={t('dev.tabs.dtm')}       value={dtm.length}      emoji="🎓" />
      <StatCard label={t('dev.stats.articles')} value={articles.length} emoji="📰" />
      <StatCard label={t('dev.stats.lessons')}  value={lessons.length}  emoji="🎬" />
      <StatCard label={t('dev.stats.sizeUsed')} value={formatBytes(totalSize)} emoji="💾" />
    </div>
  )
}

// ───────────────────────── Retention (14-day pilot) ─────────────────────────

const ROLE_FILTERS: (UserRole | 'all')[] = ['dtm', 'all', 'student', 'adult', 'parent']
const MATURE_DAYS = 14
const RECENT_WINDOW_DAYS = 2 // "still coming back" = active within the last 2 days

function RetentionTab() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<RetentionRow[] | null>(null)
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('dtm')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    admin.getRetentionSummary(roleFilter === 'all' ? undefined : roleFilter)
      .then(r => { if (!cancelled) setRows(r) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [roleFilter])

  const { matureCohort, stillActive, retentionPct } = useMemo(() => {
    const mature = (rows ?? []).filter(r => r.daysSinceSignup >= MATURE_DAYS)
    const active = mature.filter(r => {
      if (!r.lastActiveDate) return false
      const days = (Date.now() - new Date(r.lastActiveDate).getTime()) / 86_400_000
      return days <= RECENT_WINDOW_DAYS
    })
    return {
      matureCohort: mature,
      stillActive: active,
      retentionPct: mature.length ? Math.round((active.length / mature.length) * 100) : null,
    }
  }, [rows])

  return (
    <div className="flex flex-col gap-5 p-1">
      <div className="glass-panel p-5">
        <h3 className="text-lg font-bold text-white">{t('dev.retention.title')}</h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t('dev.retention.sub')}</p>

        <div className="flex items-center gap-2 flex-wrap mt-3">
          {ROLE_FILTERS.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
                    className={cn('px-3 py-1.5 rounded-full text-xs font-bold border transition capitalize',
                      roleFilter === r
                        ? 'bg-cosmic-mint/15 border-cosmic-mint/45 text-cosmic-mint'
                        : 'border-white/10 text-slate-300 hover:bg-white/[0.05]')}>
              {r === 'all' ? t('dev.retention.filterAll') : r}
            </button>
          ))}
        </div>

        {isMockMode && (
          <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 mt-3">
            {t('dev.retention.mockNotice')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label={t('dev.retention.matureCohort')} value={matureCohort.length} emoji="👥" />
        <StatCard label={t('dev.retention.stillActive')} value={stillActive.length} emoji="🔁" />
        <StatCard label={t('dev.retention.retentionRate')}
                  value={retentionPct === null ? '—' : `${retentionPct}%`} emoji="📈" />
      </div>

      {matureCohort.length === 0 && !loading && (
        <p className="text-xs text-slate-400 italic px-1">{t('dev.retention.noMatureCohort')}</p>
      )}

      <div className="glass-panel p-5">
        {loading ? (
          <p className="text-xs text-slate-400 italic">…</p>
        ) : !rows || rows.length === 0 ? (
          <p className="text-xs text-slate-400 italic">{t('dev.retention.noUsers')}</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex flex-col gap-1.5 max-h-[560px] overflow-y-auto pr-1 min-w-[640px]">
              <div className="grid text-[10px] uppercase tracking-wide text-slate-500 px-2 pb-2 border-b border-white/5"
                   style={{ gridTemplateColumns: '1.6fr 80px 90px 60px 100px 60px 100px' }}>
                <span>{t('dev.retention.table.name')}</span>
                <span>{t('dev.retention.table.role')}</span>
                <span>{t('dev.retention.table.signedUp')}</span>
                <span>{t('dev.retention.table.days')}</span>
                <span>{t('dev.retention.table.lastActive')}</span>
                <span>{t('dev.retention.table.streak')}</span>
                <span>{t('dev.retention.table.status')}</span>
              </div>
              {rows.map(r => (
                <div key={r.userId}
                     className="grid items-center gap-2 px-2 py-2 text-[12px] rounded-lg hover:bg-white/[0.04]"
                     style={{ gridTemplateColumns: '1.6fr 80px 90px 60px 100px 60px 100px' }}>
                  <span className="text-slate-100 truncate">
                    {r.name}
                    {r.email && <span className="block text-[10px] text-slate-500 truncate">{r.email}</span>}
                  </span>
                  <span className="text-slate-300 capitalize">{r.role}</span>
                  <span className="text-slate-400">{new Date(r.signedUpAt).toLocaleDateString()}</span>
                  <span className="text-slate-300 tabular-nums">{r.daysSinceSignup}</span>
                  <span className="text-slate-400">{r.lastActiveDate ? new Date(r.lastActiveDate).toLocaleDateString() : '—'}</span>
                  <span className="text-slate-300 tabular-nums">{r.streak}</span>
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-bold w-fit',
                    r.activeToday
                      ? 'bg-cosmic-mint/15 text-cosmic-mint border-cosmic-mint/40'
                      : 'bg-white/[0.04] text-slate-400 border-white/10')}>
                    {r.activeToday ? t('dev.retention.activeToday') : t('dev.retention.inactive')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ───────────────────────── helpers ─────────────────────────

function StatCard({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <div className="glass-panel p-5">
      <div className="text-3xl mb-1.5">{emoji}</div>
      <p className="text-3xl font-extrabold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

// ─── Timed transcript builder ────────────────────────────────────────────────
// Whisper turns audio into cues with real start/end seconds, which is what lets
// the lesson transcript follow playback. Streaming pages (YouTube/Vimeo) don't
// serve their media at the page URL, so those need the audio uploaded instead —
// the video still plays from YouTube, this is only for the timings.

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function TranscriptField({
  mediaUrl, cues, setCues,
}: {
  mediaUrl: string
  cues: TranscriptCue[]
  setCues: (c: TranscriptCue[]) => void
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const info = detectMedia(mediaUrl)
  const isStream = info.kind === 'youtube' || info.kind === 'vimeo'
  const canUseUrl = !!mediaUrl.trim() && !isStream && info.kind !== 'unknown'

  async function run(source: File | string) {
    setBusy(true); setErr(null)
    try {
      const res = await learning.transcribeLesson(source)
      setCues(res.cues)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Field label="Transkript (vaqt bilan)">
      <input
        ref={fileRef}
        type="file"
        accept="audio/*,video/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) run(f)
          e.target.value = ''
        }}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
        >
          {busy ? 'Yaratilmoqda…' : 'Audio yuklab yaratish'}
        </button>
        <button
          type="button"
          onClick={() => run(mediaUrl.trim())}
          disabled={busy || !canUseUrl}
          className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
          title={isStream ? 'YouTube/Vimeo havolasidan server audio ololmaydi — faylni yuklang' : undefined}
        >
          URL dan yaratish
        </button>
        {cues.length > 0 && (
          <button
            type="button"
            onClick={() => setCues([])}
            className="btn-ghost text-xs px-3 py-1.5 text-rose-300"
          >
            Tozalash
          </button>
        )}
      </div>

      {isStream && (
        <p className="mt-2 text-[11px] text-amber-300/80">
          YouTube/Vimeo uchun audio faylni alohida yuklang — video baribir o'sha
          yerdan o'ynaydi, bu faqat vaqt belgilari uchun.
        </p>
      )}

      {err && (
        <p className="mt-2 text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2">
          {err}
        </p>
      )}

      {cues.length > 0 && (
        <div className="mt-2 rounded-lg border border-white/10 bg-black/20">
          <div className="px-3 py-1.5 text-[11px] text-slate-400 border-b border-white/10">
            {cues.length} qator · {fmt(cues[cues.length - 1].end)} davomiylik
          </div>
          <div className="max-h-40 overflow-y-auto px-3 py-2 space-y-1">
            {cues.map((c, i) => (
              <div key={i} className="flex gap-2 text-[11px]">
                <span className="flex-none font-mono tabular-nums text-cosmic-mint">{fmt(c.start)}</span>
                <span className="text-slate-300">{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Field>
  )
}

function MediaPreview({ url, compact }: { url: string; compact?: boolean }) {
  if (!url || url.trim().length < 4) return null
  return (
    <div className={cn('mt-2', compact && 'max-w-md')}>
      <MediaPlayer url={url} />
    </div>
  )
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

function formatBytes(b: number): string {
  if (b < 1024)        return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}
