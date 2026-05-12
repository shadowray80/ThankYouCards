import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { ViewContent } from './ViewContent';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: campaign } = await supabaseAdmin
    .from('campaigns')
    .select('id, recipient_name')
    .eq('slug', slug)
    .single();

  if (!campaign) {
    return { title: "You've got a card! — thankyoucards.au" };
  }

  const name = campaign.recipient_name.charAt(0).toUpperCase() + campaign.recipient_name.slice(1);

  const { data: firstContrib } = await supabaseAdmin
    .from('contributions')
    .select('contributor_name')
    .eq('campaign_id', campaign.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  const sender = firstContrib?.contributor_name ?? null;
  const title = sender
    ? `${name}, you've got a card from ${sender}! 🎉`
    : `${name}, you've got a card! 🎉`;
  const description = 'Open to read your personalised card.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'thankyoucards.au',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function ViewPage() {
  return <ViewContent />;
}
