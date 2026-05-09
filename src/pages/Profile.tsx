import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/store/auth';

export function Profile() {
  const { user, onboarding, signOut } = useAuth();

  return (
    <>
      <Cosmos />
      <AppShell>
        <Topbar variant="search" />

        <section className="flex-1 min-h-0 overflow-auto grid grid-cols-[260px_1fr] gap-5">
          <aside className="glass-panel p-6 text-center">
            <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-blue-400 to-violet-400 grid place-items-center text-3xl font-bold text-white border-2 border-white/30">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <h3 className="mt-3 text-xl font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <p className="mt-3 px-3 py-1 inline-block text-xs rounded-full bg-cosmic-mint/15 border border-cosmic-mint/40 text-cosmic-mint capitalize">
              {user?.role} · {user?.plan ?? 'Free'}
            </p>
            <button className="mt-5 btn-ghost w-full" onClick={signOut}>Sign out</button>
          </aside>

          <div className="grid grid-cols-2 gap-5 content-start">
            <Card title="Goal" value={onboarding.goal ?? '—'} />
            <Card title="Level" value={onboarding.level ?? '—'} />
            <Card title="Daily target" value={onboarding.dailyMinutes ? `${onboarding.dailyMinutes} min/day` : '—'} />
            <Card title="IELTS band target" value={onboarding.bandTarget?.toString() ?? '—'} />
            <Card title="Exam date" value={onboarding.examDate ?? '—'} />
            <Card title="Member since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} />
          </div>
        </section>
      </AppShell>
    </>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="glass-panel p-5">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 text-lg font-bold text-white capitalize">{value}</p>
    </div>
  );
}
