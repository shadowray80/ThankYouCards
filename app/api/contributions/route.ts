import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { campaign_id, contributor_name, message, contributor_email, photo_url } = body;

  if (!campaign_id || !contributor_name) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: campaign } = await supabaseAdmin
    .from('campaigns')
    .select('status')
    .eq('id', campaign_id)
    .single();

  if (!campaign || campaign.status !== 'open') {
    return Response.json({ error: 'Campaign is no longer accepting contributions' }, { status: 409 });
  }

  const { data, error } = await supabaseAdmin
    .from('contributions')
    .insert({
      campaign_id,
      contributor_name,
      message: message ?? null,
      photo_url: photo_url ?? null,
      amount: 0,
      status: 'paid',
      contributor_email: contributor_email ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('Create contribution error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ contribution: data }, { status: 201 });
}
