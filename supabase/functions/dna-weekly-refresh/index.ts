// Cron: once a week (e.g. Monday 06:00 Asia/Tashkent).
// Blends the last 7 days of quiz performance on category-tagged lessons into
// each learner's DNA scores, so the profile moves between full diagnostic
// retakes. See weekly_dna_refresh() for the actual blending logic.
//
// Trigger via Supabase Cron, same pattern as daily-report:
//   "0 1 * * 1"   (01:00 UTC Monday = 06:00 Tashkent)
// Pass header  X-Cron-Secret: <DAILY_REPORT_SECRET>  to authenticate
// (reuses the same secret as daily-report — both are cron-only, service-side
// triggers with no user-facing surface).

import { jsonResponse, preflight } from '../_shared/cors.ts';
import { serviceClient }           from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();

  const secret = Deno.env.get('DAILY_REPORT_SECRET');
  if (secret && req.headers.get('X-Cron-Secret') !== secret) {
    return jsonResponse({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const sb = serviceClient();
    const { data: updated, error } = await sb.rpc('weekly_dna_refresh');
    if (error) throw error;

    console.info(`[dna-weekly-refresh] updated ${updated ?? 0} category scores`);
    return jsonResponse({ ok: true, updated });
  } catch (e) {
    return jsonResponse({ error: (e as Error).message }, { status: 500 });
  }
});
