import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Only handle payment_intent.succeeded for MVP
  if (event.type !== 'payment_intent.succeeded') {
    return Response.json({ received: true });
  }

  const pi = event.data.object as Stripe.PaymentIntent;

  // Idempotency check — skip if already processed
  const { data: existing } = await supabaseAdmin
    .from('contributions')
    .select('id, status')
    .eq('stripe_payment_intent_id', pi.id)
    .maybeSingle();

  if (existing?.status === 'paid') {
    console.log(`Duplicate webhook for payment_intent ${pi.id} — skipping`);
    return Response.json({ received: true });
  }

  // Find contribution by payment intent ID or via checkout session metadata
  // The contribution_id is stored in metadata on the checkout session
  const sessionId = pi.metadata?.checkout_session_id;
  let contributionId: string | undefined = pi.metadata?.contribution_id ?? undefined;

  if (!contributionId && sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    contributionId = session.metadata?.contribution_id ?? undefined;
  }

  if (!contributionId) {
    console.error('No contribution_id found in payment intent metadata', pi.id);
    return Response.json({ received: true });
  }

  // Get the contribution
  const { data: contribution } = await supabaseAdmin
    .from('contributions')
    .select('id, campaign_id, amount, status')
    .eq('id', contributionId)
    .maybeSingle();

  if (!contribution) {
    console.error('Contribution not found:', contributionId);
    return Response.json({ received: true });
  }

  if (contribution.status === 'paid') {
    return Response.json({ received: true });
  }

  // Mark contribution as paid and record payment intent + event IDs
  const { error: updateErr } = await supabaseAdmin
    .from('contributions')
    .update({
      status: 'paid',
      stripe_payment_intent_id: pi.id,
      stripe_event_id: event.id,
    })
    .eq('id', contributionId);

  if (updateErr) {
    console.error('Failed to update contribution:', updateErr);
    return Response.json({ error: 'DB update failed' }, { status: 500 });
  }

  // Atomically increment funded_amount on campaign
  const { data: campaign } = await supabaseAdmin
    .from('campaigns')
    .select('id, funded_amount, target_amount, status')
    .eq('id', contribution.campaign_id)
    .single();

  if (!campaign) {
    console.error('Campaign not found for contribution:', contributionId);
    return Response.json({ received: true });
  }

  const newFunded = (campaign.funded_amount ?? 0) + contribution.amount;
  const goalReached = newFunded >= campaign.target_amount;

  await supabaseAdmin
    .from('campaigns')
    .update({
      funded_amount: newFunded,
      ...(goalReached && campaign.status === 'open' ? { status: 'goal_reached' } : {}),
    })
    .eq('id', campaign.id);

  if (goalReached) {
    console.log(`Goal reached for campaign ${campaign.id} — funded: ${newFunded}/${campaign.target_amount}`);
  }

  return Response.json({ received: true });
}
