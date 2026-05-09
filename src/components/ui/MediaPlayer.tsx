// =============================================================================
// MediaPlayer — universal renderer for any media URL.
// Picks the right element based on detectMedia():
//   • youtube / vimeo  → <iframe> embed
//   • mp4 / webm       → <video controls>
//   • mp3 / wav / m4a  → <audio controls>
// Wrapped in a 16:9 container for video-shaped media so the layout doesn't jump.
// =============================================================================
import { detectMedia, isIframeMedia, type MediaInfo } from '@/lib/media'
import { cn } from '@/lib/cn'

interface Props {
  url:        string
  className?: string
  /** When true, suppresses the rounded outer wrapper — use inside other panels. */
  bare?:      boolean
  /** Optional poster image used while a video isn't playing. */
  poster?:    string
  /** Optional title overlay rendered on top-left for video-shaped media. */
  title?:     React.ReactNode
}

export function MediaPlayer({ url, className, bare, poster, title }: Props) {
  const info = detectMedia(url ?? '')
  if (!info.embedUrl) {
    return (
      <Empty className={className}>No media URL.</Empty>
    )
  }

  if (isIframeMedia(info.kind)) {
    return (
      <Wrapper className={className} bare={bare}>
        <iframe
          src={info.embedUrl}
          title="Media"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
        {title && <TitleOverlay>{title}</TitleOverlay>}
      </Wrapper>
    )
  }

  if (info.kind === 'video') {
    return (
      <Wrapper className={className} bare={bare}>
        <video
          src={info.embedUrl}
          poster={poster}
          controls
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {title && <TitleOverlay>{title}</TitleOverlay>}
      </Wrapper>
    )
  }

  if (info.kind === 'audio') {
    return (
      <div className={cn('w-full', className)}>
        <audio controls preload="metadata" src={info.embedUrl} className="w-full h-10" />
      </div>
    )
  }

  return <UnknownFallback info={info} className={className} />
}

// ───────────────────── helpers ─────────────────────

function Wrapper({ children, className, bare }: { children: React.ReactNode; className?: string; bare?: boolean }) {
  return (
    <div className={cn(
      'relative w-full aspect-video overflow-hidden',
      bare ? '' : 'rounded-2xl border border-white/10 bg-black/30',
      className,
    )}>
      {children}
    </div>
  )
}

function TitleOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute top-4 left-5 text-2xl font-bold text-white drop-shadow-lg z-10">
      {children}
    </div>
  )
}

function Empty({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'w-full aspect-video rounded-2xl border border-dashed border-white/15 grid place-items-center text-xs text-slate-400',
      className,
    )}>
      {children}
    </div>
  )
}

function UnknownFallback({ info, className }: { info: MediaInfo; className?: string }) {
  return (
    <div className={cn('w-full p-3 rounded-xl border border-amber-400/30 bg-amber-400/5 text-amber-200 text-xs', className)}>
      ⚠ Format aniqlanmadi. <a href={info.original} target="_blank" rel="noopener noreferrer" className="underline">Linkni yangi tabda ochish</a>
    </div>
  )
}
