import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { recipient_name, occasion, target_amount, deadline, organiser_email, card_theme, card_message, card_image_url } = body;

  if (!recipient_name || target_amount == null || !organiser_email) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const base = slugify(recipient_name) || 'card';
  const slug = `${base}-${randomSuffix()}`;

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .insert({
      recipient_name,
      occasion: occasion ?? null,
      target_amount,
      funded_amount: 0,
      deadline: deadline ?? null,
      status: 'open',
      organiser_email,
      card_theme: card_theme ?? null,
      card_message: card_message ?? null,
      card_image_url: card_image_url ?? null,
      slug,
    })
    .select()
    .single();

  if (error) {
    console.error('Create campaign error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ campaign: data }, { status: 201 });
}
