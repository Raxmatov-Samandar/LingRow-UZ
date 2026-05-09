import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useActivity, computeWeeklyStats } from '@/store/activity';
import { Mascot } from './Mascot';

/**
 * Floating "Ask Professor Linguo" button — pinned bottom-right on every
 * authenticated page. Hidden on the tutor page itself (we'd be redundant) and
 * on auth screens.
 */
export function FloatingTutor() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const events = useActivity(s => s.events);
  const log    = useActivity(s => s.log);
  const stats  = useMemo(() => computeWeeklyStats(events), [events]);

  // Hide on the tutor page + public/auth routes (those don't render AppShell anyway)
  if (pathname.startsWith('/tutor')) return null;

  function go(path: string, prompt?: string) {
    if (prompt) {
      // Persist a one-shot prompt for the tutor page to pick up.
      sessionStorage.setItem('lr-tutor-shot', prompt);
      log('tutor_message', { source: pathname, prompt });
    }
    navigate(path);
  }

  return (
    <>
      {/* Animated mascot */}
      <Mascot active={open} onClick={() => setOpen(o => !o)} />

      {/* Quick-actions popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-40 w-72 glass-panel p-4"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl grid place-items-center text-base
                              bg-gradient-to-br from-cosmic-mint to-cosmic-sky border border-white/20">🎓</div>
              <div>
                <p className="font-bold text-white text-sm leading-tight">{t('floatingTutor.profName')}</p>
                <p className="text-[10px] text-slate-400">{t('floatingTutor.profSub')}</p>
              </div>
            </div>

            {/* Mini progress glance */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <Stat label={t('floatingTutor.miniLessons')} value={stats.lessonsDone} />
              <Stat label={t('floatingTutor.miniVocab')}   value={stats.vocabReviewed} />
              <Stat label={t('floatingTutor.miniQuiz')}    value={stats.avgQuizScore ?? '—'} />
            </div>

            <p className="text-[11px] text-slate-400 mb-2">{t('floatingTutor.quickAsk')}</p>
            <div className="flex flex-col gap-1.5">
              <Quick onClick={() => { setOpen(false); go('/tutor', `Looking at my last week: lessons ${stats.lessonsDone}, vocab ${stats.vocabReviewed}, quizzes ${stats.quizzesTaken}. Where am I weakest right now?`); }}
                     text={t('floatingTutor.diagnose')} />
              <Quick onClick={() => { setOpen(false); go('/tutor', 'Build me a 7-day study plan based on my recent activity.'); }}
                     text={t('floatingTutor.plan7')} />
              <Quick onClick={() => { setOpen(false); go('/tutor', 'Predict my IELTS band based on what I\'ve done so far.'); }}
                     text={t('floatingTutor.predictBand')} />
              <Quick onClick={() => { setOpen(false); go('/tutor'); }}
                     text={t('floatingTutor.openChat')} highlight />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-white/[0.04] border border-white/8 py-1.5">
      <div className="text-base font-bold text-white leading-none">{value}</div>
      <div className="text-[9px] text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function Quick({ onClick, text, highlight = false }: { onClick(): void; text: string; highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`text-left text-xs px-3 py-2 rounded-lg border transition
                  ${highlight
                    ? 'bg-cosmic-mint/15 border-cosmic-mint/40 text-cosmic-mint hover:bg-cosmic-mint/25'
                    : 'bg-white/[0.03] border-white/8 text-slate-300 hover:text-white hover:bg-white/[0.06]'}`}
    >
      {text}
    </button>
  );
}
