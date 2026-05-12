// =============================================================================
// SceneArt — cartoon SVG illustrations for the dusk/twilight login background.
// Composition: layered mountains (atmospheric perspective) + backlit pine
// forest (warm-on-cold for the autumn/spring/summer dusk feel) + dark
// silhouetted bush line at the front + drifting clouds and birds.
// Each season swaps fills via CSS custom properties on the wrapping element,
// so the same SVG geometry serves all four moods.
// =============================================================================
import type { Season } from './SeasonalLoginScene'

// ───────────────────────── Mountains ─────────────────────────

export function MountainLayers({ season }: { season: Season }) {
  // we use CSS variables for the 3 mountain layers so a season switch crossfades
  void season
  return (
    <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYEnd slice" aria-hidden>
      {/* far layer */}
      <path
        d="M0 500 L0 320 L80 250 L160 290 L260 200 L360 270 L460 230 L560 290 L660 220 L780 280 L900 240 L1020 290 L1140 250 L1200 280 L1200 500 Z"
        fill="var(--mountain-far)"
        opacity="0.85"
      />
      {/* mid layer */}
      <path
        d="M0 500 L0 360 L100 300 L200 340 L320 270 L420 330 L540 290 L660 350 L780 280 L900 340 L1020 300 L1140 350 L1200 320 L1200 500 Z"
        fill="var(--mountain-mid)"
      />
      {/* near layer */}
      <path
        d="M0 500 L0 400 L80 360 L180 400 L290 340 L380 400 L490 360 L600 410 L720 370 L820 420 L940 380 L1060 420 L1200 390 L1200 500 Z"
        fill="var(--mountain-near)"
      />
    </svg>
  )
}

// ───────────────────────── Sun behind mountains ─────────────────────────

export function SunDisc() {
  return (
    <svg viewBox="0 0 240 240" aria-hidden>
      <defs>
        <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#fff7d6" />
          <stop offset="55%" stopColor="#ffd086" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff9050" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="115" fill="url(#sunCore)" />
    </svg>
  )
}

// ───────────────────────── Pine forest ─────────────────────────
// Cluster of backlit pines. The bright color comes from --tree-bright /
// --tree-warm; --tree-shadow paints the front-facing shadow side. We mix
// taller and shorter pines for a natural skyline.

export function PineForest() {
  // each pine: {x: number, scale: number, sway?: boolean}
  const pines = [
    { x: 30,  scale: 1.30 },
    { x: 90,  scale: 0.95 },
    { x: 150, scale: 1.10 },
    { x: 210, scale: 0.85 },
    { x: 260, scale: 1.20 },
    { x: 320, scale: 1.00 },
    { x: 380, scale: 1.15 },
    { x: 440, scale: 0.90 },
    { x: 490, scale: 1.05 },
    { x: 540, scale: 1.30 },
    { x: 600, scale: 0.95 },
  ]
  return (
    <svg viewBox="0 0 660 600" preserveAspectRatio="xMinYEnd meet" aria-hidden>
      <defs>
        <linearGradient id="pineLight" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="var(--tree-bright)" />
          <stop offset="60%" stopColor="var(--tree-warm)"   />
          <stop offset="100%" stopColor="var(--tree-deep)"  />
        </linearGradient>
        <linearGradient id="pineDark" x1="1" x2="0" y1="0" y2="0">
          <stop offset="0%"  stopColor="var(--tree-shadow)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--tree-shadow)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {pines.map((p, i) => <Pine key={i} x={p.x} scale={p.scale} />)}
      {/* foreground darker overlay to push these into shadow at base */}
      <rect x="0" y="540" width="660" height="60" fill="var(--tree-shadow)" opacity="0.55" />
    </svg>
  )
}

function Pine({ x, scale }: { x: number; scale: number }) {
  // a tall narrow pine. Base width ~70, full height ~340.
  const h = 340 * scale
  const w = 70 * scale
  return (
    <g transform={`translate(${x} ${600 - h}) scale(${scale})`}>
      {/* trunk */}
      <rect x={28} y={310} width={14} height={36} fill="var(--tree-shadow)" opacity="0.9" />
      {/* main body — 4 stacked triangular tiers, each slightly offset for organic feel */}
      <path d="M35 0   L0  100 L70 100 Z" fill="url(#pineLight)" />
      <path d="M35 70  L5  175 L65 175 Z" fill="url(#pineLight)" />
      <path d="M35 140 L0  240 L70 240 Z" fill="url(#pineLight)" />
      <path d="M35 215 L-5 320 L75 320 Z" fill="url(#pineLight)" />
      {/* darker shadow side */}
      <path d="M35 0   L0  100 L35 100 Z" fill="url(#pineDark)" />
      <path d="M35 70  L5  175 L35 175 Z" fill="url(#pineDark)" />
      <path d="M35 140 L0  240 L35 240 Z" fill="url(#pineDark)" />
      <path d="M35 215 L-5 320 L35 320 Z" fill="url(#pineDark)" />
      {/* bright tip highlight */}
      <path d="M35 0 L24 35 L46 35 Z" fill="var(--tree-bright)" opacity="0.6" />
      {/* discard unused vars from TS (h/w computed for layout intent) */}
      <rect width={w} height={h} fill="none" />
    </g>
  )
}

// ───────────────────────── Foreground bush silhouette line ─────────────────────────

export function BushSilhouetteLine() {
  return (
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="bushGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="var(--bush-color)" />
          <stop offset="100%" stopColor="var(--bush-edge)" />
        </linearGradient>
      </defs>
      <path
        d="M0 60 L0 30
           Q 30 18, 60 28
           Q 90 16, 130 26
           Q 170 14, 210 24
           Q 250 20, 300 12
           Q 340 24, 380 18
           Q 420 26, 470 20
           Q 510 28, 560 16
           Q 600 26, 650 22
           Q 700 12, 740 24
           Q 780 18, 830 26
           Q 870 14, 910 22
           Q 950 28, 1000 18
           Q 1040 26, 1080 22
           Q 1120 16, 1160 26
           Q 1180 22, 1200 30
           L 1200 60 Z"
        fill="url(#bushGrad)"
      />
    </svg>
  )
}

// ───────────────────────── Birds (V silhouettes) ─────────────────────────

export function BirdV() {
  return (
    <svg viewBox="0 0 24 14" aria-hidden>
      <path d="M2 8 Q6 2 12 6 Q18 2 22 8" stroke="rgba(0,0,0,0.65)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}
