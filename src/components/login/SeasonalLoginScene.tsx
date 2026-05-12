// =============================================================================
// SeasonalLoginScene — dusk-lit composition for the login page.
//
// Layered z-stack (back → front):
//   [0]  sky gradient + horizon glow (CSS pseudo)
//   [1]  twinkling stars + sun disc behind mountains
//   [2]  mountain silhouettes (3 layers: far, mid, near)
//   [3]  drifting cloud streaks, V-shaped birds
//   [4]  pine forest on both sides (mirrored)
//   [5]  bush silhouette line + low mist wisps
//   [6]  reflective water (with mirrored forest reflection)
//   [10] glass card slot (children)
//   [11] vignette overlay (CSS pseudo)
//
// Crossfading: a single `data-season` attribute on the scene root drives every
// palette via CSS variables, so switching feels like a smooth lighting change
// rather than a hard re-render. Composition stays identical across seasons.
// =============================================================================
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import './seasons.css'
import {
  MountainLayers, PineForest, BushSilhouetteLine, SunDisc, BirdV,
} from './SceneArt'

export type Season = 'autumn' | 'winter' | 'spring' | 'summer'

export function detectSeason(d: Date = new Date()): Season {
  const m = d.getMonth() // 0-11
  if (m >= 2 && m <= 4)  return 'spring'
  if (m >= 5 && m <= 7)  return 'summer'
  if (m >= 8 && m <= 10) return 'autumn'
  return 'winter'
}

interface Props {
  children: ReactNode
  initialSeason?: Season
}

const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter']
const SEASON_EMOJI: Record<Season, string> = {
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
}

export function SeasonalLoginScene({ children, initialSeason }: Props) {
  const [season, setSeason] = useState<Season>(initialSeason ?? detectSeason())

  // Mouse parallax — gentle sun drift only (tree movement would feel jittery
  // in a still scene). Updates a CSS variable; CSS handles the transform.
  useEffect(() => {
    let frame = 0
    const onMove = (e: MouseEvent) => {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        const dx = (e.clientX - cx) / cx
        const dy = (e.clientY - cy) / cy
        document.documentElement.style.setProperty('--parallax-sun-x', `${dx * 16}px`)
        document.documentElement.style.setProperty('--parallax-sun-y', `${dy * 8}px`)
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => { window.removeEventListener('mousemove', onMove); if (frame) cancelAnimationFrame(frame) }
  }, [])

  // Generate a stable random star field once (memoized — positions don't shift
  // when the season changes, only their color via CSS variable).
  const stars = useMemo(() => {
    const out: { x: number; y: number; delay: number; size: number }[] = []
    const seeded = mulberry32(20260511)
    for (let i = 0; i < 60; i++) {
      out.push({
        x: seeded() * 100,
        y: seeded() * 100,
        delay: seeded() * 3.5,
        size: 1 + Math.round(seeded() * 1.5),
      })
    }
    return out
  }, [])

  return (
    <div className="fixed inset-0">
      <div className="season-scene" data-season={season}>
        {/* stars */}
        <div className="s-stars">
          {stars.map((s, i) => (
            <span key={i}
                  className="s-star"
                  style={{
                    left: `${s.x}%`,
                    top:  `${s.y}%`,
                    width:  `${s.size}px`,
                    height: `${s.size}px`,
                    animationDelay: `${s.delay}s`,
                  }} />
          ))}
        </div>

        {/* sun behind mountains */}
        <div className="s-sun-wrap">
          <SunDisc />
        </div>

        {/* layered mountains */}
        <div className="s-mountains">
          <MountainLayers season={season} />
        </div>

        {/* cloud streaks */}
        <div className="s-clouds-wrap">
          <div className="s-cloud-streak" />
          <div className="s-cloud-streak" />
          <div className="s-cloud-streak" />
          <div className="s-cloud-streak" />
        </div>

        {/* birds */}
        <div className="s-birds">
          <span className="s-bird"><BirdV /></span>
          <span className="s-bird"><BirdV /></span>
          <span className="s-bird"><BirdV /></span>
        </div>

        {/* pine forest — left + mirrored right */}
        <div className="s-forest s-forest-left">
          <PineForest />
        </div>
        <div className="s-forest s-forest-right">
          <PineForest />
        </div>

        {/* bush silhouette line */}
        <div className="s-bushes-line">
          <BushSilhouetteLine />
        </div>

        {/* mist wisps */}
        <div className="s-mist">
          <div className="s-mist-wisp" />
          <div className="s-mist-wisp" />
          <div className="s-mist-wisp" />
          <div className="s-mist-wisp" />
        </div>

        {/* water with reflection */}
        <div className="s-water">
          <div className="s-water-reflection">
            {/* mirror of forest + bushes */}
            <div style={{ position: 'absolute', left: '-2%', bottom: '0', width: '50%', height: '100%' }}>
              <PineForest />
            </div>
            <div style={{ position: 'absolute', right: '-2%', bottom: '0', width: '50%', height: '100%', transform: 'scaleX(-1)' }}>
              <PineForest />
            </div>
          </div>
          <div className="s-ripple" />
          <div className="s-ripple" />
          <div className="s-ripple" />
          <div className="s-ripple" />
        </div>

        {/* season switcher */}
        <div className="season-switcher">
          {SEASON_ORDER.map(s => (
            <button key={s}
                    onClick={() => setSeason(s)}
                    className={season === s ? 'active' : undefined}
                    title={s}
                    aria-label={s}>
              {SEASON_EMOJI[s]}
            </button>
          ))}
        </div>

        {/* glass card slot */}
        <div className="season-card-wrapper">
          <div className="season-card">
            <div className="season-card-shine" />
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Deterministic PRNG — keeps star positions stable across re-renders.
function mulberry32(seed: number) {
  let t = seed
  return () => {
    t |= 0; t = (t + 0x6D2B79F5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
