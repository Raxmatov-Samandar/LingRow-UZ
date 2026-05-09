import { Link, useParams } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useQuery } from '@tanstack/react-query';
import { parentApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export function ChildProfile() {
  const { id = 'c1' } = useParams();
  const { data: children } = useQuery({ queryKey: ['parent.children'], queryFn: () => parentApi.getChildren('p1') });
  const { data: reports }  = useQuery({ queryKey: ['parent.reports', id], queryFn: () => parentApi.getReports(id) });
  const child = children?.find(c => c.childId === id);

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle={child?.name ?? 'Child'} bannerSubtitle={`Age ${child?.age ?? '—'} · Linked ${child ? new Date(child.linkedAt).toLocaleDateString() : '—'}`} />

        <section className="flex-1 min-h-0 overflow-auto flex flex-col gap-5">
          <Link to="/parent" className="text-xs text-slate-400 hover:text-white">← Back to dashboard</Link>

          <div className="grid grid-cols-4 gap-5">
            <Stat label="Today"     value={`${reports?.[reports.length - 1]?.minutesSpent ?? 0} min`} />
            <Stat label="Lessons"   value={String(reports?.[reports.length - 1]?.lessonsDone ?? 0)} />
            <Stat label="XP earned" value={String(reports?.reduce((a, r) => a + r.xpEarned, 0) ?? 0)} />
            <Stat label="Streak"    value="7 days" />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="glass-panel p-5">
              <h3 className="text-lg font-bold text-white mb-3">Daily activity</h3>
              <div className="h-[220px]">
                <ResponsiveContainer>
                  <BarChart data={reports ?? []}>
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={d => d.slice(5)} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
                    <Bar dataKey="minutesSpent" fill="#7ef7d3" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-5">
              <h3 className="text-lg font-bold text-white mb-3">Last 5 sessions</h3>
              <ul className="flex flex-col gap-2 text-sm">
                {reports?.slice().reverse().slice(0, 5).map(r => (
                  <li key={r.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10">
                    <span className="text-slate-300">{r.date}</span>
                    <span className="text-white font-semibold">{r.minutesSpent} min · {r.lessonsDone} lessons · {r.xpEarned} XP</span>
                    <span className={r.streakMaintained ? 'text-cosmic-mint' : 'text-rose-300'}>
                      {r.streakMaintained ? '🔥 streak' : '— missed'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </AppShell>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-5 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-extrabold text-white mt-1">{value}</p>
    </div>
  );
}
