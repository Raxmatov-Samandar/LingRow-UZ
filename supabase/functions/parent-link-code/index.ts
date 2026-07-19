// POST /functions/v1/parent-link-code  { childName: string, childPhone?: string }
// Auth: parent.
// Creates a 6-digit code (10-min expiry). If childPhone supplied, also SMS the code.
import { jsonResponse, preflight, serverError } from '../_shared/cors.ts';
import { getCallerUser, serviceClient } from '../_shared/supabase.ts';
import { sendSms } from '../_shared/eskiz.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  try {
    const user = await getCallerUser(req);
    if (!user) return jsonResponse({ error: 'unauthorized' }, { status: 401 });

    const { childName, childPhone } = await req.json();
    if (!childName) return jsonResponse({ error: 'childName required' }, { status: 400 });

    const sb = serviceClient();

    // Find or create parent_profiles row
    let { data: parent } = await sb.from('parent_profiles').select('*').eq('user_id', user.id).maybeSingle();
    if (!parent) {
      const ins = await sb.from('parent_profiles').insert({ user_id: user.id }).select().single();
      if (ins.error) throw ins.error;
      parent = ins.data;
    }

    const code        = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt   = new Date(Date.now() + 10 * 60_000).toISOString();

    // child_id stays NULL until the child redeems the code (parent-link-redeem
    // fills it in). Leaving it NULL — not the parent's own id — lets a parent
    // create more than one pending invite: unique(parent_id, child_id) never
    // fires because Postgres treats every NULL as distinct from every other.
    const { data, error } = await sb.from('parent_children').insert({
      parent_id: parent.id,
      link_code: code,
      code_expires_at: expiresAt,
      is_active: false,
    }).select().single();
    if (error) throw error;

    if (childPhone) {
      await sendSms(childPhone, `Your parent has invited you to LingRow. Enter code ${code} in the app to link your account.`);
    }

    return jsonResponse({ ok: true, code, expires_at: expiresAt, name: childName, link_id: data.id });
  } catch (e) {
    return serverError(e);
  }
});
