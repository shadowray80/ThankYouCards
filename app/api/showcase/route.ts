import { supabaseAdmin } from '@/lib/supabase';

// Public — used by the home page to render whichever example cards are live.
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('showcase_cards')
    .select('*')
    .eq('is_live', true)
    .order('display_order', { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ cards: data ?? [] });
}
