// Shared daily-quota guard for the AI endpoints (ielts-tutor, grade-writing,
// grade-speaking). Every one of them already writes a row to ai_feedback per
// call, so that table doubles as the usage counter — no new schema needed.
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

/** Returns true if the user is still under their daily AI-call quota. */
export async function underAiQuota(sb: SupabaseClient, userId: string, limit = 50): Promise<boolean> {
  const { count } = await sb
    .from('ai_feedback')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60_000).toISOString());
  return (count ?? 0) < limit;
}
