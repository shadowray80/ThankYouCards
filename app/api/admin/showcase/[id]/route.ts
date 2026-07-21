import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { email, session_token, ...fields } = body;

  if (!(await requireAdmin(email, session_token))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const allowed = [
    'kind', 'group_style', 'recipient_name', 'occasion', 'card_message', 'card_note',
    'card_image_url', 'card_palette', 'card_logo_url', 'card_logo_scale', 'sender_name', 'solo_message',
    'sample_messages', 'display_order', 'is_live',
  ];
  const update: Record<string, unknown> = {};
  for (const key of allowed) if (key in fields) update[key] = fields[key];

  const { data, error } = await supabaseAdmin
    .from('showcase_cards')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ card: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { email, session_token } = await request.json();

  if (!(await requireAdmin(email, session_token))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const { error } = await supabaseAdmin.from('showcase_cards').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
