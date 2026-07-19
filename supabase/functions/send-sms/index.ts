// Generic SMS sender (admin only) — useful for ad-hoc parent notifications.
// POST /functions/v1/send-sms  { phone: string, message: string }
import { jsonResponse, preflight, serverError } from '../_shared/cors.ts';
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
    if (message.length > 300) return jsonResponse({ error: 'message too long (max 300 chars)' }, { status: 400 });

    // Only let a parent SMS a phone that actually belongs to one of their own
    // linked, active children — otherwise this endpoint is a free SMS relay
    // to any number, billed to LingRow's Eskiz balance.
    const cleanPhone = phone.replace(/^\+/, '');
    const { data: parent } = await sb.from('parent_profiles').select('id').eq('user_id', user.id).maybeSingle();
    const { data: links } = parent
      ? await sb.from('parent_children')
          .select('profiles!parent_children_child_id_fkey(phone)')
          .eq('parent_id', parent.id).eq('is_active', true)
      : { data: [] as { profiles: { phone: string | null } | null }[] };
    const allowed = (links ?? []).some(l => l.profiles?.phone === cleanPhone);
    if (!allowed) return jsonResponse({ error: 'phone must belong to one of your linked children' }, { status: 403 });

    // Abuse cap: at most 10 ad-hoc messages to the same number per day.
    const { count } = await sb.from('sms_log')
      .select('id', { count: 'exact', head: true })
      .eq('to_phone', phone)
      .gte('sent_at', new Date(Date.now() - 24 * 60 * 60_000).toISOString());
    if ((count ?? 0) >= 10) return jsonResponse({ error: 'daily message limit reached for this contact' }, { status: 429 });

    await sendSms(phone, message);
    return jsonResponse({ ok: true });
  } catch (e) {
    return serverError(e);
  }
});
