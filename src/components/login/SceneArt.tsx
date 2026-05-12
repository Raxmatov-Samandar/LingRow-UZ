// =============================================================================
// SceneArt — cartoon SVG illustrations for the login background scene.
// Flat-illustration style (think Notion / Stripe illustrations) with two-to-
// three-tone gradients, soft rounded foliage, and subtle inner shadows for
// depth. Each tree is purpose-drawn per season — autumn maple, winter snowy
// fir, spring cherry blossom, summer oak — so the scenery actually reads as
// the right time of year, not just recolored blobs.
// =============================================================================
import type { Season } from './SeasonalLoginScene'

interface TreeProps {
  season: Season
  /** big | mid */
  size?: 'big' | 'mid'
}

export function SeasonTree({ season, size = 'big' }: TreeProps) {
  if (season === 'autumn') return size === 'big' ? <AutumnTreeBig /> : <AutumnTreeMid />
  if (season === 'winter') return size === 'big' ? <WinterTreeBig /> : <WinterTreeMid />
  if (season === 'spring') return size === 'big' ? <SpringTreeBig /> : <SpringTreeMid />
  return size === 'big' ? <SummerTreeBig /> : <SummerTreeMid />
}

export function SeasonBush({ season }: { season: Season }) {
  if (season === 'winter') return <BushSnowy />
  if (season === 'autumn') return <BushAutumn />
  if (season === 'spring') return <BushSpring />
  return <BushSummer />
}

export function SeasonSun({ season }: { season: Season }) {
  if (season === 'winter') return <SunPale />
  if (season === 'summer') return <SunBright />
  return <SunWarm />
}

// ──────────────────────── AUTUMN — maple ────────────────────────

function AutumnTreeBig() {
  return (
    <svg viewBox="0 0 240 320" width="100%" height="100%" preserveAspectRatio="xMidYEnd meet">
      <defs>
        <radialGradient id="aBigCanopy" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffb45a" />
          <stop offset="55%" stopColor="#e0651e" />
          <stop offset="100%" stopColor="#a83410" />
        </radialGradient>
        <radialGradient id="aBigShine" cx="35%" cy="30%" r="20%">
          <stop offset="0%" stopColor="#fff0b8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffd07a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* trunk */}
      <path d="M105 320 L107 230 Q108 218 118 218 L122 218 Q132 218 133 230 L135 320 Z" fill="#4a2210" />
      <path d="M118 220 Q113 240 116 270" stroke="#3a1a08" strokeWidth="2" fill="none" opacity="0.6" />
      {/* canopy clusters — three overlapping organic blobs */}
      <ellipse cx="80"  cy="180" rx="58" ry="52" fill="url(#aBigCanopy)" />
      <ellipse cx="160" cy="170" rx="62" ry="56" fill="url(#aBigCanopy)" />
      <ellipse cx="120" cy="130" rx="72" ry="60" fill="url(#aBigCanopy)" />
      {/* highlight blob */}
      <ellipse cx="100" cy="115" rx="40" ry="28" fill="url(#aBigShine)" />
      {/* a few scattered leaves on canopy */}
      <circle cx="60"  cy="200" r="6" fill="#c44d1a" />
      <circle cx="180" cy="195" r="5" fill="#f0a030" />
      <circle cx="135" cy="95"  r="5" fill="#e87830" />
      <circle cx="195" cy="135" r="4" fill="#d4892a" />
    </svg>
  )
}

function AutumnTreeMid() {
  return (
    <svg viewBox="0 0 160 220" width="100%" height="100%" preserveAspectRatio="xMidYEnd meet">
      <defs>
        <radialGradient id="aMidCanopy" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#f0a430" />
          <stop offset="100%" stopColor="#b54218" />
        </radialGradient>
      </defs>
      <path d="M73 220 L74 165 Q75 156 80 156 L82 156 Q87 156 88 165 L89 220 Z" fill="#5a2a10" />
      <ellipse cx="55" cy="115" rx="38" ry="36" fill="url(#aMidCanopy)" />
      <ellipse cx="105" cy="110" rx="40" ry="38" fill="url(#aMidCanopy)" />
      <ellipse cx="80" cy="80" rx="48" ry="42" fill="url(#aMidCanopy)" />
      <ellipse cx="72" cy="68" rx="20" ry="12" fill="#ffd070" opacity="0.4" />
    </svg>
  )
}

