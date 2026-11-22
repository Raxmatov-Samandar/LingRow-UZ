// Edge function: AI Speaking analyzer
// Workflow:
//   1. Client uploads the audio (multipart/form-data, field "audio") + "target" sentence.
//   2. We push the audio to Supabase Storage (bucket "speaking").
//   3. We run STT — Whisper API (OpenAI) is the simplest external option;
//      swap with Eleven Labs / a self-hosted Whisper as needed.
//   4. We send the transcript + target to Claude for scoring.
//   5. We persist the AI feedback row + return the result.
//
// POST /functions/v1/grade-speaking  multipart  audio=…  target="…"
// → { accuracy, fluency, pronunciation, transcript, tip }

import { corsHeaders, jsonResponse, preflight, serverError } from '../_shared/cors.ts';
import { getCallerUser, serviceClient }         from '../_shared/supabase.ts';
import { chat, extractJson }                    from '../_shared/anthropic.ts';
import { underAiQuota }                         from '../_shared/rateLimit.ts';

const STT_API = 'https://api.openai.com/v1/audio/transcriptions';

const SYSTEM = `You are an English pronunciation coach.
Compare a learner's spoken transcript with the target sentence and return JSON only:
{
  "accuracy": 0-100,        // word-for-word correctness
  "fluency": 0-100,         // pace, hesitation, filler words
  "pronunciation": 0-100,   // qualitative clarity
  "tip": "<one short coaching sentence>"
}`;

async function transcribe(audio: Blob): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');
  const fd = new FormData();
  // Whisper formatni fayl kengaytmasidan aniqlaydi: veb .webm yuboradi,
  // Flutter ilova esa .m4a — shuning uchun asl nomni saqlaymiz.
  fd.append('file', audio, (audio as File).name || 'audio.webm');
  fd.append('model', 'whisper-1');
  fd.append('response_format', 'json');
  fd.append('language', 'en');
  const res = await fetch(STT_API, {
    method:  'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body:    fd,
  });
  if (!res.ok) throw new Error(`Whisper ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.text as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  try {
    const user = await getCallerUser(req);
    if (!user) return jsonResponse({ error: 'unauthorized' }, { status: 401 });

    const sb = serviceClient();
    if (!(await underAiQuota(sb, user.id))) {
      return jsonResponse({ error: 'Daily AI usage limit reached — try again tomorrow' }, { status: 429 });
    }

    const fd = await req.formData();
    const audio  = fd.get('audio')  as File | null;
    const target = (fd.get('target') as string | null)?.toString() ?? '';
    if (!audio)  return jsonResponse({ error: 'audio file required' }, { status: 400 });
    if (!target) return jsonResponse({ error: 'target sentence required' }, { status: 400 });
    if (audio.size > 10 * 1024 * 1024) {
      return jsonResponse({ error: 'audio too large (max 10MB)' }, { status: 400 });
    }

    // 1) Upload to Storage
    const path = `${user.id}/${crypto.randomUUID()}.webm`;
    const up = await sb.storage.from('speaking').upload(path, audio, { contentType: audio.type });
    if (up.error) throw up.error;
    const { data: signed } = await sb.storage.from('speaking').createSignedUrl(path, 60 * 60 * 24);

    // 2) Transcribe
    const transcript = await transcribe(audio);

    // 3) Score via Claude
    const { text: aiText } = await chat([{
      role: 'user',
      content: `Target: "${target}"\nTranscript: "${transcript}"\nReturn JSON only.`,
    }], { system: SYSTEM, maxTokens: 256, temperature: 0.2 });
    const score = extractJson<{ accuracy: number; fluency: number; pronunciation: number; tip: string }>(aiText);

    // 4) Persist
    await sb.from('ai_feedback').insert({
      user_id:       user.id,
      kind:          'speaking',
      submission:    transcript,
      audio_url:     signed?.signedUrl,
      accuracy:      score.accuracy,
      fluency:       score.fluency,
      pronunciation: score.pronunciation,
      feedback:      score,
    });

    return jsonResponse({ ...score, transcript }, { headers: corsHeaders });
  } catch (e) {
    return serverError(e);
  }
});
