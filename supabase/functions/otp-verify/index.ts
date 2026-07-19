// POST /functions/v1/otp-verify  { phone, code }
// → { ok: true, access_token, refresh_token } when verified
//
// Flow: we verify the OTP in our otp_codes table, then call admin-API
// generateLink to mint a session for the phone-keyed user (creating one if needed).
import { jsonResponse, preflight, serverError } from '../_shared/cors.ts';
import { serviceClient }           from '../_shared/supabase.ts';

async function hash(s: string) {
  const enc = new TextEncoder().encode(s + (Deno.env.get('OTP_SALT') ?? 'lingrow-salt'));
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) return jsonResponse({ error: 'phone and code required' }, { status: 400 });

    const sb = serviceClient();
    const { data: rows } = await sb.from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .gt('expires_at', new Date().toISOString())
      .is('consumed_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    const row = rows?.[0];
    if (!row) return jsonResponse({ error: 'no active code' }, { status: 400 });
    if (row.attempts >= 5) return jsonResponse({ error: 'too many attempts' }, { status: 429 });

    const expected = await hash(code);
    if (expected !== row.code_hash) {
      await sb.from('otp_codes').update({ attempts: row.attempts + 1 }).eq('id', row.id);
      return jsonResponse({ error: 'invalid code' }, { status: 400 });
    }

    await sb.from('otp_codes').update({ consumed_at: new Date().toISOString() }).eq('id', row.id);

    // ensure user exists — look up via profiles.phone (unique, indexed),
    // not admin.listUsers(): listUsers() only returns one page, so past the
    // first page-size worth of users, existing accounts would read as "not
    // found" and get a duplicate account created on every login.
    const cleanPhone     = phone.replace(/^\+/, '');
    const syntheticEmail = `${cleanPhone}@phone.lingrow.uz`;
    const { data: profile } = await sb.from('profiles').select('id').eq('phone', cleanPhone).maybeSingle();

    let user;
    if (profile) {
      const { data: got, error } = await sb.auth.admin.getUserById(profile.id);
      if (error) throw error;
      user = got.user;
    } else {
      // Give phone-only users a deterministic email too — generateLink()
      // below needs one, and without it here it would silently mint a
      // second, disconnected user record instead of linking this one.
      const { data: created, error } = await sb.auth.admin.createUser({
        phone: cleanPhone,
        phone_confirm: true,
        email: syntheticEmail,
        email_confirm: true,
      });
      if (error) throw error;
      user = created.user!;
    }

    // Mint a session the client can redeem with supabase.auth.verifyOtp()
    // directly (no redirect / action_link round-trip needed).
    const { data: link, error } = await sb.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email ?? syntheticEmail,
    });
    if (error) throw error;

    return jsonResponse({ ok: true, token_hash: link.properties?.hashed_token });
  } catch (e) {
    return serverError(e);
  }
});
