import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';

// Sent cards whose sender opted in to being featured. Only cover fields are returned —
// messages are never part of the showcase.
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') ?? '';
  const sessionToken = request.nextUrl.searchParams.get('session_token') ?? '';

  if (!(await requireAdmin(email, sessionToken))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('id, slug, recipient_name, occasion, card_message, card_image_url, card_style, card_palette, card_logo_url, card_text_on_image, deadline, created_at, feature_dismissed, feature_exported_at, feature_showcase_id')
    .eq('feature_ok', true)
    .eq('status', 'sent')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // A homepage copy may since have been deleted on /admin/showcase — don't report it as on the homepage.
  const { data: showcase } = await supabaseAdmin.from('showcase_cards').select('id');
  const liveShowcaseIds = new Set((showcase ?? []).map(r => r.id));
  const cards = (data ?? []).map(c => ({
    ...c,
    feature_showcase_id: c.feature_showcase_id && liveShowcaseIds.has(c.feature_showcase_id) ? c.feature_showcase_id : null,
  }));

  return Response.json({ cards });
}
