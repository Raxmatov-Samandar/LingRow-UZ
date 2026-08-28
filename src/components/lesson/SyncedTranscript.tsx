// =============================================================================
// SyncedTranscript — the transcript that follows the video.
//
// It is a pure function of `currentTime`: the active cue is whichever one spans
// that moment. That is what makes pause work for free — when playback stops,
// time stops advancing, so the highlight simply stays put.
//
// Tapping a line seeks the player, so the transcript doubles as a scrubber.
// =============================================================================
import { useEffect, useMemo, useRef } from 'react'

export interface Cue { start: number; end: number; text: string }

interface Props {
  cues: Cue[]
  currentTime: number
  onSeek?: (seconds: number) => void
  /** When false we show a hint that this media can't drive the highlight. */
  syncable?: boolean
  className?: string
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/** Index of the cue containing `t`, else the last one that has already started. */
export function activeCueIndex(cues: Cue[], t: number): number {
  if (!cues.length) return -1
  let idx = -1
  for (let i = 0; i < cues.length; i++) {
    if (t >= cues[i].start) idx = i
    else break
  }
  // Past the end of a cue but before the next starts — keep the last one lit
  // rather than blanking out during pauses in speech.
  return idx
}

export function SyncedTranscript({ cues, currentTime, onSeek, syncable = true, className }: Props) {
  const activeIdx = useMemo(() => activeCueIndex(cues, currentTime), [cues, currentTime])
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef<HTMLButtonElement | null>(null)

  // Keep the active line in view, but only scroll the transcript's own box —
  // never the page (scrollIntoView would yank the whole layout).
  useEffect(() => {
    const box = scrollRef.current
    const el = activeRef.current
    if (!box || !el) return
    const boxRect = box.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const above = elRect.top < boxRect.top + 8
    const below = elRect.bottom > boxRect.bottom - 8
    if (above || below) {
      box.scrollTo({
        top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2,
        behavior: 'smooth',
      })
    }
  }, [activeIdx])

  if (!cues.length) {
    return (
      <div className={className}>
        <p className="text-sm text-slate-400">
          Bu dars uchun hali transkript yo'q. Dev Panel'da "Transkript yaratish" tugmasini bosing.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {!syncable && (
        <p className="mb-2 text-xs text-amber-300/80">
          Bu media uchun vaqt kuzatilmaydi — transkript videoga ergashmaydi, lekin
          qatorni bosib mavzuni topishingiz mumkin.
        </p>
      )}
      <div ref={scrollRef} className="max-h-[320px] overflow-y-auto pr-1">
        {cues.map((c, i) => {
          const isActive = i === activeIdx
          return (
            <button
              key={`${c.start}-${i}`}
              ref={isActive ? activeRef : undefined}
              type="button"
              onClick={() => onSeek?.(c.start)}
              className={[
                'flex w-full gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                isActive ? 'bg-cosmic-sky/15' : 'hover:bg-white/5',
              ].join(' ')}
            >
              <span
                className={[
                  'mt-0.5 flex-none font-mono text-[11px] tabular-nums',
                  isActive ? 'text-cosmic-mint' : 'text-slate-500',
                ].join(' ')}
              >
                {formatTime(c.start)}
              </span>
              <span
                className={[
                  'text-sm leading-relaxed',
                  isActive ? 'font-medium text-white' : 'text-slate-300',
                ].join(' ')}
              >
                {c.text}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
