import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 401 });
  }

  const { data: campaign, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .eq('organiser_token', token)
    .single();

  if (error || !campaign) {
    return Response.json({ error: 'Not found or invalid token' }, { status: 404 });
  }

  const { data: contributions } = await supabaseAdmin
    .from('contributions')
    .select('id, contributor_name, message, photo_url, photo_label, amount, status, created_at')
    .eq('campaign_id', campaign.id)
    .eq('status', 'paid')
    .order('created_at', { ascending: true });

  return Response.json({ campaign, contributions: contributions ?? [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const { token, action } = body;

  if (!token) return Response.json({ error: 'Missing token' }, { status: 401 });
  if (!['mark_sent', 'update_palette', 'update_logo', 'update_card'].includes(action)) return Response.json({ error: 'Unknown action' }, { status: 400 });

  const { data: campaign, error } = await supabaseAdmin
    .from('campaigns')
    .select('id, status')
    .eq('slug', slug)
    .eq('organiser_token', token)
    .single();

  if (error || !campaign) return Response.json({ error: 'Not found or invalid token' }, { status: 404 });

  if (action === 'update_card') {
    const { card_message, card_note, occasion, card_image_url, card_text_on_image } = body;
    const { error: updateError } = await supabaseAdmin
      .from('campaigns')
      .update({ card_message: card_message ?? null, card_note: card_note ?? null, occasion: occasion ?? null, card_image_url: card_image_url ?? null, card_text_on_image: card_text_on_image ?? true })
      .eq('id', campaign.id);
    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  if (action === 'update_logo') {
    const { card_logo_url } = body;
    const { error: updateError } = await supabaseAdmin
      .from('campaigns')
      .update({ card_logo_url: card_logo_url ?? null })
      .eq('id', campaign.id);
    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  if (action === 'update_palette') {
    const { card_palette } = body;
    if (!card_palette) return Response.json({ error: 'Missing card_palette' }, { status: 400 });
    const { error: updateError } = await supabaseAdmin
      .from('campaigns')
      .update({ card_palette })
      .eq('id', campaign.id);
    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  if (campaign.status === 'sent') return Response.json({ ok: true });

  const { error: updateError } = await supabaseAdmin
    .from('campaigns')
    .update({ status: 'sent' })
    .eq('id', campaign.id)
    .eq('status', 'open');

  if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
  return Response.json({ ok: true });
}
