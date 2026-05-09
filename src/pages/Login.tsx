import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cosmos } from '@/components/layout/Cosmos';
import { useAuth } from '@/store/auth';
import type { UserRole } from '@/types';

const ROLES: { id: UserRole; emoji: string; title: string; sub: string }[] = [
  { id: 'student', emoji: '👦', title: 'Student',     sub: '10–16 years • Gamified learning' },
  { id: 'adult',   emoji: '🎓', title: 'Adult / IELTS', sub: '16+ • Cambridge tests, AI feedback' },
  { id: 'parent',  emoji: '👨‍👩‍👧', title: 'Parent',     sub: 'Track and guide your child' },
];

export function Login() {
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
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally { setLoading(false); }
  }

  return (
    <>
      <Cosmos />
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
              <h2 className="text-xl font-bold text-white mb-1">Welcome!</h2>
              <p className="text-sm text-slate-400 mb-6">Who are you signing in as?</p>

              <div className="flex flex-col gap-3 mb-6">
                {ROLES.map(r => (
                  <button key={r.id}
                          onClick={() => setRoleLocal(r.id)}
                          className={`crystal-card text-left p-4 transition ${role === r.id ? 'ring-2 ring-cosmic-mint/50' : 'hover:bg-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{r.emoji}</span>
                      <div>
                        <p className="font-bold text-white">{r.title}</p>
                        <p className="text-xs text-slate-400">{r.sub}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button className="btn-mint w-full" onClick={() => setStep('creds')}>Continue</button>

              <p className="text-xs text-slate-400 text-center mt-5">
                Don't have an account? <Link to="/register" className="text-cosmic-mint">Sign up</Link>
              </p>
            </>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <button type="button" onClick={() => setStep('role')} className="text-xs text-slate-400 self-start mb-1">← Change role</button>
              <h2 className="text-xl font-bold text-white">Sign in as <span className="text-cosmic-mint">{ROLES.find(r => r.id === role)?.title}</span></h2>
              <p className="text-xs text-slate-400 mb-2">Demo: any email / any password works.</p>

              <input className="input-glass" type="email" placeholder="Email"
                     value={email} onChange={e => setEmail(e.target.value)} required />
              <input className="input-glass" type="password" placeholder="Password"
                     value={password} onChange={e => setPassword(e.target.value)} required />

              {error && <p className="text-xs text-red-300">{error}</p>}

              <button className="btn-mint mt-3" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>

              <div className="my-3 flex items-center gap-2 text-xs text-slate-500">
                <div className="flex-1 h-px bg-white/10"/>OR<div className="flex-1 h-px bg-white/10"/>
              </div>

              <button type="button" className="btn-ghost py-2.5">Continue with Google</button>
              <button type="button" className="btn-ghost py-2.5">Sign in with phone (OTP)</button>

              <p className="text-xs text-slate-400 text-center mt-3">
                New here? <Link to="/register" className="text-cosmic-mint">Create an account</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
