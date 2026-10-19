import { supabaseAdmin } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/isAdminEmail';

// The public columns of a card — what its recipient's view page gets (no tokens or emails).
export const PUBLIC_CARD_COLUMNS =
  'id, slug, recipient_name, occasion, card_theme, card_message, card_note, card_image_url, funded_amount, card_style, card_palette, card_logo_url, card_logo_scale, card_logo_position, card_accent, card_text_on_image, card_font, card_text_color, card_text_stroke, card_sign_off';

// Pulls the card slug out of anything pasted: a share, view, organiser or print link, or the slug itself.
export function slugFromLink(link: string): string | null {
  const text = link.trim();
  const fromPath = text.match(/\/(?:card|view|manage|print)\/([a-z0-9-]+)/i);
  const slug = fromPath ? fromPath[1] : text;
  return /^[a-z0-9-]{3,80}$/i.test(slug) ? slug.toLowerCase() : null;
}

// Which cards may go in the homepage gallery: cards an admin made (Tim's examples, paid or not),
// and solo cards whose sender ticked "Happy for us to feature this card". Never anyone else's
// group card: its messages belong to the people who wrote them.
export function canFeature(card: { organiser_email: string | null; deadline: string | null; feature_ok: boolean | null; status: string }): boolean {
  if (card.organiser_email && isAdminEmail(card.organiser_email)) return true;
  return !card.deadline && !!card.feature_ok && card.status === 'sent';
}

// Each linked card's public details and its messages, keyed by campaign id.
export async function loadLinkedCards(campaignIds: string[]) {
  const cards = new Map<string, { campaign: Record<string, unknown>; contributions: Record<string, unknown>[] }>();
  if (campaignIds.length === 0) return cards;
  const { data: campaigns } = await supabaseAdmin.from('campaigns').select(PUBLIC_CARD_COLUMNS).in('id', campaignIds);
  const { data: messages } = await supabaseAdmin
    .from('contributions')
    .select('campaign_id, contributor_name, message, photo_url, photo_label')
    .in('campaign_id', campaignIds)
    .eq('status', 'paid')
    .order('created_at', { ascending: true });
  for (const c of campaigns ?? []) cards.set(c.id, { campaign: c, contributions: [] });
  for (const { campaign_id, ...m } of messages ?? []) cards.get(campaign_id)?.contributions.push(m);
  return cards;
}
