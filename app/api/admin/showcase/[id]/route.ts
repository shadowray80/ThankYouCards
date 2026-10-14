import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';

// A gallery entry: on/off the homepage carousel, or its place in the order.
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

  const update: Record<string, unknown> = {};
  if (typeof fields.is_live === 'boolean') update.is_live = fields.is_live;
  if (Number.isInteger(fields.display_order)) update.display_order = fields.display_order;

  const { error } = await supabaseAdmin.from('showcase_cards').update(update).eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

// Take an entry out of the gallery. The card itself is untouched.
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
