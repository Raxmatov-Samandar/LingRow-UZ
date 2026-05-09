// Service-role Supabase client. Use only in trusted edge functions.
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export function serviceClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Resolve the calling user (from Authorization: Bearer header). */
export async function getCallerUser(req: Request) {
  const url       = Deno.env.get('SUPABASE_URL')!;
  const anonKey   = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization') ?? '';
  const c = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await c.auth.getUser();
  return user;
}
