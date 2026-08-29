/**
 * MobileConceptIOS — LingRow iOS design concept.
 *
 * Adapted from an AliBrand-Uzum concept mockup for reuse here. Standalone
 * preview page, not wired to real LingRow data — every number and list is
 * mock content for the visual concept only.
 *
 * Requires: react, lucide-react, and Tailwind CSS (both already installed).
 */
import { useState, useMemo, useEffect, useRef } from 'react';
// Real Error-DNA content, so the concept mirrors the shipping data model
// (5 categories, 0-100 mastery where higher = stronger) instead of invented numbers.
import { ERROR_CATALOG } from '@/data/errorDna';
import type { ErrorCategory } from '@/types';
// The real dictionary, not mock words — the search box is meant to be used.
// `lookupWord` searches the curated bank and the academic word list together.
import { lookupWord, DICTIONARY, type LookupEntry } from '@/data/vocabulary/lookup';
import {
  Home, BookOpen, BarChart3, Dna, User, UserRound, ChevronRight, Bell, Search, Play, Pause,
  TrendingUp, TrendingDown, CheckCircle2, Award, Lock, Info, Contrast,
  Wifi, Signal, BatteryFull, ArrowUpRight, ArrowDownRight, ArrowLeft,
  LogOut, Sparkles, Eye, Box,
  HelpCircle, Globe, Moon, Sun, Camera,
  X, AlertTriangle, Bot, Zap, Flame, Repeat2
} from 'lucide-react';

// ─── useIsMobile (inlined so this file has no local dependencies) ────────────
const MOBILE_BREAKPOINT = 768;

function getInitialIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(getInitialIsMobile);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

// ─── Notification System ─────────────────────────────────────────────────────

type NotifKind = 'lesson' | 'review' | 'ai' | 'streak';

interface AppNotification {
  id: string;
  kind: NotifKind;
  appName: string;
  title: string;
  body: string;
  time: string;
  iconBg: string;
  Icon: typeof Home;
}

const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    kind: 'lesson',
    appName: 'LINGROW',
    title: 'Bugungi dars tayyor',
    body: "Present Perfect grammatika darsi va 8 ta yangi so'z sizni kutmoqda.",
    time: 'hozir',
    iconBg: 'linear-gradient(135deg, #2563EB, #8a4dff)',
    Icon: BookOpen,
  },
  {
    id: 'n2',
    kind: 'review',
    appName: 'LINGROW',
    title: "So'zlarni takrorlash vaqti",
    body: "12 ta so'z spaced repetition navbatida — unutmasdan oldin takrorlang.",
    time: '1 daq',
    iconBg: 'linear-gradient(135deg, #F59E0B, #ff453a)',
    Icon: Repeat2,
  },
  {
    id: 'n3',
    kind: 'ai',
    appName: 'AI TUTOR',
    title: 'Yangi maslahat',
    body: "Artikllar (a/an/the) bilan ko'p xato qilyapsiz — shu mavzuga 10 daqiqa ajrating.",
    time: '5 daq',
    iconBg: 'linear-gradient(135deg, #AF52DE, #a59bff)',
    Icon: Bot,
  },
  {
    id: 'n4',
    kind: 'streak',
    appName: 'LINGROW',
    title: '7 kunlik streak!',
    body: 'Ajoyib! Ketma-ket 7 kun mashq qildingiz — davom eting.',
    time: '12 daq',
    iconBg: 'linear-gradient(135deg, #22C55E, #30D158)',
    Icon: Flame,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LingRow — iOS Concept
// Interactive iPhone 15 Pro mockup with 5 main screens.
// All data is mocked — this is a design concept, not wired to live data.
// ─────────────────────────────────────────────────────────────────────────────

// ─── LingRow surface language ────────────────────────────────────────────────
// Lifted from the live app: a deep navy field, panels that are gradients rather
// than flat fills, hairline light borders, and mint reserved for small
// uppercase labels — mint is far too pale to sit under white text, but on the
// dark field it's the brightest thing on screen, which is exactly what a label
// wants to be.

const LR = {
  mint:   '#7ef7d3',
  sky:    '#5aa9ff',
  violet: '#a59bff',
  /** Fills that carry white text — light tints fail contrast, these don't. */
  blue:   '#2563EB',
  purple: '#8a4dff',
};

/** Panel background: a gradient on dark, plain white on light. */
function panelBg(isDark: boolean): string {
  return isDark
    ? 'linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 45%, rgba(140,175,255,0.035) 100%), #0b1020'
    : '#ffffff';
}

/** The hairline that makes a panel read as glass rather than a painted box. */
function panelBorder(isDark: boolean): string {
  return isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(60,60,67,0.10)';
}

/** Small uppercase label — mint on dark, muted ink on light. */
function labelColor(isDark: boolean): string {
  return isDark ? LR.mint : 'rgba(60,60,67,0.65)';
}

type TabKey = 'home' | 'lessons' | 'vocab' | 'analytics' | 'profile';
type DeviceColor = 'titanium' | 'natural' | 'blue' | 'white';

// Five slots, and the middle one is the reach-for-it action. Merging the two
// analytics screens freed a slot; the dictionary earns it because looking a word
// up is the thing a learner does most often and from anywhere.
const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Bosh', icon: Home },
  { key: 'lessons', label: 'Darslar', icon: BookOpen },
  { key: 'vocab', label: "Lug'at", icon: Search },
  { key: 'analytics', label: 'Tahlil', icon: BarChart3 },
  { key: 'profile', label: 'Profil', icon: User },
];

// ─── Notification Animations (CSS keyframes injected once) ───────────────────
// Inject CSS into document.head once so Vite Fast Refresh / lazy-mount cycles
// can't lose the reference (was causing "NotifKeyframes is not defined" crashes).

const NOTIF_KEYFRAMES_CSS = `
  @keyframes ios-banner-in {
    0% { transform: translateY(-130%); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes ios-banner-out {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-130%); opacity: 0; }
  }
  @keyframes ios-sheet-up {
    0% { transform: translateY(100%); }
    100% { transform: translateY(0); }
  }
  @keyframes ios-fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes ios-stack-in {
    0% { transform: translateY(20px) scale(0.96); opacity: 0; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  @keyframes ios-banner-shrink {
    0% { transform: scaleX(1); }
    100% { transform: scaleX(0); }
  }

  /* Segmented-control pill. The iOS curve: quick out of the gate, long tail,
     no overshoot — a tab switch is a discrete tap, not a thrown object. */
  .lesson-seg-pill {
    transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    .lesson-seg-pill { transition: none; }
  }
`;

function useNotifKeyframes() {
  useEffect(() => {
    const id = 'mobile-concept-ios-notif-keyframes';
    // Reuse the existing tag but always refresh its contents — bailing out when
    // the element exists leaves a stale stylesheet behind across Fast Refresh,
    // so newly added rules silently never apply.
    const styleEl = document.getElementById(id) ?? document.createElement('style');
    styleEl.id = id;
    if (styleEl.textContent !== NOTIF_KEYFRAMES_CSS) {
      styleEl.textContent = NOTIF_KEYFRAMES_CSS;
    }
    if (!styleEl.isConnected) document.head.appendChild(styleEl);
  }, []);
}

// ─── Notification Banner ─────────────────────────────────────────────────────
// iOS-style banner that slides down from the top, auto-dismisses after ~5s.

