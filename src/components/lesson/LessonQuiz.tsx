// =============================================================================
// LessonQuiz — Kahoot-style vocabulary quiz overlay.
//
// Flow:
//   1. Intro screen (Get ready) → "Start" button
//   2. For each question:
//        - English word at top, prompt below
//        - 4 colored answer tiles (Kahoot's red/blue/yellow/green with shapes)
//        - Timer bar drains over QUESTION_MS
//        - Correct → green flash + speed bonus points
//        - Wrong   → red flash + small shake
//   3. Summary screen: total score, accuracy, streak, time taken
//
// Designed as a portal-style fixed overlay so the user can launch from any
// page; the host page just toggles `open`.
// =============================================================================
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useActivity } from '@/store/activity'
import { useProgress } from '@/store/progress'

// ─────────────────────────── Types ───────────────────────────

export interface QuizVocab {
  word:   string
  ipa?:   string
  uz:     string
  defEn?: string
  defUz?: string
}

interface Props {
  open:     boolean
  onClose:  () => void
  /** Pool of vocab to build questions from. */
  vocab:    QuizVocab[]
  /** How many questions per quiz run (default 8). */
  count?:   number
  /** Title shown on the intro screen. */
  title?:   string
}

interface Question {
  word:    string
  ipa?:    string
  options: string[]   // 4 options
  answer:  number     // index of correct option
}

// ─────────────────────────── Constants ───────────────────────────

const QUESTION_MS  = 18_000          // 18s per question
const FEEDBACK_MS  = 1_400           // pause to show right/wrong
const MAX_POINTS   = 1_000

const KAHOOT_TILES: { bg: string; shape: 'triangle' | 'diamond' | 'circle' | 'square'; ring: string }[] = [
  { bg: '#e21b3c', shape: 'triangle', ring: 'rgba(255,80,110,0.45)' },
  { bg: '#1368ce', shape: 'diamond',  ring: 'rgba(100,170,255,0.45)' },
  { bg: '#d89e00', shape: 'circle',   ring: 'rgba(255,210,80,0.45)' },
  { bg: '#26890c', shape: 'square',   ring: 'rgba(120,230,140,0.45)' },
]

// ─────────────────────────── Component ───────────────────────────

