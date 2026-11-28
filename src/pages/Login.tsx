import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { PasswordField } from '@/components/login/PasswordField';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signIn, setRole } = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage(''); setLoading(true);
    try {
      const user = await signIn(email, password);
      setRole(user.role);
      navigate(user.role === 'parent' ? '/parent' : user.role === 'dtm' ? '/dtm/home' : '/home');
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Qayta urinib ko‘ring.');
    } finally { setLoading(false); }
  }

  return (
        <div className="valley-card">
          <h1>Kirish</h1>
          <form onSubmit={submit}>
            <label className="valley-field"><span className="sr-only">Email</span><input id="valley-email" type="email" placeholder="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
            <PasswordField placeholder="Parol" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
            {message && <p className="valley-message" role="status">{message}</p>}
            <button className="valley-submit" disabled={loading}>{loading ? 'Kirilmoqda…' : 'Kirish'}</button>
          </form>
          <div className="valley-divider"><span />yoki<span /></div>
          <Link className="valley-register" to="/register">Ro‘yxatdan o‘tish</Link>
        </div>
  );
}
