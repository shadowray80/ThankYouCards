import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sessionIsValid } from '@/lib/organiserSession';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') ?? '';
  const sessionToken = request.nextUrl.searchParams.get('session_token') ?? '';

  if (!(await sessionIsValid(email, sessionToken))) {
    return Response.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('brand_kits')
    .select('id, name, card_palette, card_logo_url, created_at')
    .eq('email', email)
    .order('created_at', { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ brandKits: data ?? [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, session_token, name, card_palette, card_logo_url } = body;

  if (!(await sessionIsValid(email, session_token))) {
    return Response.json({ error: 'Not signed in' }, { status: 401 });
  }
  if (!name || !card_palette) {
    return Response.json({ error: 'Missing name or card_palette' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('brand_kits')
    .insert({ email, name, card_palette, card_logo_url: card_logo_url ?? null })
    .select('id, name, card_palette, card_logo_url, created_at')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ brandKit: data }, { status: 201 });
}
