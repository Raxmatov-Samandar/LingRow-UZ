// =============================================================================
// Uzbek Error DNA — profile dashboard.
// Shows the per-category mastery score (0-100, higher = stronger), the
// single weakest category, lessons the curriculum generator picked because
// they target that weakness, and a "share as image" viral loop — the DNA
// profile rendered as a 9:16 story card via html-to-image + Web Share API.
// =============================================================================
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toSvg } from 'html-to-image';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { dna } from '@/lib/api';
import { ERROR_CATEGORY_LABELS, ERROR_CATEGORIES } from '@/data/errorDna';
import type { DnaScores, Lesson, ErrorCategory } from '@/types';

// Score is 0-100 MASTERY (higher = stronger) — never render the weak end in
// red. Red reads as "you failed"; the goal here is "here's where to focus".
function barColor(score: number) {
  if (score >= 70) return 'from-cosmic-mint to-emerald-400';
  if (score >= 40) return 'from-amber-300 to-yellow-400';
  return 'from-orange-300 to-orange-400';
}
function scoreBadge(score: number): { text: string; cls: string } {
  if (score >= 70) return { text: 'Kuchli ✅', cls: 'text-cosmic-mint bg-cosmic-mint/10 border-cosmic-mint/30' };
  if (score >= 40) return { text: 'Yaxshilash mumkin', cls: 'text-amber-300 bg-amber-300/10 border-amber-300/30' };
  return { text: 'Fokus zonasi 🎯', cls: 'text-orange-300 bg-orange-300/10 border-orange-300/30' };
}
function shareBarColor(score: number) {
  if (score >= 70) return 'linear-gradient(90deg,#7ef7d3,#34d399)';
  if (score >= 40) return 'linear-gradient(90deg,#fde68a,#fbbf24)';
  return 'linear-gradient(90deg,#fdba74,#fb923c)';
}

// html-to-image's own toPng()/toCanvas() hang indefinitely in some browsers —
// they set img.crossOrigin on a data-URI image before loading it, and that
// combination can silently stop `onload` from ever firing. toSvg() alone is
// unaffected (no image-load step), so we do the raster step ourselves with a
// plain Image() and a hard timeout, instead of trusting toCanvas()/toPng().
async function captureCardAsPng(node: HTMLDivElement): Promise<string> {
  const pixelRatio = 3;
  const svgDataUrl = await toSvg(node, { pixelRatio, backgroundColor: '#0b1030' });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('image_load_timeout')), 15000);
    img.onload = () => { clearTimeout(timer); resolve(); };
    img.onerror = () => { clearTimeout(timer); reject(new Error('image_load_error')); };
    img.src = svgDataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = node.clientWidth * pixelRatio;
  canvas.height = node.clientHeight * pixelRatio;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

