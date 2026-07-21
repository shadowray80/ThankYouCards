import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') ?? '';
  const sessionToken = request.nextUrl.searchParams.get('session_token') ?? '';

  if (!(await requireAdmin(email, sessionToken))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('showcase_cards')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ cards: data ?? [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, session_token, ...fields } = body;

  if (!(await requireAdmin(email, session_token))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }
  if (!fields.kind || !fields.recipient_name) {
    return Response.json({ error: 'Missing kind or recipient_name' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('showcase_cards')
    .insert({
      kind: fields.kind,
      group_style: fields.group_style ?? null,
      recipient_name: fields.recipient_name,
      occasion: fields.occasion ?? null,
      card_message: fields.card_message ?? null,
      card_note: fields.card_note ?? null,
      card_image_url: fields.card_image_url ?? null,
      card_palette: fields.card_palette ?? null,
      card_logo_url: fields.card_logo_url ?? null,
      card_logo_scale: fields.card_logo_scale ?? 1,
      sender_name: fields.sender_name ?? null,
      solo_message: fields.solo_message ?? null,
      sample_messages: fields.sample_messages ?? [],
      display_order: fields.display_order ?? 0,
      is_live: fields.is_live ?? false,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ card: data }, { status: 201 });
}
