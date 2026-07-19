// Edge function: AI Writing grader (Claude Haiku)
// POST /functions/v1/grade-writing  { text: string, prompt?: string }
// → { score, accuracy, fluency, pronunciation, feedback }

import { corsHeaders, jsonResponse, preflight, serverError } from '../_shared/cors.ts';
import { getCallerUser, serviceClient }         from '../_shared/supabase.ts';
import { chat, extractJson }                    from '../_shared/anthropic.ts';
import { underAiQuota }                         from '../_shared/rateLimit.ts';

interface AiResponse {
  score: number;
  accuracy: number;
  fluency: number;
  style: number;
  feedback: Array<{ type: 'grammar'|'vocabulary'|'style'; line?: number; problem: string; suggestion: string }>;
  band_estimate?: number;
}

const SYSTEM = `You are an IELTS Writing examiner. Given an essay, return a single JSON object:
{
  "score": 0-100,
  "accuracy": 0-100,        // grammatical accuracy
  "fluency": 0-100,         // coherence & cohesion
  "style": 0-100,           // lexical resource
  "band_estimate": 4-9,
  "feedback": [
    { "type": "grammar"|"vocabulary"|"style", "line": <int|null>, "problem": "<short>", "suggestion": "<short>" }
  ]
}
Limit feedback to 5 most impactful items. Output JSON only — no prose, no fences.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();

  try {
    const user = await getCallerUser(req);
    if (!user) return jsonResponse({ error: 'unauthorized' }, { status: 401, headers: corsHeaders });

    const sb = serviceClient();
    if (!(await underAiQuota(sb, user.id))) {
      return jsonResponse({ error: 'Daily AI usage limit reached — try again tomorrow' }, { status: 429 });
    }

    const { text, prompt } = await req.json();
    if (!text || typeof text !== 'string' || text.length < 20) {
      return jsonResponse({ error: 'text must be ≥20 chars' }, { status: 400 });
    }
    if (text.length > 6000) {
      return jsonResponse({ error: 'text too long (max 6000 chars)' }, { status: 400 });
    }

    const userMsg = prompt
      ? `Topic: ${prompt}\n\nEssay:\n${text}`
      : `Essay:\n${text}`;

    const { text: aiText } = await chat([{ role: 'user', content: userMsg }], {
      system: SYSTEM, maxTokens: 1024, temperature: 0.1,
    });

    const data = extractJson<AiResponse>(aiText);

    // Persist
    await sb.from('ai_feedback').insert({
      user_id:       user.id,
      kind:          'writing',
      prompt:        prompt ?? null,
      submission:    text,
      score:         data.score,
      accuracy:      data.accuracy,
      fluency:       data.fluency,
      pronunciation: data.style,            // reuse column for "style" in writing
      feedback:      data,
    });

    return jsonResponse({
      score:         data.score,
      accuracy:      data.accuracy,
      fluency:       data.fluency,
      pronunciation: data.style,
      band_estimate: data.band_estimate,
      feedback:      data.feedback.map(f => `${f.type[0].toUpperCase() + f.type.slice(1)}: ${f.problem} → ${f.suggestion}`),
    });
  } catch (e) {
    return serverError(e);
  }
});
