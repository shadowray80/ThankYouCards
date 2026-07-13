import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: campaign, error } = await supabaseAdmin
    .from('campaigns')
    .select('id, slug, recipient_name, occasion, card_theme, card_message, card_image_url, funded_amount, target_amount, status, card_style, card_palette, card_logo_url, card_text_on_image')
    .eq('slug', slug)
    .single();

  if (error || !campaign) {
    return Response.json({ error: 'Campaign not found' }, { status: 404 });
  }

  const { data: contributions } = await supabaseAdmin
    .from('contributions')
    .select('contributor_name, message, photo_url, photo_label')
    .eq('campaign_id', campaign.id)
    .eq('status', 'paid')
    .order('created_at', { ascending: true });

  return Response.json({ campaign, contributions: contributions ?? [] });
}
