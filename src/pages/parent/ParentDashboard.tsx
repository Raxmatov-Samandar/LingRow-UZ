import { Link } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { parentApi } from '@/lib/api';

export function ParentDashboard() {
  const user = useAuth(s => s.user);
  const { data: children } = useQuery({
    queryKey: ['parent.children'],
    queryFn: () => parentApi.getChildren('p1'),
    enabled: !!user,
  });

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle="Parent Dashboard" bannerSubtitle="Track your child's learning progress" />

        <section className="flex-1 min-h-0 overflow-auto flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-5">
            <StatCard label="Children linked" value={String(children?.length ?? 0)} accent="mint" />
            <StatCard label="Active today"     value={String(children?.length ?? 0)} accent="sky" />
            <StatCard label="Total XP this week" value="1,420" accent="gold" />
          </div>

          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">My Children</h3>
              <Link to="/onboarding" className="btn-mint text-xs px-4 py-2">+ Link a child</Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {children?.map(c => (
                <Link key={c.id} to={`/parent/child/${c.childId}`}
                      className="crystal-card flex items-center gap-4 p-4 hover:bg-white/[0.04] transition">
                  <img className="w-14 h-14 rounded-2xl object-cover" src={c.avatarUrl} alt={c.name}/>
                  <div className="flex-1">
                    <p className="font-bold text-white">{c.name}</p>
                    <p className="text-xs text-slate-400">Age {c.age} · Linked {new Date(c.linkedAt).toLocaleDateString()}</p>
                    <div className="mt-2 flex gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-cosmic-mint/15 border border-cosmic-mint/40 text-cosmic-mint">🔥 7 day streak</span>
                      <span className="px-2 py-0.5 rounded-full bg-cosmic-sky/15 border border-cosmic-sky/40 text-cosmic-sky">⭐ 320 XP</span>
                    </div>
                  </div>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="glass-panel p-5">
              <h3 className="text-lg font-bold text-white mb-3">This week's activity</h3>
              <div className="grid grid-cols-7 gap-1.5 h-24 items-end">
                {[28, 35, 41, 50, 23, 0, 60].map((mins, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-md bg-gradient-to-t from-cosmic-sky to-cosmic-mint"
                         style={{ height: `${(mins / 70) * 100}%` }}/>
                    <span className="text-[10px] text-slate-400">{['M','T','W','T','F','S','S'][i]}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">Average: 33 minutes/day · Goal: 45 min</p>
            </div>

            <div className="glass-panel p-5">
              <h3 className="text-lg font-bold text-white mb-3">Recent notifications</h3>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li className="flex gap-3">🎉 <span><b className="text-white">Alibek</b> earned the "Streak 7" badge</span></li>
                <li className="flex gap-3">📈 <span><b className="text-white">Malika</b> improved her band score: 5.5 → 6.0</span></li>
                <li className="flex gap-3">⏰ <span><b className="text-white">Alibek</b> hasn't started today's session yet</span></li>
                <li className="flex gap-3">📊 <span><b className="text-white">Daily report</b> ready · 8:00 PM</span></li>
              </ul>
            </div>
          </div>
        </section>
      </AppShell>
    </>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: 'mint' | 'sky' | 'gold' }) {
  const colors = {
    mint: 'from-cosmic-mint to-emerald-600',
    sky:  'from-cosmic-sky to-blue-700',
    gold: 'from-yellow-300 to-orange-500',
  };
  return (
    <div className="glass-panel p-5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 bg-gradient-to-br ${colors[accent]} bg-clip-text text-transparent`}>{value}</p>
    </div>
  );
}
