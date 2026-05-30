'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { CasualView } from '@/components/cards/CasualView';
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
  card_style: string | null;
  card_palette: string | null;
}

interface Contribution {
  id: string;
  contributor_name: string;
  message: string | null;
  photo_url?: string | null;
  photo_label?: string | null;
  amount: number;
  created_at: string;
}

function ManageContent() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const slug         = typeof params.slug === 'string' ? params.slug : '';
  const token        = searchParams.get('token') ?? '';
  const paidParam    = searchParams.get('paid') === '1';

  const [campaign, setCampaign]           = useState<Campaign | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [copied, setCopied]               = useState(false);
  const [copiedRecipient, setCopiedRecipient] = useState(false);
  const [paying, setPaying]               = useState(false);
  const [refreshing, setRefreshing]       = useState(false);

  useEffect(() => {
    if (slug && token) {
      const sessions = JSON.parse(localStorage.getItem('tyc_manage') ?? '{}');
      sessions[slug] = token;
      localStorage.setItem('tyc_manage', JSON.stringify(sessions));
    }
  }, [slug, token]);

  const loadData = (isRefresh = false) => {
    if (!slug || !token) { setError('Invalid link'); setLoading(false); return; }
    if (isRefresh) setRefreshing(true); else setLoading(true);
    fetch(`/api/manage/${slug}?token=${token}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) { setError(json.error); return; }
        setCampaign(json.campaign);
        setContributions(json.contributions ?? []);
      })
      .catch(() => setError('Could not load campaign'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => {
    loadData();
    if (paidParam && token) {
      fetch(`/api/manage/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'mark_sent' }),
      }).catch(err => console.error('mark_sent failed:', err));
    }
  }, [slug, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://thankyoucards.au';

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${origin}/card/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyRecipientLink = () => {
    navigator.clipboard.writeText(`${origin}/view/${slug}`);
    setCopiedRecipient(true);
    setTimeout(() => setCopiedRecipient(false), 2000);
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch('/api/checkout/send-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, token }),
      });
      const json = await res.json();
      if (json.error) { alert(json.error); setPaying(false); return; }
      window.location.href = json.url;
    } catch {
      alert('Something went wrong — please try again.');
      setPaying(false);
    }
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

  const isSent        = campaign.status === 'sent' || paidParam;
  const theme         = THEMES.find(t => t.id === campaign.card_theme) ?? THEMES[0];
  const recipientName = campaign.recipient_name.charAt(0).toUpperCase() + campaign.recipient_name.slice(1);
  const deadlineStr   = campaign.deadline
    ? new Date(campaign.deadline).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const daysLeft = campaign.deadline
    ? Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86400000)
    : null;
  const messages          = contributions.map(c => ({ name: c.contributor_name, msg: c.message ?? '' }));
  const totalContributors = contributions.length;

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFDF8', fontFamily: "'Nunito',sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#3A8FA0,#5AAFBF)', padding: '18px 20px 16px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <a href="/" style={{ fontWeight: 800, fontSize: '1rem', color: 'rgba(255,255,255,.85)', textDecoration: 'none' }}>
              thank<span style={{ color: '#fff' }}>you</span>cards<span style={{ color: 'rgba(255,255,255,.5)' }}>.au</span>
            </a>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => loadData(true)} disabled={refreshing}
                style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 20, padding: '4px 10px', fontSize: '.72rem', fontWeight: 800, color: '#fff', cursor: 'pointer', letterSpacing: '.04em' }}>
                {refreshing ? '…' : '↻ Refresh'}
              </button>
              <div style={{ background: isSent ? 'rgba(74,222,128,.3)' : 'rgba(255,255,255,.2)', borderRadius: 20, padding: '4px 12px', fontSize: '.72rem', fontWeight: 800, color: '#fff', letterSpacing: '.04em' }}>
                {isSent ? '✓ SENT' : 'ORGANISER VIEW'}
              </div>
            </div>
          </div>

          <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff', marginBottom: 4 }}>
            {recipientName}&apos;s card
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 18px 40px' }}>

        {/* Send section — top when sent, bottom when not */}
        {isSent && (
          <div style={{ background: 'linear-gradient(135deg,#F0ECFB,#E8E2F6)', borderRadius: 14, padding: '18px 16px', marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#2A2A2A', marginBottom: 4 }}>🎉 Ready to send!</div>
            <div style={{ fontSize: '.82rem', color: '#7A7585', fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>
              Share this link directly with {recipientName} — they&apos;ll see the full card with all the messages.
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, fontSize: '.78rem', color: '#7C5CBF', fontWeight: 700, wordBreak: 'break-all', background: '#fff', border: '1.5px solid #D4C8EE', borderRadius: 8, padding: '8px 10px' }}>
                {origin}/view/{slug}
              </div>
              <button onClick={copyRecipientLink} style={{ background: '#7C5CBF', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#fff', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito',sans-serif" }}>
                {copiedRecipient ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {(() => {
                const from = campaign.occasion ? campaign.occasion.replace(/^From\s+/i, '') : 'Your team';
                const msg = `Hey ${recipientName}! ${from} made you a card 🎉 Open it here: ${origin}/view/${slug}`;
                return (<>
                  <a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, background: '#25D366', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
                    💬 WhatsApp
                  </a>
                  <a href={`sms:?body=${encodeURIComponent(msg)}`}
                    style={{ flex: 1, background: '#5AC8FA', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
                    💬 SMS
                  </a>
                  <a href={`mailto:?subject=A card for you, ${recipientName}&body=${encodeURIComponent(msg)}`}
                    style={{ flex: 1, background: '#3A8FA0', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
                    ✉️ Email
                  </a>
                </>);
              })()}
            </div>
            <a href={`/view/${slug}`} target="_blank"
              style={{ display: 'block', textAlign: 'center', color: '#7C5CBF', fontWeight: 700, fontSize: '.82rem', textDecoration: 'none' }}>
              Preview what {recipientName} will see →
            </a>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Signed', value: totalContributors },
            { label: 'Days left', value: daysLeft !== null ? (daysLeft > 0 ? daysLeft : '—') : '∞' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#2A2A2A' }}>{s.value}</div>
              <div style={{ fontSize: '.68rem', fontWeight: 700, color: '#B0A8BC', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Share link — only shown before sending */}
        {!isSent && (() => {
          const from = campaign.occasion ? campaign.occasion.replace(/^From\s+/i, '') : 'the team';
          const contribMsg = `We're making a group card for ${recipientName} from ${from} — add your message here 💙 ${origin}/card/${slug}`;
          return (
            <div style={{ background: '#EAF4FB', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#2A2A2A', marginBottom: 6 }}>🔗 Share with contributors</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ flex: 1, fontSize: '.78rem', color: '#3A8FA0', fontWeight: 700, wordBreak: 'break-all', background: '#fff', border: '1.5px solid #C8E8F0', borderRadius: 8, padding: '8px 10px' }}>
                  {origin}/card/{slug}
                </div>
                <button onClick={copyShareLink} style={{ background: '#3A8FA0', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`https://wa.me/?text=${encodeURIComponent(contribMsg)}`} target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, background: '#25D366', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
                  💬 WhatsApp
                </a>
                <a href={`sms:?body=${encodeURIComponent(contribMsg)}`}
                  style={{ flex: 1, background: '#5AC8FA', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
                  💬 SMS
                </a>
                <a href={`mailto:?subject=Add your message to ${recipientName}'s card&body=${encodeURIComponent(contribMsg)}`}
                  style={{ flex: 1, background: '#3A8FA0', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
                  ✉️ Email
                </a>
              </div>
            </div>
          );
        })()}

        {/* Card preview */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase' }}>Card preview</div>
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(60,50,100,.14)' }}>
            {campaign.card_style === 'casual' ? (
              <CasualView
                campaign={campaign}
                contributions={contributions.map(c => ({ contributor_name: c.contributor_name, message: c.message, photo_url: c.photo_url, photo_label: c.photo_label }))}
                preview
              />
            ) : (
              <CardScrollView
                theme={theme}
                imgIdx={0}
                customImgUrl={campaign.card_image_url ?? undefined}
                recipientName={recipientName}
                fromText={campaign.occasion ?? undefined}
                message={campaign.card_message ?? ''}
                messages={messages}
                landscapeCover
              />
            )}
          </div>
          <a
            href={`/view/${slug}?preview=1`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', textAlign: 'center', marginTop: 10,
              background: '#fff', border: '2px solid #E8E2F0', borderRadius: 10,
              padding: '10px', fontWeight: 800, fontSize: '.85rem',
              color: '#3A8FA0', textDecoration: 'none',
            }}
          >
            Open full preview as recipient ↗
          </a>
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
                <div key={c.id} style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#3A8FA0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.85rem', color: '#fff', flexShrink: 0 }}>
                    {c.contributor_name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#2A2A2A' }}>{c.contributor_name}</div>
                    {c.message && <div style={{ fontSize: '.78rem', color: '#7A7585', fontWeight: 600, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{c.message}"</div>}
                    {c.photo_url && !c.message && <div style={{ fontSize: '.78rem', color: '#7A7585', fontWeight: 600, marginTop: 2 }}>📷 Photo</div>}
                  </div>
                  {c.photo_url && (
                    <img src={c.photo_url} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Send card section — only shown before sending; sent state is at top */}
        {!isSent && (
          <div style={{ background: 'linear-gradient(135deg,#FDF0E8,#FAE4D4)', borderRadius: 14, padding: '18px 16px' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#2A2A2A', marginBottom: 4 }}>🎉 Happy with the card?</div>
            <div style={{ fontSize: '.82rem', color: '#7A7585', fontWeight: 600, marginBottom: 6, lineHeight: 1.5 }}>
              Once everyone has signed, pay $15 to unlock the recipient link and send the card to {recipientName}.
            </div>
            <div style={{ fontSize: '.75rem', color: '#B0A8BC', fontWeight: 600, marginBottom: 16 }}>
              Contributors can still sign after you pay.
            </div>
            <button
              onClick={handlePay}
              disabled={paying}
              style={{ width: '100%', background: paying ? '#B0A8BC' : '#E8724A', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 800, fontSize: '1rem', cursor: paying ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}
            >
              {paying ? 'Redirecting…' : `Send the card — $15 →`}
            </button>
          </div>
        )}

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
