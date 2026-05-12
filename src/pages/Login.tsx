import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { SeasonalLoginScene } from '@/components/login/SeasonalLoginScene';
import { useAuth } from '@/store/auth';
import type { UserRole } from '@/types';

interface RoleDef { id: UserRole; emoji: string; titleKey: string }
const ROLES: RoleDef[] = [
  { id: 'student', emoji: '👦',   titleKey: 'role.student' },
  { id: 'adult',   emoji: '🎓',   titleKey: 'role.adult'   },
  { id: 'dtm',     emoji: '🎯',   titleKey: 'role.dtm'     },
  { id: 'parent',  emoji: '👨‍👩‍👧', titleKey: 'role.parent'  },
];

export function Login() {
  const { t } = useTranslation();
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
      const user = await signIn(email, password, role);
      setRole(user.role);
      navigate(
        user.role === 'parent' ? '/parent'
      : user.role === 'dtm'    ? '/dtm/home'
      : '/home'
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally { setLoading(false); }
  }

  return (
    <>
      <div className="absolute top-4 right-4 z-30"><LanguageSwitcher /></div>
      <SeasonalLoginScene>
        <h2>{t('login.welcome')}</h2>

        {/* Role chips */}
        <div className="role-grid">
          {ROLES.map(r => (
            <button key={r.id}
                    type="button"
                    onClick={() => setRoleLocal(r.id)}
                    className={`season-role-chip ${role === r.id ? 'active' : ''}`}>
              <span>{r.emoji}</span>
              <span>{t(r.titleKey)}</span>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input className="season-input"
                 type="email" placeholder={t('login.email')}
                 value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="season-input"
                 type="password" placeholder={t('login.password')}
                 value={password} onChange={e => setPassword(e.target.value)} required />

          {error && <p className="text-xs text-red-300 font-medium">{error}</p>}

          <button className="season-btn" disabled={loading}>
            {loading ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>

        <p className="text-xs text-center mt-4" style={{ color: 'color-mix(in srgb, var(--title-color) 75%, transparent)' }}>
          {t('login.noAccount')}{' '}
          <Link to="/register" style={{ color: 'var(--title-color)', fontWeight: 600, textDecoration: 'underline' }}>
            {t('common.signUp')}
          </Link>
        </p>
      </SeasonalLoginScene>
    </>
  );
}
