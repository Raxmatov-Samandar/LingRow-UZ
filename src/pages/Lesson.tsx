import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { SUBTITLE_CARDS } from '@/data/mock';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useActivity } from '@/store/activity';
import { useUi } from '@/store/ui';
import { useDevContent, type DevLesson } from '@/store/devContent';
import { MediaPlayer } from '@/components/ui/MediaPlayer';

interface VocabRow {
  word:   string;
  ipa:    string;
  uz:     string;     // Uzbek translation
  defEn:  string;
  defUz:  string;
  active?: boolean;
}

const VOCAB_ROWS: VocabRow[] = [
  { word: 'Hello',         ipa: '/həˈloʊ/',         uz: 'Salom',
    defEn: 'A common greeting used when meeting someone.',
    defUz: 'Birovni uchratganda aytiladigan oddiy salomlashish so‘zi.',
    active: true },
  { word: 'Hi',            ipa: '/haɪ/',            uz: 'Salom (do‘stona)',
    defEn: 'An informal, friendly greeting.',
    defUz: 'Norasmiy, do‘stona salomlashish.' },
  { word: 'Good morning',  ipa: '/ɡʊd ˈmɔːr.nɪŋ/',  uz: 'Xayrli tong',
    defEn: 'A polite greeting used in the morning.',
    defUz: 'Ertalab aytiladigan muloyim salomlashish.' },
  { word: 'Good afternoon',ipa: '/ɡʊd ˌæf.tɚˈnuːn/',uz: 'Xayrli kun',
    defEn: 'A polite greeting used after midday.',
    defUz: 'Tushdan keyin aytiladigan salomlashish.' },
  { word: 'Good evening',  ipa: '/ɡʊd ˈiːv.nɪŋ/',   uz: 'Xayrli kech',
    defEn: 'A polite greeting used in the evening.',
    defUz: 'Kechqurun aytiladigan salomlashish.' },
  { word: 'How are you?',  ipa: '/haʊ ɑːr juː/',    uz: 'Qalaysiz?',
    defEn: 'A polite question about someone’s wellbeing.',
    defUz: 'Birovning ahvolini so‘rovchi muloyim savol.' },
  { word: "I’m fine",      ipa: '/aɪm faɪn/',       uz: 'Yaxshi',
    defEn: 'A standard reply meaning you feel well.',
    defUz: 'Ahvolingiz yaxshi ekanini bildirish.' },
  { word: 'Nice to meet you', ipa: '/naɪs tuː miːt juː/', uz: 'Tanishganimdan xursandman',
    defEn: 'A polite phrase when meeting someone for the first time.',
    defUz: 'Birinchi marta tanishganda aytiladigan ibora.' },
  { word: 'Welcome',       ipa: '/ˈwel.kəm/',       uz: 'Xush kelibsiz',
    defEn: 'A warm phrase used to receive someone.',
    defUz: 'Mehmonni iliq qabul qilish iborasi.' },
  { word: 'Thank you',     ipa: '/θæŋk juː/',       uz: 'Rahmat',
    defEn: 'An expression of gratitude.',
    defUz: 'Minnatdorchilik bildirish.' },
  { word: "You’re welcome",ipa: '/jɔːr ˈwel.kəm/',  uz: 'Arzimaydi',
    defEn: 'A polite reply to “thank you”.',
    defUz: '"Rahmat"ga muloyim javob.' },
  { word: 'Please',        ipa: '/pliːz/',          uz: 'Iltimos',
    defEn: 'A polite word used in requests.',
    defUz: 'So‘rov yoki iltimosda ishlatiladigan muloyim so‘z.' },
  { word: 'Sorry',         ipa: '/ˈsɒr.i/',         uz: 'Kechirasiz',
    defEn: 'Used to express apology or regret.',
    defUz: 'Uzr so‘rash yoki afsus bildirish.' },
  { word: 'Excuse me',     ipa: '/ɪkˈskjuːz miː/',  uz: 'Kechiring',
    defEn: 'Used to politely get attention or pass by.',
    defUz: 'Diqqat tortish yoki yo‘l so‘rashda muloyim ibora.' },
  { word: 'Yes',           ipa: '/jes/',            uz: 'Ha',
    defEn: 'An affirmative reply.',
    defUz: 'Tasdiqlovchi javob.' },
  { word: 'No',            ipa: '/noʊ/',            uz: 'Yo‘q',
    defEn: 'A negative reply.',
    defUz: 'Inkor javob.' },
  { word: 'Goodbye',       ipa: '/ˌɡʊdˈbaɪ/',       uz: 'Xayr',
    defEn: 'A farewell used when leaving someone.',
    defUz: 'Birovdan ajralayotganda aytiladigan xayrlashish so‘zi.' },
  { word: 'See you later', ipa: '/siː juː ˈleɪ.tɚ/', uz: 'Keyin ko‘rishamiz',
    defEn: 'A casual farewell expecting to meet again.',
    defUz: 'Yana ko‘rishishni nazarda tutgan tasodifiy xayrlashish.' },
  { word: 'Take care',     ipa: '/teɪk keər/',      uz: 'O‘zingizga ehtiyot bo‘ling',
    defEn: 'A friendly farewell wishing wellbeing.',
    defUz: 'Sog‘lik tilab xayrlashish iborasi.' },
  { word: 'Have a nice day',ipa: '/hæv ə naɪs deɪ/', uz: 'Kuningiz xayrli o‘tsin',
    defEn: 'A polite phrase wishing someone a good day.',
    defUz: 'Birovga yaxshi kun tilash uchun ibora.' },
];

