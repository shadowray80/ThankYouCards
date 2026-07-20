import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  if (!token) return Response.json({ error: 'Missing token' }, { status: 400 });

  const { data: link, error } = await supabaseAdmin
    .from('login_links')
    .select('id, email, expires_at, used')
    .eq('token', token)
    .single();

  if (error || !link) return Response.json({ error: 'This login link is invalid.' }, { status: 404 });
  if (link.used) return Response.json({ error: 'This login link has already been used — request a new one.' }, { status: 410 });
  if (new Date(link.expires_at) < new Date()) return Response.json({ error: 'This login link has expired — request a new one.' }, { status: 410 });

  await supabaseAdmin.from('login_links').update({ used: true }).eq('id', link.id);

  const session_token = randomUUID();
  const { error: sessionError } = await supabaseAdmin
    .from('organiser_sessions')
    .upsert({ email: link.email, session_token }, { onConflict: 'email' });

  if (sessionError) {
    console.error('Create session error:', sessionError);
    return Response.json({ error: sessionError.message }, { status: 500 });
  }

  return Response.json({ email: link.email, session_token });
}
