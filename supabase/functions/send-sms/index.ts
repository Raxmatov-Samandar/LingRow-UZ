// Generic SMS sender (admin only) — useful for ad-hoc parent notifications.
// POST /functions/v1/send-sms  { phone: string, message: string }
import { jsonResponse, preflight } from '../_shared/cors.ts';
import { getCallerUser, serviceClient } from '../_shared/supabase.ts';
import { sendSms }                  from '../_shared/eskiz.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  try {
    const user = await getCallerUser(req);
    if (!user) return jsonResponse({ error: 'unauthorized' }, { status: 401 });

    const sb = serviceClient();
    const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'parent') {
      return jsonResponse({ error: 'parent role required' }, { status: 403 });
    }

    const { phone, message } = await req.json();
    if (!phone || !message) return jsonResponse({ error: 'phone and message required' }, { status: 400 });

    await sendSms(phone, message);
    return jsonResponse({ ok: true });
  } catch (e) {
    return jsonResponse({ error: (e as Error).message }, { status: 500 });
  }
});
