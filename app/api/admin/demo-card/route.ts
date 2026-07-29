import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/requireAdmin';

// Fixed, well-known slug for a standing internal campaign that only exists so admins
// have somewhere to click through to /manage, /view and /card without creating (and
// leaving behind) a real campaign every time they just want to look at a page.
const DEMO_SLUG = 'admin-demo';

function randomToken(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') ?? '';
  const sessionToken = request.nextUrl.searchParams.get('session_token') ?? '';

  if (!(await requireAdmin(email, sessionToken))) {
    return Response.json({ error: 'Not authorised' }, { status: 401 });
  }

  const { data: existing } = await supabaseAdmin
    .from('campaigns')
    .select('slug, organiser_token')
    .eq('slug', DEMO_SLUG)
    .maybeSingle();

  if (existing) {
    return Response.json({ slug: existing.slug, token: existing.organiser_token });
  }

  const { data: created, error } = await supabaseAdmin
    .from('campaigns')
    .insert({
      slug: DEMO_SLUG,
      organiser_token: randomToken(),
      recipient_name: 'Demo Card',
      occasion: '',
      target_amount: 0,
      funded_amount: 0,
      deadline: '2099-12-31',
      status: 'open',
      organiser_email: null,
      card_theme: '',
      card_message: 'Thanks for everything!',
      card_image_url: 'https://ofoboqojauitnmdbhcaz.supabase.co/storage/v1/object/public/cards/thank_you_beach_papercraft_04.png',
      card_style: 'casual',
      card_palette: 'sky',
      card_text_on_image: true,
    })
    .select('slug, organiser_token')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ slug: created.slug, token: created.organiser_token });
}
