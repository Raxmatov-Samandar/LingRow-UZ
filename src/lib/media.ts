// =============================================================================
// Media URL helpers — turn user-pasted links into embeddable URLs.
// Currently supports:
//   • YouTube watch URLs        → /embed/<id>
//   • youtu.be short URLs       → /embed/<id>
//   • YouTube playlist URLs     → /embed/videoseries?list=<id>
//   • YouTube /shorts/<id>      → /embed/<id>
//   • Vimeo                     → player.vimeo.com/video/<id>
//   • Direct mp4/mp3/data URLs  → returned as-is
// =============================================================================

export type MediaKind = 'youtube' | 'vimeo' | 'audio' | 'video' | 'unknown'

export interface MediaInfo {
  kind:     MediaKind
  /** URL safe to drop into an <iframe src> or <video src> / <audio src>. */
  embedUrl: string
  /** Original input. */
  original: string
}

const YT_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'])

export function detectMedia(raw: string): MediaInfo {
  const url = (raw ?? '').trim()
  if (!url) return { kind: 'unknown', embedUrl: '', original: url }

  // Data URLs
  if (url.startsWith('data:audio/')) return { kind: 'audio', embedUrl: url, original: url }
  if (url.startsWith('data:video/')) return { kind: 'video', embedUrl: url, original: url }

  let parsed: URL | null = null
  try { parsed = new URL(url) } catch { return { kind: 'unknown', embedUrl: url, original: url } }

  const host = parsed.hostname.toLowerCase()

  // youtu.be/<id>
  if (host === 'youtu.be') {
    const id = parsed.pathname.replace(/^\//, '').split('/')[0]
    if (id) return ytEmbed(id, parsed, url)
  }

  // youtube.com/watch?v=<id>  |  /shorts/<id>  |  /playlist?list=<id>  |  /embed/<id>
  if (YT_HOSTS.has(host)) {
    const list = parsed.searchParams.get('list')
    const v    = parsed.searchParams.get('v')
    const path = parsed.pathname

    if (path.startsWith('/embed/')) {
      // already an embed — keep it
      return { kind: 'youtube', embedUrl: url, original: url }
    }
    if (path === '/playlist' && list) {
      return { kind: 'youtube', embedUrl: `https://www.youtube.com/embed/videoseries?list=${list}`, original: url }
    }
    if (path.startsWith('/shorts/')) {
      const id = path.replace('/shorts/', '').split('/')[0]
      if (id) return ytEmbed(id, parsed, url)
    }
    if (v) return ytEmbed(v, parsed, url)
  }

  // Vimeo
  if (host === 'vimeo.com' || host === 'www.vimeo.com') {
    const id = parsed.pathname.replace(/^\//, '').split('/')[0]
    if (/^\d+$/.test(id)) {
      return { kind: 'vimeo', embedUrl: `https://player.vimeo.com/video/${id}`, original: url }
    }
  }
  if (host === 'player.vimeo.com') {
    return { kind: 'vimeo', embedUrl: url, original: url }
  }

  // Direct file URLs by extension
  const lowerPath = parsed.pathname.toLowerCase()
  if (/\.(mp3|wav|m4a|ogg)$/.test(lowerPath)) return { kind: 'audio', embedUrl: url, original: url }
  if (/\.(mp4|webm|mov)$/.test(lowerPath))    return { kind: 'video', embedUrl: url, original: url }

  return { kind: 'unknown', embedUrl: url, original: url }
}

function ytEmbed(id: string, parsed: URL, original: string): MediaInfo {
  const list = parsed.searchParams.get('list')
  const t    = parsed.searchParams.get('t') || parsed.searchParams.get('start')
  const params = new URLSearchParams()
  if (list) params.set('list', list)
  if (t) {
    // 't' may be like '90' or '1m30s' — strip non-digits for ?start=
    const sec = parseTimeToSeconds(t)
    if (sec > 0) params.set('start', String(sec))
  }
  // Reasonable defaults: rel=0 keeps "Up next" videos to the same channel.
  params.set('rel', '0')
  return {
    kind: 'youtube',
    embedUrl: `https://www.youtube.com/embed/${id}${params.toString() ? '?' + params.toString() : ''}`,
    original,
  }
}

function parseTimeToSeconds(s: string): number {
  if (/^\d+$/.test(s)) return Number(s)
  let total = 0
  const m = s.match(/(\d+)h/);  if (m) total += Number(m[1]) * 3600
  const mm = s.match(/(\d+)m/); if (mm) total += Number(mm[1]) * 60
  const ms = s.match(/(\d+)s/); if (ms) total += Number(ms[1])
  return total
}

export function isIframeMedia(kind: MediaKind): boolean {
  return kind === 'youtube' || kind === 'vimeo'
}
