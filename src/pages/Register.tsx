import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cosmos } from '@/components/layout/Cosmos';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAuth } from '@/store/auth';
import type { UserRole } from '@/types';

export function Register() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  const { signUp, setRole: storeSetRole } = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const user = await signUp({ name, email, password, role, age: typeof age === 'number' ? age : undefined });
      storeSetRole(user.role);
      navigate('/onboarding');
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'EMAIL_CONFIRMATION_REQUIRED') {
        setConfirmEmailSent(true);
      } else {
        setError(err instanceof Error ? err.message : t('common.error'));
      }
    } finally { setLoading(false); }
  }

  if (confirmEmailSent) {
    return (
      <>
        <Cosmos />
        <div className="h-screen flex items-center justify-center px-6">
          <div className="glass-panel w-full max-w-md p-8 flex flex-col gap-3 text-center">
            <p className="text-4xl mb-1">📩</p>
            <h1 className="text-xl font-bold text-white">{t('register.confirmEmailTitle')}</h1>
            <p className="text-sm text-slate-300 leading-relaxed">{t('register.confirmEmailBody', { email })}</p>
            <Link to="/login" className="btn-mint mt-3">{t('common.signIn')}</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Cosmos />
      <div className="absolute top-4 right-4 z-20"><LanguageSwitcher /></div>
      <div className="h-screen flex items-center justify-center px-6">
        <form onSubmit={submit} className="glass-panel w-full max-w-md p-8 flex flex-col gap-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-no-repeat"
                 style={{ backgroundImage: "url('/logo.png')", backgroundPosition: 'center', backgroundSize: '180% auto',
                          filter: 'drop-shadow(0 0 12px rgba(126,247,180,0.4))' }} />
            <h1 className="text-2xl font-bold text-white">{t('register.title')}</h1>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            {(['student', 'adult', 'dtm', 'parent'] as UserRole[]).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition
                                  ${role === r
                                    ? 'bg-cosmic-mint/20 border border-cosmic-mint/50 text-cosmic-mint'
                                    : 'border border-white/10 text-slate-300 hover:bg-white/5'}`}>
                {t(`role.${r}`)}
              </button>
            ))}
          </div>

          <input className="input-glass" placeholder={t('register.fullName')} value={name} onChange={e => setName(e.target.value)} required />
          {role !== 'parent' && (
            <input className="input-glass" type="number" placeholder={t('register.age')} min={6} max={99}
                   value={age} onChange={e => setAge(e.target.value ? Number(e.target.value) : '')} required />
          )}
          <input className="input-glass" type="email" placeholder={t('register.emailLabel')} value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input-glass" type="password" placeholder={t('register.passwordLabel')}
                 value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />

          {error && <p className="text-xs text-red-300">{error}</p>}

          <button className="btn-mint mt-2" disabled={loading}>{loading ? t('register.creating') : t('register.submit')}</button>

          <p className="text-xs text-slate-400 text-center mt-2">
            {t('register.haveAccount')} <Link to="/login" className="text-cosmic-mint">{t('common.signIn')}</Link>
          </p>
        </form>
      </div>
    </>
  );
}
