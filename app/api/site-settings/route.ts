import { supabaseAdmin } from '@/lib/supabase';

// Public — read-only site-wide display settings (e.g. homepage carousel speed).
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('carousel_interval_seconds')
    .eq('id', 1)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