export function Lesson() {
  const { id } = useParams<{ id: string }>();
  const [activeIdx, setActiveIdx] = useState(0);
  const log = useActivity(s => s.log);
  const setSidebar = useUi(s => s.setSidebar);

  const lessons = useDevContent(s => s.lessons);
  // Active lesson: matched by URL param, otherwise first video lesson, otherwise undefined.
  const activeLesson = useMemo<DevLesson | undefined>(() => {
    if (id) return lessons.find(l => l.id === id);
    return lessons.find(l => l.kind === 'video' && !!l.mediaUrl) ?? lessons[0];
  }, [lessons, id]);

  const lessonTitle = activeLesson?.title ?? 'Greetings in English';

  // Auto-collapse sidebar on lesson pages for focus mode (one-time, on mount)
  useEffect(() => { setSidebar(true); }, []); // eslint-disable-line

  // Mark this lesson as started + completed when user reaches the end
  useEffect(() => { log('lesson_started', { lesson: lessonTitle }); }, [lessonTitle]); // eslint-disable-line
  useEffect(() => {
    if (activeIdx === SUBTITLE_CARDS.length - 1) log('lesson_completed', { lesson: lessonTitle });
  }, [activeIdx, lessonTitle]); // eslint-disable-line

  // Keep idx in range when switching lessons
  useEffect(() => { setActiveIdx(0); }, [activeLesson?.id]);

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="search" />

        <section className="grid grid-cols-[1fr_320px] gap-5 flex-1 min-h-0 overflow-auto">
          {/* Video block */}
          <div className="glass-panel flex flex-col gap-4 p-5">
            {activeLesson?.mediaUrl ? (
              <MediaPlayer url={activeLesson.mediaUrl} title={activeLesson.title} />
            ) : (
              <DemoVideoPlaceholder title={lessonTitle} />
            )}

            {lessons.length > 0 && <LessonSwitcher lessons={lessons} activeId={activeLesson?.id} />}

            <SubtitleBar activeIdx={activeIdx} setActiveIdx={setActiveIdx} />
          </div>

          <aside className="flex flex-col gap-4 min-h-0">
            <VocabPanel />

            <div className="glass-panel p-4">
              <h4 className="text-base font-bold text-white mb-3">Progress Tracker</h4>
              <ul className="flex flex-col gap-3">
                {[
                  ['Intro', 'done'],
                  ['Lesson', 'active'],
                  ['Vocabulary', ''],
                  ['Review', ''],
                  ['Quiz', ''],
                ].map(([label, state]) => (
                  <li key={label as string}
                      className={`relative pl-7 text-sm
                                  ${state === 'done' ? 'text-slate-500' : state === 'active' ? 'text-white font-semibold' : 'text-slate-300/70'}`}>
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                          style={{
                            background:
                              state === 'done'   ? '#7ef7d3' :
                              state === 'active' ? '#5aa9ff' :
                                                   'rgba(255,255,255,0.10)',
                            border:
                              state === 'active' ? '2px solid #fff' :
                              state === 'done'   ? '2px solid #7ef7d3' :
                                                   '2px solid rgba(255,255,255,0.3)',
                            boxShadow:
                              state === 'done'   ? '0 0 10px #7ef7d3' :
                              state === 'active' ? '0 0 14px #5aa9ff' : 'none',
                          }} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>
      </AppShell>
    </>
  );
}

// ───────────────────────────── DemoVideoPlaceholder ─────────────────────────────
// Shown when the dev hasn't uploaded any video lesson yet — keeps the page
// presentable for first-time visitors.

function DemoVideoPlaceholder({ title }: { title: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden aspect-video"
         style={{ background: 'linear-gradient(135deg,#3a4d8c,#1a2350)' }}>
      <img className="w-full h-full object-cover"
           src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=85" alt="Teacher" />
      <div className="absolute top-4 left-5 text-2xl font-bold text-white drop-shadow-lg">
        {title}
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70px] h-[70px] rounded-full grid place-items-center"
           style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.45)',
                    backdropFilter: 'blur(8px)', boxShadow: '0 0 30px rgba(120,180,255,0.5)' }}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M8 5.5v13l11-6.5z"/></svg>
      </div>
      <div className="absolute left-5 right-5 bottom-3 flex items-center gap-3 text-white text-xs">
        <div className="flex-1 h-1 rounded bg-gradient-to-r from-cosmic-mint via-cosmic-mint/60 to-white/20" />
        <span className="opacity-80">Demo</span>
      </div>
    </div>
  );
}

