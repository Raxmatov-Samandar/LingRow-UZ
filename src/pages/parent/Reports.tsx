import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useQuery } from '@tanstack/react-query';
import { parentApi } from '@/lib/api';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function Reports() {
  const { data: children } = useQuery({ queryKey: ['parent.children'], queryFn: () => parentApi.getChildren('p1') });

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="banner" bannerTitle="Reports" bannerSubtitle="Weekly + monthly progress for each child" />

        <section className="flex-1 min-h-0 overflow-auto flex flex-col gap-5">
          {children?.map(c => <ChildReport key={c.childId} childId={c.childId} name={c.name} />)}
        </section>
      </AppShell>
    </>
  );
}

function ChildReport({ childId, name }: { childId: string; name: string }) {
  const { data: reports } = useQuery({ queryKey: ['parent.reports', childId], queryFn: () => parentApi.getReports(childId) });
  const total = reports?.reduce((a, r) => a + r.minutesSpent, 0) ?? 0;
  const lessons = reports?.reduce((a, r) => a + r.lessonsDone, 0) ?? 0;

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <div className="flex gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-cosmic-mint/15 border border-cosmic-mint/40 text-cosmic-mint">Total: {total} min</span>
          <span className="px-2.5 py-1 rounded-full bg-cosmic-sky/15 border border-cosmic-sky/40 text-cosmic-sky">Lessons: {lessons}</span>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer>
          <LineChart data={reports ?? []}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={d => d.slice(5)} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: '#0a1530', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                     labelStyle={{ color: '#fff' }} itemStyle={{ color: '#7ef7d3' }} />
            <Line type="monotone" dataKey="minutesSpent" stroke="#7ef7d3" strokeWidth={2} dot={{ fill: '#7ef7d3', r: 4 }} />
            <Line type="monotone" dataKey="xpEarned"     stroke="#5aa9ff" strokeWidth={2} dot={{ fill: '#5aa9ff', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
