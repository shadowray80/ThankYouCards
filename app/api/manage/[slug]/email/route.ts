import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendCardEmail } from '@/lib/email';
import { cardEmailSubject, CARD_EMAIL_MAX_MESSAGE } from '@/lib/cardEmail';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Anything link-like in the personal message — the card link is added by us, so a sender
// never needs one, and refusing them keeps this from being useful for spam/phishing.
const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|au|io|co|info|xyz|ru|cn|biz|link|click|top)\b)/i;

// Abuse limits. Every send is logged in `card_emails`; if that table can't be read we
// refuse to send rather than send unlimited.
const PER_CARD_LIMIT = 10;     // total, per card
const PER_IP_DAILY_LIMIT = 20; // per sender IP, rolling 24h
const GLOBAL_DAILY_LIMIT = 90; // site-wide, rolling 24h (Resend free plan allows 100/day)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json().catch(() => ({}));
  const token = String(body.token ?? '');
  const to = String(body.to ?? '').trim();
  const senderName = String(body.senderName ?? '').trim().slice(0, 60);
  const senderEmail = String(body.senderEmail ?? '').trim();
  const message = String(body.message ?? '').trim();
  const sendCopy = body.sendCopy === true;

  if (!token) return Response.json({ error: 'Missing token' }, { status: 401 });
  if (!EMAIL_RE.test(to)) return Response.json({ error: 'That email address doesn\'t look right' }, { status: 400 });
  if (senderEmail && !EMAIL_RE.test(senderEmail)) return Response.json({ error: 'Your email address doesn\'t look right' }, { status: 400 });
  if (!senderName) return Response.json({ error: 'Please add your name' }, { status: 400 });
  if (!message) return Response.json({ error: 'Please add a message' }, { status: 400 });
  if (message.length > CARD_EMAIL_MAX_MESSAGE) return Response.json({ error: 'That message is a bit long — please shorten it' }, { status: 400 });
  if (LINK_RE.test(message) || LINK_RE.test(senderName)) {
    return Response.json({ error: 'Please remove any web links — the card link is added for you' }, { status: 400 });
  }

  const { data: campaign, error } = await supabaseAdmin
    .from('campaigns')
    .select('id, slug, status, recipient_name, occasion, card_occasion, card_image_url, deadline')
    .eq('slug', slug)
    .eq('organiser_token', token)
    .single();
  if (error || !campaign) return Response.json({ error: 'Not found or invalid token' }, { status: 404 });
  if (campaign.status !== 'sent') return Response.json({ error: 'This card hasn\'t been sent yet' }, { status: 400 });

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const dayAgo = new Date(Date.now() - 86400000).toISOString();
  const [perCard, perIp, global] = await Promise.all([
    supabaseAdmin.from('card_emails').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id),
    supabaseAdmin.from('card_emails').select('id', { count: 'exact', head: true }).eq('ip', ip).gte('created_at', dayAgo),
    supabaseAdmin.from('card_emails').select('id', { count: 'exact', head: true }).gte('created_at', dayAgo),
  ]);
  // A count of null (not 0) means the lookup didn't really run — e.g. a missing table
  // returns no error on a head request — so treat it as a failure too.
  if (perCard.error || perIp.error || global.error || perCard.count == null || perIp.count == null || global.count == null) {
    console.error('card_emails lookup failed', perCard.error ?? perIp.error ?? global.error);
    return Response.json({ error: 'Email sending isn\'t available right now — please copy the link instead' }, { status: 503 });
  }
  if ((perCard.count ?? 0) >= PER_CARD_LIMIT) return Response.json({ error: `This card has already been emailed ${PER_CARD_LIMIT} times` }, { status: 429 });
  if ((perIp.count ?? 0) >= PER_IP_DAILY_LIMIT || (global.count ?? 0) >= GLOBAL_DAILY_LIMIT) {
    return Response.json({ error: 'Too many emails sent today — please try again tomorrow, or copy the link instead' }, { status: 429 });
  }

  // Group cards always have a contributor deadline; solo cards never do.
  const isSolo = !campaign.deadline;

  const origin = request.nextUrl.origin;
  const cardUrl = `${origin}/view/${campaign.slug}`;
  const imageUrl = campaign.card_image_url
    ? (campaign.card_image_url.startsWith('/') ? `${origin}${campaign.card_image_url}` : campaign.card_image_url)
    : `${origin}/og-image.png`;

  const subject = cardEmailSubject({
    recipientName: campaign.recipient_name,
    fromName: isSolo ? senderName : (campaign.occasion ?? ''),
    isSolo,
    cardOccasion: campaign.card_occasion,
  });
  // Heading in the email body = subject without its leading emoji.
  const heading = subject.replace(/^[^\p{L}\p{N}]+/u, '');

  // Log first so concurrent requests can't slip past the limits.
  const { error: logError } = await supabaseAdmin.from('card_emails').insert({ campaign_id: campaign.id, to_email: to, ip });
  if (logError) {
    console.error('card_emails insert failed', logError);
    return Response.json({ error: 'Email sending isn\'t available right now — please copy the link instead' }, { status: 503 });
  }

  const result = await sendCardEmail({
    to, senderName, senderEmail: senderEmail || null, sendCopy,
    subject, heading, personalMessage: message, imageUrl, cardUrl,
  });
  if (!result.ok) return Response.json({ error: 'Something went wrong sending the email — please try again' }, { status: 500 });

  return Response.json({ ok: true });
}
