// =============================================================================
// transcribe-lesson — turns a lesson's audio/video into a TIMED transcript.
//
// The lesson player needs cues with real start/end seconds so the transcript can
// follow playback (and freeze on pause). Whisper's `verbose_json` response
// format returns exactly that, per segment.
//
// POST multipart/form-data { media: File }           → transcribe an upload
// POST application/json    { url: string }           → fetch, then transcribe
// → { cues: [{ start, end, text }], duration, language }
//
// Auth + the shared daily AI quota apply, same as grade-speaking.
// =============================================================================
import { corsHeaders, jsonResponse, preflight, serverError } from '../_shared/cors.ts';
import { getCallerUser, serviceClient }                      from '../_shared/supabase.ts';
import { underAiQuota }                                      from '../_shared/rateLimit.ts';

const STT_API = 'https://api.openai.com/v1/audio/transcriptions';

// Whisper's hard limit is 25 MB. Reject early with a clear message rather than
// letting OpenAI return an opaque 413.
const MAX_BYTES = 25 * 1024 * 1024;

export interface Cue { start: number; end: number; text: string }

interface WhisperSegment { start: number; end: number; text: string }

async function transcribeTimed(media: Blob, filename: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const fd = new FormData();
  fd.append('file', media, filename);
  fd.append('model', 'whisper-1');
  // verbose_json is what carries per-segment start/end times.
  fd.append('response_format', 'verbose_json');
  fd.append('timestamp_granularities[]', 'segment');
  fd.append('language', 'en');

  const res = await fetch(STT_API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: fd,
  });
  if (!res.ok) throw new Error(`Whisper ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const segments: WhisperSegment[] = data.segments ?? [];

  const cues: Cue[] = segments
    .map((s) => ({
      start: Number(s.start),
      end: Number(s.end),
      text: String(s.text ?? '').trim(),
    }))
    .filter((c) => c.text.length > 0 && Number.isFinite(c.start) && Number.isFinite(c.end));

  return { cues, duration: Number(data.duration ?? 0), language: String(data.language ?? 'en') };
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

    const contentType = req.headers.get('content-type') ?? '';
    let media: Blob;
    let filename = 'lesson.mp3';

    if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData();
      const file = fd.get('media') as File | null;
      if (!file) return jsonResponse({ error: 'media file required' }, { status: 400 });
      if (file.size > MAX_BYTES) {
        return jsonResponse(
          { error: `File is ${(file.size / 1048576).toFixed(1)} MB — Whisper accepts up to 25 MB. Upload the audio track instead of the full video.` },
          { status: 413 },
        );
      }
      media = file;
      filename = file.name || filename;
    } else {
      const { url } = await req.json().catch(() => ({ url: null }));
      if (!url || typeof url !== 'string') {
        return jsonResponse({ error: 'url required' }, { status: 400 });
      }
      // NOTE: this fetches a direct media file. Streaming sites (YouTube, Vimeo)
      // do not serve their media at the page URL, so those must be uploaded as a
      // file instead — the caller is expected to surface that.
      const src = await fetch(url);
      if (!src.ok) return jsonResponse({ error: `Could not fetch media (${src.status})` }, { status: 400 });

      const len = Number(src.headers.get('content-length') ?? 0);
      if (len > MAX_BYTES) {
        return jsonResponse(
          { error: `Remote file is ${(len / 1048576).toFixed(1)} MB — Whisper accepts up to 25 MB.` },
          { status: 413 },
        );
      }
      media = await src.blob();
      if (media.size > MAX_BYTES) {
        return jsonResponse({ error: 'Remote file exceeds the 25 MB Whisper limit.' }, { status: 413 });
      }
      filename = url.split('/').pop()?.split('?')[0] || filename;
    }

    const result = await transcribeTimed(media, filename);
    if (!result.cues.length) {
      return jsonResponse({ error: 'No speech detected in that media.' }, { status: 422 });
    }

    return jsonResponse(result, { headers: corsHeaders });
  } catch (err) {
    return serverError(err);
  }
});
