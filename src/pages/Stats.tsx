import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { FloatingDecor } from '@/components/ui/FloatingDecor';
import { useQuery } from '@tanstack/react-query';
import { gamify, learning } from '@/lib/api';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, AreaChart, Area } from 'recharts';
import { useActivity, computeWeeklyStats, type ActivityEvent, type ActivityKind } from '@/store/activity';
import { useProgress } from '@/store/progress';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ANY_ACTIVITY: ActivityKind[] = ['lesson_completed', 'quiz_submitted', 'writing_submitted', 'speaking_practiced', 'vocab_reviewed'];

/** Real per-day counts for the given event kinds, oldest → newest, `days` long. */
function dayBuckets(events: ActivityEvent[], kinds: ActivityKind[], days: number) {
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86_400_000);
    return { key: d.toISOString().slice(0, 10), day: DAY_LABELS[d.getDay()], v: 0 };
  });
  const byKey = new Map(buckets.map(b => [b.key, b]));
  for (const e of events) {
    if (!kinds.includes(e.kind)) continue;
    const bucket = byKey.get(new Date(e.ts).toISOString().slice(0, 10));
    if (bucket) bucket.v += 1;
  }
  return buckets;
}

export function Stats() {
  const { t } = useTranslation();
  const { data: badges }      = useQuery({ queryKey: ['badges'],      queryFn: gamify.getBadges });
  const { data: leaderboard } = useQuery({ queryKey: ['leaderboard'], queryFn: gamify.getLeaderboard });
  const { data: levels }      = useQuery({ queryKey: ['levels'],      queryFn: learning.getLevels });

  const events = useActivity(s => s.events);
  const xp     = useProgress(s => s.xp);

  const weekly = useMemo(() => computeWeeklyStats(events), [events]);
  const activityByDay = useMemo(() => dayBuckets(events, ANY_ACTIVITY, 7), [events]);
  const vocabByDay     = useMemo(() => dayBuckets(events, ['vocab_reviewed'], 6), [events]);
  const streakActivity = useMemo(() => dayBuckets(events, ANY_ACTIVITY, 28).map((b, i) => ({ d: i + 1, v: b.v })), [events]);

  const todayPercent = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = events.filter(e => new Date(e.ts).toISOString().slice(0, 10) === today).length;
    return Math.min(100, Math.round((todayCount / 5) * 100)); // 5 distinct activities = a full day
  }, [events]);

  const totalQuizCorrect = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86_400_000;
    return events
      .filter(e => e.kind === 'quiz_submitted' && e.ts >= weekAgo)
      .reduce((sum, e) => sum + (typeof e.meta?.correct === 'number' ? (e.meta.correct as number) : 0), 0);
  }, [events]);

  const totalLessons = levels?.reduce((sum, l) => sum + l.totalLessons, 0) ?? 0;
  const lessonsProgressPct = totalLessons > 0 ? Math.min(100, Math.round((weekly.lessonsDone / totalLessons) * 100)) : 0;

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle={t('stats.title')} />

        <section className="flex-1 min-h-0 overflow-auto flex flex-col gap-5">
          {/* Top row */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1.6fr] gap-5">
            {/* Donut */}
            <div className="glass-panel p-5 text-center">
              <h4 className="text-base font-bold text-white text-left mb-3">{t('stats.dailyGoal')}</h4>
              <div className="relative w-[200px] h-[200px] mx-auto grid place-items-center mb-3">
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <defs>
                    <linearGradient id="dg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#5aa9ff"/>
                      <stop offset="100%" stopColor="#7ef7d3"/>
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="48" stroke="rgba(255,255,255,0.10)" strokeWidth="14" fill="none"/>
                  <circle cx="60" cy="60" r="48" stroke="url(#dg)" strokeWidth="14" fill="none" strokeLinecap="round"
                          strokeDasharray="301" strokeDashoffset={301 - (301 * todayPercent) / 100} transform="rotate(-90 60 60)"/>
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div>
                    <div className="bg-white text-slate-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full mx-auto inline-block mb-1">{t('common.today')}</div>
                    <div className="text-3xl font-extrabold text-white leading-none">{todayPercent}%</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{t('stats.todayPercent')}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{xp.toLocaleString()} XP</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 border-t border-white/10 pt-3 text-center">
                <div><b className="text-base text-white">{weekly.lessonsDone}</b><br/><span className="text-[11px] text-slate-400">{t('stats.lessonsDone')}</span></div>
                <div><b className="text-base text-white">{weekly.speakingsPractised}</b><br/><span className="text-[11px] text-slate-400">{t('stats.speakingSessions')}</span></div>
                <div><b className="text-base text-white">{totalQuizCorrect}</b><br/><span className="text-[11px] text-slate-400">{t('stats.quizCorrect')}</span></div>
              </div>
            </div>

            {/* Daily bar */}
            <div className="glass-panel p-5">
              <h4 className="text-base font-bold text-white mb-3">{t('stats.activityThisWeek')}</h4>
              <div className="h-[200px]">
                <ResponsiveContainer>
                  <BarChart data={activityByDay}>
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} allowDecimals={false} />
                    <Bar dataKey="v" fill="url(#dg2)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="dg2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7ef7d3"/>
                        <stop offset="100%" stopColor="#2c5fc7"/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Progress overview */}
            <div className="glass-panel p-5">
              <h4 className="text-base font-bold text-white mb-3">{t('stats.progressOverview')}</h4>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-slate-400 mb-2">{t('stats.vocabAcquired')}</p>
                  <div className="h-[140px]">
                    <ResponsiveContainer>
                      <BarChart data={vocabByDay}>
                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                        <Bar dataKey="v" fill="url(#dg2)" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2">{t('stats.lessonsProgress')}</p>
                  <div className="h-2 rounded bg-white/10 mb-1">
                    <div className="h-full rounded shadow-[0_0_10px_#5aa9ff]"
                         style={{ width: `${lessonsProgressPct}%`, background: 'linear-gradient(90deg, #5aa9ff, #7ef7d3)' }}/>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>0</span><span>{weekly.lessonsDone}/{totalLessons}</span><span>{lessonsProgressPct}%</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-1 mt-3">{t('stats.studyStreak')}</p>
                  <div className="h-[70px]">
                    <ResponsiveContainer>
                      <AreaChart data={streakActivity}>
                        <defs>
                          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(126,247,211,0.5)"/>
                            <stop offset="100%" stopColor="rgba(126,247,211,0)"/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke="#7ef7d3" fill="url(#sg)" strokeWidth={2}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5">
            <div className="glass-panel p-5">
              <h4 className="text-base font-bold text-white mb-3">{t('stats.badges')}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {badges?.slice(0, 4).map(b => (
                  <div key={b.id} className={`text-center flex flex-col items-center gap-1.5 ${!b.unlocked ? 'opacity-50 grayscale' : ''}`}>
                    <div className="w-[86px] h-[86px] rounded-2xl grid place-items-center text-[38px]"
                         style={{
                           background: 'linear-gradient(135deg, rgba(212,175,55,0.30), rgba(120,90,30,0.20))',
                           border: '1px solid rgba(255,215,120,0.45)',
                           boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.3), 0 8px 22px rgba(0,0,0,0.35)',
                         }}>{b.icon}</div>
                    <p className="text-xs font-bold text-white">{b.name}</p>
                    <p className="text-[10px] text-slate-400">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-5">
              <h4 className="text-base font-bold text-white mb-3">{t('stats.leaderboard')}</h4>
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5">
                <h5 className="text-base font-bold text-white mb-3">{t('stats.leaderboard')}</h5>
                <div className="grid text-[12px] text-slate-400 px-1.5 pb-2 border-b border-white/5"
                     style={{ gridTemplateColumns: '50px 1.4fr 70px 1fr 70px' }}>
                  <span>{t('stats.rank')}</span><span>{t('stats.user')}</span><span>{t('stats.country')}</span><span>{t('stats.streak')}</span><span>{t('stats.level')}</span>
                </div>
                {leaderboard?.map(e => (
                  <div key={e.userId}
                       className={`grid items-center gap-2 px-1.5 py-2 text-[12px] rounded-lg
                                   ${e.isMe ? 'bg-cosmic-sky/10 border border-cosmic-sky/40' : 'hover:bg-white/[0.04]'}`}
                       style={{ gridTemplateColumns: '50px 1.4fr 70px 1fr 70px' }}>
                    <span className="font-bold text-white">{leaderboard.indexOf(e) + 1}</span>
                    <span className="flex items-center gap-2 text-slate-200">
                      <i className={`w-[22px] h-[22px] rounded-full inline-block bg-gradient-to-br ${e.isMe ? 'from-rose-400 to-red-700' : 'from-cosmic-mint to-cosmic-sky'}`} />
                      {e.name}
                    </span>
                    <span className="text-base">{e.countryFlag}</span>
                    <span className="flex items-center gap-1.5">
                      <i className="not-italic text-[10px] px-2 py-0.5 rounded-full bg-cosmic-sky/15 text-blue-200 border border-cosmic-sky/30">Streak</i>
                      {e.streak}
                    </span>
                    <span className="text-white font-semibold">{e.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-500 py-1">{t('stats.poweredBy')} V2.1</p>
        </section>

        <FloatingDecor />
      </AppShell>
    </>
  );
}
