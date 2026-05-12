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
  ForegroundGrass, CenterPath,
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

        {/* center glowing path leading to the horizon (between the trees) */}
        <div className="s-center-path">
          <CenterPath />
        </div>

        {/* bush silhouette line */}
        <div className="s-bushes-line">
          <BushSilhouetteLine />
        </div>

        {/* foreground grass tufts — sits on top of the bush line */}
        <div className="s-foreground-grass">
          <ForegroundGrass />
        </div>

        {/* falling particles — leaves / snow / petals / fireflies */}
        <Particles season={season} />

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

// ──────────────────────── Particles (season-aware) ────────────────────────

function Particles({ season }: { season: Season }) {
  // 14 slots; each child :nth-child styles its own left/delay/duration
  const items = Array.from({ length: 14 }, (_, i) => i)
  return (
    <div className="s-particles" aria-hidden>
      {items.map(i => (
        <div key={`${season}-${i}`} className="s-particle">
          {renderParticle(season, i)}
        </div>
      ))}
    </div>
  )
}

function renderParticle(season: Season, i: number): ReactNode {
  if (season === 'winter') return <Snowflake variant={i % 3} />
  if (season === 'spring') return <Petal     color={SPRING_COLORS[i % SPRING_COLORS.length]} variant={i % 2} />
  if (season === 'summer') return <Firefly   />
  return <Leaf color={AUTUMN_COLORS[i % AUTUMN_COLORS.length]} variant={i % 3} />
}

const AUTUMN_COLORS = ['#e05c2a', '#d4892a', '#c44d1a', '#f0a030', '#b83818', '#e87830']
const SPRING_COLORS = ['#f8c5d8', '#f5a8c0', '#fcd5e3', '#ffb8d0', '#ffcfdf', '#f896b8']

function Leaf({ color, variant }: { color: string; variant: number }) {
  if (variant === 0) return (
    <svg viewBox="0 0 20 20">
      <path d="M10 1 Q18 6 16 14 Q10 20 4 14 Q2 6 10 1Z" fill={color} opacity="0.95" />
      <line x1="10" y1="1" x2="10" y2="19" stroke={color} strokeWidth="0.8" opacity="0.5" />
    </svg>
  )
  if (variant === 1) return (
    <svg viewBox="0 0 20 20">
      <ellipse cx="10" cy="10" rx="7" ry="9" fill={color} opacity="0.9" transform="rotate(-20 10 10)" />
    </svg>
  )
  return (
    <svg viewBox="0 0 20 20">
      <path d="M10 0 L12 6 L18 4 L14 10 L20 12 L13 12 L12 18 L10 14 L8 18 L7 12 L0 12 L6 10 L2 4 L8 6Z" fill={color} opacity="0.9" />
    </svg>
  )
}

function Snowflake({ variant }: { variant: number }) {
  const stroke = '#ffffff'
  if (variant === 0) return (
    <svg viewBox="0 0 20 20">
      <g stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity="0.95">
        <line x1="10" y1="2" x2="10" y2="18" />
        <line x1="2"  y1="10" x2="18" y2="10" />
        <line x1="4"  y1="4"  x2="16" y2="16" />
        <line x1="16" y1="4"  x2="4"  y2="16" />
      </g>
    </svg>
  )
  if (variant === 1) return (
    <svg viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="3" fill={stroke} opacity="0.9" />
      <circle cx="10" cy="10" r="6" stroke={stroke} strokeWidth="0.7" fill="none" opacity="0.7" />
    </svg>
  )
  return (
    <svg viewBox="0 0 20 20">
      <g fill={stroke} opacity="0.95">
        <circle cx="10" cy="10" r="2" />
        <circle cx="10" cy="3"  r="1.4" />
        <circle cx="10" cy="17" r="1.4" />
        <circle cx="3"  cy="10" r="1.4" />
        <circle cx="17" cy="10" r="1.4" />
      </g>
    </svg>
  )
}

function Petal({ color, variant }: { color: string; variant: number }) {
  if (variant === 0) return (
    <svg viewBox="0 0 20 20">
      <path d="M10 2 Q16 6 14 12 Q10 18 6 12 Q4 6 10 2Z" fill={color} opacity="0.92" />
    </svg>
  )
  return (
    <svg viewBox="0 0 20 20">
      <ellipse cx="10" cy="10" rx="4" ry="7" fill={color} opacity="0.9" transform="rotate(35 10 10)" />
    </svg>
  )
}

function Firefly() {
  return (
    <svg viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="2.5" fill="#fff5a8" opacity="0.9">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="10" cy="10" r="6" fill="#fff5a8" opacity="0.3">
        <animate attributeName="opacity" values="0.05;0.45;0.05" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
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
