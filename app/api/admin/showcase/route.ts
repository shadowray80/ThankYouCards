import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';
import { slugFromLink, canFeature } from '@/lib/showcase';

// The homepage gallery: every entry, in carousel order, with a summary of the card it links to.
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

  const ids = (data ?? []).map(r => r.campaign_id).filter(Boolean);
  const { data: campaigns } = ids.length
    ? await supabaseAdmin.from('campaigns').select('id, slug, recipient_name, card_occasion, card_style, card_image_url, deadline, status').in('id', ids)
    : { data: [] };
  const byId = new Map((campaigns ?? []).map(c => [c.id, c]));

  const cards = (data ?? []).map(r => ({
    id: r.id,
    is_live: r.is_live,
    display_order: r.display_order,
    card: r.campaign_id ? byId.get(r.campaign_id) ?? null : null,
    // Older entries made in the retired builder: no linked card, just their copied fields.
    legacy: r.campaign_id ? null : { recipient_name: r.recipient_name, kind: r.kind, group_style: r.group_style, card_image_url: r.card_image_url },
  }));
  return Response.json({ cards });
}

// Add a card to the gallery from a pasted link. It goes in at the end, not yet on the homepage.
export async function POST(request: NextRequest) {
  const { email, session_token, link } = await request.json();

  if (!(await requireAdmin(email, session_token))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const slug = slugFromLink(typeof link === 'string' ? link : '');
  if (!slug) return Response.json({ error: 'Paste a card link' }, { status: 400 });

  const { data: card } = await supabaseAdmin
    .from('campaigns')
    .select('id, recipient_name, card_style, deadline, organiser_email, feature_ok, status')
    .eq('slug', slug)
    .maybeSingle();
  if (!card) return Response.json({ error: 'Couldn’t find that card' }, { status: 404 });
  if (!canFeature(card)) {
    return Response.json({ error: 'Only your own cards, or solo cards whose sender said they’re happy to be featured, can go in the gallery' }, { status: 403 });
  }

  const { data: existing } = await supabaseAdmin.from('showcase_cards').select('id').eq('campaign_id', card.id).maybeSingle();
  if (existing) return Response.json({ error: 'That card is already in the gallery' }, { status: 409 });

  const { data: last } = await supabaseAdmin
    .from('showcase_cards')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabaseAdmin.from('showcase_cards').insert({
    campaign_id: card.id,
    // The old copy columns are kept filled so the table reads sensibly; the homepage uses the live card.
    kind: card.deadline ? 'group' : 'solo',
    group_style: card.deadline ? card.card_style : null,
    recipient_name: card.recipient_name,
    sample_messages: [],
    display_order: (last?.display_order ?? 0) + 1,
    is_live: false,
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true }, { status: 201 });
}
