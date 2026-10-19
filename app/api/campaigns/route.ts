import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendOrganiserLink } from '@/lib/email';
import { sessionIsValid } from '@/lib/organiserSession';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

function randomToken(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { recipient_name, occasion, card_occasion, target_amount, deadline, organiser_email, card_theme, card_message, card_note, card_image_url, card_style, card_palette, card_logo_url, card_logo_scale, card_logo_position, card_accent, card_text_on_image, feature_ok, session_token } = body;

  if (!recipient_name) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // A solo card (no deadline) only gets an email when made while logged in: that's what puts it
  // in the account's "My cards". The login proves the email is theirs.
  const isSolo = !deadline;
  const ownerEmail = isSolo
    ? (organiser_email && await sessionIsValid(organiser_email, session_token ?? '') ? organiser_email : null)
    : organiser_email ?? null;

  const base = slugify(recipient_name) || 'card';
  const slug = `${base}-${randomSuffix()}`;
  const organiser_token = randomToken();

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .insert({
      recipient_name,
      occasion: occasion ?? null,
      card_occasion: card_occasion ?? null,
      target_amount: target_amount ?? null,
      funded_amount: 0,
      deadline: deadline ?? null,
      status: 'open',
      organiser_email: ownerEmail,
      card_theme: card_theme ?? null,
      card_message: card_message ?? null,
      card_note: card_note ?? null,
      card_image_url: card_image_url ?? null,
      card_style:     card_style ?? 'classic',
      card_palette:   card_palette ?? 'sky',
      card_logo_url:  card_logo_url ?? null,
      card_logo_scale: card_logo_scale ?? 1,
      card_logo_position: card_logo_position ?? 'left',
      card_accent: card_accent ?? null,
      card_text_on_image: card_text_on_image ?? true,
      feature_ok: feature_ok === true,
      slug,
      organiser_token,
    })
    .select()
    .single();

  if (error) {
    console.error('Create campaign error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const origin = request.headers.get('origin') ?? 'https://thankyoucards.au';
  if (organiser_email && !isSolo) {
    sendOrganiserLink({
      to: organiser_email,
      recipientName: recipient_name,
      manageUrl: `${origin}/manage/${slug}?token=${organiser_token}`,
      shareUrl:  `${origin}/card/${slug}`,
    }).catch(err => console.error('Failed to send organiser email:', err));
  }

  return Response.json({ campaign: data }, { status: 201 });
}
