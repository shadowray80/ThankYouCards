'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Nav } from '@/components/ui/Nav';
import { Btn } from '@/components/ui/Button';
import { GiftSelector } from '@/components/forms/GiftSelector';
import { GiftProgress } from '@/components/dashboard/GiftProgress';
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
  deadline: string | null;
  status: string;
}

interface Contribution {
  id: string;
  contributor_name: string;
  message: string | null;
  amount: number;
}

interface ContribViewProps {
  onBack: () => void;
  onToCard: () => void;
  onToast: (msg: string) => void;
  onNav: (view: string) => void;
  campaignSlug?: string;
}

export function ContribView({ onBack, onToast, onNav, campaignSlug: initialSlug }: ContribViewProps) {
  const DEMO_CAMPAIGN: Campaign = { id: 'demo', slug: 'demo', recipient_name: 'Coach Dave', occasion: 'Coach', card_theme: 'coach', card_message: 'Thank you Coach!', card_image_url: null, funded_amount: 87, target_amount: 150, deadline: null, status: 'active' };

  const [slugInput, setSlugInput]         = useState('');
  const [activeSlug, setActiveSlug]       = useState(initialSlug ?? 'demo');
  const [manageToken, setManageToken]     = useState<string | null>(null);

  useEffect(() => {
    if (initialSlug && initialSlug !== 'demo') {
      const sessions = JSON.parse(localStorage.getItem('tyc_manage') ?? '{}');
      if (sessions[initialSlug]) setManageToken(sessions[initialSlug]);
    }
  }, [initialSlug]);
  const [campaign, setCampaign]           = useState<Campaign | null>(initialSlug ? null : DEMO_CAMPAIGN);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading]             = useState(false);
  const [loadError, setLoadError]         = useState('');

  const [msg, setMsg]               = useState('');
  const [photoUrl, setPhotoUrl]     = useState<string | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');
  const photoInputRef               = useRef<HTMLInputElement>(null);
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [giftSel, setGiftSel]       = useState<string | null>(null);
  const [giftCustom, setGiftCustom] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [myContrib, setMyContrib]       = useState<{ id: string; name: string; message: string; amount?: number } | null>(null);

  const hasMsg      = msg.trim().length > 0 || photoUrl !== null;
  const hasAmount   = !!(giftSel || giftCustom);
  const validEmail  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit   = name.trim() && hasMsg;
  const canPay      = canSubmit && validEmail;

  useEffect(() => {
    if (!activeSlug || activeSlug === 'demo') return;
    setLoading(true);
    setLoadError('');
    fetch(`/api/campaigns/${activeSlug}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) { setLoadError(json.error); return; }
        setCampaign(json.campaign);
        setContributions(json.contributions ?? []);
      })
      .catch(() => setLoadError('Could not load campaign'))
      .finally(() => setLoading(false));
  }, [activeSlug]);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setUploadError('');
    const fd = new FormData();
    fd.append('file', f);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setPhotoUrl(json.url);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  }

  async function submitMessageOnly() {
    if (!campaign) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaign.id, contributor_name: name, message: msg || null, photo_url: photoUrl, contributor_email: email.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      const saved = { id: json.contribution.id, name, message: msg };
      localStorage.setItem(`tyc_contrib_${activeSlug}`, JSON.stringify(saved));
      setMyContrib(saved);
      setContributions(prev => [...prev, { id: json.contribution.id, contributor_name: name, message: msg || null, amount: 0 }]);
      setMsg(''); setName(''); setGiftSel(null); setGiftCustom('');
      onToast("You're on the card! ✨");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }


  async function submitWithPayment(overrideName?: string, overrideMsg?: string) {
    if (!campaign) return;
    const amountCents = Math.round(Number(giftSel || giftCustom) * 100);
    if (!amountCents || amountCents < 100) { setSubmitError('Please enter an amount of at least $1'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaign.id, contributor_name: overrideName ?? name, message: (overrideMsg ?? msg) || null, amount_cents: amountCents, contributor_email: email.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to start checkout');
      // Save to localStorage now so when Stripe redirects back they're recognised
      const saved = { id: json.contribution_id, name: overrideName ?? name, message: (overrideMsg ?? msg) || '', amount: amountCents / 100 };
      localStorage.setItem(`tyc_contrib_${activeSlug}`, JSON.stringify(saved));
      window.location.href = json.url;
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  // ── No slug — lookup screen ──
  if (!activeSlug || (!campaign && !loading && !loadError)) {
    return (
      <div>
        <Nav onHome={onBack} onNav={onNav} />
        <div style={{ padding: '40px 24px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.3rem', color: '#2A2A2A', marginBottom: 8 }}>Contributor view</div>
          <div style={{ color: '#7A7585', fontSize: '.88rem', marginBottom: 20 }}>Enter a campaign slug to load a real card, or load the demo to preview the experience.</div>
          <input
            value={slugInput} onChange={e => setSlugInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && slugInput.trim() && setActiveSlug(slugInput.trim())}
            placeholder="e.g. coach-dave-n8l4n"
            style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box' }}
          />
          <Btn variant="teal" full onClick={() => setActiveSlug(slugInput.trim())} style={{ marginTop: 12 }} disabled={!slugInput.trim()}>Load card →</Btn>
{loadError && <div style={{ color: '#E8724A', fontWeight: 700, fontSize: '.85rem', marginTop: 10 }}>{loadError}</div>}
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ padding: '80px 24px', textAlign: 'center', color: '#7A7585', fontWeight: 700 }}>Loading…</div>;

  if (loadError || !campaign) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ color: '#E8724A', fontWeight: 800, fontSize: '1rem', marginBottom: 12 }}>Campaign not found</div>
        <Btn variant="outline" onClick={() => { setActiveSlug(''); setLoadError(''); }}>Try another code</Btn>
      </div>
    );
  }

  const theme = THEMES.find(t => t.id === campaign.card_theme) ?? THEMES[0];
  const recipientName = campaign.recipient_name.charAt(0).toUpperCase() + campaign.recipient_name.slice(1);
  const deadlineStr = campaign.deadline
    ? new Date(campaign.deadline).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const noGift     = campaign.target_amount === 0;
  const hasTarget  = campaign.target_amount !== null && campaign.target_amount > 0;
  const openFund   = campaign.target_amount === null;

  // If myContrib has an amount and isn't in the paid list yet (webhook pending), show it optimistically
  const myContribIsPending = myContrib?.amount && !contributions.find(c => c.id === myContrib.id);
  const displayFunded = campaign.funded_amount + (myContribIsPending ? (myContrib?.amount ?? 0) : 0);
  const pct = hasTarget ? Math.min(100, Math.round((displayFunded / campaign.target_amount!) * 100)) : 0;

  const existingMsgs = contributions.map(c => ({ name: c.contributor_name, msg: c.message ?? '' }));

  // If their paid contribution is still pending in DB, show their message optimistically
  const optimisticMsg: { name: string; msg: string }[] = myContribIsPending && myContrib?.message
    ? [{ name: myContrib.name, msg: myContrib.message }]
    : [];

  const previewMsgs = name.trim() && msg.trim()
    ? [...existingMsgs, ...optimisticMsg, { name: name.trim(), msg: msg.trim() }]
    : [...existingMsgs, ...optimisticMsg];

  return (
    <div>
      {/* Organiser recovery banner */}
      {manageToken && (
        <a
          href={`/manage/${activeSlug}?token=${manageToken}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#F0ECFB', borderBottom: '1px solid #D4C8EE', padding: '10px 16px', textDecoration: 'none', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '.82rem', color: '#7C5CBF' }}
        >
          🔐 Organiser view — back to your dashboard →
        </a>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#3A8FA0,#5AAFBF)', padding: '18px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1rem', color: 'rgba(255,255,255,.85)' }}>
            thank<span style={{ color: '#fff' }}>you</span>cards<span style={{ color: 'rgba(255,255,255,.5)' }}>.au</span>
          </div>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8, padding: '5px 10px', color: 'rgba(255,255,255,.85)', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer' }}>← Home</button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {campaign.occasion && <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,.15)', borderRadius: 20, padding: '4px 10px', fontSize: '.74rem', color: 'rgba(255,255,255,.9)', fontWeight: 700 }}>{campaign.occasion}</div>}
          {deadlineStr && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.15)', borderRadius: 20, padding: '4px 10px', fontSize: '.74rem', color: 'rgba(255,255,255,.9)', fontWeight: 700 }}>⏰ Closes {deadlineStr}</div>}
        </div>
        {hasTarget && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'rgba(255,255,255,.7)', marginBottom: 5, letterSpacing: '.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              Gift fund — ${displayFunded} raised of ${campaign.target_amount}
              {pct >= 100 && <span style={{ background: '#4ADE80', color: '#166534', borderRadius: 20, padding: '1px 8px', fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em' }}>✓ Goal reached!</span>}
            </div>
            <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: '#4ADE80', borderRadius: 8, transition: 'width .5s ease' }} />
            </div>
          </div>
        )}
        {openFund && displayFunded > 0 && (
          <div style={{ marginTop: 10, fontSize: '.72rem', fontWeight: 800, color: 'rgba(255,255,255,.85)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
            💰 ${displayFunded} raised so far
          </div>
        )}
      </div>

      {/* Card preview */}
      <div style={{ padding: '16px 18px 0' }}>
        <CardScrollView
          theme={theme} imgIdx={0}
          customImgUrl={campaign.card_image_url ?? undefined}
          recipientName={recipientName}
          fromText={campaign.occasion ?? undefined}
          message={campaign.card_message ?? ''}
          messages={previewMsgs}
          giftAmount={displayFunded > 0 ? displayFunded : undefined}
        />
      </div>

      {/* Form */}
      <div style={{ padding: '20px 18px 160px' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Your name</label>
          <input
            value={name} onChange={e => setName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
            placeholder="e.g. Sarah (Liam's mum)"
            autoCapitalize="words"
            style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
            onFocus={e => (e.target.style.borderColor = '#3A8FA0')}
            onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Your message</label>
          <textarea
            value={msg} onChange={e => setMsg(e.target.value)}
            placeholder={`Write something nice…`}
            maxLength={400}
            style={{ width: '100%', minHeight: 150, border: '2px solid #E8E2F0', borderRadius: 12, padding: 14, fontFamily: "'Lora',serif", fontSize: '1rem', color: '#2A2A2A', background: '#FFFDF8', resize: 'vertical', lineHeight: 1.7, outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
            onFocus={e => (e.target.style.borderColor = '#3A8FA0')}
            onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
          />
          <div style={{ textAlign: 'right', fontSize: '.73rem', color: '#7A7585', marginTop: 4 }}>{msg.length}/400</div>

          {/* Photo upload */}
          <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoSelect} />
          {!photoUrl ? (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploading}
              style={{ marginTop: 10, background: 'none', border: '2px dashed #E8E2F0', borderRadius: 10, padding: '10px 14px', width: '100%', cursor: uploading ? 'default' : 'pointer', color: '#7A7585', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {uploading ? '⏳ Uploading…' : '📷 Add a photo (optional)'}
            </button>
          ) : (
            <div style={{ marginTop: 10, position: 'relative' }}>
              <img src={photoUrl} alt="Your photo" style={{ width: '100%', borderRadius: 10, display: 'block', maxHeight: 220, objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => setPhotoUrl(null)}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.55)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#fff', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>
          )}
          {uploadError && <div style={{ fontSize: '.75rem', color: '#E8724A', fontWeight: 700, marginTop: 6 }}>{uploadError}</div>}
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            Your email {hasAmount ? <span style={{ color: '#E8724A' }}>*</span> : <span style={{ color: '#B0A8BC', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>— optional</span>}
          </label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
            onFocus={e => (e.target.style.borderColor = '#3A8FA0')}
            onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
          />
          <div style={{ fontSize: '.72rem', color: '#B0A8BC', marginTop: 4, fontWeight: 600 }}>
            {hasAmount ? 'Required — Stripe will send your payment receipt here' : "We'll send you the card link so you can check back anytime"}
          </div>
        </div>
        {/* Gift selector — hidden until gift fund feature is reinstated
        <div style={{ borderTop: '2px solid #E8E2F0', paddingTop: 20 }}>
          {!openFund && noGift ? (
            <div style={{ background: '#F0ECFB', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#7C5CBF', marginBottom: 2 }}>Want to chip in anyway? <span style={{ fontWeight: 600, color: '#B0A8BC' }}>— optional</span></div>
              <div style={{ fontSize: '.8rem', color: '#7A7585', lineHeight: 1.5, fontWeight: 600 }}>No gift was planned, but contributions are welcome. Completely your call.</div>
            </div>
          ) : hasTarget ? (
            <div style={{ marginBottom: 14 }}>
              <GiftProgress raised={campaign.funded_amount} target={campaign.target_amount!} />
              <div style={{ marginTop: 8, fontSize: '.82rem', color: '#7A7585', fontWeight: 600 }}>Every bit helps — no minimum, no pressure.</div>
            </div>
          ) : (
            <div style={{ marginBottom: 14 }} />
          )}
          <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2A2A2A', marginBottom: 10 }}>Choose an amount</div>
          <GiftSelector selected={giftSel} onSelect={a => { setGiftSel(a); setGiftCustom(''); }} custom={giftCustom} onCustom={v => { setGiftCustom(v); setGiftSel(null); }} />
        </div>
        */}
        {submitError && <div style={{ color: '#E8724A', fontWeight: 700, fontSize: '.85rem', marginTop: 12 }}>{submitError}</div>}
      </div>

      {/* Sticky buttons */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '12px 18px', background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(8px)', borderTop: '1px solid #E8E2F0', zIndex: 100 }}>
        {hasAmount ? (
          <>
            <Btn variant="coral" full disabled={!canPay || submitting} onClick={() => submitWithPayment()}>
              {submitting ? 'Starting checkout…' : `Add message + contribute $${giftSel || giftCustom} →`}
            </Btn>
            {!validEmail && <div style={{ fontSize: '.75rem', color: '#E8724A', fontWeight: 700, marginTop: 6, textAlign: 'center' }}>Please enter your email to continue</div>}
            <Btn variant="outline" full disabled={submitting} onClick={submitMessageOnly} style={{ marginTop: 8 }}>Just my message, no contribution</Btn>
          </>
        ) : (
          <Btn variant="teal" full disabled={!canSubmit || submitting} onClick={submitMessageOnly}>
            {submitting ? 'Saving…' : 'Add my message →'}
          </Btn>
        )}
      </div>
    </div>
  );
}
