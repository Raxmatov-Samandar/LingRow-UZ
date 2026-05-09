// POST /functions/v1/otp-send  { phone: "+998901234567" }
// 1. Generate 6-digit code
// 2. Hash + store in otp_codes (10 min expiry)
// 3. Send via Eskiz SMS

import { jsonResponse, preflight }           from '../_shared/cors.ts';
import { serviceClient }                     from '../_shared/supabase.ts';
import { sendSms }                           from '../_shared/eskiz.ts';

async function hash(s: string) {
  const enc = new TextEncoder().encode(s + (Deno.env.get('OTP_SALT') ?? 'lingrow-salt'));
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  try {
    const { phone } = await req.json();
    if (!/^\+?\d{9,15}$/.test(phone)) return jsonResponse({ error: 'invalid phone' }, { status: 400 });

    const code      = String(Math.floor(100000 + Math.random() * 900000));
    const code_hash = await hash(code);
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

    const sb = serviceClient();
    // Throttle: max 3 OTPs in 10 minutes
    const { count } = await sb
      .from('otp_codes')
      .select('id', { count: 'exact', head: true })
      .eq('phone', phone)
      .gte('created_at', new Date(Date.now() - 10 * 60_000).toISOString());
    if ((count ?? 0) >= 3) return jsonResponse({ error: 'too many OTPs — wait 10 minutes' }, { status: 429 });

    await sb.from('otp_codes').insert({ phone, code_hash, expires_at: expiresAt });
    await sendSms(phone, `LingRow code: ${code}. Valid for 10 minutes.`);

    return jsonResponse({ ok: true });
  } catch (e) {
    return jsonResponse({ error: (e as Error).message }, { status: 500 });
  }
});
