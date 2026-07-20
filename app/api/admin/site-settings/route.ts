import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { email, session_token, carousel_interval_seconds } = body;

  if (!(await requireAdmin(email, session_token))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const seconds = Number(carousel_interval_seconds);
  if (!Number.isFinite(seconds) || seconds < 2 || seconds > 30) {
    return Response.json({ error: 'Carousel speed must be between 2 and 30 seconds' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .update({ carousel_interval_seconds: seconds, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
