import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cosmos } from '@/components/layout/Cosmos';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAuth } from '@/store/auth';
import type { UserRole } from '@/types';

interface RoleDef { id: UserRole; emoji: string; titleKey: string; subKey: string }
const ROLES: RoleDef[] = [
  { id: 'student', emoji: '👦', titleKey: 'role.student', subKey: 'role.studentSub' },
  { id: 'adult',   emoji: '🎓', titleKey: 'role.adult',   subKey: 'role.adultSub' },
  { id: 'parent',  emoji: '👨‍👩‍👧', titleKey: 'role.parent',  subKey: 'role.parentSub' },
];

export function Login() {
  const { t } = useTranslation();
  const [step, setStep] = useState<'role' | 'creds'>('role');
  const [role, setRoleLocal] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setRole, signIn } = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const user = await signIn(email, password);
      setRole(user.role);
      navigate(user.role === 'parent' ? '/parent' : '/home');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally { setLoading(false); }
  }

  const activeRoleTitle = t(ROLES.find(r => r.id === role)?.titleKey ?? 'role.student');

  return (
    <>
      <Cosmos />
      <div className="absolute top-4 right-4 z-20"><LanguageSwitcher /></div>
      <div className="h-screen flex items-center justify-center px-6">
        <div className="glass-panel w-full max-w-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-no-repeat"
                 style={{ backgroundImage: "url('/logo.png')", backgroundPosition: 'center', backgroundSize: '180% auto',
                          filter: 'drop-shadow(0 0 14px rgba(126,247,180,0.4))' }} />
            <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">LingRow</h1>
          </div>

          {step === 'role' ? (
            <>
              <h2 className="text-xl font-bold text-white mb-1">{t('login.welcome')}</h2>
              <p className="text-sm text-slate-400 mb-6">{t('login.pickRole')}</p>

              <div className="flex flex-col gap-3 mb-6">
                {ROLES.map(r => (
                  <button key={r.id}
                          onClick={() => setRoleLocal(r.id)}
                          className={`crystal-card text-left p-4 transition ${role === r.id ? 'ring-2 ring-cosmic-mint/50' : 'hover:bg-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{r.emoji}</span>
                      <div>
                        <p className="font-bold text-white">{t(r.titleKey)}</p>
                        <p className="text-xs text-slate-400">{t(r.subKey)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button className="btn-mint w-full" onClick={() => setStep('creds')}>{t('common.continue')}</button>

              <p className="text-xs text-slate-400 text-center mt-5">
                {t('login.noAccount')} <Link to="/register" className="text-cosmic-mint">{t('common.signUp')}</Link>
              </p>
            </>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <button type="button" onClick={() => setStep('role')} className="text-xs text-slate-400 self-start mb-1">{t('login.changeRole')}</button>
              <h2 className="text-xl font-bold text-white">{t('login.signInAs')} <span className="text-cosmic-mint">{activeRoleTitle}</span></h2>
              <p className="text-xs text-slate-400 mb-2">{t('login.demoNote')}</p>

              <input className="input-glass" type="email" placeholder={t('login.email')}
                     value={email} onChange={e => setEmail(e.target.value)} required />
              <input className="input-glass" type="password" placeholder={t('login.password')}
                     value={password} onChange={e => setPassword(e.target.value)} required />

              {error && <p className="text-xs text-red-300">{error}</p>}

              <button className="btn-mint mt-3" disabled={loading}>{loading ? t('login.signingIn') : t('login.signIn')}</button>

              <div className="my-3 flex items-center gap-2 text-xs text-slate-500">
                <div className="flex-1 h-px bg-white/10"/>{t('login.or')}<div className="flex-1 h-px bg-white/10"/>
              </div>

              <button type="button" className="btn-ghost py-2.5">{t('login.continueGoogle')}</button>
              <button type="button" className="btn-ghost py-2.5">{t('login.signInPhone')}</button>

              <p className="text-xs text-slate-400 text-center mt-3">
                {t('login.newHere')} <Link to="/register" className="text-cosmic-mint">{t('login.createOne')}</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
