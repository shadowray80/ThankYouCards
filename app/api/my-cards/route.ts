import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sessionIsValid } from '@/lib/organiserSession';

// The logged-in organiser's group cards — matched on the email entered when each card was
// created (logging in proves they own that email). Newest first. Includes each card's
// organiser token, since this is the organiser's own way back into their cards.
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') ?? '';
  const sessionToken = request.nextUrl.searchParams.get('session_token') ?? '';

  if (!(await sessionIsValid(email, sessionToken))) {
    return Response.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('slug, organiser_token, recipient_name, card_occasion, status, created_at')
    // Case-insensitive exact match: escape LIKE wildcards so an email can't act as a pattern.
    .ilike('organiser_email', email.replace(/[\\%_]/g, c => '\\' + c))
    .not('deadline', 'is', null)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ cards: data ?? [] });
}