// ───────────────────────────── LessonSwitcher ─────────────────────────────
// Horizontal chip list of all dev-uploaded lessons. Click → /lesson/<id>.

function LessonSwitcher({ lessons, activeId }: { lessons: DevLesson[]; activeId: string | undefined }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
      {lessons.map(l => (
        <Link
          key={l.id}
          to={`/lesson/${l.id}`}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition border text-[12px]
                      ${l.id === activeId
                        ? 'bg-cosmic-mint/15 border-cosmic-mint/45 text-cosmic-mint'
                        : 'border-white/8 text-slate-300 hover:text-white hover:bg-white/[0.05]'}`}
        >
          <span className="text-[11px]">
            {l.kind === 'video' ? '🎬' : l.kind === 'reading' ? '📖' : l.kind === 'speaking' ? '🎤' : l.kind === 'writing' ? '✍️' : '🧠'}
          </span>
          <span className="font-semibold whitespace-nowrap max-w-[180px] truncate">{l.title}</span>
          <span className="text-[9px] uppercase tracking-wider opacity-70">{l.level}</span>
        </Link>
      ))}
    </div>
  );
}

// ───────────────────────────── SubtitleBar ─────────────────────────────
// One continuous "live subtitle" for the video lesson:
//  • the active phrase is shown big & glowing
//  • all phrases are listed below as a horizontal ticker
//  • prev / next chevrons + auto-centering of the active chip
//  • a thin progress bar showing position in the lesson

function SubtitleBar({
  activeIdx, setActiveIdx,
}: { activeIdx: number; setActiveIdx: (i: number) => void }) {
  const total   = SUBTITLE_CARDS.length;
  const cur     = SUBTITLE_CARDS[activeIdx];
  const tickerRef = useRef<HTMLDivElement>(null);
  const reduced  = useReducedMotion();

  // Center the active chip whenever it changes
  useEffect(() => {
    const container = tickerRef.current;
    if (!container) return;
    const chip = container.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    chip?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      inline:   'center',
      block:    'nearest',
    });
  }, [activeIdx, reduced]);

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-end mb-2">
        <span className="text-[11px] text-slate-400 tabular-nums">
          {String(activeIdx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      {/* Big active phrase + IPA */}
      <div className="text-center min-h-[68px] mb-3 relative">
        <motion.div
          key={cur.num}
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[28px] font-bold text-white leading-none tracking-tight">
            {cur.en}
          </p>
          <p className="mt-1 text-sm text-cosmic-mint/85 italic">{cur.ipa}</p>
        </motion.div>
      </div>

      {/* Ticker — all phrases on one continuous flowing line */}
      <div className="relative">
        {/* edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-10"
             style={{ background: 'linear-gradient(to right, rgba(15,20,40,0.95), transparent)' }} />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10"
             style={{ background: 'linear-gradient(to left, rgba(15,20,40,0.95), transparent)' }} />

        <div ref={tickerRef}
             className="flex items-center gap-1.5 overflow-x-auto scroll-smooth no-scrollbar py-1 px-8">
          {SUBTITLE_CARDS.map((c, i) => (
            <button
              key={c.num}
              data-idx={i}
              onClick={() => setActiveIdx(i)}
              className={`group shrink-0 flex items-baseline gap-1.5 px-3 py-2 rounded-full transition-all
                          ${i === activeIdx
                            ? 'bg-cosmic-mint/15 border border-cosmic-mint/45 text-cosmic-mint shadow-[0_0_18px_rgba(126,247,211,0.30)]'
                            : 'border border-white/8 text-slate-300 hover:text-white hover:bg-white/[0.05]'}`}
            >
              <span className="text-[13px] font-semibold whitespace-nowrap">{c.en}</span>
              <span className={`text-[10px] italic ${i === activeIdx ? 'text-cosmic-mint/70' : 'text-slate-500'}`}>
                {c.ipa}
              </span>
              {i < total - 1 && <span className="ml-1.5 text-slate-600">·</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Prev/Next + thin progress bar */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
          disabled={activeIdx === 0}
          className="w-7 h-7 rounded-full grid place-items-center border border-white/10 text-slate-300 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cosmic-mint to-cosmic-sky shadow-[0_0_10px_#7ef7d3]"
            animate={{ width: `${((activeIdx + 1) / total) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        <button
          onClick={() => setActiveIdx(Math.min(total - 1, activeIdx + 1))}
          disabled={activeIdx === total - 1}
          className="w-7 h-7 rounded-full grid place-items-center border border-white/10 text-slate-300 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────── VocabPanel ─────────────────────────────
// Animated, scrollable vocabulary list with:
//  • staggered entry animation on first mount
//  • per-card reveal-in-view as the user scrolls
//  • soft fade gradients at top & bottom edges of the scroll area
//  • auto-scroll to the active word on mount

function VocabPanel() {
  const reduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  // Auto-scroll to active item once on mount
  useEffect(() => {
    if (reduced) return;
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [reduced]);

  // Track scroll position for fade indicators
  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setAtTop(el.scrollTop < 8);
    setAtBottom(el.scrollHeight - el.clientHeight - el.scrollTop < 8);
  }
  useEffect(onScroll, []);

  return (
    <div className="glass-panel p-4 flex flex-col min-h-0 flex-1 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-bold text-white">Lesson Vocabulary</h4>
        <span className="text-[11px] text-slate-400">{VOCAB_ROWS.length} words</span>
      </div>

      {/* fade gradient at top */}
      <div className={`pointer-events-none absolute left-4 right-4 top-12 h-6 z-10 transition-opacity duration-200
                       ${atTop ? 'opacity-0' : 'opacity-100'}`}
           style={{ background: 'linear-gradient(to bottom, rgba(15,20,40,0.95), transparent)' }} />

      <motion.div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex flex-col gap-2 overflow-y-auto pr-1 scroll-smooth"
        initial="hidden"
        animate="visible"
        variants={{
          hidden:  {},
          visible: { transition: { staggerChildren: reduced ? 0 : 0.06 } },
        }}
      >
        {VOCAB_ROWS.map((v) => (
          <motion.div
            key={v.word}
            ref={v.active ? activeRef : undefined}
            variants={{
              hidden:  { opacity: 0, y: reduced ? 0 : 14, scale: reduced ? 1 : 0.98 },
              visible: {
                opacity: 1, y: 0, scale: 1,
                transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            whileHover={reduced ? undefined : { y: -2, transition: { duration: 0.2 } }}
            className={`group rounded-xl px-3.5 py-3 transition-colors cursor-pointer flex-shrink-0
                        ${v.active
                          ? 'bg-cosmic-sky/12 border border-cosmic-sky/40 shadow-[0_4px_18px_rgba(90,169,255,0.20)]'
                          : 'border border-white/8 hover:bg-white/[0.04]'}`}
          >
            {/* row 1: EN word + IPA + UZ translation */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {v.active && (
                <span className="w-2 h-2 rounded-full bg-cosmic-sky shadow-[0_0_8px_#5aa9ff] shrink-0 animate-pulse" />
              )}
              <span className="text-[15px] font-bold text-white">{v.word}</span>
              <span className="text-[11px] text-slate-400 italic">{v.ipa}</span>
              <span className="ml-auto text-[12px] font-semibold text-cosmic-mint">{v.uz}</span>
            </div>

            {/* row 2: bilingual definition */}
            <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-cosmic-mint/20">
              <p className="text-[11.5px] leading-snug text-slate-200/85">
                <span className="text-slate-500 mr-1.5 font-mono text-[10px]">EN</span>{v.defEn}
              </p>
              <p className="text-[11.5px] leading-snug text-slate-200/75">
                <span className="text-slate-500 mr-1.5 font-mono text-[10px]">UZ</span>{v.defUz}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* fade gradient at bottom */}
      <div className={`pointer-events-none absolute left-4 right-4 bottom-4 h-8 z-10 transition-opacity duration-200
                       ${atBottom ? 'opacity-0' : 'opacity-100'}`}
           style={{ background: 'linear-gradient(to top, rgba(15,20,40,0.95), transparent)' }} />

      {/* scroll hint chevron when not at bottom */}
      {!atBottom && (
        <motion.div
          aria-hidden
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 z-20 text-cosmic-mint/70"
        >
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
            <path d="M2 2l8 8 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      )}
    </div>
  );
}
