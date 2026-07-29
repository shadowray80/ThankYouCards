import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Both actions are organiser-only (editing typos, removing something inappropriate) —
// verified via the same organiser_token used everywhere else, by walking contribution
// -> campaign_id -> campaigns.organiser_token rather than trusting the contribution id
// alone (ids are unguessable, but that's not the same as authorised).
async function verifyOwnership(id: string, token: string): Promise<boolean> {
  if (!token) return false;
  const { data: contribution } = await supabaseAdmin
    .from('contributions')
    .select('campaign_id')
    .eq('id', id)
    .single();
  if (!contribution) return false;

  const { data: campaign } = await supabaseAdmin
    .from('campaigns')
    .select('id')
    .eq('id', contribution.campaign_id)
    .eq('organiser_token', token)
    .maybeSingle();
  return !!campaign;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { token, message } = await request.json();

  if (!(await verifyOwnership(id, token))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from('contributions')
    .update({ message: message ?? null })
    .eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { token } = await request.json();

  if (!(await verifyOwnership(id, token))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from('contributions')
    .delete()
    .eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
