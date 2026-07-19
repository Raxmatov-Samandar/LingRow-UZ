// POST /functions/v1/parent-link-redeem  { code: "123456" }
// Auth: child (logged-in user).
// Marks the parent_children row active and binds child_id to the caller.
import { jsonResponse, preflight, serverError } from '../_shared/cors.ts';
import { getCallerUser, serviceClient } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  try {
    const user = await getCallerUser(req);
    if (!user) return jsonResponse({ error: 'unauthorized' }, { status: 401 });

    const { code } = await req.json();
    if (!/^\d{6}$/.test(code)) return jsonResponse({ error: 'invalid code' }, { status: 400 });

    const sb = serviceClient();

    const { data: row } = await sb.from('parent_children')
      .select('*')
      .eq('link_code', code)
      .gt('code_expires_at', new Date().toISOString())
      .eq('is_active', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row) return jsonResponse({ error: 'code invalid or expired' }, { status: 400 });

    const upd = await sb.from('parent_children').update({
      child_id:        user.id,
      is_active:       true,
      linked_at:       new Date().toISOString(),
      link_code:       null,
      code_expires_at: null,
    }).eq('id', row.id).select().single();
    if (upd.error) throw upd.error;

    // Default parental controls
    await sb.from('parental_controls').insert({ child_id: user.id }).select();

    return jsonResponse({ ok: true, parent_id: row.parent_id });
  } catch (e) {
    return serverError(e);
  }
});
