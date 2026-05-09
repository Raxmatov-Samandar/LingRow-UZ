import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { FloatingDecor } from '@/components/ui/FloatingDecor';
import { useQuery } from '@tanstack/react-query';
import { gamify } from '@/lib/api';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, AreaChart, Area } from 'recharts';

const VOCAB_DATA = [
  { day: 'Mon', v: 110 },
  { day: 'Tue', v: 90  },
  { day: 'Wed', v: 140 },
  { day: 'Thu', v: 200 },
  { day: 'Fri', v: 230 },
  { day: 'Sat', v: 165 },
];
const DAILY_DATA = [
  { day: 'Mon', v: 450 },
  { day: 'Tue', v: 820 },
  { day: 'Wed', v: 1200 },
];
const STREAK_DATA = Array.from({ length: 28 }, (_, i) => ({ d: i + 1, v: 6 + Math.round(Math.sin(i / 2) * 4 + Math.random() * 2) }));

export function Stats() {
  const { data: badges }      = useQuery({ queryKey: ['badges'],      queryFn: gamify.getBadges });
  const { data: leaderboard } = useQuery({ queryKey: ['leaderboard'], queryFn: gamify.getLeaderboard });

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle="My Learning Stats" />

        <section className="flex-1 min-h-0 overflow-auto flex flex-col gap-5">
          {/* Top row */}
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr 1.6fr' }}>
            {/* Donut */}
            <div className="glass-panel p-5 text-center">
              <h4 className="text-base font-bold text-white text-left mb-3">Daily Goal</h4>
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
                          strokeDasharray="301" strokeDashoffset="45" transform="rotate(-90 60 60)"/>
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div>
                    <div className="bg-white text-slate-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full mx-auto inline-block mb-1">Today</div>
                    <div className="text-3xl font-extrabold text-white leading-none">85%</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Daily Learning Goal</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">965 XP</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 border-t border-white/10 pt-3 text-center">
                <div><b className="text-base text-white">803</b><br/><span className="text-[11px] text-slate-400">Lessons Done</span></div>
                <div><b className="text-base text-white">35 min</b><br/><span className="text-[11px] text-slate-400">Minutes Spoken</span></div>
                <div><b className="text-base text-white">23</b><br/><span className="text-[11px] text-slate-400">Quiz Correct</span></div>
              </div>
            </div>

            {/* Daily bar */}
            <div className="glass-panel p-5">
              <h4 className="text-base font-bold text-white mb-3">XP This Week</h4>
              <div className="h-[200px]">
                <ResponsiveContainer>
                  <BarChart data={DAILY_DATA}>
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
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
              <h4 className="text-base font-bold text-white mb-3">Progress Overview</h4>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-slate-400 mb-2">Vocabulary Acquired</p>
                  <div className="h-[140px]">
                    <ResponsiveContainer>
                      <BarChart data={VOCAB_DATA}>
                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                        <Bar dataKey="v" fill="url(#dg2)" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2">Grammar Lessons Completed</p>
                  <div className="h-2 rounded bg-white/10 mb-1">
                    <div className="h-full rounded shadow-[0_0_10px_#5aa9ff]"
                         style={{ width: '50%', background: 'linear-gradient(90deg, #5aa9ff, #7ef7d3)' }}/>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>0</span><span>20</span><span>50</span><span>100</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-1 mt-3">Study Streak (Days)</p>
                  <div className="h-[70px]">
                    <ResponsiveContainer>
                      <AreaChart data={STREAK_DATA}>
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
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1.4fr' }}>
            <div className="glass-panel p-5">
              <h4 className="text-base font-bold text-white mb-3">Badges Gallery</h4>
              <div className="grid grid-cols-4 gap-3.5">
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
              <h4 className="text-base font-bold text-white mb-3">Community Leaderboard</h4>
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5">
                <h5 className="text-base font-bold text-white mb-3">Leaderboard</h5>
                <div className="grid text-[12px] text-slate-400 px-1.5 pb-2 border-b border-white/5"
                     style={{ gridTemplateColumns: '50px 1.4fr 70px 1fr 70px' }}>
                  <span>Rank</span><span>User</span><span>Country</span><span>Streak</span><span>Level</span>
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

          <p className="text-center text-[11px] text-slate-500 py-1">My Learning Stats | Powered by LingRow V2.1</p>
        </section>

        <FloatingDecor />
      </AppShell>
    </>
  );
}
