import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: campaign, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !campaign) {
    return Response.json({ error: 'Campaign not found' }, { status: 404 });
  }

  const { data: contributions } = await supabaseAdmin
    .from('contributions')
    .select('id, contributor_name, message, amount, created_at')
    .eq('campaign_id', campaign.id)
    .eq('status', 'paid')
    .order('created_at', { ascending: true });

  return Response.json({ campaign, contributions: contributions ?? [] });
}