// ──────────────────────── WINTER — snowy fir ────────────────────────

function WinterTreeBig() {
  return (
    <svg viewBox="0 0 240 320" width="100%" height="100%" preserveAspectRatio="xMidYEnd meet">
      <defs>
        <linearGradient id="wFir" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2d5a3d" />
          <stop offset="100%" stopColor="#1a3a26" />
        </linearGradient>
      </defs>
      {/* trunk */}
      <rect x="108" y="270" width="24" height="50" rx="3" fill="#3a2418" />
      {/* fir tiers — 3 triangular layers */}
      <path d="M120 80  L75 175  L165 175 Z" fill="url(#wFir)" />
      <path d="M120 140 L60 230  L180 230 Z" fill="url(#wFir)" />
      <path d="M120 195 L48 285  L192 285 Z" fill="url(#wFir)" />
      {/* snow caps over each tier */}
      <path d="M120 80  Q108 100 95 115 Q108 110 120 100 Q132 110 145 115 Q132 100 120 80 Z" fill="#ffffff" opacity="0.95" />
      <path d="M120 140 Q102 165 80 185 Q100 178 120 168 Q140 178 160 185 Q138 165 120 140 Z" fill="#ffffff" opacity="0.95" />
      <path d="M120 195 Q98  225 70  250 Q98  240 120 228 Q142 240 170 250 Q142 225 120 195 Z" fill="#ffffff" opacity="0.95" />
      {/* snow at base */}
      <ellipse cx="120" cy="318" rx="80" ry="6" fill="#ffffff" opacity="0.7" />
    </svg>
  )
}

function WinterTreeMid() {
  return (
    <svg viewBox="0 0 160 220" width="100%" height="100%" preserveAspectRatio="xMidYEnd meet">
      <defs>
        <linearGradient id="wFirMid" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#316246" />
          <stop offset="100%" stopColor="#1f422a" />
        </linearGradient>
      </defs>
      <rect x="72" y="180" width="16" height="35" rx="2" fill="#3a2418" />
      <path d="M80 50  L48 115 L112 115 Z" fill="url(#wFirMid)" />
      <path d="M80 95  L36 165 L124 165 Z" fill="url(#wFirMid)" />
      <path d="M80 140 L26 200 L134 200 Z" fill="url(#wFirMid)" />
      <path d="M80 50 Q70 65 60 76 Q70 72 80 66 Q90 72 100 76 Q90 65 80 50 Z" fill="#fff" opacity="0.95" />
      <path d="M80 95 Q68 115 50 130 Q68 124 80 117 Q92 124 110 130 Q92 115 80 95 Z" fill="#fff" opacity="0.95" />
      <path d="M80 140 Q65 165 40 185 Q65 178 80 170 Q95 178 120 185 Q95 165 80 140 Z" fill="#fff" opacity="0.95" />
    </svg>
  )
}

// ──────────────────────── SPRING — cherry blossom ────────────────────────

