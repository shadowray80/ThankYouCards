import { supabaseAdmin } from '@/lib/supabase';

const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function sessionIsValid(email: string, sessionToken: string): Promise<boolean> {
  if (!email || !sessionToken) return false;

  const { data } = await supabaseAdmin
    .from('organiser_sessions')
    .select('email, created_at')
    .eq('email', email)
    .eq('session_token', sessionToken)
    .single();

  if (!data) return false;
  return Date.now() - new Date(data.created_at).getTime() < SESSION_MAX_AGE_MS;
}