export function LessonQuiz({ open, onClose, vocab, count = 8, title = 'Vocabulary Quiz' }: Props) {
  const log = useActivity(s => s.log)
  const addXp = useProgress(s => s.addXp)

  const [stage, setStage] = useState<'intro' | 'playing' | 'summary'>('intro')
  const [qIdx, setQIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [msLeft, setMsLeft] = useState(QUESTION_MS)
  const startTimeRef = useRef<number>(0)
  const tickRef = useRef<number | null>(null)
  const advanceRef = useRef<number | null>(null)

  // Build questions once per open
  const questions = useMemo<Question[]>(() => {
    if (!open) return []
    const pool = [...vocab]
    shuffle(pool)
    const picked = pool.slice(0, Math.min(count, pool.length))
    return picked.map(v => {
      const distractors = vocab.filter(x => x.uz !== v.uz)
      shuffle(distractors)
      const opts = [v.uz, distractors[0]?.uz, distractors[1]?.uz, distractors[2]?.uz].filter(Boolean) as string[]
      while (opts.length < 4) opts.push('—')
      shuffle(opts)
      return {
        word:    v.word,
        ipa:     v.ipa,
        options: opts,
        answer:  opts.indexOf(v.uz),
      }
    })
  }, [open, vocab, count])

  // Reset all state when overlay opens / closes
  useEffect(() => {
    if (!open) return
    setStage('intro')
    setQIdx(0); setPicked(null); setScore(0); setStreak(0); setMaxStreak(0); setCorrectCount(0)
    setMsLeft(QUESTION_MS)
    return () => {
      if (tickRef.current)    cancelAnimationFrame(tickRef.current)
      if (advanceRef.current) clearTimeout(advanceRef.current)
    }
  }, [open])

  // Timer loop while a question is active
  useEffect(() => {
    if (stage !== 'playing' || picked !== null) return
    startTimeRef.current = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current
      const remaining = Math.max(0, QUESTION_MS - elapsed)
      setMsLeft(remaining)
      if (remaining <= 0) {
        // Timeout — count as wrong
        setPicked(-1) // -1 = timed out
        setStreak(0)
        advanceRef.current = window.setTimeout(advance, FEEDBACK_MS)
        return
      }
      tickRef.current = requestAnimationFrame(tick)
    }
    tickRef.current = requestAnimationFrame(tick)
    return () => { if (tickRef.current) cancelAnimationFrame(tickRef.current) }
  }, [stage, qIdx, picked]) // eslint-disable-line

  function start() {
    setStage('playing')
  }

  function answer(i: number) {
    if (picked !== null) return
    if (tickRef.current) cancelAnimationFrame(tickRef.current)
    const q = questions[qIdx]
    const isCorrect = i === q.answer
    if (isCorrect) {
      // Points scale linearly with time remaining
      const pts = Math.round(MAX_POINTS * 0.5 + MAX_POINTS * 0.5 * (msLeft / QUESTION_MS))
      setScore(s => s + pts)
      setCorrectCount(c => c + 1)
      setStreak(s => {
        const n = s + 1
        setMaxStreak(m => Math.max(m, n))
        return n
      })
    } else {
      setStreak(0)
    }
    setPicked(i)
    advanceRef.current = window.setTimeout(advance, FEEDBACK_MS)
  }

  function advance() {
    if (qIdx + 1 >= questions.length) {
      finish()
    } else {
      setQIdx(i => i + 1)
      setPicked(null)
      setMsLeft(QUESTION_MS)
    }
  }

  function finish() {
    setStage('summary')
    log('quiz_submitted', { score, total: questions.length, correct: correctCount })
    addXp(score)
  }

  function close() {
    onClose()
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        key="quiz-overlay"
        className="fixed inset-0 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* dark backdrop */}
        <div className="absolute inset-0"
             style={{ background: 'radial-gradient(circle at 50% 30%, #2a1455, #0a0418 70%)' }} />

        {/* scattered confetti-style sparks (decorative) */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          {SPARK_POSITIONS.map((p, i) => (
            <span key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${p.x}%`, top: `${p.y}%`,
                    width: `${p.size}px`, height: `${p.size}px`,
                    background: p.color,
                    opacity: 0.35,
                    filter: 'blur(1px)',
                  }} />
          ))}
        </div>

        {/* Close button */}
        <button onClick={close}
                className="absolute top-5 right-5 w-10 h-10 rounded-full grid place-items-center text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md z-10 transition-transform active:scale-95"
                aria-label="Close">
          ✕
        </button>

        {/* Stage */}
        <div className="absolute inset-0 grid place-items-center px-4">
          {stage === 'intro'   && <IntroScreen title={title} count={questions.length} onStart={start} />}
          {stage === 'playing' && questions[qIdx] && (
            <PlayingScreen
              q={questions[qIdx]}
              qIdx={qIdx}
              total={questions.length}
              picked={picked}
              msLeft={msLeft}
              score={score}
              streak={streak}
              onAnswer={answer}
            />
          )}
          {stage === 'summary' && (
            <SummaryScreen
              score={score}
              correct={correctCount}
              total={questions.length}
              maxStreak={maxStreak}
              onClose={close}
              onRetry={() => {
                // start a fresh run
                setStage('intro')
                setQIdx(0); setPicked(null); setScore(0); setStreak(0); setMaxStreak(0); setCorrectCount(0)
                setMsLeft(QUESTION_MS)
              }}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─────────────────────────── Intro ───────────────────────────

function IntroScreen({ title, count, onStart }: { title: string; count: number; onStart: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="text-center max-w-md"
    >
      <div className="text-7xl mb-4">🎮</div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight"
          style={{ textShadow: '0 0 30px rgba(120,180,255,0.5)' }}>
        {title}
      </h1>
      <p className="mt-3 text-slate-300 text-sm leading-relaxed">
        {count} questions · Faster = more points · Stay sharp
      </p>
      <button onClick={onStart}
              className="mt-8 px-10 py-4 rounded-2xl text-lg font-bold tracking-wide text-slate-900 transition-transform active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #7ef7d3, #4fd6a6)',
                boxShadow: '0 12px 40px rgba(126,247,211,0.45)',
              }}>
        ▶ START
      </button>
    </motion.div>
  )
}

// ─────────────────────────── Playing ───────────────────────────

function PlayingScreen({
  q, qIdx, total, picked, msLeft, score, streak, onAnswer,
}: {
  q: Question
  qIdx: number
  total: number
  picked: number | null
  msLeft: number
  score: number
  streak: number
  onAnswer: (i: number) => void
}) {
  const timerPct = (msLeft / QUESTION_MS) * 100

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      {/* HUD */}
      <div className="flex items-center justify-between text-white text-sm font-bold">
        <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15">
          Q {qIdx + 1} / {total}
        </span>
        {streak >= 2 && (
          <span className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200"
                key={streak}
                style={{ animation: 'pop 0.4s ease-out' }}>
            🔥 {streak}x streak
          </span>
        )}
        <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 font-mono">
          {score.toLocaleString()} pts
        </span>
      </div>

      {/* Timer bar */}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${timerPct}%`,
            background: timerPct > 50
              ? 'linear-gradient(90deg, #7ef7d3, #4fd6a6)'
              : timerPct > 25
                ? 'linear-gradient(90deg, #ffd870, #ff9038)'
                : 'linear-gradient(90deg, #ff6470, #e21b3c)',
            transition: 'background 0.3s ease',
          }}
        />
      </div>

      {/* Question */}
      <motion.div
        key={qIdx}
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="text-center px-4 py-6 rounded-3xl bg-white/[0.05] backdrop-blur-md border border-white/10"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">
          What does this mean?
        </p>
        <h2 className="text-5xl font-extrabold text-white tracking-tight"
            style={{ textShadow: '0 4px 30px rgba(120,180,255,0.5)' }}>
          {q.word}
        </h2>
        {q.ipa && <p className="mt-2 text-cosmic-mint text-sm italic">{q.ipa}</p>}
      </motion.div>

      {/* Answer tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map((opt, i) => {
          const tile = KAHOOT_TILES[i]
          const isPicked = picked === i
          const isCorrect = i === q.answer && picked !== null
          const isWrong = isPicked && picked !== q.answer

          return (
            <motion.button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={picked !== null}
              whileTap={{ scale: 0.97 }}
              animate={isWrong ? { x: [-6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="relative px-5 py-5 rounded-2xl text-left text-white font-bold text-lg disabled:cursor-not-allowed overflow-hidden"
              style={{
                background: tile.bg,
                boxShadow: isCorrect
                  ? `0 0 0 4px #7ef7d3, 0 12px 32px ${tile.ring}`
                  : isWrong
                    ? `0 0 0 4px #ff6470, 0 12px 32px ${tile.ring}`
                    : `0 6px 22px ${tile.ring}, inset 0 1px 0 rgba(255,255,255,0.18)`,
                opacity: picked !== null && !isCorrect && !isWrong ? 0.5 : 1,
                transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div className="flex items-center gap-3 relative z-10">
                <span className="w-9 h-9 grid place-items-center bg-white/15 rounded-lg shrink-0">
                  <Shape kind={tile.shape} />
                </span>
                <span className="flex-1 leading-snug">{opt}</span>
                {isCorrect && <span className="text-2xl">✓</span>}
                {isWrong   && <span className="text-2xl">✕</span>}
              </div>
              {/* shine */}
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18), transparent 40%)' }} />
            </motion.button>
          )
        })}
      </div>

      {/* Feedback banner */}
      {picked !== null && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`text-center font-extrabold text-2xl ${picked === q.answer ? 'text-cosmic-mint' : 'text-rose-300'}`}
        >
          {picked === -1 ? '⌛ Time\'s up!' : picked === q.answer ? '🎉 Correct!' : '😞 Not quite'}
        </motion.div>
      )}
    </div>
  )
}