function SpringTreeBig() {
  return (
    <svg viewBox="0 0 240 320" width="100%" height="100%" preserveAspectRatio="xMidYEnd meet">
      <defs>
        <radialGradient id="sBigBlossom" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#fbc8dd" />
          <stop offset="100%" stopColor="#e67aa6" />
        </radialGradient>
      </defs>
      {/* trunk + branches */}
      <path d="M105 320 L108 220 Q108 205 118 200 L122 200 Q132 205 132 220 L135 320 Z" fill="#7a4830" />
      <path d="M118 215 Q90 195 70 175"  stroke="#7a4830" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M122 215 Q150 195 175 178" stroke="#7a4830" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M120 205 Q120 175 115 150" stroke="#7a4830" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* blossom clouds */}
      <ellipse cx="70"  cy="170" rx="48" ry="44" fill="url(#sBigBlossom)" />
      <ellipse cx="175" cy="170" rx="50" ry="46" fill="url(#sBigBlossom)" />
      <ellipse cx="120" cy="130" rx="62" ry="52" fill="url(#sBigBlossom)" />
      <ellipse cx="100" cy="200" rx="32" ry="28" fill="url(#sBigBlossom)" />
      <ellipse cx="155" cy="205" rx="30" ry="26" fill="url(#sBigBlossom)" />
      {/* tiny blossom dots */}
      {[
        [80, 175], [110, 110], [150, 120], [180, 160], [60, 180], [165, 195], [100, 95], [200, 175]
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#ffb6cc" />
      ))}
    </svg>
  )
}

function SpringTreeMid() {
  return (
    <svg viewBox="0 0 160 220" width="100%" height="100%" preserveAspectRatio="xMidYEnd meet">
      <defs>
        <radialGradient id="sMidBlossom" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f098b8" />
        </radialGradient>
      </defs>
      <path d="M73 220 L75 160 Q75 150 80 148 L82 148 Q87 150 87 160 L89 220 Z" fill="#7a4830" />
      <ellipse cx="50" cy="115" rx="32" ry="30" fill="url(#sMidBlossom)" />
      <ellipse cx="110" cy="115" rx="34" ry="32" fill="url(#sMidBlossom)" />
      <ellipse cx="80" cy="80" rx="42" ry="36" fill="url(#sMidBlossom)" />
      <circle cx="65" cy="80" r="3" fill="#ffb6cc" />
      <circle cx="100" cy="100" r="3" fill="#ffb6cc" />
      <circle cx="90" cy="120" r="3" fill="#ffb6cc" />
    </svg>
  )
}

// ──────────────────────── SUMMER — full oak ────────────────────────

function SummerTreeBig() {
  return (
    <svg viewBox="0 0 240 320" width="100%" height="100%" preserveAspectRatio="xMidYEnd meet">
      <defs>
        <radialGradient id="suBigCanopy" cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#84d058" />
          <stop offset="55%" stopColor="#48a02a" />
          <stop offset="100%" stopColor="#1f5e14" />
        </radialGradient>
      </defs>
      <path d="M105 320 L107 230 Q108 218 118 218 L122 218 Q132 218 133 230 L135 320 Z" fill="#4a2818" />
      <ellipse cx="78"  cy="180" rx="58" ry="54" fill="url(#suBigCanopy)" />
      <ellipse cx="162" cy="170" rx="62" ry="58" fill="url(#suBigCanopy)" />
      <ellipse cx="120" cy="125" rx="74" ry="64" fill="url(#suBigCanopy)" />
      {/* highlight */}
      <ellipse cx="100" cy="110" rx="40" ry="26" fill="#b3e88a" opacity="0.45" />
      {/* small fruit accents */}
      <circle cx="135" cy="180" r="4" fill="#f0463a" />
      <circle cx="85"  cy="155" r="3.5" fill="#f0463a" />
      <circle cx="170" cy="200" r="3.5" fill="#f0463a" />
    </svg>
  )
}

function SummerTreeMid() {
  return (
    <svg viewBox="0 0 160 220" width="100%" height="100%" preserveAspectRatio="xMidYEnd meet">
      <defs>
        <radialGradient id="suMidCanopy" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#7bc848" />
          <stop offset="100%" stopColor="#2a6818" />
        </radialGradient>
      </defs>
      <path d="M73 220 L75 165 Q75 156 80 156 L82 156 Q87 156 88 165 L89 220 Z" fill="#5a3018" />
      <ellipse cx="55" cy="115" rx="38" ry="36" fill="url(#suMidCanopy)" />
      <ellipse cx="105" cy="112" rx="40" ry="38" fill="url(#suMidCanopy)" />
      <ellipse cx="80" cy="78" rx="48" ry="42" fill="url(#suMidCanopy)" />
    </svg>
  )
}

