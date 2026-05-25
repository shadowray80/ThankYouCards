'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { THEMES } from '@/lib/themes';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

interface Campaign {
  id: string;
  slug: string;
  recipient_name: string;
  occasion: string | null;
  card_theme: string | null;
  card_message: string | null;
  card_image_url: string | null;
  funded_amount: number;
  target_amount: number;
  deadline: string | null;
  status: string;
  organiser_email: string;
}

interface Contribution {
  id: string;
  contributor_name: string;
  message: string | null;
  amount: number;
  created_at: string;
}

function ManageContent() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const slug         = typeof params.slug === 'string' ? params.slug : '';
  const token        = searchParams.get('token') ?? '';

  const [campaign, setCampaign]           = useState<Campaign | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [copied, setCopied]               = useState(false);
  const [copiedRecipient, setCopiedRecipient] = useState(false);

  useEffect(() => {
    if (slug && token) {
      const sessions = JSON.parse(localStorage.getItem('tyc_manage') ?? '{}');
      sessions[slug] = token;
      localStorage.setItem('tyc_manage', JSON.stringify(sessions));
    }
  }, [slug, token]);

  useEffect(() => {
    if (!slug || !token) { setError('Invalid link'); setLoading(false); return; }
    fetch(`/api/manage/${slug}?token=${token}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) { setError(json.error); return; }
        setCampaign(json.campaign);
        setContributions(json.contributions ?? []);
      })
      .catch(() => setError('Could not load campaign'))
      .finally(() => setLoading(false));
  }, [slug, token]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(`thankyoucards.au/card/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyRecipientLink = () => {
    navigator.clipboard.writeText(`thankyoucards.au/view/${slug}`);
    setCopiedRecipient(true);
    setTimeout(() => setCopiedRecipient(false), 2000);
  };

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: '#7A7585' }}>
      Loading…
    </div>
  );

  if (error || !campaign) return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", gap: 16, padding: 24 }}>
      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#E8724A' }}>This link isn't valid</div>
      <div style={{ fontSize: '.85rem', color: '#7A7585', fontWeight: 600 }}>Check you copied the full organiser link.</div>
      <button onClick={() => router.push('/')} style={{ background: '#3A8FA0', border: 'none', borderRadius: 10, padding: '11px 22px', color: '#fff', fontWeight: 800, fontSize: '.9rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>← Home</button>
    </div>
  );

  const theme         = THEMES.find(t => t.id === campaign.card_theme) ?? THEMES[0];
  const recipientName = campaign.recipient_name.charAt(0).toUpperCase() + campaign.recipient_name.slice(1);
  const deadlineStr   = campaign.deadline
    ? new Date(campaign.deadline).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const daysLeft = campaign.deadline
    ? Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86400000)
    : null;
  const pct      = campaign.target_amount > 0 ? Math.min(100, Math.round((campaign.funded_amount / campaign.target_amount) * 100)) : 0;
  const messages = contributions.map(c => ({ name: c.contributor_name, msg: c.message ?? '' }));
  const totalContributors = contributions.length;
  const paidContributors  = contributions.filter(c => c.amount > 0).length;

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFDF8', fontFamily: "'Nunito',sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#3A8FA0,#5AAFBF)', padding: '18px 20px 16px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'rgba(255,255,255,.85)' }}>
              thank<span style={{ color: '#fff' }}>you</span>cards<span style={{ color: 'rgba(255,255,255,.5)' }}>.au</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 12px', fontSize: '.72rem', fontWeight: 800, color: '#fff', letterSpacing: '.04em' }}>
              ORGANISER VIEW
            </div>
          </div>

          <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff', marginBottom: 4 }}>
            {recipientName}'s card
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: campaign.target_amount > 0 ? 12 : 0 }}>
            {campaign.occasion && (
              <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 20, padding: '4px 10px', fontSize: '.74rem', color: 'rgba(255,255,255,.9)', fontWeight: 700 }}>
                {campaign.occasion}
              </div>
            )}
            {daysLeft !== null && (
              <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 20, padding: '4px 10px', fontSize: '.74rem', color: 'rgba(255,255,255,.9)', fontWeight: 700 }}>
                {daysLeft > 0 ? `⏰ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : '⏰ Deadline passed'}
              </div>
            )}
          </div>

          {campaign.target_amount > 0 && (
            <div>
              <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'rgba(255,255,255,.7)', marginBottom: 5, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                Gift fund — ${campaign.funded_amount} raised of ${campaign.target_amount} ({pct}%)
              </div>
              <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: '#fff', borderRadius: 8, transition: 'width .5s ease' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 18px 40px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Signed', value: totalContributors },
            { label: 'Contributed', value: paidContributors },
            { label: 'Raised', value: `$${campaign.funded_amount}` },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#2A2A2A' }}>{s.value}</div>
              <div style={{ fontSize: '.68rem', fontWeight: 700, color: '#B0A8BC', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Share link */}
        <div style={{ background: '#EAF4FB', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#2A2A2A', marginBottom: 6 }}>🔗 Share with contributors</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, fontSize: '.78rem', color: '#3A8FA0', fontWeight: 700, wordBreak: 'break-all', background: '#fff', border: '1.5px solid #C8E8F0', borderRadius: 8, padding: '8px 10px' }}>
              thankyoucards.au/card/{slug}
            </div>
            <button onClick={copyShareLink} style={{ background: '#3A8FA0', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div style={{ fontSize: '.72rem', color: '#7A7585', fontWeight: 600, marginTop: 6 }}>
            Forward this to anyone who hasn't signed yet
          </div>
        </div>

        {/* Card preview */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>Card preview</div>
          <CardScrollView
            theme={theme}
            imgIdx={0}
            customImgUrl={campaign.card_image_url ?? undefined}
            recipientName={recipientName}
            fromText={campaign.occasion ?? undefined}
            message={campaign.card_message ?? ''}
            messages={messages}
            giftAmount={campaign.funded_amount > 0 ? campaign.funded_amount : undefined}
          />
        </div>

        {/* Contributor list */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>
            Contributors ({totalContributors})
          </div>
          {contributions.length === 0 ? (
            <div style={{ background: '#F7F5FB', borderRadius: 12, padding: '20px', textAlign: 'center', color: '#B0A8BC', fontWeight: 700, fontSize: '.88rem' }}>
              No one has signed yet — share the link above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {contributions.map(c => (
                <div key={c.id} style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#3A8FA0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.85rem', color: '#fff', flexShrink: 0 }}>
                      {c.contributor_name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#2A2A2A' }}>{c.contributor_name}</div>
                      {c.message && <div style={{ fontSize: '.78rem', color: '#7A7585', fontWeight: 600, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{c.message}"</div>}
                    </div>
                  </div>
                  {c.amount > 0 && (
                    <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#3A8FA0', flexShrink: 0 }}>${c.amount}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Send card */}
        <div style={{ background: 'linear-gradient(135deg,#F0ECFB,#E8E2F6)', borderRadius: 14, padding: '18px 16px' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#2A2A2A', marginBottom: 4 }}>🎉 Ready to send?</div>
          <div style={{ fontSize: '.82rem', color: '#7A7585', fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>
            Share this link directly with {recipientName} — they&apos;ll see the full card with all the messages.
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, fontSize: '.78rem', color: '#7C5CBF', fontWeight: 700, wordBreak: 'break-all', background: '#fff', border: '1.5px solid #D4C8EE', borderRadius: 8, padding: '8px 10px' }}>
              thankyoucards.au/view/{slug}
            </div>
            <button onClick={copyRecipientLink} style={{ background: '#7C5CBF', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#fff', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito',sans-serif" }}>
              {copiedRecipient ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <a href={`https://wa.me/?text=${encodeURIComponent(`I made you a card — open it here: https://thankyoucards.au/view/${slug}`)}`} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, background: '#25D366', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
              💬 WhatsApp
            </a>
            <a href={`sms:?body=${encodeURIComponent(`I made you a card — open it here: https://thankyoucards.au/view/${slug}`)}`}
              style={{ flex: 1, background: '#5AC8FA', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
              💬 SMS
            </a>
            <a href={`mailto:?subject=A card for you, ${recipientName}&body=${encodeURIComponent(`I made you a card — open it here: https://thankyoucards.au/view/${slug}`)}`}
              style={{ flex: 1, background: '#3A8FA0', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
              ✉️ Email
            </a>
          </div>
          <a
            href={`/view/${slug}`}
            target="_blank"
            style={{ display: 'block', textAlign: 'center', color: '#7C5CBF', fontWeight: 700, fontSize: '.82rem', textDecoration: 'none' }}
          >
            Preview what {recipientName} will see →
          </a>
        </div>

      </div>
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: '#7A7585' }}>Loading…</div>}>
      <ManageContent />
    </Suspense>
  );
}
