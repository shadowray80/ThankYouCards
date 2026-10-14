import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
  if (!['mark_sent', 'update_palette', 'update_logo', 'update_card', 'update_deadline', 'update_cover_text'].includes(action)) return Response.json({ error: 'Unknown action' }, { status: 400 });

  const { data: campaign, error } = await supabaseAdmin
    .from('campaigns')
    .select('id, status, deadline')
    .eq('slug', slug)
    .eq('organiser_token', token)
    .single();

  if (error || !campaign) return Response.json({ error: 'Not found or invalid token' }, { status: 404 });

  // Change the contributor deadline (tap the "Days left" tile). Must stay set — a deadline is what
  // marks a group card — and can't be in the past.
  if (action === 'update_deadline') {
    const { deadline } = body;
    if (typeof deadline !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(deadline) || isNaN(Date.parse(deadline))) {
      return Response.json({ error: 'Pick a date' }, { status: 400 });
    }
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10); // allow for time zones
    if (deadline < yesterday) return Response.json({ error: 'Pick a date that hasn’t passed' }, { status: 400 });
    if (!campaign.deadline) return Response.json({ error: 'Only group cards have a deadline' }, { status: 400 });
    const { error: updateError } = await supabaseAdmin.from('campaigns').update({ deadline }).eq('id', campaign.id);
    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
    return Response.json({ ok: true, deadline });
  }

  // "Show name & text on photo" — saved as soon as it's switched.
  if (action === 'update_cover_text') {
    const { error: updateError } = await supabaseAdmin
      .from('campaigns')
      .update({ card_text_on_image: body.card_text_on_image !== false })
      .eq('id', campaign.id);
    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
    return Response.json({ ok: true });
  }

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
    const { card_logo_url, card_logo_scale, card_logo_position } = body;
    const { error: updateError } = await supabaseAdmin
      .from('campaigns')
      .update({ card_logo_url: card_logo_url ?? null, card_logo_scale: card_logo_scale ?? 1, card_logo_position: card_logo_position ?? 'left' })
      .eq('id', campaign.id);
    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  if (action === 'update_palette') {
    const { card_palette, card_accent } = body;
    if (!card_palette) return Response.json({ error: 'Missing card_palette' }, { status: 400 });
    const { error: updateError } = await supabaseAdmin
      .from('campaigns')
      .update({ card_palette, card_accent: card_accent ?? null })
      .eq('id', campaign.id);
    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  if (campaign.status === 'sent') return Response.json({ ok: true });

  // Sending is only free for a solo card (no deadline, at most one message). Anything else
  // needs a completed Stripe checkout for this exact campaign — paid, or $0 via a promo code.
  const { count: messageCount, error: countError } = await supabaseAdmin
    .from('contributions')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaign.id);
  if (countError) return Response.json({ error: countError.message }, { status: 500 });

  const isFreeSolo = !campaign.deadline && (messageCount ?? 0) <= 1;
  if (!isFreeSolo) {
    const sessionId = typeof body.session_id === 'string' ? body.session_id : '';
    if (!sessionId) return Response.json({ error: 'Payment required' }, { status: 402 });
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const paid = session.status === 'complete'
        && (session.payment_status === 'paid' || session.payment_status === 'no_payment_required')
        && session.metadata?.campaign_id === campaign.id;
      if (!paid) return Response.json({ error: 'Payment not completed' }, { status: 402 });
    } catch {
      return Response.json({ error: 'Could not confirm payment' }, { status: 402 });
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from('campaigns')
    .update({ status: 'sent' })
    .eq('id', campaign.id)
    .eq('status', 'open');

  if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
  return Response.json({ ok: true });
}
