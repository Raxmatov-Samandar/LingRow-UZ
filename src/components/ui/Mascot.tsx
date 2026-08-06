import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  onClick: () => void;
  /** Popover open / talking. */
  active?: boolean;
}

const TIPS = [
  '5 min vocab review?',
  'Streak heating up 🔥',
  'Try a Speaking drill!',
  'Read 1 passage today.',
  "Don't skip Listening!",
  'Practice = magic.',
  'You got this. ✨',
  'Band 7 starts here.',
  "Open me up — let's chat!",
];

type Mood = 'idle' | 'walking' | 'excited' | 'thinking' | 'celebrate' | 'sleepy';

/** Per-mood emoji that floats above the head. */
const MOOD_EMOJI: Record<Mood, string | null> = {
  idle:      null,
  walking:   null,
  excited:   '✨',
  thinking:  '💭',
  celebrate: '🎉',
  sleepy:    '😴',
};

/** Per-mood whole-body animation. transform-origin = bottom-center, so all
 * tilts/skews look like the mascot is balancing on its little feet. */
const BODY_ANIM: Record<Mood, { y: number[]; rotate: number[]; skewX?: number[] }> = {
  idle:      { y: [0, -7, 0],          rotate: [0, 1.5, -1.5, 0]                 },
  walking:   { y: [0, -10, 0, -10, 0], rotate: [0, 8, -8, 8, -8, 0], skewX: [0, -2, 2, -2, 2, 0] },
  excited:   { y: [0, -16, 0, -10, 0], rotate: [0, -8, 8, -4, 0]                  },
  thinking:  { y: [0, -3, 0],          rotate: [0, -10, -10, -10, 0]              },
  celebrate: { y: [0, -22, 0],         rotate: [0, 360]                           },
  sleepy:    { y: [0, -3, 0],          rotate: [0, 1, -1, 0]                      },
};
const BODY_DUR: Record<Mood, number> = {
  idle: 2.6, walking: 0.55, excited: 0.9, thinking: 2.2, celebrate: 1.2, sleepy: 4.2,
};