function Shape({ kind }: { kind: 'triangle' | 'diamond' | 'circle' | 'square' }) {
  if (kind === 'triangle') return <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M12 3 L21 20 L3 20 Z" /></svg>
  if (kind === 'diamond')  return <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M12 3 L21 12 L12 21 L3 12 Z" /></svg>
  if (kind === 'circle')   return <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><circle cx="12" cy="12" r="9" /></svg>
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
}

// ─────────────────────────── Summary ───────────────────────────

function SummaryScreen({ score, correct, total, maxStreak, onClose, onRetry }: {
  score: number
  correct: number
  total: number
  maxStreak: number
  onClose: () => void
  onRetry: () => void
}) {
  const accuracy = total ? Math.round((correct / total) * 100) : 0
  const emoji =
    accuracy >= 90 ? '🏆' :
    accuracy >= 70 ? '🌟' :
    accuracy >= 50 ? '👍' :
                     '💪'

  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="text-center max-w-md w-full"
    >
      <div className="text-7xl mb-3">{emoji}</div>
      <h2 className="text-3xl font-extrabold text-white">Quiz complete!</h2>
      <p className="mt-2 text-slate-300 text-sm">You earned {score.toLocaleString()} XP</p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Score"    value={score.toLocaleString()} mint />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Streak"   value={`${maxStreak}x`} />
      </div>

      <div className="mt-7 flex items-center justify-center gap-3">
        <button onClick={onRetry}
                className="px-6 py-3 rounded-2xl font-bold text-white bg-white/10 border border-white/20 hover:bg-white/15 transition active:scale-95">
          Retry
        </button>
        <button onClick={onClose}
                className="px-6 py-3 rounded-2xl font-bold text-slate-900 transition active:scale-95"
                style={{ background: 'linear-gradient(135deg, #7ef7d3, #4fd6a6)', boxShadow: '0 10px 30px rgba(126,247,211,0.4)' }}>
          Done
        </button>
      </div>
    </motion.div>
  )
}

function Stat({ label, value, mint }: { label: string; value: string; mint?: boolean }) {
  return (
    <div className="px-3 py-4 rounded-2xl border border-white/10 bg-white/[0.04]">
      <p className={`text-2xl font-extrabold ${mint ? 'text-cosmic-mint' : 'text-white'}`}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</p>
    </div>
  )
}

// ─────────────────────────── Helpers ───────────────────────────

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Decorative background sparks
const SPARK_POSITIONS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 137) % 100,
  y: (i * 73)  % 100,
  size: 2 + (i % 3),
  color: ['#7ef7d3', '#ffd870', '#ff6470', '#6aa4ff'][i % 4],
}))

// pop keyframe for streak chip
const STYLE = document.createElement('style')
STYLE.textContent = `
  @keyframes pop {
    0%   { transform: scale(0.7); }
    60%  { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
`
if (typeof document !== 'undefined' && !document.head.querySelector('style[data-quiz-pop]')) {
  STYLE.setAttribute('data-quiz-pop', '')
  document.head.appendChild(STYLE)
}
