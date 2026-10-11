import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';

// Admin actions on an opted-in customer card:
//   dismiss / undismiss  — hide it from (or bring it back to) the customer cards page
//   mark_exported        — record that its Instagram image was downloaded
//   add_to_homepage      — copy it (cover + the sender's message) into the homepage carousel, live
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { email, session_token, action } = await request.json();

  if (!(await requireAdmin(email, session_token))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const { data: card, error: cardError } = await supabaseAdmin
    .from('campaigns')
    .select('id, recipient_name, occasion, card_message, card_image_url, card_style, card_palette, card_logo_url, card_logo_scale, deadline, feature_ok, status, feature_showcase_id')
    .eq('id', id)
    .single();
  if (cardError || !card) return Response.json({ error: 'Card not found' }, { status: 404 });
  if (!card.feature_ok || card.status !== 'sent' || card.deadline) {
    return Response.json({ error: "This card isn't opted in to being featured" }, { status: 403 });
  }

  const update = async (fields: Record<string, unknown>) => {
    const { error } = await supabaseAdmin.from('campaigns').update(fields).eq('id', id);
    return error ? Response.json({ error: error.message }, { status: 500 }) : Response.json({ ok: true, ...fields });
  };

  if (action === 'dismiss') return update({ feature_dismissed: true });
  if (action === 'undismiss') return update({ feature_dismissed: false });
  if (action === 'mark_exported') return update({ feature_exported_at: new Date().toISOString() });

  if (action === 'add_to_homepage') {
    if (card.feature_showcase_id) {
      const { data: existing } = await supabaseAdmin.from('showcase_cards').select('id').eq('id', card.feature_showcase_id).maybeSingle();
      if (existing) return Response.json({ error: 'Already on the homepage' }, { status: 409 });
    }

    const { data: last } = await supabaseAdmin
      .from('showcase_cards')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: sender } = await supabaseAdmin
      .from('contributions')
      .select('contributor_name, message')
      .eq('campaign_id', card.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    const { data: showcase, error } = await supabaseAdmin
      .from('showcase_cards')
      .insert({
        kind: 'solo',
        group_style: null,
        recipient_name: card.recipient_name,
        occasion: card.occasion,
        card_message: card.card_message,
        card_image_url: card.card_image_url,
        card_palette: card.card_palette,
        card_logo_url: card.card_logo_url,
        card_logo_scale: card.card_logo_scale ?? 1,
        sender_name: sender?.contributor_name ?? null,
        solo_message: sender?.message ?? null,
        sample_messages: [],
        display_order: (last?.display_order ?? 0) + 1,
        is_live: true,
      })
      .select('id')
      .single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return update({ feature_showcase_id: showcase.id });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}
