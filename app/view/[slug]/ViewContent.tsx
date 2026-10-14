'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { LiveCard } from '@/components/cards/LiveCard';
import { TintedIcon } from '@/components/ui/TintedIcon';
import { KeepsakeButtons } from '@/components/ui/KeepsakeButtons';

interface Campaign {
  id: string;
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
  target_amount: number | null;
  status: string;
  deadline?: string | null;
}

interface Contribution {
  contributor_name: string;
  message: string | null;
  photo_url?: string | null;
  photo_label?: string | null;
}

export function ViewContent() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const slug         = typeof params.slug === 'string' ? params.slug : '';
  const isPreview    = searchParams.get('preview') === '1';

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

  if (campaign.status !== 'sent' && !isPreview) return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", gap: 12, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: '2.4rem' }}>⏳</div>
      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#3A8FA0' }}>Your card is on its way!</div>
      <div style={{ fontSize: '.85rem', color: '#7A7585', fontWeight: 600 }}>The organiser is still collecting messages. Check back soon.</div>
    </div>
  );

  const backToDashboard = isPreview ? (() => {
    try {
      const sessions = JSON.parse(localStorage.getItem('tyc_manage') ?? '{}');
      const token = sessions[slug];
      return token ? `/manage/${slug}?token=${token}` : null;
    } catch { return null; }
  })() : null;

  const previewBar = backToDashboard ? (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(42,42,42,.92)', backdropFilter: 'blur(6px)',
      padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: "'Nunito',sans-serif",
    }}>
      <span style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.6)', fontWeight: 700 }}>Preview mode</span>
      <a href={backToDashboard} style={{
        background: '#3A8FA0', color: '#fff', borderRadius: 8, padding: '7px 14px',
        fontWeight: 800, fontSize: '.82rem', textDecoration: 'none',
      }}>← Back to dashboard</a>
    </div>
  ) : null;

  // An unpaid group card (only reachable via the organiser's ?preview=1): exports stay locked.
  const exportsLocked = campaign.status !== 'sent' && !!campaign.deadline;

  if (campaign.card_style === 'casual') {
    return (
      <>
        {previewBar}
        <div style={previewBar ? { paddingTop: 44 } : undefined}>
          <div data-card-capture style={{ position: 'relative' }}><LiveCard campaign={campaign} contributions={contributions} /></div>
          <KeepsakeButtons slug={slug} preview={isPreview} locked={exportsLocked} />
        </div>
      </>
    );
  }

  if (campaign.card_style === 'corporate') {
    return (
      <>
        {previewBar}
        <div style={previewBar ? { paddingTop: 44 } : undefined}>
          <div data-card-capture style={{ position: 'relative' }}><LiveCard campaign={campaign} contributions={contributions} /></div>
          <KeepsakeButtons slug={slug} preview={isPreview} locked={exportsLocked} />
        </div>
      </>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(175deg,#EAF4FB 0%,#FDF0E8 55%,#F0ECFB 100%)', fontFamily: "'Nunito',sans-serif", paddingTop: previewBar ? 44 : 0 }}>
      {previewBar}

      {/* Card — straight in, no header */}
      <div data-card-capture style={{ position: 'relative', maxWidth: 480, margin: '0 auto', padding: '16px 16px 0' }}>
        <LiveCard campaign={campaign} contributions={contributions} />
      </div>

      {/* CTA button — full width of card */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '14px 16px 0' }}>
        <a
          href="/"
          style={{ background: '#E8724A', color: '#fff', borderRadius: 12, padding: '14px 24px', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, textAlign: 'center', fontFamily: "'Nunito',sans-serif" }}
        >
          Send a card!
          <TintedIcon src="/Icons/Send.png" size={20} color="#fff" />
        </a>
      </div>

      <div style={{ paddingTop: 14 }}>
        <KeepsakeButtons slug={slug} preview={isPreview} locked={exportsLocked} />
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
        <div style={{ marginTop: 12, display: 'flex', gap: 16, justifyContent: 'center' }}>
          <a href="/terms" style={{ fontSize: '.78rem', color: '#B0A8BC', fontWeight: 600, textDecoration: 'none' }}>Terms</a>
          <a href="/privacy" style={{ fontSize: '.78rem', color: '#B0A8BC', fontWeight: 600, textDecoration: 'none' }}>Privacy</a>
        </div>
      </div>

    </div>
  );
}