// ──────────────────────── BUSHES ────────────────────────

function BushAutumn() {
  return (
    <svg viewBox="0 0 120 60" width="100%" height="100%">
      <defs>
        <radialGradient id="bushA" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#e0651e" />
          <stop offset="100%" stopColor="#a03410" />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="40" rx="28" ry="22" fill="url(#bushA)" />
      <ellipse cx="65" cy="35" rx="32" ry="26" fill="url(#bushA)" />
      <ellipse cx="95" cy="40" rx="22" ry="20" fill="url(#bushA)" />
      <ellipse cx="55" cy="28" rx="18" ry="8" fill="#ffd07a" opacity="0.35" />
    </svg>
  )
}

function BushSnowy() {
  return (
    <svg viewBox="0 0 120 60" width="100%" height="100%">
      <defs>
        <radialGradient id="bushW" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#a8c3df" />
          <stop offset="100%" stopColor="#7593b0" />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="42" rx="28" ry="22" fill="url(#bushW)" />
      <ellipse cx="65" cy="36" rx="32" ry="26" fill="url(#bushW)" />
      <ellipse cx="95" cy="42" rx="22" ry="20" fill="url(#bushW)" />
      {/* snow caps */}
      <path d="M10 35 Q30 18 50 32 Q40 28 30 28 Q20 28 10 35 Z" fill="#ffffff" />
      <path d="M40 25 Q65 8 90 24 Q75 18 65 18 Q55 18 40 25 Z" fill="#ffffff" />
      <path d="M78 32 Q95 18 115 30 Q105 24 95 24 Q85 24 78 32 Z" fill="#ffffff" />
    </svg>
  )
}

function BushSpring() {
  return (
    <svg viewBox="0 0 120 60" width="100%" height="100%">
      <defs>
        <radialGradient id="bushS" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#80c84a" />
          <stop offset="100%" stopColor="#3e7a2a" />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="40" rx="28" ry="22" fill="url(#bushS)" />
      <ellipse cx="65" cy="35" rx="32" ry="26" fill="url(#bushS)" />
      <ellipse cx="95" cy="40" rx="22" ry="20" fill="url(#bushS)" />
      {/* flower dots */}
      <circle cx="25" cy="30" r="3" fill="#fbb6d0" />
      <circle cx="50" cy="22" r="3" fill="#ffffff" />
      <circle cx="75" cy="25" r="3" fill="#f8dfe9" />
      <circle cx="98" cy="33" r="3" fill="#fbb6d0" />
      <circle cx="40" cy="40" r="2.5" fill="#ffd970" />
      <circle cx="80" cy="42" r="2.5" fill="#ffd970" />
    </svg>
  )
}

function BushSummer() {
  return (
    <svg viewBox="0 0 120 60" width="100%" height="100%">
      <defs>
        <radialGradient id="bushU" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#73c43a" />
          <stop offset="100%" stopColor="#1f5e14" />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="40" rx="28" ry="22" fill="url(#bushU)" />
      <ellipse cx="65" cy="35" rx="32" ry="26" fill="url(#bushU)" />
      <ellipse cx="95" cy="40" rx="22" ry="20" fill="url(#bushU)" />
      <circle cx="50" cy="22" r="3" fill="#ffffff" />
      <circle cx="80" cy="28" r="2.5" fill="#ffd970" />
    </svg>
  )
}

// ──────────────────────── SUNS ────────────────────────

