import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendOrganiserLink } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}
function randomToken(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { recipient_name, occasion, deadline, organiser_email, card_theme, card_message, card_image_url } = body;

  if (!recipient_name) {
    return Response.json({ error: 'Missing recipient name' }, { status: 400 });
  }

  const slug           = `${slugify(recipient_name) || 'card'}-${randomSuffix()}`;
  const organiser_token = randomToken();
  const origin         = request.headers.get('origin') ?? 'https://thankyoucards.au';

  // Create campaign as pending — activated by webhook after payment
  const { data: campaign, error } = await supabaseAdmin
    .from('campaigns')
    .insert({
      recipient_name,
      occasion:        occasion ?? null,
      target_amount:   0,
      funded_amount:   0,
      deadline:        deadline ?? null,
      status:          'open',
      organiser_email: organiser_email ?? null,
      card_theme:      card_theme ?? null,
      card_message:    card_message ?? null,
      card_image_url:  card_image_url ?? null,
      slug,
      organiser_token,
    })
    .select()
    .single();

  if (error || !campaign) {
    console.error('Create campaign error:', error);
    return Response.json({ error: error?.message ?? 'Failed to create campaign' }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'aud',
        unit_amount: 1500, // $15.00
        product_data: {
          name: `Group card for ${recipient_name}`,
          description: 'Unlimited contributors, all messages in one card',
        },
      },
      quantity: 1,
    }],
    customer_email: organiser_email || undefined,
    payment_intent_data: {
      metadata: {
        type:            'group_card_creation',
        campaign_id:     campaign.id,
        organiser_token,
        slug,
      },
    },
    metadata: {
      type:            'group_card_creation',
      campaign_id:     campaign.id,
      organiser_token,
      slug,
    },
    success_url: `${origin}/manage/${slug}?token=${organiser_token}`,
    cancel_url:  `${origin}/?cancelled=group`,
  });

  if (organiser_email) {
    sendOrganiserLink({
      to: organiser_email,
      recipientName: recipient_name,
      manageUrl: `${origin}/manage/${slug}?token=${organiser_token}`,
      shareUrl:  `${origin}/card/${slug}`,
    }).catch(err => console.error('Failed to send organiser email:', err));
  }

  return Response.json({ url: session.url }, { status: 200 });
}
