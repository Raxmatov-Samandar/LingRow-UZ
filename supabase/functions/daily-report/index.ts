// Cron: every day at 20:00 Asia/Tashkent
//   1. Aggregate per-child report → daily_reports
//   2. SMS each parent who opted in with a short summary
//
// Trigger via:  supabase functions deploy daily-report  +  Supabase Cron schedule:
//   "0 15 * * *"   (15:00 UTC = 20:00 Tashkent)
// Pass header  X-Cron-Secret: <DAILY_REPORT_SECRET>  to authenticate.

import { jsonResponse, preflight, serverError } from '../_shared/cors.ts';
import { serviceClient }            from '../_shared/supabase.ts';
import { sendSms }                  from '../_shared/eskiz.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();

  const secret = Deno.env.get('DAILY_REPORT_SECRET');
  if (secret && req.headers.get('X-Cron-Secret') !== secret) {
    return jsonResponse({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const sb = serviceClient();

    // 1) Build today's reports (Postgres function does the aggregation)
    const today = new Date().toISOString().slice(0, 10);
    const { data: built } = await sb.rpc('build_daily_reports', { p_date: today });
    console.info(`[daily-report] built reports for ${built ?? 0} children`);

    // 2) Compose & send SMS to each parent that opted-in
    const { data: rows } = await sb.from('parent_children')
      .select(`
        parent_profiles!inner ( phone, user_id ),
        child_id,
        profiles!parent_children_child_id_fkey ( name )
      `).eq('is_active', true);

    let sent = 0;
    for (const link of rows ?? []) {
      const phone = (link as any).parent_profiles?.phone;
      const childName = (link as any).profiles?.name ?? 'Child';
      if (!phone) continue;

      const { data: ctl } = await sb.from('parental_controls')
        .select('notify_daily_summary').eq('child_id', link.child_id).maybeSingle();
      if (!ctl?.notify_daily_summary) continue;

      const { data: rep } = await sb.from('daily_reports')
        .select('*').eq('child_id', link.child_id).eq('date', today).maybeSingle();
      if (!rep) continue;

      const lines = [
        `LingRow daily report`,
        `${childName}, ${today}:`,
        `✓ ${rep.lessons_done} lessons (${rep.minutes_spent} min)`,
        rep.streak_maintained ? '🔥 streak kept' : '⚠ streak missed',
        `+${rep.xp_earned} XP`,
      ];
      try { await sendSms(phone, lines.join('\n')); sent++; }
      catch (e) { console.error('SMS failed', e); }
    }

    return jsonResponse({ ok: true, reports_built: built, sms_sent: sent });
  } catch (e) {
    return serverError(e);
  }
});