function SunWarm() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%">
      <defs>
        <radialGradient id="sunWarm" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff5cc" />
          <stop offset="55%" stopColor="#ffc864" />
          <stop offset="100%" stopColor="#ff8a2a" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="55" fill="url(#sunWarm)" opacity="0.55" />
      <circle cx="60" cy="60" r="32" fill="#ffd870" />
      <circle cx="50" cy="50" r="10" fill="#fff0b8" opacity="0.7" />
    </svg>
  )
}

function SunBright() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%">
      <defs>
        <radialGradient id="sunBright" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#ffe85a" />
          <stop offset="100%" stopColor="#ffa830" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform="translate(60 60)">
        {[0, 30, 60, 90, 120, 150].map(a => (
          <rect key={a} x="-2" y="-58" width="4" height="14" rx="2" fill="#ffe06a" transform={`rotate(${a})`} />
        ))}
      </g>
      <circle cx="60" cy="60" r="55" fill="url(#sunBright)" />
      <circle cx="60" cy="60" r="30" fill="#ffe85a" />
      <circle cx="50" cy="50" r="9" fill="#ffffff" opacity="0.75" />
    </svg>
  )
}

function SunPale() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%">
      <defs>
        <radialGradient id="sunPale" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff9d8" />
          <stop offset="60%" stopColor="#ffe6a8" />
          <stop offset="100%" stopColor="#cfd8e6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="55" fill="url(#sunPale)" opacity="0.7" />
      <circle cx="60" cy="60" r="30" fill="#fff5d0" opacity="0.95" />
      <circle cx="51" cy="50" r="8" fill="#ffffff" opacity="0.6" />
    </svg>
  )
}

// ──────────────────────── DISTANT MOUNTAINS ────────────────────────

export function DistantMountains({ season }: { season: Season }) {
  const colors: Record<Season, { far: string; near: string; opacity: number }> = {
    autumn: { far: '#8a4818', near: '#a04a18', opacity: 0.35 },
    winter: { far: '#7a8fa8', near: '#a5b8cc', opacity: 0.55 },
    spring: { far: '#8aa8c8', near: '#b5c8e0', opacity: 0.40 },
    summer: { far: '#5588ba', near: '#7aa8d0', opacity: 0.45 },
  }
  const c = colors[season]
  return (
    <svg viewBox="0 0 1200 200" preserveAspectRatio="none"
         style={{ position: 'absolute', bottom: '28%', left: 0, right: 0, width: '100%', height: '18vh', zIndex: 1, opacity: c.opacity, pointerEvents: 'none' }}>
      <path d="M0 200 L0 130 L120 70 L220 110 L340 50 L460 100 L580 60 L700 120 L820 80 L940 110 L1060 70 L1200 100 L1200 200 Z" fill={c.far} />
      <path d="M0 200 L0 160 L100 120 L200 150 L320 110 L420 145 L540 115 L660 155 L780 125 L900 150 L1020 120 L1200 145 L1200 200 Z" fill={c.near} opacity="0.7" />
    </svg>
  )
}

// ──────────────────────── GRASS TUFTS ────────────────────────

export function GrassTufts({ season }: { season: Season }) {
  if (season === 'winter') return null
  const color = season === 'autumn' ? '#c44d1a' : season === 'spring' ? '#5e9c45' : '#3e7a30'
  return (
    <svg viewBox="0 0 1200 40" preserveAspectRatio="none"
         style={{ position: 'absolute', bottom: '27.5%', left: 0, right: 0, width: '100%', height: '20px', zIndex: 4, pointerEvents: 'none' }}>
      {Array.from({ length: 22 }).map((_, i) => {
        const x = i * 56 + (i % 2 ? 12 : 0)
        const h = 14 + (i % 3) * 5
        return (
          <g key={i}>
            <path d={`M${x} 40 Q${x + 3} ${40 - h} ${x + 6} 40`}      stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d={`M${x + 5} 40 Q${x + 9} ${40 - h - 3} ${x + 13} 40`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )
      })}
    </svg>
  )
}