export function Mascot({ onClick, active }: Props) {
  const reduced = useReducedMotion();
  const [anchor, setAnchor] = useState(0);
  const [tip, setTip]       = useState<string | null>(null);
  const [mood, setMood]     = useState<Mood>('idle');
  const [isDesktop, setIsDesktop] = useState(false);

  // Below lg, some anchors sit mid-screen and overlap scrollable content —
  // a thumb trying to scroll there lands on the mascot's tap target instead.
  // Only let it wander on desktop; phones keep it pinned to a safe corner.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Trigger a temporary mood, then return to idle.
  function pulseMood(m: Mood, ms = 2400) {
    setMood(m);
    window.setTimeout(() => setMood('idle'), ms);
  }

  // Drift to a new anchor every ~25s — sets walking mood while in motion.
  useEffect(() => {
    if (reduced || !isDesktop) return;
    const id = window.setInterval(() => {
      setMood('walking');
      setAnchor(a => (a + 1 + Math.floor(Math.random() * 3)) % 4);
      window.setTimeout(() => setMood('idle'), 3400);
    }, 22_000 + Math.random() * 8_000);
    return () => clearInterval(id);
  }, [reduced, isDesktop]);

  // Random emotion ticks — every 18-30 s pick a random brief mood.
  useEffect(() => {
    if (reduced) return;
    const ticks: Mood[] = ['excited', 'thinking', 'celebrate', 'sleepy'];
    let timer: number;
    const loop = () => {
      const m = ticks[Math.floor(Math.random() * ticks.length)];
      pulseMood(m, m === 'celebrate' ? 1400 : 2400);
      timer = window.setTimeout(loop, 18_000 + Math.random() * 12_000);
    };
    timer = window.setTimeout(loop, 12_000);
    return () => clearTimeout(timer);
  }, [reduced]);

  // Speech bubble loop
  useEffect(() => {
    if (reduced) return;
    let timer: number;
    const loop = () => {
      const t = TIPS[Math.floor(Math.random() * TIPS.length)];
      setTip(t);
      window.setTimeout(() => setTip(null), 5000);
      timer = window.setTimeout(loop, 28_000 + Math.random() * 18_000);
    };
    timer = window.setTimeout(loop, 9_000);
    return () => clearTimeout(timer);
  }, [reduced]);

  const ANCHORS = [
    { right: 24,            bottom: 24 },
    { right: 24,            bottom: '40%' as const },
    { right: 24,            top:    96 },
    { right: '7%' as const, bottom: 100 },
  ];
  const pos = isDesktop ? ANCHORS[anchor] : ANCHORS[0];

  // While popover is open, force a "thinking" pose.
  const effective: Mood = active ? 'thinking' : mood;
  const anim     = BODY_ANIM[effective];
  const dur      = BODY_DUR[effective];
  const emoji    = MOOD_EMOJI[effective];

  return (
    <motion.div
      className="fixed z-40 pointer-events-none"
      animate={pos}
      transition={{ duration: 3.4, ease: [0.4, 0, 0.2, 1] }}
      style={pos as React.CSSProperties}
    >
      {/* Speech bubble (real text tips) */}
      <AnimatePresence>
        {tip && !active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit   ={{ opacity: 0, scale: 0.7, y: 8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-[92px] top-2 whitespace-nowrap"
          >
            <div className="relative bg-white text-slate-900 text-xs font-semibold px-3 py-2 rounded-2xl shadow-[0_8px_22px_rgba(0,0,0,0.35)]">
              {tip}
              <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating mood emoji above the head */}
      <AnimatePresence>
        {emoji && (
          <motion.span
            key={emoji + effective}
            initial={{ opacity: 0, y: 8, scale: 0.4 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit   ={{ opacity: 0, y: -18, scale: 0.6 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl pointer-events-none drop-shadow-md"
            style={{ zIndex: 2 }}
          >
            {emoji}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Sparkles around the mascot when excited / celebrating */}
      <AnimatePresence>
        {(effective === 'excited' || effective === 'celebrate') && (
          <>
            {[0, 1, 2, 3].map(i => (
              <motion.span
                key={'spark-' + i}
                className="absolute text-yellow-300 pointer-events-none"
                initial={{ opacity: 0, scale: 0.4, x: 30, y: 30 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale:   [0.4, 1, 0.4],
                  x: 30 + Math.cos((i / 4) * Math.PI * 2) * 50,
                  y: 30 + Math.sin((i / 4) * Math.PI * 2) * 50,
                }}
                transition={{ duration: 1.2, delay: i * 0.08, ease: 'easeOut' }}
                style={{ left: 0, top: 0, fontSize: 14 }}
              >
                ✦
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* The mascot character with full-body animations */}
      <motion.button
        onClick={() => { pulseMood('celebrate', 1100); onClick(); }}
        aria-label="Ask Professor Linguo"
        className="pointer-events-auto cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cosmic-mint rounded-full block"
        animate={reduced ? undefined : anim}
        transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={reduced ? undefined : { scale: 1.10, rotate: -6, y: -4 }}
        whileTap  ={reduced ? undefined : { scale: 0.92 }}
        onMouseEnter={() => pulseMood('excited', 1200)}
        style={{ transformOrigin: '50% 88%' }}
      >
        <img
          src="/mascot.png"
          alt=""
          width={88}
          height={88}
          draggable={false}
          className="select-none drop-shadow-[0_8px_18px_rgba(126,247,180,0.40)]"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = 'none';
            const fallback = el.parentElement?.querySelector('[data-fallback]') as HTMLElement | null;
            if (fallback) fallback.style.display = 'grid';
          }}
        />
        <span data-fallback
              style={{ display: 'none' }}
              className="w-[64px] h-[64px] place-items-center text-3xl rounded-2xl bg-gradient-to-br from-cosmic-mint to-cosmic-sky border border-white/30">
          🎓
        </span>
      </motion.button>

      {/* Soft shadow underneath — squishes when walking / jumping */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-16 h-2 rounded-[50%]"
        style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.45), transparent 70%)', filter: 'blur(2px)' }}
        animate={reduced ? undefined : {
          scale:   effective === 'celebrate' ? [1, 0.4, 1] : effective === 'walking' ? [1, 0.6, 1, 0.6, 1] : [1, 0.85, 1],
          opacity: effective === 'celebrate' ? [0.55, 0.15, 0.55] : effective === 'walking' ? [0.55, 0.25, 0.55, 0.25, 0.55] : [0.55, 0.35, 0.55],
        }}
        transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
