import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword, createSession } from '@/lib/passwords';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_EMAIL = 10;
const MAX_FAILS_PER_IP = 30;

const WRONG = 'Incorrect email or password. New here, or forgotten it? Tap "Set or reset password".';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || null;

  if (!email || !password) return Response.json({ error: 'Enter your email and password.' }, { status: 400 });

  // Slow down password guessing: too many recent failures for this email or IP → wait.
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const [byEmail, byIp] = await Promise.all([
    supabaseAdmin.from('login_attempts').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', since),
    ip
      ? supabaseAdmin.from('login_attempts').select('id', { count: 'exact', head: true }).eq('ip', ip).gte('created_at', since)
      : Promise.resolve({ count: 0, error: null }),
  ]);
  if (byEmail.error || byIp.error) {
    return Response.json({ error: 'Login is unavailable right now — please try again shortly.' }, { status: 503 });
  }
  if ((byEmail.count ?? 0) >= MAX_FAILS_PER_EMAIL || (byIp.count ?? 0) >= MAX_FAILS_PER_IP) {
    return Response.json({ error: 'Too many attempts — please wait 15 minutes and try again.' }, { status: 429 });
  }

  const { data: account } = await supabaseAdmin
    .from('account_passwords')
    .select('password_hash')
    .eq('email', email)
    .maybeSingle();

  const ok = account ? await verifyPassword(password, account.password_hash) : false;
  if (!ok) {
    await supabaseAdmin.from('login_attempts').insert({ email, ip });
    return Response.json({ error: WRONG }, { status: 401 });
  }

  const session = await createSession(email);
  if ('error' in session) return Response.json({ error: session.error }, { status: 500 });

  return Response.json({ email, session_token: session.session_token });
}
