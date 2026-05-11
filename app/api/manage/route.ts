import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 });
  }

  const { data: campaign } = await supabaseAdmin
    .from('campaigns')
    .select('slug')
    .eq('organiser_token', token)
    .single();

  if (!campaign) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json({ slug: campaign.slug });
}
