'use client';

import { CardScrollView } from '@/components/cards/CardScrollView';
import { CasualView } from '@/components/cards/CasualView';
import { CorporateView } from '@/components/cards/CorporateView';
import { THEMES } from '@/lib/themes';

export interface LiveCampaign {
  slug: string;
  recipient_name: string;
  occasion: string | null;
  card_theme: string | null;
  card_message: string | null;
  card_note: string | null;
  card_image_url: string | null;
  card_style: string | null;
  card_palette: string | null;
  card_logo_url: string | null;
  card_logo_scale: number | null;
  card_logo_position: 'left' | 'center' | 'right' | null;
  card_accent: string | null;
  card_text_on_image: boolean | null;
  funded_amount: number;
}

export interface LiveContribution {
  contributor_name: string;
  message: string | null;
  photo_url?: string | null;
  photo_label?: string | null;
}

// A real card exactly as its recipient sees it, in whichever style it was made: used by the
// view page and the homepage carousel. `preview` gives casual/corporate their lighter wrapper.
export function LiveCard({ campaign, contributions, preview }: {
  campaign: LiveCampaign;
  contributions: LiveContribution[];
  preview?: boolean;
}) {
  if (campaign.card_style === 'casual') {
    return <CasualView campaign={campaign} contributions={contributions} preview={preview} />;
  }

  if (campaign.card_style === 'corporate') {
    return (
      <CorporateView
        campaign={campaign} contributions={contributions} preview={preview}
        logoScale={campaign.card_logo_scale ?? 1} logoPosition={campaign.card_logo_position ?? 'left'}
      />
    );
  }

  const theme = THEMES.find(t => t.id === campaign.card_theme) ?? THEMES[0];
  const name = campaign.recipient_name.charAt(0).toUpperCase() + campaign.recipient_name.slice(1);
  const isSolo = contributions.length <= 1;
  // Solo cards store the occasion/theme label in `occasion`, not the sender — the
  // signature comes from the contributor's own name instead. Fall back to '' (not
  // undefined) so a blank message still routes to the solo branch.
  const soloMessage = isSolo && contributions.length === 1 ? contributions[0].message ?? '' : undefined;
  const fromText = isSolo && contributions.length === 1 ? contributions[0].contributor_name : (campaign.occasion ?? undefined);
  const groupMessages = isSolo ? [] : contributions.map(c => ({ name: c.contributor_name, msg: c.message ?? '' }));

  return (
    <CardScrollView
      theme={theme}
      customImgUrl={campaign.card_image_url ?? undefined}
      recipientName={name}
      fromText={fromText}
      message={campaign.card_message ?? ''}
      messages={groupMessages}
      soloMessage={soloMessage}
      giftAmount={campaign.funded_amount > 0 ? campaign.funded_amount : undefined}
      landscapeCover
      showCoverText={campaign.card_text_on_image ?? true}
      alwaysShowCoverMessage={!isSolo}
    />
  );
}
