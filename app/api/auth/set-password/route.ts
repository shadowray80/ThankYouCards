import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword, createSession, MIN_PASSWORD_LENGTH } from '@/lib/passwords';

// Which email a still-valid link belongs to, so the page can show it and give the
// browser's password manager a username to save the new password against.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? '';
  const { data: link } = await supabaseAdmin
    .from('login_links')
    .select('email, expires_at, used')
    .eq('token', token)
    .maybeSingle();
  if (!link || link.used || new Date(link.expires_at) < new Date()) {
    return Response.json({ error: 'This link has expired or already been used — request a new one.' }, { status: 410 });
  }
  return Response.json({ email: link.email });
}

// Sets (or resets) an account's password using an emailed link token — the token is what
// proves the person owns the email address — then logs them in.
export async function POST(request: NextRequest) {
  const { token, password } = await request.json();
  if (!token) return Response.json({ error: 'Missing link token.' }, { status: 400 });
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return Response.json({ error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 });
  }

  const { data: link, error } = await supabaseAdmin
    .from('login_links')
    .select('id, email, expires_at, used')
    .eq('token', token)
    .single();

  if (error || !link) return Response.json({ error: 'This link is invalid.' }, { status: 404 });
  if (link.used) return Response.json({ error: 'This link has already been used — request a new one.' }, { status: 410 });
  if (new Date(link.expires_at) < new Date()) return Response.json({ error: 'This link has expired — request a new one.' }, { status: 410 });

  const password_hash = await hashPassword(password);
  const { error: saveError } = await supabaseAdmin
    .from('account_passwords')
    .upsert({ email: link.email, password_hash, updated_at: new Date().toISOString() }, { onConflict: 'email' });
  if (saveError) {
    console.error('Save password error:', saveError);
    return Response.json({ error: saveError.message }, { status: 500 });
  }

  await supabaseAdmin.from('login_links').update({ used: true }).eq('id', link.id);

  const session = await createSession(link.email);
  if ('error' in session) return Response.json({ error: session.error }, { status: 500 });

  return Response.json({ email: link.email, session_token: session.session_token });
}
