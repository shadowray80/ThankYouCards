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
    .select('id, contributor_name, message, amount, status, created_at')
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
  if (action !== 'mark_sent') return Response.json({ error: 'Unknown action' }, { status: 400 });

  const { data: campaign, error } = await supabaseAdmin
    .from('campaigns')
    .select('id, status')
    .eq('slug', slug)
    .eq('organiser_token', token)
    .single();

  if (error || !campaign) return Response.json({ error: 'Not found or invalid token' }, { status: 404 });
  if (campaign.status === 'sent') return Response.json({ ok: true });

  const { error: updateError } = await supabaseAdmin
    .from('campaigns')
    .update({ status: 'sent' })
    .eq('id', campaign.id)
    .eq('status', 'open');

  if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
  return Response.json({ ok: true });
}
