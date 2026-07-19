// Shared CORS headers used by every edge function.
// Set APP_ORIGIN once the frontend has a real production domain — until
// then this falls back to '*' so local dev / preview deploys keep working.
export const corsHeaders = {
  'Access-Control-Allow-Origin':  Deno.env.get('APP_ORIGIN') ?? '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
}

export function preflight() {
  return new Response('ok', { headers: corsHeaders });
}

/**
 * Logs the real error server-side and returns a generic message to the
 * client — the raw exception text (library names, internal paths, SQL
 * fragments) has no business leaving the server.
 */
export function serverError(e: unknown) {
  console.error(e);
  return jsonResponse({ error: 'Internal server error' }, { status: 500 });
}
