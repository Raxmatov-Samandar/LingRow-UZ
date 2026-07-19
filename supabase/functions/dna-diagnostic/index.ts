// Edge function: Uzbek Error DNA diagnostic grading.
// POST /functions/v1/dna-diagnostic  { answers: [{ question_id: string, selected_index: number }] }
// → { scores: Record<category, number>, weakest_category: string | null, narrative?: string }
//
// Grading itself happens inside submit_diagnostic() (Postgres, security definer)
// so the answer key never has to be trusted to — or even visible to — this
// function's caller. This function only verifies the caller, forwards their
// answers via the service-role client, and optionally asks Claude for a
// short, encouraging narrative on top of the deterministic scores.

import { corsHeaders, jsonResponse, preflight } from '../_shared/cors.ts';
import { getCallerUser, serviceClient }         from '../_shared/supabase.ts';
import { chat }                                 from '../_shared/anthropic.ts';

const MAX_ANSWERS = 40; // 20-question test; generous cap against abuse, not a hard business rule

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  try {
    const user = await getCallerUser(req);
    if (!user) return jsonResponse({ error: 'unauthorized' }, { status: 401 });

    const { answers } = await req.json();
    if (!Array.isArray(answers) || answers.length === 0) {
      return jsonResponse({ error: 'answers required' }, { status: 400 });
    }
    if (answers.length > MAX_ANSWERS) {
      return jsonResponse({ error: `too many answers (max ${MAX_ANSWERS})` }, { status: 400 });
    }
    for (const a of answers) {
      if (typeof a?.question_id !== 'string' || typeof a?.selected_index !== 'number') {
        return jsonResponse({ error: 'each answer needs question_id and selected_index' }, { status: 400 });
      }
    }

    const sb = serviceClient();
    const { data: scores, error } = await sb.rpc('submit_diagnostic', {
      p_user: user.id,
      p_answers: answers,
    });
    if (error) throw error;

    const entries = Object.entries(scores ?? {}) as [string, number][];
    const weakest = entries.length
      ? entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
      : null;

    let narrative: string | undefined;
    try {
      const { text } = await chat([{
        role: 'user',
        content: `A learner's Uzbek Error DNA diagnostic scores (0-100, higher = bigger problem): ${JSON.stringify(scores)}. Weakest category: ${weakest}. Write 2 short encouraging sentences in English pointing them at that one category to work on first.`,
      }], {
        system: 'You are a warm, concise IELTS coach. Two sentences max. No markdown.',
        maxTokens: 150, temperature: 0.4,
      });
      narrative = text;
    } catch (_) {
      // Non-fatal — the deterministic scores are the source of truth; a
      // missing ANTHROPIC_API_KEY should never break the diagnostic result.
    }

    return jsonResponse({ scores, weakest_category: weakest, narrative }, { headers: corsHeaders });
  } catch (e) {
    return jsonResponse({ error: (e as Error).message }, { status: 500 });
  }
});
