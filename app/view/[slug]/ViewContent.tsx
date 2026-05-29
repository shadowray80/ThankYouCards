'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { THEMES } from '@/lib/themes';

interface Campaign {
  id: string;
  slug: string;
  recipient_name: string;
  occasion: string | null;
  card_theme: string | null;
  card_message: string | null;
  card_image_url: string | null;
  funded_amount: number;
  target_amount: number | null;
  status: string;
}

interface Contribution {
  contributor_name: string;
  message: string | null;
}

export function ViewContent() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/campaigns/${slug}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) { setError(json.error); return; }
        setCampaign(json.campaign);
        setContributions(json.contributions ?? []);
      })
      .catch(() => setError('Could not load card'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: '#7A7585', fontSize: '1rem' }}>
      Loading your card…
    </div>
  );

  if (error || !campaign) return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", gap: 12, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: '2.4rem' }}>💌</div>
      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#E8724A' }}>This card link isn&apos;t valid</div>
      <div style={{ fontSize: '.85rem', color: '#7A7585', fontWeight: 600 }}>Check you copied the full link from the organiser.</div>
    </div>
  );

  if (campaign.status !== 'sent') return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", gap: 12, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: '2.4rem' }}>⏳</div>
      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#3A8FA0' }}>Your card is on its way!</div>
      <div style={{ fontSize: '.85rem', color: '#7A7585', fontWeight: 600 }}>The organiser is still collecting messages. Check back soon.</div>
    </div>
  );

  const theme = THEMES.find(t => t.id === campaign.card_theme) ?? THEMES[0];
  const name = campaign.recipient_name.charAt(0).toUpperCase() + campaign.recipient_name.slice(1);
  const hasGift = campaign.funded_amount > 0;

  const names = contributions.map(c => c.contributor_name);
  const fromText =
    names.length === 0 ? undefined
    : names.length === 1 ? names[0]
    : names.length === 2 ? `${names[0]} & ${names[1]}`
    : `${names[0]}, ${names[1]} & ${names.length - 2} more`;

  const isSolo = contributions.length <= 1;
  const soloMessage = isSolo && contributions.length === 1 ? contributions[0].message ?? undefined : undefined;
  const groupMessages = isSolo ? [] : contributions.map(c => ({ name: c.contributor_name, msg: c.message ?? '' }));

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(175deg,#EAF4FB 0%,#FDF0E8 55%,#F0ECFB 100%)', fontFamily: "'Nunito',sans-serif" }}>

      {/* Card — straight in, no header */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 0' }}>
        <CardScrollView
          theme={theme}
          customImgUrl={campaign.card_image_url ?? undefined}
          recipientName={name}
          fromText={fromText}
          message={campaign.card_message ?? ''}
          messages={groupMessages}
          soloMessage={soloMessage}
          giftAmount={hasGift ? campaign.funded_amount : undefined}
          landscapeCover
        />
      </div>

      {/* CTA button — full width of card */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '14px 16px 0' }}>
        <a
          href="/"
          style={{ background: '#E8724A', color: '#fff', borderRadius: 12, padding: '14px 24px', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', display: 'block', textAlign: 'center', fontFamily: "'Nunito',sans-serif" }}
        >
          Create your own card →
        </a>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px 24px 48px', marginTop: 16, borderTop: '1px solid #E8E2F0' }}>
        <a href="https://thankyoucards.au" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 6 }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#3A8FA0' }}>
            thank<span style={{ color: '#E8724A' }}>you</span>cards<span style={{ color: '#7A7585', fontWeight: 600, fontSize: '1rem' }}>.au</span>
          </div>
        </a>
        <div style={{ fontSize: '.95rem', color: '#B0A8BC', fontWeight: 600 }}>
          Beautiful cards for the legends in your life
        </div>
      </div>

    </div>
  );
}
