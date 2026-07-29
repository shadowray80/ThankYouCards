import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { CardRedirect } from './CardRedirect';

type Props = {
  params: Promise<{ slug: string }>;
};

// Link previews (SMS/iMessage/WhatsApp) fetch this URL's raw HTML without running any
// JavaScript, so they never see the client-side redirect below — they only ever see
// whatever's in generateMetadata here. Without this, they fall back to the generic
// site-wide title/description from the root layout.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: campaign } = await supabaseAdmin
    .from('campaigns')
    .select('recipient_name')
    .eq('slug', slug)
    .single();

  if (!campaign) {
    return { title: 'Join the card! — thankyoucards.au' };
  }

  const name = campaign.recipient_name.charAt(0).toUpperCase() + campaign.recipient_name.slice(1);
  const title = `We're making a card for ${name}! 💌`;
  const description = `Add your message to ${name}'s card — it only takes a minute.`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: 'thankyoucards.au' },
    twitter: { card: 'summary', title, description },
  };
}

export default function CardPage() {
  return <CardRedirect />;
}
