// Tiny Anthropic Messages API helper for edge functions.
// Reference: https://docs.anthropic.com/en/api/messages
const API = 'https://api.anthropic.com/v1/messages';
const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-haiku-4-5';

export interface AiMessage { role: 'user' | 'assistant'; content: string; }

export async function chat(messages: AiMessage[], opts?: { system?: string; maxTokens?: number; temperature?: number }) {
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
      model:       MODEL,
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
