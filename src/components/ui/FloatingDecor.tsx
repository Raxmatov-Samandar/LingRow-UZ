// Decorative floating letter glyphs (cosmic-style accents).
// `zIndex: 0` keeps them above the cosmos backdrop but BEHIND any glass-panel
// (which is rendered later in the DOM with implicit stacking — they win).
// We also nudge them toward the page corners so they don't sit on top of content.
export function FloatingDecor() {
  return (
    <>
      <span className="absolute pointer-events-none animate-floatY font-bold select-none"
            style={{ right: '1.5%', top: '8%', fontSize: 60, color: '#c8d6ff', opacity: 0.18,
                     filter: 'drop-shadow(0 0 12px currentColor)',
                     animationDelay: '-1s', zIndex: 0 }}>A</span>
      <span className="absolute pointer-events-none animate-floatY font-bold select-none"
            style={{ right: '1.5%', bottom: '6%', fontSize: 56, color: '#b69dff', opacity: 0.18,
                     filter: 'drop-shadow(0 0 12px currentColor)',
                     animationDelay: '-3s', zIndex: 0 }}>B</span>
      <span className="absolute pointer-events-none animate-floatY font-bold select-none"
            style={{ left: '1.5%', bottom: '8%', fontSize: 44, color: '#cfe1ff', opacity: 0.15,
                     filter: 'drop-shadow(0 0 12px currentColor)',
                     animationDelay: '-2s', zIndex: 0 }}>Q</span>
    </>
  );
}