function NotificationBanner({
  notification,
  onDismiss,
  isDark,
  mobile = false,
}: {
  notification: AppNotification;
  onDismiss: () => void;
  isDark: boolean;
  mobile?: boolean;
}) {
  const [exiting, setExiting] = useState(false);
  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; }, [onDismiss]);

  // Reset exit animation when notification changes
  useEffect(() => { setExiting(false); }, [notification.id]);

  // Dismiss on tap (no auto-dismiss — banner stays until user interacts)
  const handleClick = () => {
    setExiting(true);
    window.setTimeout(() => onDismissRef.current(), 350);
  };

  const Icon = notification.Icon;

  return (
    <div
      className="absolute left-0 right-0 top-0 z-[60] px-3 pointer-events-none"
      style={{ paddingTop: mobile ? `calc(env(safe-area-inset-top, 12px) + 8px)` : '14px' }}
    >
      <div
        onClick={handleClick}
        className="pointer-events-auto cursor-pointer overflow-hidden rounded-[22px] backdrop-blur-2xl"
        style={{
          animation: exiting
            ? 'ios-banner-out 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards'
            : 'ios-banner-in 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
          background: isDark ? 'rgba(40,40,42,0.88)' : 'rgba(245,245,247,0.92)',
          boxShadow: isDark
            ? '0 12px 40px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.08) inset'
            : '0 12px 40px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.04) inset',
        }}
      >
        <div className="flex items-start gap-2.5 p-3">
          <div
            className="flex h-9 w-9 flex-none items-center justify-center rounded-[8px]"
            style={{ background: notification.iconBg }}
          >
            <Icon className="h-4 w-4 text-white" strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span
                className="truncate text-[11px] font-medium tracking-wide"
                style={{ color: isDark ? 'rgba(235,235,245,0.65)' : 'rgba(60,60,67,0.65)' }}
              >
                {notification.appName}
              </span>
              <span
                className="flex-none text-[11px]"
                style={{ color: isDark ? 'rgba(235,235,245,0.65)' : 'rgba(60,60,67,0.65)' }}
              >
                {notification.time}
              </span>
            </div>
            <div
              className="mt-0.5 text-[14px] font-semibold leading-tight"
              style={{ color: isDark ? '#ffffff' : '#000000' }}
            >
              {notification.title}
            </div>
            <div
              className="mt-0.5 line-clamp-2 text-[13px] leading-snug"
              style={{ color: isDark ? 'rgba(235,235,245,0.85)' : 'rgba(60,60,67,0.9)' }}
            >
              {notification.body}
            </div>
          </div>
        </div>
        <div
          className="h-[2px] w-full overflow-hidden"
          style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
        >
          <div
            className="h-full"
            style={{
              background: 'linear-gradient(90deg, #2563EB, #8a4dff)',
              animation: 'ios-banner-shrink 4.5s linear forwards',
              transformOrigin: 'left',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Notification Center (lock-screen style) ─────────────────────────────────

function NotificationCenter({
  isDark,
  onClose,
  onTriggerDemo,
}: {
  isDark: boolean;
  onClose: () => void;
  onTriggerDemo: () => void;
}) {
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const cardBg = isDark ? 'rgba(40,40,42,0.85)' : 'rgba(255,255,255,0.92)';

  return (
    <div className="absolute inset-0 z-[55]" style={{ animation: 'ios-fade-in 0.25s ease-out' }}>
      <div
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-2xl"
        style={{ background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 flex max-h-[88%] flex-col overflow-hidden rounded-t-[28px]"
        style={{
          animation: 'ios-sheet-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          background: isDark ? 'rgba(28,28,30,0.96)' : 'rgba(242,242,247,0.96)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex justify-center pb-2 pt-2">
          <div
            className="h-1 w-9 rounded-full"
            style={{ background: isDark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)' }}
          />
        </div>
        <div className="flex items-center justify-between px-5 pb-3">
          <div>
            <h2 className="text-[22px] font-bold" style={{ color: primaryText }}>
              Bildirishnomalar
            </h2>
            <p className="text-[12px]" style={{ color: secondaryText }}>
              {DEMO_NOTIFICATIONS.length} ta yangi
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition active:scale-90"
            style={{ background: isDark ? 'rgba(120,120,128,0.36)' : 'rgba(120,120,128,0.18)' }}
          >
            <X className="h-4 w-4" style={{ color: primaryText }} strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {DEMO_NOTIFICATIONS.map((n, i) => {
            const Icon = n.Icon;
            return (
              <div
                key={n.id}
                className="mb-2 overflow-hidden rounded-[18px] backdrop-blur-xl"
                style={{
                  animation: `ios-stack-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 60}ms backwards`,
                  background: cardBg,
                  boxShadow: isDark
                    ? '0 0 0 0.5px rgba(255,255,255,0.06) inset'
                    : '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04) inset',
                }}
              >
                <div className="flex items-start gap-2.5 p-3">
                  <div
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-[8px]"
                    style={{ background: n.iconBg }}
                  >
                    <Icon className="h-4 w-4 text-white" strokeWidth={2.4} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="truncate text-[11px] font-medium tracking-wide"
                        style={{ color: secondaryText }}
                      >
                        {n.appName}
                      </span>
                      <span className="flex-none text-[11px]" style={{ color: secondaryText }}>
                        {n.time}
                      </span>
                    </div>
                    <div
                      className="mt-0.5 text-[14px] font-semibold leading-tight"
                      style={{ color: primaryText }}
                    >
                      {n.title}
                    </div>
                    <div
                      className="mt-0.5 text-[13px] leading-snug"
                      style={{ color: isDark ? 'rgba(235,235,245,0.85)' : 'rgba(60,60,67,0.9)' }}
                    >
                      {n.body}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <button
            onClick={onTriggerDemo}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[18px] py-3.5 text-[14px] font-semibold transition active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #8a4dff)',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0,122,255,0.35)',
            }}
          >
            <Zap className="h-4 w-4" />
            Banner namunasi
          </button>
          <p className="mt-3 text-center text-[11px]" style={{ color: secondaryText }}>
            Yopish uchun tashqarini bosing
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Progress report sheet ───────────────────────────────────────────────────
// Slides up from the bottom inside the phone frame (same pattern as the
// notification center) instead of opening a separate PDF.

type ReportKey = 'daily' | 'weekly' | 'monthly';

interface ReportStat { label: string; value: string; accent?: 'up' | 'down' }
interface ReportTable { heading: string; columns: string[]; rows: string[][] }
interface ReportNote { heading: string; body: string }

interface ReportData {
  title: string;
  period: string;
  stats: ReportStat[];
  table: ReportTable;
  notes: ReportNote[];
}

const REPORTS: Record<ReportKey, ReportData> = {
  daily: {
    title: 'Kunlik mashqlar',
    period: '25-avgust, dushanba',
    stats: [
      { label: "XP to'plandi", value: '+42', accent: 'up' },
      { label: 'Darslar', value: '4' },
      { label: "Yangi so'zlar", value: '8' },
      { label: 'Streak', value: '7 kun' },
    ],
    table: {
      heading: 'Bugungi darslar',
      columns: ['Dars', 'Bajarildi'],
      rows: [
        ['Present Perfect grammatika', '100%'],
        ['Listening: Cambridge Test 3', '65%'],
        ["Vocabulary: Ish joyida so'zlar", '40%'],
        ['Speaking: Intervyu mashqlari', '80%'],
      ],
    },
    notes: [
      { heading: 'Xato DNA', body: "12 ta mashq yakunlandi, 5 ta xato tuzatildi. Eng ko'p uchragan: artikllar (a/an/the)." },
    ],
  },
  weekly: {
    title: 'Haftalik progress',
    period: "19–25-avgust",
    stats: [
      { label: 'IELTS Band', value: '6.5', accent: 'up' },
      { label: 'Darslar', value: '18' },
      { label: "Yangi so'zlar", value: '47' },
      { label: 'Aniqlik', value: '87%' },
    ],
    table: {
      heading: 'Kunlik faollik',
      columns: ['Kun', 'XP', 'Darslar'],
      rows: [
        ['Dushanba', '38', '3'],
        ['Seshanba', '52', '4'],
        ['Chorshanba', '45', '3'],
        ['Payshanba', '61', '5'],
        ['Juma', '58', '4'],
        ['Shanba', '72', '6'],
        ['Yakshanba', '42', '3'],
      ],
    },
    notes: [
      { heading: 'Eng zaif nuqta', body: "Artikllar (a/an/the) — 42% xato darajasi. Shu mavzuga qo'shimcha mashq tavsiya etiladi." },
    ],
  },
  monthly: {
    title: 'Oylik xulosa',
    period: 'May 2026',
    stats: [
      { label: 'Darslar', value: '34' },
      { label: "So'zlar", value: '128' },
      { label: 'IELTS Band', value: '6.5', accent: 'up' },
      { label: 'Rekord', value: '14 kun' },
    ],
    table: {
      heading: "Ko'nikmalar taqsimoti",
      columns: ["Ko'nikma", 'Ulush'],
      rows: [
        ['Listening', '32.4%'],
        ['Reading', '26.1%'],
        ['Vocabulary', '24.7%'],
        ['Speaking', '16.8%'],
      ],
    },
    notes: [
      { heading: 'Yutuqlar', body: "Band 6.5 maqsadiga yetildi. 14 kunlik streak rekordi o'rnatildi." },
      { heading: 'Keyingi oy uchun', body: "Artikllar va so'z tartibi mavzulariga ko'proq e'tibor bering." },
    ],
  },
};

function ReportSheet({
  reportKey,
  onClose,
  isDark,
}: {
  reportKey: ReportKey;
  onClose: () => void;
  isDark: boolean;
}) {
  const data = REPORTS[reportKey];
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const tileBg = isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFF';
  const divider = isDark ? 'rgba(84,84,88,0.6)' : 'rgba(60,60,67,0.18)';

  return (
    <div className="absolute inset-0 z-[58]" style={{ animation: 'ios-fade-in 0.2s ease-out' }}>
      <div
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.4)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 flex max-h-[86%] flex-col overflow-hidden rounded-t-[28px]"
        style={{
          animation: 'ios-sheet-up 0.36s cubic-bezier(0.16, 1, 0.3, 1)',
          background: isDark ? '#0e1428' : '#ffffff',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Grab handle */}
        <div className="flex flex-none justify-center pb-1 pt-2">
          <div className="h-1 w-9 rounded-full" style={{ background: secondaryText }} />
        </div>

        {/* Header */}
        <div className="flex flex-none items-start justify-between px-5 pb-3">
          <div className="min-w-0">
            <h2 className="truncate text-[19px] font-bold" style={{ color: primaryText }}>
              {data.title}
            </h2>
            <p className="text-[12px]" style={{ color: secondaryText }}>{data.period}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 flex h-8 w-8 flex-none items-center justify-center rounded-full transition active:scale-90"
            style={{ background: isDark ? 'rgba(120,120,128,0.36)' : 'rgba(120,120,128,0.18)' }}
            aria-label="Yopish"
          >
            <X className="h-4 w-4" style={{ color: primaryText }} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          {/* Stat tiles */}
          <div className="mb-4 grid grid-cols-2 gap-2.5">
            {data.stats.map((s) => (
              <div key={s.label} className="rounded-2xl p-3" style={{ background: tileBg }}>
                <div className="text-[11px]" style={{ color: secondaryText }}>{s.label}</div>
                <div
                  className="mt-0.5 text-[19px] font-bold"
                  style={{ color: s.accent === 'up' ? '#22C55E' : s.accent === 'down' ? '#ff453a' : primaryText }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="mb-2 text-[13px] font-medium" style={{ color: secondaryText }}>
            {data.table.heading}
          </div>
          <div className="mb-4 overflow-hidden rounded-2xl" style={{ background: tileBg }}>
            <div
              className="flex items-center gap-3 px-3.5 py-2"
              style={{ borderBottom: `0.5px solid ${divider}` }}
            >
              {data.table.columns.map((c, i) => (
                <span
                  key={c}
                  className={`text-[11px] font-semibold ${i === 0 ? 'flex-1' : 'w-14 text-right'}`}
                  style={{ color: secondaryText }}
                >
                  {c}
                </span>
              ))}
            </div>
            {data.table.rows.map((row, ri) => (
              <div
                key={row[0]}
                className="flex items-center gap-3 px-3.5 py-2.5"
                style={{
                  borderBottom: ri < data.table.rows.length - 1 ? `0.5px solid ${divider}` : 'none',
                }}
              >
                {row.map((cell, ci) => (
                  <span
                    key={ci}
                    className={`truncate text-[13px] ${ci === 0 ? 'flex-1' : 'w-14 text-right font-semibold'}`}
                    style={{ color: ci === 0 ? primaryText : primaryText }}
                  >
                    {cell}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Notes */}
          {data.notes.map((n) => (
            <div key={n.heading} className="mb-3 rounded-2xl p-3.5" style={{ background: tileBg }}>
              <div className="text-[13px] font-semibold" style={{ color: primaryText }}>{n.heading}</div>
              <div className="mt-1 text-[12px] leading-snug" style={{ color: secondaryText }}>{n.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MobileConceptIOS() {
  // Inject notification keyframes once (HMR-safe)
  useNotifKeyframes();

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  // The product itself is dark-first (globals.css paints the body #02030c),
  // so the mockup opens the way a real user sees the app.
  const [isDark, setIsDark] = useState(true);
  const [deviceColor, setDeviceColor] = useState<DeviceColor>('titanium');
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');
  const isMobile = useIsMobile();

  // Notification state — start with first banner visible on load
  // (CSS animation makes it slide in nicely, then auto-dismiss after ~5s)
  const [activeBanner, setActiveBanner] = useState<AppNotification | null>(
    () => DEMO_NOTIFICATIONS[0]
  );
  const [centerOpen, setCenterOpen] = useState(false);
  // Which progress report is open as a bottom sheet (null = none).
  const [activeReport, setActiveReport] = useState<ReportKey | null>(null);
  const queueRef = useRef(0);

  const fireNextNotification = () => {
    queueRef.current = (queueRef.current + 1) % DEMO_NOTIFICATIONS.length;
    setActiveBanner(DEMO_NOTIFICATIONS[queueRef.current]);
  };

  const notifProps = {
    activeBanner,
    onDismissBanner: () => setActiveBanner(null),
    centerOpen,
    onOpenCenter: () => setCenterOpen(true),
    onCloseCenter: () => setCenterOpen(false),
    onTriggerDemo: fireNextNotification,
  };

  // ─── MOBILE: Render as a real full-screen iOS app ──────────────────────
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 flex flex-col overflow-hidden"
        style={{ background: isDark ? '#02030c' : '#F8FAFF' }}
      >
        {/* Same sky on a real phone as in the desktop mockup. */}
        {isDark && <PhoneCosmos />}
        <StatusBar isDark={isDark} mobile />
        <ScreenContent
          activeTab={activeTab}
          isDark={isDark}
          onOpenNotifCenter={notifProps.onOpenCenter}
          onToggleTheme={() => setIsDark((v) => !v)}
          onOpenReport={setActiveReport}
        />
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} mobile />

        {/* Progress report — slides up from the bottom */}
        {activeReport && (
          <ReportSheet reportKey={activeReport} onClose={() => setActiveReport(null)} isDark={isDark} />
        )}

        {/* Floating dark mode toggle */}
        <button
          onClick={() => setIsDark((v) => !v)}
          className="fixed right-3 top-2 z-50 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition active:scale-90"
          style={{
            background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
          }}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="h-3.5 w-3.5 text-white/80" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-black/70" />
          )}
        </button>

        {/* Notification banner */}
        {activeBanner && (
          <NotificationBanner
            notification={activeBanner}
            onDismiss={notifProps.onDismissBanner}
            isDark={isDark}
            mobile
          />
        )}

        {/* Notification center */}
        {centerOpen && (
          <NotificationCenter
            isDark={isDark}
            onClose={notifProps.onCloseCenter}
            onTriggerDemo={notifProps.onTriggerDemo}
          />
        )}
      </div>
    );
  }

  // ─── DESKTOP: Showcase with iPhone frame + info panel ──────────────────
  return (
    <div
      className="h-full w-full overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
      }}
    >
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 py-3 lg:px-8">
        {/* Header */}
        <div className="mb-3 flex items-center justify-center gap-2">
          <h1 className="bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-xl font-bold tracking-tight text-transparent lg:text-2xl">
            LingRow
          </h1>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-blue-400" />
            <span className="text-[11px] font-medium tracking-wide text-white/80">
              CONCEPT — {platform === 'ios' ? 'iOS 17' : 'Android'}
            </span>
          </div>
        </div>

        {/* Controls + phone preview, side by side */}
        <div className="flex min-h-0 flex-1 items-center justify-center gap-6">
          {/* Theme + device color controls — beside the phone */}
          <div className="flex flex-col items-stretch gap-2">
            <button
              onClick={() => setIsDark((v) => !v)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm transition hover:bg-white/10"
            >
              {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              {isDark ? 'Dark mode' : 'Light mode'}
            </button>

            <div className="flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
              {(['titanium', 'natural', 'blue', 'white'] as DeviceColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setDeviceColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition ${
                    deviceColor === c
                      ? 'border-white scale-110'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ background: deviceColors[c].swatch }}
                  aria-label={c}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
              {(['ios', 'android'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    platform === p
                      ? 'bg-white text-slate-900'
                      : 'text-white/60 hover:text-white/90'
                  }`}
                >
                  {p === 'ios' ? 'iOS' : 'Android'}
                </button>
              ))}
            </div>
          </div>

          <PhoneFrame deviceColor={deviceColor} platform={platform}>
            <PhoneScreen isDark={isDark}>
              <StatusBar isDark={isDark} platform={platform} />
              <ScreenContent
                activeTab={activeTab}
                isDark={isDark}
                onOpenNotifCenter={notifProps.onOpenCenter}
                onToggleTheme={() => setIsDark((v) => !v)}
                onOpenReport={setActiveReport}
              />
              <TabBar activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />

              {/* Progress report — slides up from the bottom */}
              {activeReport && (
                <ReportSheet reportKey={activeReport} onClose={() => setActiveReport(null)} isDark={isDark} />
              )}

              {/* Notification banner — overlays the phone screen */}
              {activeBanner && (
                <NotificationBanner
                  notification={activeBanner}
                  onDismiss={notifProps.onDismissBanner}
                  isDark={isDark}
                />
              )}

              {/* Notification center */}
              {centerOpen && (
                <NotificationCenter
                  isDark={isDark}
                  onClose={notifProps.onCloseCenter}
                  onTriggerDemo={notifProps.onTriggerDemo}
                />
              )}
            </PhoneScreen>
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Phone Frame
// ─────────────────────────────────────────────────────────────────────────────

const deviceColors: Record<DeviceColor, { frame: string; swatch: string }> = {
  titanium: {
    frame: 'linear-gradient(145deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
    swatch: 'linear-gradient(145deg, #4a4a4a, #1a1a1a)',
  },
  natural: {
    frame: 'linear-gradient(145deg, #b8a896 0%, #8a7a6a 50%, #5a4a3a 100%)',
    swatch: 'linear-gradient(145deg, #b8a896, #5a4a3a)',
  },
  blue: {
    frame: 'linear-gradient(145deg, #4a5a7a 0%, #2a3a5a 50%, #1a2a4a 100%)',
    swatch: 'linear-gradient(145deg, #4a5a7a, #1a2a4a)',
  },
  white: {
    frame: 'linear-gradient(145deg, #f5f5f5 0%, #d5d5d5 50%, #a5a5a5 100%)',
    swatch: 'linear-gradient(145deg, #f5f5f5, #a5a5a5)',
  },
};

function PhoneFrame({
  children,
  deviceColor,
  platform,
}: {
  children: React.ReactNode;
  deviceColor: DeviceColor;
  platform: 'ios' | 'android';
}) {
  const outerRadius = platform === 'ios' ? 42 : 28;
  const bezelRadius = platform === 'ios' ? 39 : 25;
  const screenRadius = platform === 'ios' ? 33 : 20;
  return (
    <div className="relative" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}>
      {/* Phone outer frame */}
      <div
        className="relative flex-none p-[3px]"
        style={{
          background: deviceColors[deviceColor].frame,
          height: 'min(820px, 90vh)',
          width: 'min(402px, 44.1vh)',
          borderRadius: outerRadius,
        }}
      >
        {/* Inner bezel */}
        <div
          className="relative h-full w-full overflow-hidden bg-black p-[8px]"
          style={{ borderRadius: bezelRadius }}
        >
          {/* Side buttons */}
          <div
            className="absolute -left-[3px] top-[120px] h-[35px] w-[3px] rounded-l-md"
            style={{ background: deviceColors[deviceColor].frame }}
          />
          <div
            className="absolute -left-[3px] top-[170px] h-[60px] w-[3px] rounded-l-md"
            style={{ background: deviceColors[deviceColor].frame }}
          />
          <div
            className="absolute -left-[3px] top-[245px] h-[60px] w-[3px] rounded-l-md"
            style={{ background: deviceColors[deviceColor].frame }}
          />
          <div
            className="absolute -right-[3px] top-[200px] h-[100px] w-[3px] rounded-r-md"
            style={{ background: deviceColors[deviceColor].frame }}
          />

          {/* Screen */}
          <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: screenRadius }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * One of the floating ABC letters from the brand banner.
 */
function BrandLetter({
  char, className, size, tilt, tone, under,
}: {
  char: string; className?: string; size: number; tilt: number; tone: string; under: string;
}) {
  return (
    <span
      className={`absolute font-black leading-none ${className ?? ''}`}
      style={{
        fontSize: size,
        color: tone,
        transform: `rotate(${tilt}deg)`,
        textShadow: `0 2px 0 ${under}, 0 4px 8px rgba(24,6,58,0.35)`,
      }}
    >
      {char}
    </span>
  );
}

/**
 * The concave four-point sparkle from the brand artwork. Inline rather than a
 * lucide import because lucide's `Sparkles` is a three-star cluster — a
 * different mark from the one the banner uses.
 */
function Sparkle4({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 0c.6 6.2 5.2 10.8 12 12-6.8 1.2-11.4 5.8-12 12-.6-6.2-5.2-10.8-12-12C6.8 10.8 11.4 6.2 12 0z" />
    </svg>
  );
}

/**
 * The web app's starfield, scaled to a phone screen.
 *
 * Reuses the global `.stars i` rule and the `twinkle` keyframe from
 * globals.css rather than inventing a second star treatment, so the mockup and
 * the real product drift in step. Absolute (never fixed) so it stays inside the
 * phone frame, and pointer-events-none so it can't swallow a tap.
 */
function PhoneCosmos() {
  const starsRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();

  useEffect(() => {
    const layer = starsRef.current;
    if (!layer) return;
    // A phone screen is a fraction of a desktop viewport — 320 stars here reads
    // as noise rather than sky.
    const count = 90;
    let html = '';
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 1.4 + 0.4;
      const delay = Math.random() * 6;
      const dur = 2.5 + Math.random() * 5;
      const opacity = 0.35 + Math.random() * 0.55;
      html += `<i style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;`
        + `animation-delay:${delay}s;animation-duration:${dur}s;opacity:${opacity}`
        // A continuous 3s pulse is exactly the kind of looping motion that makes
        // reduced-motion users unwell — keep the sky, drop the flicker.
        + `${reduced ? ';animation:none' : ''}"></i>`;
    }
    layer.innerHTML = html;
  }, [reduced]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{
        background: `
          radial-gradient(280px 220px at 78% 18%, #3d1d80 0%, transparent 58%),
          radial-gradient(240px 200px at 92% 72%, #1d3a8a 0%, transparent 62%),
          radial-gradient(200px 180px at 6% 28%, #112a5a 0%, transparent 66%),
          linear-gradient(180deg, #03061a 0%, #04081f 50%, #02040f 100%)`,
      }}
    >
      <div ref={starsRef} className="stars absolute inset-0" />
    </div>
  );
}

function PhoneScreen({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <div
      className="relative flex h-full w-full flex-col"
      style={{ background: isDark ? '#02030c' : '#F8FAFF' }}
    >
      {isDark && <PhoneCosmos />}
      {/* Content sits above the sky. */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Bar (with Dynamic Island)
// ─────────────────────────────────────────────────────────────────────────────

function StatusBar({
  isDark,
  mobile = false,
  platform = 'ios',
}: {
  isDark: boolean;
  mobile?: boolean;
  platform?: 'ios' | 'android';
}) {
  const txt = isDark ? 'text-white' : 'text-black';
  const now = useMemo(() => {
    const d = new Date();
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  }, []);
  return (
    <div
      className="relative z-30 flex flex-none items-end justify-between px-7 pb-1.5"
      style={{
        height: mobile ? `calc(env(safe-area-inset-top, 12px) + 32px)` : '54px',
        paddingTop: mobile ? `calc(env(safe-area-inset-top, 12px) + 4px)` : '12px',
      }}
    >
      <span className={`text-[15px] font-semibold ${txt}`}>{mobile ? now : '9:41'}</span>

      {/* Notch — hidden on real mobile (device has its own) */}
      {!mobile && platform === 'ios' && (
        <div className="absolute left-1/2 top-2 h-[32px] w-[120px] -translate-x-1/2 rounded-full bg-black" />
      )}
      {!mobile && platform === 'android' && (
        <div className="absolute left-1/2 top-[14px] h-[12px] w-[12px] -translate-x-1/2 rounded-full bg-black" />
      )}

      <div className="flex items-center gap-1.5">
        <Signal className={`h-3.5 w-3.5 ${txt}`} strokeWidth={2.5} />
        <Wifi className={`h-3.5 w-3.5 ${txt}`} strokeWidth={2.5} />
        <BatteryFull className={`h-4 w-4 ${txt}`} strokeWidth={2.5} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab Bar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tab-bubble motion. The reference used .55s; a tab switch is a direct tap, and
 * past ~400ms direct manipulation starts reading as sluggish, so this is that
 * curve at 0.8x. The curve itself overshoots slightly, which is what gives the
 * bubble its snap on arrival.
 */
const BUBBLE_DURATION = '0.44s';
const BUBBLE_EASE = 'cubic-bezier(.68,-0.15,.25,1.25)';

function TabBar({
  activeTab,
  setActiveTab,
  isDark,
  mobile = false,
}: {
  activeTab: TabKey;
  setActiveTab: (k: TabKey) => void;
  isDark: boolean;
  mobile?: boolean;
}) {
  const reduced = useReducedMotionPref();
  const activeIndex = Math.max(0, TABS.findIndex((t) => t.key === activeTab));
  const idleColor = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';

  // The bubble travels on `transform`, not `left`. Same motion, but it stays on
  // the compositor instead of asking for layout on every frame — and because the
  // step is a percentage of one tab's width, it survives any resize with no
  // measuring and no resize listener.
  const travel = reduced
    ? 'none'
    : `transform ${BUBBLE_DURATION} ${BUBBLE_EASE}`;

  return (
    <div
      className="relative z-30 flex flex-none items-start justify-around border-t px-2 pt-2 backdrop-blur-2xl"
      style={{
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(60,60,67,0.12)',
        background: isDark ? 'rgba(20,20,22,0.85)' : 'rgba(255,255,255,0.85)',
        height: mobile ? `calc(env(safe-area-inset-bottom, 0px) + 60px)` : '83px',
        paddingBottom: mobile ? 'env(safe-area-inset-bottom, 0px)' : '0',
      }}
    >
      {/* Bubble track — spans the same box the buttons share, so one step is
          exactly one tab regardless of width. */}
      <div className="pointer-events-none absolute inset-x-2 top-0" aria-hidden="true">
        <div
          className="flex justify-center"
          style={{
            width: `${100 / TABS.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
            transition: travel,
            willChange: 'transform',
          }}
        >
          <span
            className="block h-[42px] w-[42px] rounded-full"
            style={{
              marginTop: -10,
              background: 'linear-gradient(135deg, #2563EB, #8a4dff)',
              boxShadow: '0 6px 14px rgba(37,99,235,0.45), inset 0 1px 2px rgba(255,255,255,0.25)',
            }}
          />
        </div>
      </div>

      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            aria-current={isActive ? 'page' : undefined}
            className="relative z-10 flex flex-1 flex-col items-center gap-0.5 pt-1 transition active:scale-95"
          >
            <Icon
              className="h-6 w-6"
              strokeWidth={isActive ? 2.4 : 2}
              style={{
                // The active icon rises into the bubble; both move on the same
                // curve so the icon and the bubble arrive together.
                transform: isActive ? 'translateY(-13px)' : 'none',
                transition: reduced ? 'none' : `transform ${BUBBLE_DURATION} ${BUBBLE_EASE}`,
                color: isActive ? '#ffffff' : idleColor,
              }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? LR.sky : idleColor }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen Switcher
// ─────────────────────────────────────────────────────────────────────────────

function ScreenContent({
  activeTab,
  isDark,
  onOpenNotifCenter,
  onToggleTheme,
  onOpenReport,
}: {
  activeTab: TabKey;
  isDark: boolean;
  onOpenNotifCenter?: () => void;
  onToggleTheme?: () => void;
  onOpenReport?: (key: ReportKey) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {activeTab === 'home' && <HomeScreen isDark={isDark} onOpenNotifCenter={onOpenNotifCenter} />}
      {activeTab === 'lessons' && <LessonsScreen isDark={isDark} />}
      {activeTab === 'vocab' && <VocabScreen isDark={isDark} />}
      {activeTab === 'analytics' && <InsightsScreen isDark={isDark} />}
      {activeTab === 'profile' && (
        <ProfileScreen isDark={isDark} onToggleTheme={onToggleTheme} onOpenReport={onOpenReport} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME SCREEN — Dashboard
// ─────────────────────────────────────────────────────────────────────────────

const POS_UZ: Record<string, string> = {
  noun: 'ot', verb: "fe'l", adj: 'sifat', adv: 'ravish',
  prep: 'predlog', conj: "bog'lovchi", phrase: 'ibora', interj: 'undov',
};
const LEVEL_UZ: Record<string, string> = {
  beginner: "boshlang'ich", intermediate: "o'rta", advanced: 'yuqori', mastery: 'mukammal',
};

/**
 * How many hits to render before asking the user to narrow the query.
 *
 * Measured, not guessed: filtering the whole dictionary costs ~2 ms, while each
 * rendered row costs ~0.27 ms — so the row count, not the word count, is what
 * makes typing feel slow. The first keystroke of any search matches almost
 * everything, so that worst case happens on every lookup. Twelve keeps it near
 * one frame on a phone, and ranking means the answer is in the first few rows.
 */
const VOCAB_RESULT_CAP = 12;

/**
 * The shared row list. Search results and the browse view show identical rows,
 * so there is one implementation and one expand behaviour rather than two that
 * drift apart.
 */
function VocabList({ entries, isDark }: { entries: LookupEntry[]; isDark: boolean }) {
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const cardBg = isDark ? '#0e1428' : '#ffffff';
  const divider = isDark ? 'rgba(84,84,88,0.6)' : 'rgba(60,60,67,0.18)';

  const [openId, setOpenId] = useState<string | null>(null);
  const shown = entries;

  return (
      <div className="overflow-hidden rounded-2xl" style={{ background: cardBg }}>
        {shown.map((w, i) => {
          const open = openId === w.id;
          return (
            <div
              key={w.id}
              style={{ borderBottom: i < shown.length - 1 ? `0.5px solid ${divider}` : 'none' }}
            >
              {/* Tapping expands the entry in place — the definition belongs to
                  the row you tapped, not to a sheet that covers it. */}
              <button
                type="button"
                onClick={() => setOpenId(open ? null : w.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:opacity-70"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-[15px] font-semibold" style={{ color: primaryText }}>
                      {w.en}
                    </span>
                    {w.phonetic && (
                      <span className="flex-none text-[11px]" style={{ color: secondaryText }}>
                        {w.phonetic}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[13px]" style={{ color: secondaryText }}>
                    {w.uz}
                  </div>
                </div>
                {w.pos && (
                  <span
                    className="flex-none rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: isDark ? 'rgba(90,169,255,0.16)' : 'rgba(37,99,235,0.10)',
                      color: isDark ? LR.sky : LR.blue,
                    }}
                  >
                    {POS_UZ[w.pos] ?? w.pos}
                  </span>
                )}
                <ChevronRight
                  className="h-4 w-4 flex-none transition-transform duration-200"
                  style={{ color: secondaryText, transform: open ? 'rotate(90deg)' : 'none' }}
                />
              </button>

              {open && (
                <div className="px-4 pb-3.5 pt-0.5">
                  {w.defUz && (
                    <p className="text-[13px] leading-snug" style={{ color: primaryText }}>
                      {w.defUz}
                    </p>
                  )}
                  {w.defEn && (
                    <p className="mt-1 text-[12px] leading-snug" style={{ color: secondaryText }}>
                      {w.defEn}
                    </p>
                  )}
                  {w.exampleEn && (
                    <div
                      className="mt-2.5 rounded-xl px-3 py-2"
                      style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(60,60,67,0.05)' }}
                    >
                      <p className="text-[13px] italic" style={{ color: primaryText }}>
                        {w.exampleEn}
                      </p>
                      {w.exampleUz && (
                        <p className="mt-0.5 text-[12px]" style={{ color: secondaryText }}>
                          {w.exampleUz}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      w.level ? (LEVEL_UZ[w.level] ?? w.level) : null,
                      w.category,
                      // Sublist 1 is the highest-value academic vocabulary, so
                      // saying which band a word sits in is real guidance.
                      w.sublist ? `AWL ${w.sublist}-ro'yxat` : null,
                    ].filter(Boolean).map((tag) => (
                      <span
                        key={tag as string}
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(60,60,67,0.08)', color: secondaryText }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
  );
}

function VocabResults({ query, isDark }: { query: string; isDark: boolean }) {
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const cardBg = isDark ? '#0e1428' : '#ffffff';

  const hits = useMemo(() => lookupWord(query), [query]);

  if (hits.length === 0) {
    return (
      <div className="rounded-2xl px-4 py-10 text-center" style={{ background: cardBg }}>
        <p className="text-[15px] font-medium" style={{ color: primaryText }}>
          "{query.trim()}" topilmadi
        </p>
        <p className="mt-1 text-[13px]" style={{ color: secondaryText }}>
          Inglizcha yoki o'zbekcha yozib ko'ring — lug'atda {DICTIONARY.length} ta so'z bor.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 px-1 text-[12px]" style={{ color: secondaryText }}>
        {hits.length} ta natija
        {hits.length > VOCAB_RESULT_CAP && ` · birinchi ${VOCAB_RESULT_CAP} tasi`}
      </p>
      <VocabList entries={hits.slice(0, VOCAB_RESULT_CAP)} isDark={isDark} />
    </div>
  );
}

/** One search field, used by the home shortcut and the dictionary tab alike. */
function VocabSearchField({
  value, onChange, isDark, className,
}: {
  value: string;
  onChange: (v: string) => void;
  isDark: boolean;
  className?: string;
}) {
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2 ${className ?? ''}`}
      style={{ background: isDark ? '#0e1428' : '#E6ECFA' }}
    >
      <Search className="h-4 w-4 flex-none" style={{ color: secondaryText }} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') onChange(''); }}
        placeholder="So'z qidiring — inglizcha yoki o'zbekcha"
        aria-label="Lug'atdan so'z qidirish"
        className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:opacity-70"
        style={{ color: primaryText }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="flex h-5 w-5 flex-none items-center justify-center rounded-full transition active:scale-90"
          style={{ background: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(60,60,67,0.12)' }}
          aria-label="Qidiruvni tozalash"
        >
          <X className="h-3 w-3" style={{ color: secondaryText }} />
        </button>
      )}
    </div>
  );
}

/**
 * Lug'at — the dictionary tab.
 *
 * Search alone only helps someone who already knows the word they want. The
 * browse view exists for the other case: the AWL bands are ordered by how often
 * a word shows up in academic text, so working down from band 1 is a study path
 * rather than an alphabetical dump.
 */
function VocabScreen({ isDark }: { isDark: boolean }) {
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const cardBg = isDark ? '#0e1428' : '#ffffff';
  const divider = isDark ? 'rgba(84,84,88,0.6)' : 'rgba(60,60,67,0.18)';

  const [query, setQuery] = useState('');
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const searching = query.trim().length > 0;

  const groups = useMemo(() => {
    const curated = DICTIONARY.filter((e) => e.sublist === undefined);
    const bands = Array.from({ length: 10 }, (_, i) => ({
      key: `awl${i + 1}`,
      title: `${i + 1}-ro'yxat`,
      entries: DICTIONARY.filter((e) => e.sublist === i + 1),
    })).filter((g) => g.entries.length > 0);
    return [
      { key: 'curated', title: "Kundalik so'zlar", entries: curated },
      ...bands,
    ];
  }, []);

  const open = groups.find((g) => g.key === openGroup) ?? null;

  return (
    <div className="px-4 pb-4">
      <div className="pb-3 pt-2">
        <h1
          className="text-[34px] font-bold leading-tight"
          style={{ color: primaryText, letterSpacing: '-0.022em' }}
        >
          Lug'at
        </h1>
        <p className="mt-0.5 text-[13px]" style={{ color: secondaryText }}>
          {DICTIONARY.length} ta so'z · inglizcha va o'zbekcha
        </p>
      </div>

      <VocabSearchField value={query} onChange={setQuery} isDark={isDark} className="mb-4" />

      {searching ? (
        <VocabResults query={query} isDark={isDark} />
      ) : open ? (
        <div>
          <button
            type="button"
            onClick={() => setOpenGroup(null)}
            className="mb-3 flex items-center gap-1.5 text-[14px] transition active:opacity-60"
            style={{ color: LR.sky }}
          >
            <ArrowLeft className="h-4 w-4" />
            Barcha ro'yxatlar
          </button>
          <p className="mb-2 px-1 text-[12px]" style={{ color: secondaryText }}>
            {open.title} · {open.entries.length} ta so'z
          </p>
          <VocabList entries={open.entries} isDark={isDark} />
        </div>
      ) : (
        <div>
          <p className="mb-2 px-1 text-[12px] leading-snug" style={{ color: secondaryText }}>
            Ro'yxat raqami kichik bo'lsa, so'z akademik matnlarda shunchalik ko'p
            uchraydi — 1-ro'yxatdan boshlagan foydaliroq.
          </p>
          <div className="overflow-hidden rounded-2xl" style={{ background: cardBg }}>
            {groups.map((g, i) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setOpenGroup(g.key)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:opacity-70"
                style={{ borderBottom: i < groups.length - 1 ? `0.5px solid ${divider}` : 'none' }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium" style={{ color: primaryText }}>
                    {g.title}
                  </div>
                  <div className="text-[12px]" style={{ color: secondaryText }}>
                    {g.key === 'curated'
                      ? "Talaffuz va misol jumlalar bilan"
                      : 'Akademik so\'zlar'}
                  </div>
                </div>
                <span className="flex-none text-[13px] tabular-nums" style={{ color: secondaryText }}>
                  {g.entries.length}
                </span>
                <ChevronRight className="h-4 w-4 flex-none" style={{ color: secondaryText }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HomeScreen({
  isDark,
  onOpenNotifCenter,
}: {
  isDark: boolean;
  onOpenNotifCenter?: () => void;
}) {
  const cardBg = isDark ? '#0e1428' : '#ffffff';
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';

  const [query, setQuery] = useState('');
  const searching = query.trim().length > 0;

  return (
    <div className="px-4 pb-4">
      {/* Large title */}
      <div className="flex items-center justify-between pb-2 pt-2">
        <h1 className="text-[34px] font-bold leading-tight" style={{ color: primaryText }}>
          Bosh sahifa
        </h1>
        <button
          onClick={onOpenNotifCenter}
          className="relative flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90"
          style={{ background: cardBg }}
          aria-label="Bildirishnomalar"
        >
          <Bell className="h-4 w-4" style={{ color: '#5aa9ff' }} />
          {/* Unread badge */}
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ background: '#ff453a' }}
          >
            4
          </span>
        </button>
      </div>
      <p className="pb-4 text-[13px]" style={{ color: secondaryText }}>
        Salom, Aziz 👋
      </p>

      {/* Quick lookup without leaving home; the Lug'at tab is the full one. */}
      <VocabSearchField value={query} onChange={setQuery} isDark={isDark} className="mb-4" />

      {searching ? (
        <VocabResults query={query} isDark={isDark} />
      ) : (
      <>
      {/* Hero — the brand's streak band: a violet field that lightens toward the
          right, the mascot standing in it, and the day's progress as a bar along
          the floor. Copy is inset on the right so nothing runs under the art. */}
      <div
        className="relative mb-4 overflow-hidden rounded-3xl px-4 pb-3.5 pt-3.5"
        style={{
          background: 'linear-gradient(110deg, #6D28D9 0%, #7C3AED 52%, #A855F7 100%)',
          border: '1px solid rgba(255,255,255,0.14)',
        }}
      >
        {/* Art layer. Entirely decorative, so it is hidden from screen readers
            and cannot intercept a tap meant for anything beneath it. */}
        <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
          <Sparkle4 className="absolute right-[140px] top-[24px] h-4 w-4 text-white/30" />
          <Sparkle4 className="absolute bottom-[34px] right-[8px] h-2.5 w-2.5 text-white/25" />
          <Sparkle4 className="absolute bottom-[24px] right-[110px] h-2 w-2 text-white/20" />

          <img
            src="/mascot-card.png"
            alt=""
            draggable={false}
            className="absolute bottom-[20px] right-[76px] h-[84px] w-auto"
            style={{ filter: 'drop-shadow(0 6px 14px rgba(28,7,66,0.45))' }}
          />

          {/* The banner's floating letters. Flat type with a hard offset shadow
              reads as the same toy-plastic material as the mascot. */}
          <BrandLetter char="B" className="bottom-[44px] right-[134px]" size={15} tilt={-13} tone="#F59E0B" under="#B45309" />
          <BrandLetter char="A" className="top-[38px] right-[40px]" size={16} tilt={9}   tone="#FBBF24" under="#D97706" />
          <BrandLetter char="C" className="top-[62px] right-[30px]" size={17} tilt={-7}  tone="#FCD34D" under="#D97706" />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between">
            <span
              className="text-[10px] font-bold uppercase text-white"
              style={{ letterSpacing: '0.12em' }}
            >
              Joriy streak
            </span>
            <div className="flex flex-none items-center gap-1 rounded-full bg-white/20 px-2 py-0.5">
              <ArrowUpRight className="h-3 w-3 text-white" />
              <span className="text-[10px] font-semibold text-white">+3 kun</span>
            </div>
          </div>

          <div
            className="mt-2.5 pr-[119px] text-[30px] font-bold leading-none text-white"
            style={{ letterSpacing: '-0.025em' }}
          >
            7 <span className="text-[15px] font-medium text-white/80">kun ketma-ket</span>
          </div>

          <div className="mt-2 pr-[119px] text-[12px] leading-snug text-white/80">
            Bugun 42 XP · Band 6.5 maqsad
          </div>

          {/* Today's XP against the daily goal — the bar runs the full width so it
              reads as the card's floor rather than another inset row. */}
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25"
            role="progressbar"
            aria-valuenow={42}
            aria-valuemin={0}
            aria-valuemax={60}
            aria-label="Bugungi XP maqsadi"
          >
            <div className="h-full rounded-full bg-white" style={{ width: '70%' }} />
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <KPICard
          title="Yangi so'zlar"
          value="128"
          delta="+5.2%"
          deltaPositive
          icon={BookOpen}
          iconBg="#22C55E"
          isDark={isDark}
        />
        <KPICard
          title="Bajarilgan darslar"
          value="34"
          delta="+8.7%"
          deltaPositive
          icon={CheckCircle2}
          iconBg="#F59E0B"
          isDark={isDark}
        />
        <KPICard
          title="IELTS Band"
          value="6.5"
          delta="+0.5"
          deltaPositive
          icon={Award}
          iconBg="#a59bff"
          isDark={isDark}
        />
        <KPICard
          title="Aniqlik"
          value="87%"
          delta="-0.5%"
          deltaPositive={false}
          icon={TrendingUp}
          iconBg="#8a4dff"
          isDark={isDark}
        />
      </div>
      </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LESSONS SCREEN
// ─────────────────────────────────────────────────────────────────────────────

// Demo transcript for the concept's video lesson. Mirrors the real cue shape
// ({start, end, text}) that transcribe-lesson produces, so the mockup shows the
// same behaviour the shipping player has.
const DEMO_CUES: { start: number; end: number; text: string; uz: string }[] = [
  { start: 0,    end: 3.2,  text: 'Oh, good morning, Miranda.',                uz: 'Xayrli tong, Miranda.' },
  { start: 3.2,  end: 6.4,  text: "I don't see my breakfast here.",            uz: "Nonushtamni bu yerda ko'rmayapman." },
  { start: 6.4,  end: 9.8,  text: 'My eggs — where are my eggs?',              uz: 'Tuxumlarim qani?' },
  { start: 9.8,  end: 12.5, text: 'Excuse me?',                                uz: 'Kechirasiz?' },
  { start: 12.5, end: 16.9, text: 'Pick up the Polaroids from the shoot.',     uz: "Suratga olishdan Polaroid'larni oling." },
  { start: 16.9, end: 20.6, text: 'Have the brakes checked on my car.',        uz: "Mashinamning tormozini tekshirtiring." },
  { start: 20.6, end: 26.0, text: "Where's that piece of paper I had yesterday?", uz: "Kecha qo'limdagi qog'oz qani?" },
];

const DEMO_DURATION = 26;

function fmtClock(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/** Same rule the real SyncedTranscript uses: last cue whose start has passed. */
function cueIndexAt(t: number): number {
  let idx = -1;
  for (let i = 0; i < DEMO_CUES.length; i++) {
    if (t >= DEMO_CUES[i].start) idx = i;
    else break;
  }
  return idx;
}

function VideoLessonScreen({
  isDark,
  title,
  onBack,
}: {
  isDark: boolean;
  title: string;
  onBack: () => void;
}) {
  const cardBg = isDark ? '#0e1428' : '#ffffff';
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const dividerColor = isDark ? 'rgba(84,84,88,0.6)' : 'rgba(60,60,67,0.18)';
  const trackBg = isDark ? '#1b2340' : '#E6ECFA';

  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // Simulated playback clock. There's no real media in the mockup, so the timer
  // stands in for it — and because the transcript is a pure function of `time`,
  // pausing freezes the highlight exactly like the real player does.
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + 0.25;
        if (next >= DEMO_DURATION) { setPlaying(false); return DEMO_DURATION; }
        return next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing]);

  const activeIdx = cueIndexAt(time);

  // Keep the lit line visible inside the transcript box only — never scroll the page.
  useEffect(() => {
    const box = scrollRef.current;
    const el = activeRef.current;
    if (!box || !el) return;
    const b = box.getBoundingClientRect();
    const e = el.getBoundingClientRect();
    if (e.top < b.top + 4 || e.bottom > b.bottom - 4) {
      box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' });
    }
  }, [activeIdx]);

  const active = activeIdx >= 0 ? DEMO_CUES[activeIdx] : null;

  return (
    <div className="px-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full transition active:scale-90"
          style={{ background: cardBg, border: `1px solid ${dividerColor}` }}
          aria-label="Orqaga"
        >
          <ArrowLeft className="h-4 w-4" style={{ color: primaryText }} />
        </button>
        <h1 className="truncate text-[17px] font-bold" style={{ color: primaryText }}>
          {title}
        </h1>
      </div>

      {/* Video surface */}
      <div
        className="relative mb-3 overflow-hidden rounded-2xl"
        style={{ aspectRatio: '16 / 10', background: 'linear-gradient(135deg, #1f2937, #0b1024)' }}
      >
        {/* Current line burned in, like a subtitle */}
        {active && (
          <div className="absolute inset-x-0 bottom-0 p-3">
            <div
              className="rounded-lg px-2.5 py-1.5 text-center text-[12px] font-medium leading-snug text-white"
              style={{ background: 'rgba(0,0,0,0.55)' }}
            >
              {active.text}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="absolute inset-0 flex items-center justify-center transition active:scale-95"
          aria-label={playing ? 'Pauza' : 'Ijro'}
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.92)' }}
          >
            {playing
              ? <Pause className="h-6 w-6" style={{ color: '#0b1024' }} />
              : <Play className="ml-0.5 h-6 w-6" style={{ color: '#0b1024' }} />}
          </span>
        </button>
      </div>

      {/* Scrubber */}
      <div className="mb-4">
        <div className="h-1.5 overflow-hidden rounded-full" style={{ background: trackBg }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${(time / DEMO_DURATION) * 100}%`, background: '#5aa9ff' }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px]" style={{ color: secondaryText }}>
          <span>{fmtClock(time)}</span>
          <span>{fmtClock(DEMO_DURATION)}</span>
        </div>
      </div>

      {/* Synced transcript */}
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[13px] font-medium" style={{ color: secondaryText }}>Transkript</span>
        <span className="text-[11px]" style={{ color: secondaryText }}>
          {playing ? 'videoga ergashmoqda' : 'to\'xtatilgan'}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="max-h-[210px] overflow-y-auto rounded-2xl p-1"
        style={{ background: cardBg }}
      >
        {DEMO_CUES.map((c, i) => {
          const isActive = i === activeIdx;
          return (
            <button
              key={c.start}
              ref={isActive ? activeRef : undefined}
              type="button"
              onClick={() => setTime(c.start)}
              className="flex w-full gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors"
              style={{ background: isActive ? (isDark ? 'rgba(0,122,255,0.18)' : 'rgba(0,122,255,0.10)') : 'transparent' }}
            >
              <span
                className="mt-0.5 flex-none font-mono text-[10px] tabular-nums"
                style={{ color: isActive ? '#5aa9ff' : secondaryText }}
              >
                {fmtClock(c.start)}
              </span>
              <span className="min-w-0">
                <span
                  className="block text-[13px] leading-snug"
                  style={{ color: primaryText, fontWeight: isActive ? 600 : 400 }}
                >
                  {c.text}
                </span>
                {isActive && (
                  <span className="mt-0.5 block text-[11px] leading-snug" style={{ color: secondaryText }}>
                    {c.uz}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 px-1 text-[11px] leading-snug" style={{ color: secondaryText }}>
        Qatorni bosing — video o'sha vaqtga o'tadi. Pauza bosilsa, transkript
        o'sha joyda to'xtaydi.
      </p>
    </div>
  );
}

// ─── Arc wheel list ──────────────────────────────────────────────────────────
// Lessons sit on the rim of a wheel: the row nearest the centre faces you, and
// the ones above and below curve away along the arc.
//
// The scrolling itself is the browser's — momentum, rubber-banding and 1:1
// finger tracking are already correct there, and re-implementing them in JS
// would only make them worse. This adds a purely visual layer on top: each row
// is transformed by how far it sits from the centre of the viewport.

const WHEEL_ITEM_H = 68;   // px per row
const WHEEL_RADIUS = 300;  // larger = gentler curve

/** Live `prefers-reduced-motion`, so the wheel flattens the moment it's set. */
function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function wheelTransform(delta: number, flat: boolean) {
  if (flat) return { x: 0, rot: 0, scale: 1, opacity: 1 };
  // Cap how far round the rim a row may travel. Without this the furthest rows
  // swing ~90px sideways on a 288px-wide screen, which stops reading as a curve
  // and just looks broken.
  const raw = delta / WHEEL_RADIUS;
  const theta = Math.max(-0.6, Math.min(0.6, raw));
  const cos = Math.cos(theta);
  return {
    // Rows recede as they leave the centre — that sideways drift is what reads
    // as depth on a rim rather than a flat list sliding by. Damped, because the
    // full geometric offset is far more than the effect needs.
    x: WHEEL_RADIUS * (1 - cos) * 0.55,
    rot: (theta * 180) / Math.PI * 0.42,
    scale: 0.88 + 0.12 * cos,
    opacity: Math.max(0.35, cos),
  };
}

type LessonFilter = 'all' | 'active' | 'done';

const LESSON_FILTERS: { key: LessonFilter; label: string }[] = [
  { key: 'all',    label: 'Hammasi' },
  { key: 'active', label: 'Davom etayotgan' },
  { key: 'done',   label: 'Tugallangan' },
];

interface LessonRow {
  name: string;
  type: string;
  progress: number;
  duration: string;
  color: string;
}

const LESSONS: LessonRow[] = [
  { name: 'Present Perfect grammatika',      type: 'Grammar',    progress: 100, duration: '12 daqiqa', color: '#22C55E' },
  { name: 'Listening: Cambridge Test 3',     type: 'Listening',  progress: 65,  duration: '25 daqiqa', color: '#5aa9ff' },
  { name: "Vocabulary: Ish joyida so'zlar",  type: 'Vocabulary', progress: 40,  duration: '15 daqiqa', color: '#F59E0B' },
  { name: 'Reading: Academic matnlar',       type: 'Reading',    progress: 0,   duration: '30 daqiqa', color: '#8a4dff' },
  { name: 'Speaking: Intervyu mashqlari',    type: 'Speaking',   progress: 80,  duration: '20 daqiqa', color: '#a59bff' },
];

function LessonsScreen({ isDark }: { isDark: boolean }) {
  const cardBg = isDark ? '#0e1428' : '#ffffff';
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const trackBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(60,60,67,0.12)';

  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [filter, setFilter] = useState<LessonFilter>('all');

  if (openLesson) {
    return <VideoLessonScreen isDark={isDark} title={openLesson} onBack={() => setOpenLesson(null)} />;
  }

  // "Davom etayotgan" means started but unfinished — a lesson at 0% hasn't been
  // started, so it belongs under "Hammasi" only. This also keeps the filter in
  // agreement with the count in the header.
  const visible = LESSONS.filter(l =>
    filter === 'all'  ? true
    : filter === 'done' ? l.progress === 100
    : l.progress > 0 && l.progress < 100,
  );
  const activeIdx = LESSON_FILTERS.findIndex(f => f.key === filter);

  // Continue-watching is the most useful thing to surface, so the header
  // answers "what was I doing?" before the list answers "what else is there?".
  // Furthest-along first — the one you're most likely to finish next.
  const inProgress = LESSONS
    .filter(l => l.progress > 0 && l.progress < 100)
    .sort((a, b) => b.progress - a.progress);

  return (
    <div className="px-4 pb-4">
      <div className="pb-3 pt-2">
        {/* Large type wants negative tracking — letters read too far apart as they grow. */}
        <h1
          className="text-[34px] font-bold"
          style={{ color: primaryText, letterSpacing: '-0.022em', lineHeight: 1.05 }}
        >
          Darslar
        </h1>
        <p className="mt-0.5 text-[13px]" style={{ color: secondaryText }}>
          {inProgress.length} ta davom etmoqda · {LESSONS.filter(l => l.progress === 100).length} ta tugallandi
        </p>
      </div>

      {/* Continue row. A carousel earns its place here — this is a small,
          curated set you browse, not the full list you scan. Native scroll-snap
          does the work: the browser already has correct momentum and rubber-
          banding, so no JS animation is needed and it can't fight the touch. */}
      {inProgress.length > 0 && filter === 'all' && (
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-1.5 px-1">
            <Play className="h-3 w-3" style={{ color: secondaryText }} fill="currentColor" />
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: secondaryText }}>
              Davom ettirish
            </span>
          </div>

          {/* Negative margin lets cards bleed to the screen edge while the
              padding keeps the first one aligned with the rest of the page. */}
          <div
            className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
            style={{ scrollPaddingLeft: '1rem' }}
          >
            {inProgress.map((l) => (
              <button
                type="button"
                key={l.name}
                onClick={() => setOpenLesson(l.name)}
                className="snap-start overflow-hidden rounded-2xl p-4 text-left transition-transform duration-100 active:scale-[0.97]"
                style={{
                  // Just under full width, so the next card peeks — that sliver
                  // is the only affordance telling you the row scrolls. Enough
                  // to notice, not so much that it steals room from the card.
                  flex: '0 0 88%',
                  background: `linear-gradient(135deg, ${l.color} 0%, ${l.color}cc 55%, #8a4dff 100%)`,
                }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/75">
                  {l.type}
                </div>
                <div
                  className="mt-1 text-[16px] font-semibold text-white"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.25,
                    minHeight: '2.5em',
                  }}
                >
                  {l.name}
                </div>
                <div className="mt-3 h-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.28)' }}>
                  <div className="h-full rounded-full bg-white" style={{ width: `${l.progress}%` }} />
                </div>
                <div className="mt-1.5 text-[11px] text-white/85">
                  {l.progress}% · {l.duration}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Segmented control — a sliding pill, so the change of state is a
          movement you can follow rather than a jump between two paints. */}
      <div
        className="relative mb-4 flex rounded-xl p-1"
        style={{ background: isDark ? 'rgba(120,120,128,0.24)' : 'rgba(120,120,128,0.12)' }}
      >
        <div
          aria-hidden="true"
          className="absolute top-1 bottom-1 rounded-lg lesson-seg-pill"
          style={{
            width: `calc((100% - 0.5rem) / ${LESSON_FILTERS.length})`,
            left: '0.25rem',
            transform: `translateX(calc(${activeIdx} * 100%))`,
            background: cardBg,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          }}
        />
        {LESSON_FILTERS.map((f) => {
          const isActive = f.key === filter;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className="relative z-10 flex-1 rounded-lg py-1.5 text-[13px] transition-colors"
              style={{
                color: isActive ? primaryText : secondaryText,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl px-4 py-10 text-center" style={{ background: cardBg }}>
          <p className="text-[15px] font-medium" style={{ color: primaryText }}>
            {filter === 'done' ? 'Hali tugallangan dars yo\'q' : 'Davom etayotgan dars yo\'q'}
          </p>
          <p className="mt-1 text-[13px]" style={{ color: secondaryText }}>
            {filter === 'done'
              ? 'Birinchi darsni tugatsangiz, shu yerda ko\'rinadi.'
              : 'Yangi dars boshlang — ro\'yxatdan birini tanlang.'}
          </p>
        </div>
      ) : (
        <LessonWheel
          lessons={visible}
          isDark={isDark}
          onOpen={setOpenLesson}
        />
      )}
    </div>
  );
}

function LessonWheel({
  lessons,
  isDark,
  onOpen,
}: {
  lessons: LessonRow[];
  isDark: boolean;
  onOpen: (name: string) => void;
}) {
  const cardBg = isDark ? '#0e1428' : '#ffffff';
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [centre, setCentre] = useState(0);

  // Curving rows is decoration; for anyone who asked the OS to calm motion down,
  // fall back to a plain flat list rather than a spinning rim.
  const flat = useReducedMotionPref();

  // Read the live scroll offset straight off the element. Scroll events already
  // fire at most once per frame, and the work here is a single number — putting
  // it behind requestAnimationFrame would only add a frame of lag between the
  // finger and the curve.
  const onScroll = () => {
    const el = scrollRef.current;
    if (el) setCentre(el.scrollTop + el.clientHeight / 2);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) setCentre(el.scrollTop + el.clientHeight / 2);
  }, [lessons.length]);

  return (
    <div className="relative">
      {/* The rim fades at both ends so rows arrive and leave rather than being
          clipped by a hard edge. */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="no-scrollbar overflow-y-auto"
        style={{
          height: WHEEL_ITEM_H * 4,
          scrollSnapType: flat ? undefined : 'y proximity',
          perspective: flat ? undefined : '700px',
          maskImage: 'linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)',
        }}
      >
        {/* Half an item of padding top and bottom so the first and last rows can
            reach the centre of the wheel. */}
        <div style={{ paddingTop: WHEEL_ITEM_H * 1.5, paddingBottom: WHEEL_ITEM_H * 1.5 }}>
          {lessons.map((l, i) => {
            const rowCentre = i * WHEEL_ITEM_H + WHEEL_ITEM_H / 2 + WHEEL_ITEM_H * 1.5;
            const delta = rowCentre - centre;
            const t = wheelTransform(delta, flat);
            const isFocused = Math.abs(delta) < WHEEL_ITEM_H / 2;
            return (
              <div
                key={l.name}
                style={{
                  height: WHEEL_ITEM_H,
                  scrollSnapAlign: flat ? undefined : 'center',
                  transform: `translateX(${t.x}px) rotate(${t.rot}deg) scale(${t.scale})`,
                  opacity: t.opacity,
                  transformOrigin: 'left center',
                  willChange: 'transform, opacity',
                }}
              >
                <button
                  type="button"
                  onClick={() => onOpen(l.name)}
                  className="flex h-full w-full items-center gap-3 rounded-2xl px-3.5 text-left transition-transform duration-100 active:scale-[0.98]"
                  style={{
                    background: cardBg,
                    boxShadow: isFocused ? '0 6px 20px rgba(0,0,0,0.10)' : 'none',
                  }}
                >
                  <div className="relative flex-none">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-[14px] font-bold text-white"
                      style={{ background: l.color }}
                    >
                      {l.name.charAt(0)}
                    </div>
                    {l.progress === 100 && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2"
                        style={{ background: '#22C55E', borderColor: cardBg }}
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate text-[14px] font-semibold"
                      style={{ color: primaryText }}
                    >
                      {l.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="flex-none text-[11px]" style={{ color: secondaryText }}>
                        {l.type}
                      </span>
                      {l.progress > 0 && l.progress < 100 && (
                        <>
                          <span
                            className="h-1 flex-1 overflow-hidden rounded-full"
                            style={{ background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(60,60,67,0.12)' }}
                          >
                            <span
                              className="block h-full rounded-full"
                              style={{ width: `${l.progress}%`, background: l.color }}
                            />
                          </span>
                          <span className="flex-none text-[11px] tabular-nums" style={{ color: secondaryText }}>
                            {l.progress}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS SCREEN
// ─────────────────────────────────────────────────────────────────────────────

type AnalyticsPeriod = '7d' | '30d' | '3m' | 'y';

interface PeriodData {
  shortLabel: string;
  /** Directly measured activity per bucket (XP earned). */
  bars: number[];
  barLabels: string[];
  /** Hard facts we actually record. */
  lessons: number;
  words: number;
  accuracy: number;
  /** Estimated IELTS band — a projection, not a measurement. Labelled as such. */
  band: number;
  bandDelta: number;
}

const PERIOD_DATA: Record<AnalyticsPeriod, PeriodData> = {
  '7d': {
    shortLabel: '7 kun',
    bars: [38, 52, 45, 61, 58, 72, 42],
    barLabels: ['D', 'S', 'C', 'P', 'J', 'Sh', 'Y'],
    lessons: 18, words: 47, accuracy: 87, band: 6.5, bandDelta: 0.5,
  },
  '30d': {
    shortLabel: '30 kun',
    bars: [210, 265, 240, 288, 252],
    barLabels: ['1-hafta', '2-hafta', '3-hafta', '4-hafta', '5-hafta'],
    lessons: 34, words: 128, accuracy: 85, band: 6.5, bandDelta: 0.5,
  },
  '3m': {
    shortLabel: '3 oy',
    bars: [820, 960, 1105],
    barLabels: ['Mart', 'Aprel', 'May'],
    lessons: 96, words: 342, accuracy: 83, band: 6.5, bandDelta: 1.0,
  },
  'y': {
    shortLabel: 'Yil',
    bars: [380, 420, 405, 462, 488, 510, 545, 528, 580, 612, 658, 720],
    barLabels: ['Y', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O', 'N', 'D'],
    lessons: 312, words: 1240, accuracy: 81, band: 6.5, bandDelta: 1.5,
  },
};

/** Share of practice time per skill. Covers all four IELTS skills + vocabulary. */
const SKILL_SPLIT = [
  { name: 'Listening',  pct: 26, color: '#5aa9ff' },
  { name: 'Reading',    pct: 22, color: '#22C55E' },
  { name: 'Vocabulary', pct: 21, color: '#F59E0B' },
  { name: 'Speaking',   pct: 17, color: '#a59bff' },
  { name: 'Writing',    pct: 14, color: '#8a4dff' },
];

/**
 * Tahlil — activity and diagnosis in one scroll. They were two tabs answering
 * halves of the same question, which made the useful part (what to fix) a tab
 * away from the evidence for it.
 */
function InsightsScreen({ isDark }: { isDark: boolean }) {
  return (
    <>
      <AnalyticsScreen isDark={isDark} />
      <ErrorDnaSection isDark={isDark} />
    </>
  );
}

function AnalyticsScreen({ isDark }: { isDark: boolean }) {
  const cardBg = isDark ? '#0e1428' : '#ffffff';
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const trackBg = isDark ? '#1b2340' : '#E6ECFA';

  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');
  const data = PERIOD_DATA[period];
  const maxVal = Math.max(...data.bars);
  const totalXp = data.bars.reduce((s, v) => s + v, 0);

  return (
    <div className="px-4 pb-4">
      <div className="pb-3 pt-2">
        <h1 className="text-[34px] font-bold leading-tight" style={{ color: primaryText }}>
          Tahlil
        </h1>
      </div>

      {/* Period selector */}
      <div className="mb-4 flex rounded-lg p-1" style={{ background: isDark ? '#0e1428' : '#E6ECFA' }}>
        {(['7d', '30d', '3m', 'y'] as AnalyticsPeriod[]).map((p) => {
          const isActive = period === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className="flex-1 rounded-md py-1.5 text-[12px] font-medium transition-all active:scale-95"
              style={{
                background: isActive ? cardBg : 'transparent',
                color: primaryText,
                boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {PERIOD_DATA[p].shortLabel}
            </button>
          );
        })}
      </div>

      {/* Activity chart — XP is directly measured, so it's the honest headline */}
      <div className="mb-4 rounded-2xl p-5" style={{ background: cardBg }}>
        <div className="flex items-baseline justify-between">
          <span className="text-[13px]" style={{ color: secondaryText }}>Faollik (XP)</span>
          <span className="text-[12px]" style={{ color: secondaryText }}>
            eng yuqori: {maxVal}
          </span>
        </div>
        <div className="mt-0.5 text-[28px] font-bold" style={{ color: primaryText }}>
          {totalXp.toLocaleString('en-US')}
          <span className="ml-1 text-base font-normal" style={{ color: secondaryText }}>XP</span>
        </div>

        {/* Bars. The column is a flex child of a fixed-height row, and the bar is
            absolutely positioned inside it — percentage heights need a parent
            with a resolved height, which `auto` doesn't provide. */}
        <div className="mt-4 flex h-[132px] gap-1">
          {data.bars.map((v, i) => {
            const isLast = i === data.bars.length - 1;
            return (
              <div key={i} className="flex min-w-0 flex-1 flex-col">
                <div className="relative w-full flex-1">
                  <div
                    className="absolute bottom-0 w-full rounded-t-md transition-all"
                    style={{
                      height: `${(v / maxVal) * 100}%`,
                      background: isLast
                        ? 'linear-gradient(to top, #5aa9ff, #8a4dff)'
                        : trackBg,
                    }}
                  />
                </div>
                {data.barLabels[i] && (
                  <span
                    className="mt-1.5 truncate text-center text-[9px]"
                    style={{ color: secondaryText }}
                  >
                    {data.barLabels[i]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Measured facts */}
      <div className="mb-4 grid grid-cols-3 gap-2.5">
        {[
          { label: 'Darslar', value: String(data.lessons) },
          { label: "So'zlar", value: String(data.words) },
          { label: 'Aniqlik', value: `${data.accuracy}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-3" style={{ background: cardBg }}>
            <div className="text-[11px]" style={{ color: secondaryText }}>{s.label}</div>
            <div className="mt-0.5 text-[19px] font-bold" style={{ color: primaryText }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Band estimate — explicitly a projection, not a real exam score */}
      <div className="mb-4 rounded-2xl p-4" style={{ background: cardBg }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px]" style={{ color: secondaryText }}>
              IELTS band — taxminiy baho
            </div>
            <div className="mt-0.5 text-[26px] font-bold leading-none" style={{ color: primaryText }}>
              {data.band.toFixed(1)}
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full px-2 py-1" style={{ background: '#22C55E20' }}>
            <ArrowUpRight className="h-3 w-3" style={{ color: '#22C55E' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#22C55E' }}>
              +{data.bandDelta.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="mt-2 text-[11px] leading-snug" style={{ color: secondaryText }}>
          Mashq natijalaringiz asosida hisoblangan. Rasmiy imtihon bahosi emas.
        </div>
      </div>

      {/* Skill split — all four IELTS skills plus vocabulary */}
      <SectionHeader title="Mashq taqsimoti" isDark={isDark} />
      <div className="mb-2 px-1 text-[11px]" style={{ color: secondaryText }}>
        Sarflangan vaqtning ko'nikmalar bo'yicha ulushi
      </div>
      <div className="mb-4 rounded-2xl" style={{ background: cardBg }}>
        {SKILL_SPLIT.map((c, i, arr) => (
          <div
            key={c.name}
            className="px-4 py-3"
            style={{
              borderBottom: i < arr.length - 1
                ? `0.5px solid ${isDark ? 'rgba(84,84,88,0.6)' : 'rgba(60,60,67,0.18)'}`
                : 'none',
            }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[14px] font-medium" style={{ color: primaryText }}>
                {c.name}
              </span>
              <span className="text-[14px] font-semibold" style={{ color: primaryText }}>
                {c.pct}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ background: trackBg }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${c.pct}%`, background: c.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// XATO DNA SCREEN
// ─────────────────────────────────────────────────────────────────────────────

// Mastery per category, mirroring what `submit_diagnostic` returns:
// 0-100 where HIGHER = stronger, so the weakest category is the LOWEST score.
// Ordered weakest-first, which is what the real DNA screen surfaces.
const DNA_MASTERY: { category: ErrorCategory; mastery: number; delta: number }[] = [
  { category: 'articles',     mastery: 58, delta: +6 },
  { category: 'prepositions', mastery: 64, delta: +3 },
  { category: 'word_order',   mastery: 71, delta: -2 },
  { category: 'tense',        mastery: 76, delta: +5 },
  { category: 'vocabulary',   mastery: 83, delta: +2 },
];

/** Uzbek labels for the five real ErrorCategory values. */
const DNA_LABELS_UZ: Record<ErrorCategory, string> = {
  articles:     'Artikllar (a/an/the)',
  prepositions: 'Predloglar (in/on/at)',
  tense:        "Fe'l zamonlari",
  word_order:   "So'z tartibi",
  vocabulary:   "So'z boyligi",
};

/** Mastery → colour. Red below 60, amber to 75, green above. */
function masteryColor(m: number): string {
  if (m < 60) return '#ff453a';
  if (m < 76) return '#F59E0B';
  return '#22C55E';
}

function ErrorDnaSection({ isDark }: { isDark: boolean }) {
  const cardBg = isDark ? '#0e1428' : '#ffffff';
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const trackBg = isDark ? '#1b2340' : '#E6ECFA';

  const [expanded, setExpanded] = useState<ErrorCategory | null>(null);

  const sorted = [...DNA_MASTERY].sort((a, b) => a.mastery - b.mastery);
  const weakest = sorted[0];
  const overall = Math.round(DNA_MASTERY.reduce((s, d) => s + d.mastery, 0) / DNA_MASTERY.length);

  return (
    <div className="px-4 pb-4">
      {/* The half above answers "how much and how well". This one answers "what
          is actually going wrong" — same question, so it belongs on the same
          page, but it gets a rule and a smaller heading so the page still reads
          as measurement first, diagnosis second. */}
      <div
        className="mb-5 mt-1 border-t"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(60,60,67,0.12)' }}
      />
      <div className="pb-3">
        <h2
          className="text-[24px] font-bold leading-tight"
          style={{ color: primaryText, letterSpacing: '-0.02em' }}
        >
          Xato DNA
        </h2>
        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: '#22C55E20' }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium" style={{ color: '#22C55E' }}>
            20 savollik diagnostika · 3 marta topshirilgan
          </span>
        </div>
      </div>

      {/* Overall mastery */}
      <div className="mb-4 rounded-2xl p-4" style={{ background: cardBg }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px]" style={{ color: secondaryText }}>Umumiy o'zlashtirish</div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-[30px] font-bold leading-none" style={{ color: primaryText }}>{overall}</span>
              <span className="text-[13px]" style={{ color: secondaryText }}>/ 100</span>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full px-2 py-1" style={{ background: '#22C55E20' }}>
            <ArrowUpRight className="h-3 w-3" style={{ color: '#22C55E' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#22C55E' }}>+2.8 bu hafta</span>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: trackBg }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${overall}%`, background: 'linear-gradient(90deg, #2563EB, #8a4dff)' }}
          />
        </div>
        <div className="mt-2 text-[11px]" style={{ color: secondaryText }}>
          Ball qanchalik yuqori bo'lsa, mavzuni shunchalik yaxshi bilasiz.
        </div>
      </div>

      {/* Weakest category — what the diagnostic actually surfaces first */}
      <div
        className="mb-4 overflow-hidden rounded-2xl p-4"
        style={{ background: 'linear-gradient(135deg, #ff453a 0%, #F59E0B 100%)' }}
      >
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-white" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/85">
            Eng zaif kategoriya
          </span>
        </div>
        <div className="mt-1.5 text-[18px] font-bold leading-tight text-white">
          {DNA_LABELS_UZ[weakest.category]}
        </div>
        <div className="mt-1 text-[12px] text-white/85">
          {weakest.mastery}/100 o'zlashtirilgan — birinchi navbatda shu mavzuga e'tibor bering.
        </div>
      </div>

      {/* All five categories, weakest first */}
      <SectionHeader title="Kategoriyalar bo'yicha" isDark={isDark} />
      <div className="rounded-2xl" style={{ background: cardBg }}>
        {sorted.map((d, i, arr) => {
          const label = DNA_LABELS_UZ[d.category];
          const color = masteryColor(d.mastery);
          const isOpen = expanded === d.category;
          const example = ERROR_CATALOG.find(e => e.category === d.category);
          return (
            <div
              key={d.category}
              style={{
                borderBottom: i < arr.length - 1
                  ? `0.5px solid ${isDark ? 'rgba(84,84,88,0.6)' : 'rgba(60,60,67,0.18)'}`
                  : 'none',
              }}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : d.category)}
                className="w-full px-4 py-3 text-left transition-colors active:bg-black/5 dark:active:bg-white/5"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="truncate text-[14px] font-medium" style={{ color: primaryText }}>
                    {label}
                  </span>
                  <div className="flex flex-none items-center gap-2">
                    <span
                      className="flex items-center gap-0.5 text-[11px] font-medium"
                      style={{ color: d.delta >= 0 ? '#22C55E' : '#ff453a' }}
                    >
                      {d.delta >= 0
                        ? <ArrowUpRight className="h-2.5 w-2.5" />
                        : <ArrowDownRight className="h-2.5 w-2.5" />}
                      {Math.abs(d.delta)}
                    </span>
                    <span className="text-[14px] font-bold" style={{ color: primaryText }}>
                      {d.mastery}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: trackBg }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${d.mastery}%`, background: color }}
                  />
                </div>
              </button>

              {/* Real catalog example — wrong → correct + why an Uzbek speaker slips */}
              {isOpen && example && (
                <div className="px-4 pb-3.5" style={{ animation: 'ios-fade-in 0.2s ease-out' }}>
                  <div className="rounded-xl p-3" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFF' }}>
                    <div className="flex items-start gap-1.5">
                      <X className="mt-0.5 h-3 w-3 flex-none" style={{ color: '#ff453a' }} strokeWidth={3} />
                      <span className="text-[12px] line-through" style={{ color: secondaryText }}>
                        {example.wrongExample}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-start gap-1.5">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 flex-none" style={{ color: '#22C55E' }} />
                      <span className="text-[12px] font-medium" style={{ color: primaryText }}>
                        {example.correctExample}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] leading-snug" style={{ color: secondaryText }}>
                      {example.uzbekRootCause}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE SCREEN
// ─────────────────────────────────────────────────────────────────────────────

type ProfileAction =
  | 'account'
  | 'security'
  | 'notifications'
  | 'language'
  | 'about'
  | 'theme'
  | 'reports'
  | 'help'
  | 'logout';

type Lang = 'uz' | 'ru' | 'en';

const LANG_LABEL: Record<Lang, string> = {
  uz: "O'zbek",
  ru: 'Русский',
  en: 'English',
};

interface ProfileItem {
  icon: typeof Home;
  label: string;
  value?: string;
  action: ProfileAction;
  isDestructive?: boolean;
  isToggle?: boolean;
}

function ProfileScreen({
  isDark,
  onToggleTheme,
  onOpenReport,
}: {
  isDark: boolean;
  onToggleTheme?: () => void;
  onOpenReport?: (key: ReportKey) => void;
}) {
  const cardBg = isDark ? '#0e1428' : '#ffffff';
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const sheetBg = isDark ? '#0e1428' : '#ffffff';
  const dividerColor = isDark ? 'rgba(84,84,88,0.6)' : 'rgba(60,60,67,0.18)';

  const [activeSheet, setActiveSheet] = useState<ProfileAction | null>(null);
  const [lang, setLang] = useState<Lang>('uz');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 2400);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    showToast('Profil rasmi yangilandi');
    e.target.value = '';
  };

  const handleAction = (action: ProfileAction) => {
    if (action === 'notifications') {
      const next = !notifEnabled;
      setNotifEnabled(next);
      showToast(next ? "Bildirishnomalar yoqildi" : "Bildirishnomalar o'chirildi");
      return;
    }
    if (action === 'theme') {
      onToggleTheme?.();
      return;
    }
    if (action === 'logout') {
      setConfirmingLogout(true);
      return;
    }
    setActiveSheet(action);
  };

  const confirmLogout = () => {
    setConfirmingLogout(false);
    setLoggedOut(true);
    showToast("Tizimdan chiqildi");
    window.setTimeout(() => setLoggedOut(false), 1800);
  };

  const sections: { title: string; items: ProfileItem[] }[] = [
    {
      title: 'Akkaunt',
      items: [
        { icon: UserRound, label: 'Profilni boshqarish', action: 'account' },
        { icon: Lock, label: 'Parol va xavfsizlik', action: 'security' },
        {
          icon: Bell,
          label: 'Bildirishnomalar',
          action: 'notifications',
          isToggle: true,
        },
        { icon: Globe, label: 'Til', value: LANG_LABEL[lang], action: 'language' },
      ],
    },
    {
      title: 'Afzalliklar',
      items: [
        { icon: Info, label: 'Ilova haqida', action: 'about' },
        { icon: Contrast, label: 'Mavzu', value: isDark ? 'Tungi' : 'Kunduzgi', action: 'theme' },
        { icon: BarChart3, label: 'Progress hisobotlari', action: 'reports' },
      ],
    },
    {
      title: 'Yordam',
      items: [
        { icon: HelpCircle, label: 'Yordam markazi', action: 'help' },
      ],
    },
  ];

  const sheetTitles: Partial<Record<ProfileAction, string>> = {
    account: 'Profilni boshqarish',
    security: 'Parol va xavfsizlik',
    language: 'Tilni tanlang',
    about: 'Ilova haqida',
    reports: 'Progress hisobotlari',
    help: 'Yordam markazi',
  };

  const detailHeader = activeSheet && (
    <div className="mb-4 flex items-center gap-3 pt-3">
      <button
        type="button"
        onClick={() => setActiveSheet(null)}
        className="flex h-8 w-8 flex-none items-center justify-center rounded-full transition active:scale-90"
        style={{ background: cardBg, border: `1px solid ${dividerColor}` }}
        aria-label="Orqaga"
      >
        <ArrowLeft className="h-4 w-4" style={{ color: primaryText }} />
      </button>
      <h1 className="text-[18px] font-bold" style={{ color: primaryText }}>
        {sheetTitles[activeSheet]}
      </h1>
    </div>
  );

  return (
    <div className="px-4 pb-4">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

      {activeSheet === 'account' && (
        <div>
          {detailHeader}
          {/* Avatar + upload */}
          <div className="mb-4 flex flex-col items-center">
            <div className="relative mb-2">
              <div
                className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-3xl font-bold text-white"
                style={{ background: avatarUrl ? undefined : 'linear-gradient(135deg, #2563EB, #8a4dff)' }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profil rasmi" className="h-full w-full object-cover" />
                ) : (
                  'M'
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 transition active:scale-90"
                style={{ background: cardBg, borderColor: isDark ? '#000000' : '#F8FAFF' }}
                aria-label="Rasm yuklash"
              >
                <Camera className="h-3 w-3" style={{ color: primaryText }} />
              </button>
            </div>
          </div>

          <SheetRow label="To'liq ism" value="Malika Yusupova" text={primaryText} sub={secondaryText} />
          <SheetRow label="Email" value="malika.yusupova@gmail.com" text={primaryText} sub={secondaryText} />
          <SheetRow label="Telefon" value="+998 90 123 45 67" text={primaryText} sub={secondaryText} />
          <SheetRow label="IELTS maqsad" value="Band 6.5" text={primaryText} sub={secondaryText} />
          <SheetRow label="Rol" value="O'quvchi (PRO)" text={primaryText} sub={secondaryText} />
          <SheetRow label="A'zo bo'lgan" value="2026-yil 12 fevral" text={primaryText} sub={secondaryText} last />

          {/* Achievements */}
          <div className="mb-2 mt-4 text-[13px]" style={{ color: secondaryText }}>Yutuqlarim</div>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'IELTS sertifikat', value: 'Band 6.5' },
              { label: 'Streak rekord', value: '14 kun' },
              { label: "So'zlar", value: '1,240 ta' },
            ].map((d) => (
              <div key={d.label} className="rounded-2xl p-3" style={{ background: cardBg, border: `1px solid ${dividerColor}` }}>
                <div
                  className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#F8FAFF' }}
                >
                  <Award className="h-4 w-4" style={{ color: primaryText }} />
                </div>
                <div className="text-[12px] font-medium leading-tight" style={{ color: primaryText }}>{d.label}</div>
                <div className="mt-0.5 text-[11px]" style={{ color: secondaryText }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSheet === 'security' && (
        <div>
          {detailHeader}
          <div className="overflow-hidden rounded-2xl" style={{ background: cardBg, border: `1px solid ${dividerColor}` }}>
            <SheetRow label="Parol" value="••••••••" text={primaryText} sub={secondaryText} />
            <SheetRow label="Ikki bosqichli tasdiqlash" value="O'chirilgan" text={primaryText} sub={secondaryText} />
            <ReportRow
              title="Parolni yangilash"
              subtitle="Oxirgi marta 3 oy oldin o'zgartirilgan"
              text={primaryText}
              sub={secondaryText}
              onClick={() => showToast('Parolni yangilash — keyinroq')}
              last
            />
          </div>
        </div>
      )}

      {activeSheet === 'language' && (
        <div>
          {detailHeader}
          <div className="overflow-hidden rounded-2xl px-4" style={{ background: cardBg, border: `1px solid ${dividerColor}` }}>
            {(['uz', 'ru', 'en'] as Lang[]).map((code, i, arr) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setLang(code);
                  setActiveSheet(null);
                  showToast(`Til o'zgartirildi: ${LANG_LABEL[code]}`);
                }}
                className="flex w-full items-center justify-between py-3.5 text-left"
                style={{
                  borderBottom: i < arr.length - 1 ? `0.5px solid ${dividerColor}` : 'none',
                }}
              >
                <span className="text-[16px]" style={{ color: primaryText }}>{LANG_LABEL[code]}</span>
                {lang === code && (
                  <span className="text-[16px] font-medium" style={{ color: '#5aa9ff' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeSheet === 'about' && (
        <div>
          {detailHeader}
          <div className="overflow-hidden rounded-2xl" style={{ background: cardBg, border: `1px solid ${dividerColor}` }}>
            <SheetRow label="Versiya" value="1.0.1 (concept)" text={primaryText} sub={secondaryText} />
            <SheetRow label="Dasturchi" value="LingRow jamoasi" text={primaryText} sub={secondaryText} />
            <ReportRow
              title="Maxfiylik siyosati"
              subtitle="Ma'lumotlaringiz qanday ishlatilishi"
              text={primaryText}
              sub={secondaryText}
              onClick={() => window.open('/legal/maxfiylik-siyosati.pdf', '_blank', 'noopener,noreferrer')}
            />
            <ReportRow
              title="Foydalanish shartlari"
              subtitle="Xizmat ko'rsatish shartlari"
              text={primaryText}
              sub={secondaryText}
              onClick={() => window.open('/legal/foydalanish-shartlari.pdf', '_blank', 'noopener,noreferrer')}
              last
            />
          </div>
        </div>
      )}

      {activeSheet === 'reports' && (
        <div>
          {detailHeader}
          <div className="overflow-hidden rounded-2xl" style={{ background: cardBg, border: `1px solid ${dividerColor}` }}>
            <ReportRow title="Kunlik mashqlar" subtitle="Bugun · 4 ta dars" text={primaryText} sub={secondaryText} onClick={() => onOpenReport?.('daily')} />
            <ReportRow title="Haftalik progress" subtitle="So'nggi 7 kun · +0.5 band" text={primaryText} sub={secondaryText} onClick={() => onOpenReport?.('weekly')} />
            <ReportRow title="Oylik xulosa" subtitle="May 2026 · umumiy progress hisobi" text={primaryText} sub={secondaryText} onClick={() => onOpenReport?.('monthly')} last />
          </div>
        </div>
      )}

      {activeSheet === 'help' && (
        <div>
          {detailHeader}
          <div className="overflow-hidden rounded-2xl" style={{ background: cardBg, border: `1px solid ${dividerColor}` }}>
            <ReportRow title="FAQ — Tez-tez beriladigan savollar" subtitle="20 ta savol-javob" text={primaryText} sub={secondaryText} onClick={() => showToast('FAQ ochilmoqda...')} />
            <ReportRow title="Telegram qo'llab-quvvatlash" subtitle="@lingrow_support" text={primaryText} sub={secondaryText} onClick={() => showToast('Telegram ochilmoqda...')} />
            <ReportRow title="Email yozish" subtitle="lingrowsupport@gmail.com" text={primaryText} sub={secondaryText} onClick={() => showToast('Email ochilmoqda...')} last />
          </div>
        </div>
      )}

      {!activeSheet && (
        <>
          <div className="pb-4 pt-3 text-center">
            <h1 className="text-[20px] font-bold" style={{ color: primaryText }}>
              Profil
            </h1>
          </div>

          {/* User card */}
          <button
            type="button"
            onClick={() => setActiveSheet('account')}
            className="mb-6 flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-transform active:scale-[0.98]"
            style={{ background: cardBg, border: `1px solid ${dividerColor}` }}
          >
            <div
              className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-full text-2xl font-bold text-white"
              style={{ background: avatarUrl ? undefined : 'linear-gradient(135deg, #2563EB, #8a4dff)' }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profil rasmi" className="h-full w-full object-cover" />
              ) : (
                'M'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[18px] font-semibold" style={{ color: primaryText }}>
                Malika Yusupova
              </div>
              <div className="truncate text-[13px]" style={{ color: secondaryText }}>
                malika.yusupova@gmail.com
              </div>
            </div>
            <span aria-hidden="true" className="text-[15px]" style={{ color: secondaryText }}>→</span>
          </button>

          {/* Settings sections */}
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="mb-5">
              <div className="mb-2 px-1 text-[13px]" style={{ color: secondaryText }}>
                {section.title}
              </div>
              <div className="overflow-hidden rounded-2xl" style={{ background: cardBg, border: `1px solid ${dividerColor}` }}>
                {section.items.map((item, i) => {
                  const Icon = item.icon;
                  const isLast = i === section.items.length - 1;
                  const rowInner = (
                    <>
                      <Icon
                        className="h-5 w-5 flex-none"
                        strokeWidth={1.8}
                        style={{ color: item.isDestructive ? '#ff453a' : secondaryText }}
                      />
                      <span
                        className="flex-1 text-[15px]"
                        style={{ color: item.isDestructive ? '#ff453a' : primaryText }}
                      >
                        {item.label}
                      </span>
                      {item.isToggle ? (
                        <IOSToggle
                          checked={item.action === 'notifications' ? notifEnabled : false}
                          onChange={() => handleAction(item.action)}
                        />
                      ) : (
                        <>
                          {item.value && (
                            <span className="text-[13px]" style={{ color: secondaryText }}>
                              {item.value}
                            </span>
                          )}
                          <span aria-hidden="true" className="text-[15px]" style={{ color: secondaryText }}>→</span>
                        </>
                      )}
                    </>
                  );
                  const rowClassName = "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-black/5 dark:active:bg-white/5";
                  const rowStyle = { borderBottom: isLast ? 'none' : `0.5px solid ${dividerColor}` };
                  // A toggle row can't be a <button> — it would nest the IOSToggle's own
                  // <button> inside it, which is invalid HTML and breaks React hydration.
                  return item.isToggle ? (
                    <div
                      key={item.label}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleAction(item.action)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAction(item.action);
                        }
                      }}
                      className={rowClassName}
                      style={rowStyle}
                    >
                      {rowInner}
                    </div>
                  ) : (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleAction(item.action)}
                      className={rowClassName}
                      style={rowStyle}
                    >
                      {rowInner}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Logout — standalone row */}
          <div className="mb-5 overflow-hidden rounded-2xl" style={{ background: cardBg, border: `1px solid ${dividerColor}` }}>
            <button
              type="button"
              onClick={() => setConfirmingLogout(true)}
              className="flex w-full items-center justify-center gap-2 px-4 py-3.5 text-[15px] font-medium transition-colors active:bg-black/5 dark:active:bg-white/5"
              style={{ color: '#ff453a' }}
            >
              <LogOut className="h-4 w-4" />
              Chiqish
            </button>
          </div>

          <div className="text-center">
            <span className="text-[11px]" style={{ color: secondaryText }}>
              LingRow · v1.0.1 (concept)
            </span>
          </div>
        </>
      )}

      {/* ─── Logout confirm ────────────────────────────────────────────── */}
      {confirmingLogout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-[280px] overflow-hidden rounded-2xl" style={{ background: sheetBg }}>
            <div className="px-5 pb-3 pt-5 text-center">
              <div className="text-[16px] font-semibold" style={{ color: primaryText }}>Chiqishni tasdiqlang</div>
              <div className="mt-1 text-[13px]" style={{ color: secondaryText }}>
                Tizimdan chiqishni xohlaysizmi?
              </div>
            </div>
            <div className="flex" style={{ borderTop: `0.5px solid ${dividerColor}` }}>
              <button
                type="button"
                onClick={() => setConfirmingLogout(false)}
                className="flex-1 py-3 text-[16px]"
                style={{ color: '#5aa9ff', borderRight: `0.5px solid ${dividerColor}` }}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 py-3 text-[16px] font-semibold"
                style={{ color: '#ff453a' }}
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Logged-out splash ─────────────────────────────────────────── */}
      {loggedOut && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center" style={{ background: isDark ? '#000' : '#fff' }}>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#22C55E20' }}>
              <LogOut className="h-7 w-7" style={{ color: '#22C55E' }} />
            </div>
            <div className="text-[18px] font-semibold" style={{ color: primaryText }}>Xayr! 👋</div>
            <div className="mt-1 text-[13px]" style={{ color: secondaryText }}>Tizimdan muvaffaqiyatli chiqdingiz</div>
          </div>
        </div>
      )}

      {/* ─── Toast ─────────────────────────────────────────────────────── */}
      {toastMsg && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-[70] -translate-x-1/2">
          <div
            className="rounded-full px-4 py-2.5 text-[13px] font-medium shadow-lg"
            style={{
              background: isDark ? 'rgba(58,58,60,0.95)' : 'rgba(0,0,0,0.85)',
              color: '#ffffff',
              backdropFilter: 'blur(20px)',
            }}
          >
            {toastMsg}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profile detail-page primitives ────────────────────────────────────────

function SheetRow({
  label,
  value,
  text,
  sub,
  last,
}: {
  label: string;
  value: string;
  text: string;
  sub: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3"
      style={{
        borderBottom: last ? 'none' : `0.5px solid ${sub}33`,
      }}
    >
      <span className="flex-none text-[14px]" style={{ color: sub }}>{label}</span>
      <span className="truncate text-[14px] font-medium" style={{ color: text }}>{value}</span>
    </div>
  );
}

function ReportRow({
  title,
  subtitle,
  text,
  sub,
  onClick,
  last,
}: {
  title: string;
  subtitle: string;
  text: string;
  sub: string;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-opacity active:opacity-60"
      style={{
        borderBottom: last ? 'none' : `0.5px solid ${sub}33`,
      }}
    >
      <div className="min-w-0">
        <div className="truncate text-[15px] font-medium" style={{ color: text }}>{title}</div>
        <div className="mt-0.5 truncate text-[12px]" style={{ color: sub }}>{subtitle}</div>
      </div>
      <ChevronRight className="h-4 w-4 flex-none" style={{ color: sub }} />
    </button>
  );
}

function IOSToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className="relative h-[31px] w-[51px] flex-none rounded-full transition-colors"
      style={{ background: checked ? '#22C55E' : 'rgba(120,120,128,0.32)' }}
    >
      <span
        className="absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-md transition-all"
        style={{ left: checked ? '22px' : '2px' }}
      />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable bits
// ─────────────────────────────────────────────────────────────────────────────

function KPICard({
  title,
  value,
  delta,
  deltaPositive,
  icon: Icon,
  iconBg,
  isDark,
}: {
  title: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: typeof Home;
  iconBg: string;
  isDark: boolean;
}) {
  const primaryText = isDark ? '#ffffff' : '#000000';

  // On dark the tile is real glass over the starfield — the app's own
  // `.crystal-card`, not a second look invented here. On light it stays a solid
  // card: a translucent surface over a light ground has nothing to refract and
  // only costs legibility.
  const glass = isDark;

  // Label above value, the way the web app stacks them: a small mint caption
  // introduces the number rather than trailing it.
  return (
    <div
      className={glass ? 'crystal-card crystal-tile relative p-3.5' : 'rounded-2xl p-3.5'}
      style={glass ? undefined : { background: panelBg(isDark), border: panelBorder(isDark) }}
    >
      {/* The diagonal streak that makes the surface read as a lit pane of glass
          rather than a grey wash. */}
      {glass && <span className="refract" aria-hidden="true" />}

      <div className="relative mb-2 flex items-center justify-between">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{
            background: iconBg,
            // Colour belongs on a solid layer, and a small shadow lifts it off
            // the glass instead of letting it float flat on the surface.
            boxShadow: glass ? `0 4px 10px ${iconBg}55, inset 0 1px 0 rgba(255,255,255,0.28)` : 'none',
          }}
        >
          <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.4} />
        </div>
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
          style={{
            // Over glass the chip carries its own near-solid ground rather than
            // tinting whatever happens to be behind it. As a 12% tint its text
            // fell to 3.2:1 above a bright nebula; on this ground it holds ~6.4:1
            // at the worst point, so the badge is readable wherever the card lands.
            background: glass
              ? (deltaPositive ? 'rgba(16,58,35,0.90)' : 'rgba(64,24,22,0.90)')
              : (deltaPositive ? '#22C55E20' : '#ff453a20'),
            border: glass
              ? `1px solid ${deltaPositive ? 'rgba(74,222,128,0.35)' : 'rgba(255,138,128,0.35)'}`
              : '1px solid transparent',
            color: glass
              ? (deltaPositive ? '#4ADE80' : '#FF8A80')
              : (deltaPositive ? '#22C55E' : '#ff453a'),
          }}
        >
          {delta}
        </span>
      </div>
      <div
        className="relative text-[10px] font-bold uppercase"
        style={{ color: labelColor(isDark), letterSpacing: '0.07em' }}
      >
        {title}
      </div>
      <div
        className="relative mt-0.5 text-[22px] font-bold"
        style={{ color: primaryText, letterSpacing: '-0.02em' }}
      >
        {value}
      </div>
    </div>
  );
}

function ProKpiTile({
  isDark,
  icon: Icon,
  iconBg,
  label,
  value,
}: {
  isDark: boolean;
  icon: typeof Home;
  iconBg: string;
  label: string;
  value: string;
}) {
  const cardBg = isDark ? '#0e1428' : '#ffffff';
  const primaryText = isDark ? '#ffffff' : '#000000';
  const secondaryText = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  return (
    <div className="rounded-2xl p-3" style={{ background: cardBg }}>
      <div className="flex items-center gap-2 mb-1">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{ background: iconBg }}
        >
          <Icon className="h-3 w-3 text-white" strokeWidth={2.4} />
        </div>
        <span className="text-[11px] truncate" style={{ color: secondaryText }}>{label}</span>
      </div>
      <div className="text-[18px] font-bold" style={{ color: primaryText }}>{value}</div>
    </div>
  );
}

function SectionHeader({
  title,
  isDark,
  action,
}: {
  title: string;
  isDark: boolean;
  action?: string;
}) {
  const primaryText = isDark ? '#ffffff' : '#000000';
  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <h2 className="text-[20px] font-bold" style={{ color: primaryText }}>
        {title}
      </h2>
      {action && (
        <button className="text-[13px] font-medium" style={{ color: '#5aa9ff' }}>
          {action}
        </button>
      )}
    </div>
  );
}
