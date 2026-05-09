// Eskiz SMS provider helper (https://eskiz.uz)
// Auth flow:
//   1) POST /api/auth/login  with {email, password}  → token (valid ~30 days)
//   2) POST /api/message/sms/send  with {mobile_phone, message, from}  → message id
// We cache the token in memory per warm worker; refresh on 401.

import { serviceClient } from './supabase.ts';

const ESKIZ_BASE = 'https://notify.eskiz.uz';
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const email    = Deno.env.get('ESKIZ_EMAIL');
  const password = Deno.env.get('ESKIZ_PASSWORD');
  if (!email || !password) throw new Error('ESKIZ_EMAIL / ESKIZ_PASSWORD not configured');

  const fd = new FormData();
  fd.append('email', email);
  fd.append('password', password);

  const res  = await fetch(`${ESKIZ_BASE}/api/auth/login`, { method: 'POST', body: fd });
  const json = await res.json();
  if (!res.ok || !json?.data?.token) throw new Error('Eskiz login failed: ' + JSON.stringify(json));

  cachedToken = { value: json.data.token, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 25 };
  return cachedToken.value;
}

export async function sendSms(toPhone: string, message: string) {
  const token = await getToken();
  const fd = new FormData();
  fd.append('mobile_phone', toPhone.replace(/^\+/, ''));   // Eskiz wants 998901234567
  fd.append('message',      message);
  fd.append('from',         Deno.env.get('ESKIZ_FROM') ?? '4546');

  const res = await fetch(`${ESKIZ_BASE}/api/message/sms/send`, {
    method:  'POST',
    body:    fd,
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));

  // log to sms_log
  try {
    const sb = serviceClient();
    await sb.from('sms_log').insert({
      to_phone: toPhone,
      body:     message,
      provider: 'eskiz',
      status:   res.ok ? 'sent' : 'failed',
    });
  } catch (_) { /* non-fatal */ }

  if (!res.ok) throw new Error(`Eskiz send failed: ${JSON.stringify(data)}`);
  return data;
}
