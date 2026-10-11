import { supabaseAdmin } from '@/lib/supabase';

// Public — used by CardPicker to render the real card library.
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('cards')
    .select('id, image_url, category, subcategory, style, tags')
    .eq('is_active', true)
    .is('superseded_at', null);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ cards: data ?? [] });
}
