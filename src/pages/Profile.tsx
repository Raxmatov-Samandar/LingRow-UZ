import { useTranslation } from 'react-i18next';
import { Cosmos } from '@/components/layout/Cosmos';
import { AppShell } from '@/components/layout/AppShell';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/store/auth';
import { isDevUser } from '@/lib/dev';

export function Profile() {
  const { t } = useTranslation();
  const { user, onboarding, signOut } = useAuth();
  const dash = (v: string | number | undefined): string => (v == null || v === '' ? t('profile.fields.none') : String(v));
  const isDev = isDevUser(user);

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
            <h3 className="mt-3 text-xl font-bold text-white flex items-center justify-center gap-2">
              {user?.name}
              {isDev && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cosmic-mint text-slate-900 tracking-wider">
                  {t('dev.badge')}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <p className="mt-3 px-3 py-1 inline-block text-xs rounded-full bg-cosmic-mint/15 border border-cosmic-mint/40 text-cosmic-mint">
              {user?.role ? t(`role.${user.role}`) : ''} · {user?.plan ?? t('profile.free')}
            </p>
            <button className="mt-5 btn-ghost w-full" onClick={signOut}>{t('common.signOut')}</button>
          </aside>

          <div className="grid grid-cols-2 gap-5 content-start">
            <Card title={t('profile.fields.goal')} value={dash(onboarding.goal && t(`onboarding.goal.${onboarding.goal}`))} />
            <Card title={t('profile.fields.level')} value={dash(onboarding.level && t(`onboarding.level.${onboarding.level}`))} />
            <Card title={t('profile.fields.dailyTarget')} value={onboarding.dailyMinutes ? `${onboarding.dailyMinutes} ${t('profile.fields.perDay')}` : t('profile.fields.none')} />
            <Card title={t('profile.fields.bandTarget')} value={dash(onboarding.bandTarget?.toString())} />
            <Card title={t('profile.fields.examDate')} value={dash(onboarding.examDate)} />
            <Card title={t('profile.fields.memberSince')} value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : t('profile.fields.none')} />
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
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}
