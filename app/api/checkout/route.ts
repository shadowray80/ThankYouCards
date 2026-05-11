import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { campaign_id, contributor_name, message, amount_cents, contributor_email } = body;

  if (!campaign_id || !contributor_name || !amount_cents || amount_cents < 100) {
    return Response.json({ error: 'Missing required fields or amount too small' }, { status: 400 });
  }

  // Verify campaign is open
  const { data: campaign, error: campErr } = await supabaseAdmin
    .from('campaigns')
    .select('id, recipient_name, status, slug')
    .eq('id', campaign_id)
    .single();

  if (campErr || !campaign) {
    return Response.json({ error: 'Campaign not found' }, { status: 404 });
  }
  if (campaign.status !== 'open') {
    return Response.json({ error: 'Campaign is no longer accepting contributions' }, { status: 409 });
  }

  // Create a pending contribution record first
  const { data: contribution, error: contribErr } = await supabaseAdmin
    .from('contributions')
    .insert({
      campaign_id,
      contributor_name,
      message: message ?? null,
      amount: amount_cents / 100,
      status: 'pending',
      contributor_email: contributor_email ?? null,
    })
    .select()
    .single();

  if (contribErr || !contribution) {
    console.error('Create contribution error:', contribErr);
    return Response.json({ error: 'Failed to create contribution' }, { status: 500 });
  }

  const origin = request.headers.get('origin') ?? 'http://localhost:3000';

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'aud',
          unit_amount: amount_cents,
          product_data: {
            name: `Contribution to ${campaign.recipient_name}'s card`,
            description: contributor_name,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: contributor_email || undefined,
    metadata: {
      contribution_id: contribution.id,
      campaign_id,
    },
    success_url: `${origin}/?payment=success&card=${campaign.slug}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?payment=cancelled&card=${campaign.slug}`,
  });

  return Response.json({ url: session.url, contribution_id: contribution.id }, { status: 200 });
}
