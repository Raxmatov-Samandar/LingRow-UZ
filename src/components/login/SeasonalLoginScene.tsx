// =============================================================================
// SeasonalLoginScene — animated background for the Login page.
// Renders cartoon-illustration trees (see SceneArt), distant mountains,
// drifting clouds, animated road stripes, falling particles (leaves / snow /
// petals / fireflies) and a glassmorphism card slot.
// Switches palette based on the `season` prop. Auto-detects season from the
// current month, with a manual switcher in the top-left corner.
// =============================================================================
import { useEffect, useState, type ReactNode } from 'react'
import './seasons.css'
import { SeasonTree, SeasonBush, SeasonSun, DistantMountains, GrassTufts } from './SceneArt'

export type Season = 'autumn' | 'winter' | 'spring' | 'summer'

export function detectSeason(d: Date = new Date()): Season {
  const m = d.getMonth() // 0-11
  if (m >= 2 && m <= 4)  return 'spring'  // Mar-May
  if (m >= 5 && m <= 7)  return 'summer'  // Jun-Aug
  if (m >= 8 && m <= 10) return 'autumn'  // Sep-Nov
  return 'winter'                          // Dec-Feb
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

  // Mouse parallax — subtle drift on sun and edge trees.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const dx = (e.clientX - cx) / cx
      const dy = (e.clientY - cy) / cy
      document.documentElement.style.setProperty('--parallax-x', `${dx * 6}px`)
      document.documentElement.style.setProperty('--parallax-x-neg', `${dx * -6}px`)
      document.documentElement.style.setProperty('--parallax-sun-x', `${dx * 10}px`)
      document.documentElement.style.setProperty('--parallax-sun-y', `${dy * 8}px`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div className="fixed inset-0">
      <div className="season-scene" data-season={season}>
        {/* sun */}
        <div className="s-sun-wrap"
             style={{ transform: 'translate(var(--parallax-sun-x,0), var(--parallax-sun-y,0))' }}>
          <SeasonSun season={season} />
        </div>

        {/* drifting clouds */}
        <div className="s-cloud s-cloud-1"><div /><div /><div /></div>
        <div className="s-cloud s-cloud-2"><div /><div /></div>

        {/* distant mountain silhouettes for depth */}
        <DistantMountains season={season} />

        {/* mid background trees — small, slightly behind */}
        <div className="s-tree s-tree-mid-left">
          <SeasonTree season={season} size="mid" />
        </div>
        <div className="s-tree s-tree-mid-right">
          <SeasonTree season={season} size="mid" />
        </div>

        {/* ground + road */}
        <div className="s-ground" />
        <div className="s-road" />

        {/* grass tufts on top of ground edge */}
        <GrassTufts season={season} />

        {/* foreground trees — big, framing the card */}
        <div className="s-tree s-tree-left"  style={{ transform: 'translateX(var(--parallax-x,0))' }}>
          <SeasonTree season={season} size="big" />
        </div>
        <div className="s-tree s-tree-right" style={{ transform: 'translateX(var(--parallax-x-neg,0))' }}>
          <SeasonTree season={season} size="big" />
        </div>

        {/* bushes */}
        <div className="s-bush s-bush-left">
          <SeasonBush season={season} />
        </div>
        <div className="s-bush s-bush-right">
          <SeasonBush season={season} />
        </div>

        {/* falling particles */}
        <Particles season={season} />

        {/* season switcher (top-left) */}
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

// ──────────────────────── particles ────────────────────────

function Particles({ season }: { season: Season }) {
  const items = Array.from({ length: 16 }, (_, i) => i)
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
  if (season === 'summer') return <Firefly   variant={i % 2} />
  return <Leaf color={AUTUMN_COLORS[i % AUTUMN_COLORS.length]} variant={i % 3} />
}

const AUTUMN_COLORS = ['#e05c2a', '#d4892a', '#c44d1a', '#f0a030', '#b83818', '#e87830']
const SPRING_COLORS = ['#f8c5d8', '#f5a8c0', '#fcd5e3', '#ffb8d0', '#ffcfdf', '#f896b8']

function Leaf({ color, variant }: { color: string; variant: number }) {
  if (variant === 0) return (
    <svg viewBox="0 0 20 20">
      <path d="M10 1 Q18 6 16 14 Q10 20 4 14 Q2 6 10 1Z" fill={color} opacity="0.9" />
      <line x1="10" y1="1" x2="10" y2="19" stroke={color} strokeWidth="0.8" opacity="0.5" />
    </svg>
  )
  if (variant === 1) return (
    <svg viewBox="0 0 20 20">
      <ellipse cx="10" cy="10" rx="7" ry="9" fill={color} opacity="0.85" transform="rotate(-20 10 10)" />
    </svg>
  )
  return (
    <svg viewBox="0 0 20 20">
      <path d="M10 0 L12 6 L18 4 L14 10 L20 12 L13 12 L12 18 L10 14 L8 18 L7 12 L0 12 L6 10 L2 4 L8 6Z" fill={color} opacity="0.85" />
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
      <path d="M10 2 Q16 6 14 12 Q10 18 6 12 Q4 6 10 2Z" fill={color} opacity="0.9" />
    </svg>
  )
  return (
    <svg viewBox="0 0 20 20">
      <ellipse cx="10" cy="10" rx="4" ry="7" fill={color} opacity="0.88" transform="rotate(35 10 10)" />
    </svg>
  )
}

function Firefly({ variant }: { variant: number }) {
  const color = variant === 0 ? '#fff5a8' : '#fff0c0'
  return (
    <svg viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="3" fill={color} opacity="0.85">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="10" cy="10" r="6" fill={color} opacity="0.25">
        <animate attributeName="opacity" values="0.05;0.4;0.05" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
