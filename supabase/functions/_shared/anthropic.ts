// Tiny Anthropic Messages API helper for edge functions.
// Reference: https://docs.anthropic.com/en/api/messages
const API = 'https://api.anthropic.com/v1/messages';

/**
 * Default model for quality-sensitive work (tutor chat, writing grading).
 * Override per project with the ANTHROPIC_MODEL secret.
 */
const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-5';

/**
 * Cheap model for throwaway text where quality barely moves the product —
 * e.g. the two-sentence Error-DNA encouragement. Roughly half the cost of
 * Sonnet, and the deterministic scores are the real output anyway.
 */
export const CHEAP_MODEL = 'claude-haiku-4-5';

export interface AiMessage { role: 'user' | 'assistant'; content: string; }

export async function chat(
  messages: AiMessage[],
  opts?: { system?: string; maxTokens?: number; temperature?: number; model?: string },
) {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:       opts?.model ?? MODEL,
      max_tokens:  opts?.maxTokens  ?? 1024,
      temperature: opts?.temperature ?? 0.2,
      system:      opts?.system,
      messages,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Anthropic ${res.status}: ${txt}`);
  }
  const data = await res.json();
  // Concatenate text blocks
  const text = (data.content ?? [])
    .filter((c: { type: string }) => c.type === 'text')
    .map((c: { text: string }) => c.text)
    .join('\n');
  return { text, raw: data };
}

/** Parse a JSON object out of the model response (strips ```json fences). */
export function extractJson<T = unknown>(text: string): T {
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  return JSON.parse(cleaned) as T;
}
