import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const { slug, token } = await request.json();

  if (!slug || !token) {
    return Response.json({ error: 'Missing slug or token' }, { status: 400 });
  }

  const { data: campaign } = await supabaseAdmin
    .from('campaigns')
    .select('id, slug, status, organiser_token, recipient_name')
    .eq('slug', slug)
    .eq('organiser_token', token)
    .single();

  if (!campaign) {
    return Response.json({ error: 'Invalid link' }, { status: 403 });
  }

  if (campaign.status === 'sent') {
    return Response.json({ error: 'Card already sent' }, { status: 409 });
  }

  const origin = request.headers.get('origin') ?? 'https://thankyoucards.au';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'aud',
        unit_amount: 1500,
        product_data: {
          name: `Group card for ${campaign.recipient_name}`,
          description: 'Unlimited contributors, all messages in one card',
        },
      },
      quantity: 1,
    }],
    payment_intent_data: {
      metadata: {
        type:        'send_card',
        campaign_id: campaign.id,
        slug,
      },
    },
    metadata: {
      type:        'send_card',
      campaign_id: campaign.id,
      slug,
    },
    success_url: `${origin}/manage/${slug}?token=${token}&paid=1`,
    cancel_url:  `${origin}/manage/${slug}?token=${token}`,
  });

  return Response.json({ url: session.url });
}
