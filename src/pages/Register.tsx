import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { PasswordField } from '@/components/login/PasswordField';
import type { UserRole } from '@/types';

const ROLES: { id: UserRole; label: string }[] = [
  { id: 'student', label: 'O‘quvchi' },
  { id: 'adult', label: 'Kattalar / IELTS' },
  { id: 'dtm', label: 'DTM' },
  { id: 'parent', label: 'Ota-ona' },
];

export function Register() {
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
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const user = await signUp({ name, email, password, role, age: role !== 'parent' && typeof age === 'number' ? age : undefined });
      storeSetRole(user.role);
      navigate('/onboarding');
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'EMAIL_CONFIRMATION_REQUIRED') setConfirmEmailSent(true);
      else setError(err instanceof Error ? err.message : 'Qayta urinib ko‘ring.');
    } finally { setLoading(false); }
  }

  if (confirmEmailSent) return (
    <div className="valley-card valley-confirm">
      <h1>Emailni tasdiqlang</h1>
      <p role="status"><strong>{email}</strong> manziliga tasdiqlash havolasi yuborildi. Emailingizni tasdiqlab, akkauntingizga kiring.</p>
      <Link to="/login" className="valley-register">Kirish</Link>
    </div>
  );

  return (
    <div className="valley-card valley-register-card">
      <h1>Ro‘yxatdan o‘tish</h1>
      <form onSubmit={submit}>
        <div className="valley-roles" role="group" aria-label="Akkaunt turi">
          {ROLES.map(item => <button key={item.id} type="button" aria-pressed={role === item.id} onClick={() => setRole(item.id)}>{item.label}</button>)}
        </div>
        <label className="valley-field"><span className="sr-only">Ism va familiya</span><input placeholder="Ism va familiya" autoComplete="name" value={name} onChange={e => setName(e.target.value)} required /></label>
        {role !== 'parent' && <label className="valley-field"><span className="sr-only">Yosh</span><input type="number" placeholder="Yosh" min={6} max={99} value={age} onChange={e => setAge(e.target.value ? Number(e.target.value) : '')} required /></label>}
        <label className="valley-field"><span className="sr-only">Email</span><input type="email" placeholder="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <PasswordField placeholder="Parol (kamida 6 belgi)" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
        {error && <p className="valley-message" role="alert">{error}</p>}
        <button className="valley-submit" disabled={loading}>{loading ? 'Yaratilmoqda…' : 'Ro‘yxatdan o‘tish'}</button>
      </form>
      <div className="valley-divider"><span />yoki<span /></div>
      <Link to="/login" className="valley-register">Kirish</Link>
    </div>
  );
}