export function ErrorDNA() {
  const [scores, setScores]     = useState<DnaScores | null>(null);
  const [lessons, setLessons]   = useState<Lesson[]>([]);
  const [sharing, setSharing]   = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [captureError, setCaptureError] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dna.getScores().then(setScores);
    dna.getRecommendedLessons(5).then(setLessons);
  }, []);

  const hasScores = !!scores && Object.keys(scores).length > 0;
  // Mastery score: higher = stronger, so the weakest category is the MIN.
  const weakest: ErrorCategory | null = hasScores
    ? (Object.entries(scores!).reduce((a, b) => (b[1]! < a[1]! ? b : a)) as [ErrorCategory, number])[0]
    : null;

  async function shareResult() {
    if (!shareCardRef.current) return;
    setSharing(true);
    setCaptureError(false);
    try {
      const dataUrl = await captureCardAsPng(shareCardRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'my-error-dna.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Mening Error DNA profilim',
          text: "Men ingliz tilida qayerda xato qilishimni bildim! Sen ham tekshir 👉 lingrow.uz",
        });
      } else {
        downloadImage(dataUrl);
      }
    } catch (e) {
      // AbortError from a cancelled share sheet is normal, not a real failure.
      if ((e as Error)?.name !== 'AbortError') {
        console.error('Share error:', e);
        setCaptureError(true);
      }
    } finally {
      setSharing(false);
    }
  }

  async function downloadResult() {
    if (!shareCardRef.current) return;
    setDownloading(true);
    setCaptureError(false);
    try {
      const dataUrl = await captureCardAsPng(shareCardRef.current);
      downloadImage(dataUrl);
    } catch (e) {
      console.error('Download error:', e);
      setCaptureError(true);
    } finally {
      setDownloading(false);
    }
  }

  function downloadImage(dataUrl: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'my-error-dna.png';
    link.click();
  }

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerEmoji="🧬" bannerTitle="Error DNA"
                bannerSubtitle="Your personal map of where Uzbek→English mistakes hide." />

        <section className="grid lg:grid-cols-[1fr_320px] grid-cols-1 gap-5 flex-1">
          {/* Score bars */}
          <div className="glass-panel p-7">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <h2 className="text-lg font-bold text-white">Your DNA profile</h2>
              <div className="flex items-center gap-2">
                {hasScores && (
                  <>
                    <button onClick={downloadResult} disabled={downloading}
                            className="px-4 py-2 rounded-full text-xs font-bold border border-white/15 text-slate-200 hover:bg-white/[0.06] transition disabled:opacity-50">
                      {downloading ? 'Tayyorlanmoqda…' : 'Yuklab olish'}
                    </button>
                    <button onClick={shareResult} disabled={sharing}
                            className="px-4 py-2 rounded-full text-xs font-bold bg-cosmic-mint/20 border border-cosmic-mint/50 text-cosmic-mint hover:bg-cosmic-mint/30 transition disabled:opacity-50">
                      {sharing ? 'Tayyorlanmoqda…' : '📤 Natijani ulashish'}
                    </button>
                  </>
                )}
                <Link to="/dna/diagnostic"
                      className="px-4 py-2 rounded-full text-xs font-bold border border-cosmic-mint/40 text-cosmic-mint hover:bg-cosmic-mint/10 transition">
                  {hasScores ? 'Retake diagnostic' : 'Start diagnostic'}
                </Link>
              </div>
            </div>

            {captureError && (
              <p className="text-xs text-rose-300 mb-4 -mt-3">
                Rasm tayyorlashda xatolik yuz berdi. Qayta urinib ko'ring.
              </p>
            )}

            {!hasScores ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-4xl mb-3">🧬</p>
                <p className="text-slate-200 font-semibold mb-1">No diagnostic yet</p>
                <p className="text-sm text-slate-400">Take the 20-question test to see your Error DNA profile.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {ERROR_CATEGORIES.map(cat => {
                  const score = scores![cat] ?? 0;
                  const badge = scoreBadge(score);
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-slate-100">{ERROR_CATEGORY_LABELS[cat]}</span>
                        <span className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.text}</span>
                          <span className="text-xs tabular-nums text-slate-400">{score}%</span>
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${barColor(score)} transition-all duration-500`}
                             style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weakest + recommended lessons */}
          <aside className="flex flex-col gap-4">
            {weakest && (
              <div className="glass-panel p-5 border border-orange-300/25">
                <p className="text-[10px] uppercase tracking-widest text-orange-300 mb-1">🎯 Fokus zonasi</p>
                <p className="text-lg font-bold text-white">{ERROR_CATEGORY_LABELS[weakest]}</p>
                <p className="text-xs text-slate-400 mt-1">Your biggest opportunity right now — the lessons below target it first.</p>
              </div>
            )}

            <div className="glass-panel p-5 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3">Recommended next</p>
              {lessons.length === 0 ? (
                <p className="text-sm text-slate-400">Take the diagnostic to unlock personalised recommendations.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {lessons.map(l => (
                    <Link key={l.id} to={`/lesson/${l.id}`}
                          className="px-3.5 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition">
                      <p className="text-sm font-semibold text-white truncate">{l.title}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{l.level} · {l.type}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </section>

        {/* Hidden 9:16 share card — rendered off-screen, captured via html-to-image */}
        {hasScores && (
          <div style={{ position: 'fixed', top: -10000, left: -10000, pointerEvents: 'none' }}>
            <div ref={shareCardRef} style={{
              width: 360, height: 640, padding: 32, boxSizing: 'border-box',
              background: 'linear-gradient(160deg, #0b1030 0%, #131a4a 55%, #1a2456 100%)',
              display: 'flex', flexDirection: 'column', color: '#fff',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 40, lineHeight: 1 }}>🧬</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8, letterSpacing: 1 }}>MENING ERROR DNA'M</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, justifyContent: 'center' }}>
                {ERROR_CATEGORIES.map(cat => {
                  const score = scores![cat] ?? 0;
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                        <span style={{ opacity: 0.85 }}>{ERROR_CATEGORY_LABELS[cat]}</span>
                        <span style={{ fontWeight: 700 }}>{score}%</span>
                      </div>
                      <div style={{ height: 10, borderRadius: 6, background: 'rgba(255,255,255,0.12)' }}>
                        <div style={{ height: '100%', width: `${score}%`, borderRadius: 6, background: shareBarColor(score) }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {weakest && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 12.5, opacity: 0.7 }}>🎯 Fokus zonasi</div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{ERROR_CATEGORY_LABELS[weakest]}</div>
                </div>
              )}

              <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13.5, lineHeight: 1.5, opacity: 0.9 }}>
                "Sen qayerda xato qilasan?<br/>Tekshir 👇"
              </div>

              <div style={{ marginTop: 22, textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>lingrow.uz</div>
                <div style={{ fontSize: 11.5, opacity: 0.6 }}>@lingrow</div>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </>
  );
}
