// =============================================================================
// LessonPlayer — a player that reports playback position, so the lesson
// transcript can follow along and freeze when the learner pauses.
//
// Two very different backends behind one interface:
//   • HTML5 <video>/<audio> — currentTime is read directly off the element.
//   • YouTube — a plain <iframe> exposes nothing, so we mount the IFrame Player
//     API and poll getCurrentTime(). This is why detectMedia() carries videoId.
//
// Vimeo is not wired for sync (it needs its own SDK); it still plays, the
// transcript just won't follow. `syncable` tells the caller which case it's in.
// =============================================================================
import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react'
import { detectMedia } from '@/lib/media'

export interface LessonPlayerHandle {
  /** Jump to a position, used when a transcript line is tapped. */
  seekTo: (seconds: number) => void
}

interface Props {
  url: string
  /** Fires ~4x/sec while playing. */
  onTime?: (seconds: number) => void
  onPlayingChange?: (playing: boolean) => void
  /** Told once we know whether time tracking is possible for this media. */
  onSyncableChange?: (syncable: boolean) => void
  className?: string
}

// ─── YouTube IFrame API loader (once per page) ───────────────────────────────

declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
  }
}

let ytApiPromise: Promise<any> | null = null

function loadYouTubeApi(): Promise<any> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (ytApiPromise) return ytApiPromise

  ytApiPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(window.YT)
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () => reject(new Error('Could not load the YouTube player API'))
    document.head.appendChild(script)
  })
  return ytApiPromise
}

// ─────────────────────────────────────────────────────────────────────────────

export const LessonPlayer = forwardRef<LessonPlayerHandle, Props>(function LessonPlayer(
  { url, onTime, onPlayingChange, onSyncableChange, className },
  ref,
) {
  const info = detectMedia(url)
  const isYouTube = info.kind === 'youtube' && !!info.videoId
  const isHtml5 = info.kind === 'video' || info.kind === 'audio'

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null)
  const ytHostRef = useRef<HTMLDivElement | null>(null)
  const ytPlayerRef = useRef<any>(null)

  const [ytFailed, setYtFailed] = useState(false)

  // Keep callbacks in refs so the effects below don't re-run on every render.
  const onTimeRef = useRef(onTime)
  const onPlayingRef = useRef(onPlayingChange)
  const onSyncableRef = useRef(onSyncableChange)
  useEffect(() => { onTimeRef.current = onTime }, [onTime])
  useEffect(() => { onPlayingRef.current = onPlayingChange }, [onPlayingChange])
  useEffect(() => { onSyncableRef.current = onSyncableChange }, [onSyncableChange])

  useImperativeHandle(ref, () => ({
    seekTo(seconds: number) {
      if (ytPlayerRef.current?.seekTo) {
        ytPlayerRef.current.seekTo(seconds, true)
        return
      }
      if (mediaRef.current) mediaRef.current.currentTime = seconds
    },
  }), [])

  // Report whether this media can drive the transcript at all.
  useEffect(() => {
    onSyncableRef.current?.(isHtml5 || (isYouTube && !ytFailed))
  }, [isHtml5, isYouTube, ytFailed])

  // ─── YouTube: mount the API player and poll for time ───────────────────────
  useEffect(() => {
    if (!isYouTube || !ytHostRef.current) return
    let cancelled = false
    let timer: number | undefined

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !ytHostRef.current) return
        ytPlayerRef.current = new YT.Player(ytHostRef.current, {
          videoId: info.videoId,
          playerVars: { rel: 0, playsinline: 1 },
          events: {
            onStateChange: (e: any) => {
              const playing = e.data === YT.PlayerState.PLAYING
              onPlayingRef.current?.(playing)
              window.clearInterval(timer)
              if (playing) {
                // Poll while playing; on pause we simply stop, which leaves the
                // transcript frozen exactly where the learner stopped.
                timer = window.setInterval(() => {
                  const t = ytPlayerRef.current?.getCurrentTime?.()
                  if (typeof t === 'number') onTimeRef.current?.(t)
                }, 250)
              }
            },
          },
        })
      })
      .catch(() => { if (!cancelled) setYtFailed(true) })

    return () => {
      cancelled = true
      window.clearInterval(timer)
      try { ytPlayerRef.current?.destroy?.() } catch { /* already gone */ }
      ytPlayerRef.current = null
    }
  }, [isYouTube, info.videoId])

  // ─── HTML5: read time straight off the element ────────────────────────────
  useEffect(() => {
    const el = mediaRef.current
    if (!el || !isHtml5) return
    const handleTime = () => onTimeRef.current?.(el.currentTime)
    const handlePlay = () => onPlayingRef.current?.(true)
    const handlePause = () => onPlayingRef.current?.(false)
    el.addEventListener('timeupdate', handleTime)
    el.addEventListener('play', handlePlay)
    el.addEventListener('pause', handlePause)
    el.addEventListener('ended', handlePause)
    return () => {
      el.removeEventListener('timeupdate', handleTime)
      el.removeEventListener('play', handlePlay)
      el.removeEventListener('pause', handlePause)
      el.removeEventListener('ended', handlePause)
    }
  }, [isHtml5, info.embedUrl])

  if (!url) return null

  if (isYouTube && !ytFailed) {
    // The API replaces this div with its own iframe.
    return (
      <div className={className ?? 'w-full aspect-video overflow-hidden rounded-xl bg-black'}>
        <div ref={ytHostRef} className="h-full w-full" />
      </div>
    )
  }

  if (info.kind === 'video') {
    return (
      <video
        ref={mediaRef as React.RefObject<HTMLVideoElement>}
        controls
        playsInline
        preload="metadata"
        src={info.embedUrl}
        className={className ?? 'w-full aspect-video rounded-xl bg-black'}
      />
    )
  }

  if (info.kind === 'audio') {
    return (
      <audio
        ref={mediaRef as React.RefObject<HTMLAudioElement>}
        controls
        preload="metadata"
        src={info.embedUrl}
        className={className ?? 'w-full h-10'}
      />
    )
  }

  // Vimeo, playlists, unknown — playable, but no time sync.
  return (
    <div className={className ?? 'w-full aspect-video overflow-hidden rounded-xl bg-black'}>
      <iframe
        src={info.embedUrl}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Lesson media"
      />
    </div>
  )
})
