import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { sendLoginLink } from '@/lib/email';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Enter a valid email address' }, { status: 400 });
  }

  // Rate limit: at most 3 link requests per email per 15 minutes, so this can't be used
  // to spam someone's inbox.
  const { count: recentCount } = await supabaseAdmin
    .from('login_links')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

  if ((recentCount ?? 0) >= 3) {
    return Response.json({ error: 'Too many login links requested — please wait a few minutes and try again.' }, { status: 429 });
  }

  const token = randomUUID();
  const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin
    .from('login_links')
    .insert({ email, token, expires_at });

  if (error) {
    console.error('Create login link error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const origin = request.headers.get('origin') ?? 'https://thankyoucards.au';
  const sendResult = await sendLoginLink({ to: email, loginUrl: `${origin}/login/verify?token=${token}` })
    .catch(err => ({ ok: false as const, error: err instanceof Error ? err.message : 'Failed to send' }));

  if (!sendResult.ok) {
    return Response.json({ error: `Couldn't send that email: ${sendResult.error}` }, { status: 502 });
  }

  return Response.json({ ok: true });
}
