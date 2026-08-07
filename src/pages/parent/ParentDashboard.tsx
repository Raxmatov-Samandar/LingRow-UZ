import { Link } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { parentApi } from '@/lib/api';
import type { DailyReport } from '@/types';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function childStats(childId: string, reports: DailyReport[]) {
  const own = reports.filter(r => r.childId === childId).sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const r of own) {
    if (!r.streakMaintained) break;
    streak++;
  }
  const totalXp = own.reduce((sum, r) => sum + r.xpEarned, 0);
  return { streak, totalXp };
}

export function ParentDashboard() {
  const user = useAuth(s => s.user);

  const { data: children } = useQuery({
    queryKey: ['parent.children'],
    queryFn: () => parentApi.getChildren(user!.id),
    enabled: !!user,
  });

  const childIds = children?.map(c => c.childId) ?? [];
  const { data: reports } = useQuery({
    queryKey: ['parent.reports.all', childIds],
    queryFn: async () => (await Promise.all(childIds.map(id => parentApi.getReports(id)))).flat(),
    enabled: childIds.length > 0,
  });

  const allReports = reports ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = Date.now() - 7 * 86_400_000;
  const reportsThisWeek = allReports.filter(r => new Date(r.date).getTime() >= weekAgo);

  const totalXpThisWeek = reportsThisWeek.reduce((sum, r) => sum + r.xpEarned, 0);
  const activeToday = new Set(allReports.filter(r => r.date === today).map(r => r.childId)).size;

  const activityByDate = new Map<string, number>();
  for (const r of reportsThisWeek) activityByDate.set(r.date, (activityByDate.get(r.date) ?? 0) + r.minutesSpent);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86_400_000);
    return { label: DAY_LABELS[(d.getDay() + 6) % 7], mins: activityByDate.get(d.toISOString().slice(0, 10)) ?? 0 };
  });
  const peak = Math.max(60, ...days.map(d => d.mins));
  const avgMinutes = Math.round(days.reduce((s, d) => s + d.mins, 0) / 7);

  const notifications = (children ?? []).flatMap(c => {
    const todayReport = allReports.find(r => r.childId === c.childId && r.date === today);
    if (!todayReport) return [`⏰ ${c.name} hasn't started today's session yet`];
    if (todayReport.streakMaintained) return [`🔥 ${c.name} kept their streak going today`];
    return [];
  });

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle="Parent Dashboard" bannerSubtitle="Track your child's learning progress" />

        <section className="flex-1 min-h-0 overflow-auto flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard label="Children linked" value={String(children?.length ?? 0)} accent="mint" />
            <StatCard label="Active today"     value={String(activeToday)} accent="sky" />
            <StatCard label="Total XP this week" value={totalXpThisWeek.toLocaleString()} accent="gold" />
          </div>

          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">My Children</h3>
              <Link to="/onboarding" className="btn-mint text-xs px-4 py-2">+ Link a child</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {children?.map(c => {
                const { streak, totalXp } = childStats(c.childId, allReports);
                return (
                  <Link key={c.id} to={`/parent/child/${c.childId}`}
                        className="crystal-card flex items-center gap-4 p-4 hover:bg-white/[0.04] transition">
                    <img className="w-14 h-14 rounded-2xl object-cover" src={c.avatarUrl} alt={c.name}/>
                    <div className="flex-1">
                      <p className="font-bold text-white">{c.name}</p>
                      <p className="text-xs text-slate-400">Age {c.age} · Linked {new Date(c.linkedAt).toLocaleDateString()}</p>
                      <div className="mt-2 flex gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-cosmic-mint/15 border border-cosmic-mint/40 text-cosmic-mint">🔥 {streak} day streak</span>
                        <span className="px-2 py-0.5 rounded-full bg-cosmic-sky/15 border border-cosmic-sky/40 text-cosmic-sky">⭐ {totalXp} XP</span>
                      </div>
                    </div>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="glass-panel p-5">
              <h3 className="text-lg font-bold text-white mb-3">This week's activity</h3>
              <div className="grid grid-cols-7 gap-1.5 h-24 items-end">
                {days.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-md bg-gradient-to-t from-cosmic-sky to-cosmic-mint"
                         style={{ height: `${(d.mins / peak) * 100}%` }}/>
                    <span className="text-[10px] text-slate-400">{d.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">Average: {avgMinutes} minutes/day</p>
            </div>

            <div className="glass-panel p-5">
              <h3 className="text-lg font-bold text-white mb-3">Recent notifications</h3>
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400">No updates yet — check back after your children start a session.</p>
              ) : (
                <ul className="flex flex-col gap-2.5 text-xs">
                  {notifications.map((n, i) => <li key={i} className="flex gap-3"><span>{n}</span></li>)}
                </ul>
              )}
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
