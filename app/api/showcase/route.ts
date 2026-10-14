import { supabaseAdmin } from '@/lib/supabase';
import { loadLinkedCards } from '@/lib/showcase';

// Public — used by the home page to render whichever example cards are live. Entries linked to
// a real card come with that card (public details + messages) so it's drawn live; older entries
// carry their own copied fields.
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('showcase_cards')
    .select('*')
    .eq('is_live', true)
    .order('display_order', { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const linked = await loadLinkedCards((data ?? []).map(r => r.campaign_id).filter(Boolean));
  const cards = (data ?? [])
    .map(r => r.campaign_id ? { id: r.id, live: linked.get(r.campaign_id) ?? null } : r)
    .filter(r => !('live' in r) || r.live); // a linked card that's gone: skip it
  return Response.json({ cards });
}
