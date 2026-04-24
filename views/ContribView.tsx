'use client';

import React, { useState, useEffect } from 'react';
import { Nav } from '@/components/ui/Nav';
import { Btn } from '@/components/ui/Button';
import { MessageTabs } from '@/components/forms/MessageTabs';
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
  target_amount: number;
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
  const [slugInput, setSlugInput]         = useState('');
  const [activeSlug, setActiveSlug]       = useState(initialSlug ?? '');
  const [campaign, setCampaign]           = useState<Campaign | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading]             = useState(false);
  const [loadError, setLoadError]         = useState('');

  const [phase, setPhase]         = useState<'card' | 'form'>('card');
  const [msgMode, setMsgMode]     = useState<'typed' | 'handwritten'>('typed');
  const [msg, setMsg]             = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [name, setName]           = useState('');
  const [giftSel, setGiftSel]     = useState<string | null>(null);
  const [giftCustom, setGiftCustom] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [contributeOnly, setContributeOnly] = useState(false);
  const [myContrib, setMyContrib] = useState<{ id: string; name: string; message: string } | null>(null);

  const hasMsg    = msgMode === 'typed' ? msg.trim().length > 0 : photoData !== null;
  const hasAmount = !!(giftSel || giftCustom);
  const canSubmit = name.trim() && hasMsg;

  useEffect(() => {
    if (!activeSlug) return;
    setLoading(true);
    setLoadError('');
    fetch(`/api/campaigns/${activeSlug}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) { setLoadError(json.error); return; }
        setCampaign(json.campaign);
        setContributions(json.contributions ?? []);
        setPhase('card');
        const saved = localStorage.getItem(`tyc_contrib_${activeSlug}`);
        if (saved) setMyContrib(JSON.parse(saved));
      })
      .catch(() => setLoadError('Could not load campaign'))
      .finally(() => setLoading(false));
  }, [activeSlug]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setPhotoData(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  async function submitMessageOnly() {
    if (!campaign) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaign.id, contributor_name: name, message: msg || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      const saved = { id: json.contribution.id, name, message: msg };
      localStorage.setItem(`tyc_contrib_${activeSlug}`, JSON.stringify(saved));
      setMyContrib(saved);
      setContributions(prev => [...prev, { id: json.contribution.id, contributor_name: name, message: msg || null, amount: 0 }]);
      onToast("You're on the card! ✨");
      setPhase('card');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitEdit() {
    if (!myContrib) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`/api/contributions/${myContrib.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      if (!res.ok) throw new Error('Failed to update message');
      const updated = { ...myContrib, message: msg };
      localStorage.setItem(`tyc_contrib_${activeSlug}`, JSON.stringify(updated));
      setMyContrib(updated);
      setContributions(prev => prev.map(c => c.id === myContrib.id ? { ...c, message: msg } : c));
      setIsEditing(false);
      setPhase('card');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitWithPayment(overrideName?: string, overrideMsg?: string) {
    if (!campaign) return;
    const amountCents = Math.round(Number(giftSel || giftCustom) * 100);
    if (!amountCents || amountCents < 100) {
      setSubmitError('Please enter an amount of at least $1');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaign.id, contributor_name: overrideName ?? name, message: (overrideMsg ?? msg) || null, amount_cents: amountCents }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to start checkout');
      window.location.href = json.url;
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  const theme = THEMES.find(t => t.id === campaign?.card_theme) ?? THEMES[0];
  const recipientName = campaign
    ? campaign.recipient_name.charAt(0).toUpperCase() + campaign.recipient_name.slice(1)
    : '';
  const deadlineStr = campaign?.deadline
    ? new Date(campaign.deadline).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  // ── No slug — lookup screen ──
  if (!activeSlug || (!campaign && !loading && !loadError)) {
    return (
      <div>
        <Nav onHome={onBack} onNav={onNav} />
        <div style={{ padding: '40px 24px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.3rem', color: '#2A2A2A', marginBottom: 8 }}>View a campaign</div>
          <div style={{ color: '#7A7585', fontSize: '.88rem', marginBottom: 20 }}>Enter a campaign code to load the card.</div>
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

  const existingMsgs = contributions.map(c => ({ name: c.contributor_name, msg: c.message ?? '' }));

  // When editing, exclude their existing message so it doesn't show twice alongside the draft
  const baseForPreview = isEditing && myContrib
    ? contributions.filter(c => c.id !== myContrib.id).map(c => ({ name: c.contributor_name, msg: c.message ?? '' }))
    : existingMsgs;

  // Live preview includes their draft if they've started typing
  const previewMsgs = phase === 'form' && name.trim() && msg.trim()
    ? [...baseForPreview, { name: name.trim(), msg: msg.trim() }]
    : existingMsgs;

  const tealHeader = (backLabel: string, backFn: () => void, title?: string) => (
    <div style={{ background: 'linear-gradient(135deg,#3A8FA0,#5AAFBF)', padding: '18px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <button onClick={backFn} style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#fff', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer' }}>← {backLabel}</button>
      {title && <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{title}</div>}
      <div style={{ width: 60 }} />
    </div>
  );

  // ── Card view ──
  if (phase === 'card') {
    const pct = campaign.target_amount > 0 ? Math.min(100, Math.round((campaign.funded_amount / campaign.target_amount) * 100)) : 0;
    return (
      <div>
        <div style={{ background: 'linear-gradient(135deg,#3A8FA0,#5AAFBF)', padding: '20px 20px 16px' }}>
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
          {campaign.target_amount > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'rgba(255,255,255,.7)', marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                Gift fund — ${campaign.funded_amount} raised of ${campaign.target_amount}
              </div>
              <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: '#fff', borderRadius: 8, transition: 'width .5s ease' }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '18px 18px 80px', maxWidth: 480, margin: '0 auto' }}>
          <CardScrollView
            theme={theme} imgIdx={0}
            customImgUrl={campaign.card_image_url ?? undefined}
            recipientName={recipientName}
            fromText={campaign.occasion ?? undefined}
            message={campaign.card_message ?? ''}
            messages={existingMsgs}
            giftAmount={campaign.funded_amount > 0 ? campaign.funded_amount : undefined}
            onAddMessage={myContrib ? undefined : () => { setIsEditing(false); setContributeOnly(false); setPhase('form'); }}
          />
          {myContrib ? (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: '#F0ECFB', borderRadius: 12, padding: '12px 14px', fontSize: '.83rem', color: '#7C5CBF', fontWeight: 700 }}>
                👋 Know someone who hasn't added their message yet? Forward them the link!
              </div>
              <button
                onClick={() => { setContributeOnly(true); setGiftSel(null); setGiftCustom(''); setPhase('form'); }}
                style={{ width: '100%', background: '#3A8FA0', border: 'none', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '.9rem', color: '#fff' }}
              >
                💳 Make a contribution
              </button>
              <button
                onClick={() => { setMsg(myContrib.message); setName(myContrib.name); setIsEditing(true); setContributeOnly(false); setPhase('form'); }}
                style={{ width: '100%', background: '#F0ECFB', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '.85rem', color: '#7C5CBF' }}
              >
                ✏️ Edit your message
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // ── Combined form (message + gift on one screen) ──
  if (phase === 'form') {
    const noGift = campaign.target_amount === 0;
    return (
      <div>
        {tealHeader('Back', () => { setIsEditing(false); setPhase('card'); }, isEditing ? 'Edit your message' : 'Add your message')}

        {/* Live card preview */}
        <div style={{ padding: '16px 18px 0', background: '#F7F5FB' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Live preview</div>
          <div style={{ transform: 'scale(0.82)', transformOrigin: 'top left', width: '122%', marginBottom: -40, pointerEvents: 'none' }}>
            <CardScrollView
              theme={theme} imgIdx={0}
              customImgUrl={campaign.card_image_url ?? undefined}
              recipientName={recipientName}
              fromText={campaign.occasion ?? undefined}
              message={campaign.card_message ?? ''}
              messages={previewMsgs}
              landscapeCover
            />
          </div>
        </div>

        <div style={{ padding: '56px 18px 140px' }}>

          {/* Name + message — hidden when contribute-only */}
          {!contributeOnly && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Your name</label>
                <input
                  value={name} onChange={e => setName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                  placeholder="e.g. Sarah (Liam's mum)"
                  disabled={isEditing}
                  autoCapitalize="words"
                  style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#2A2A2A', background: isEditing ? '#F7F5FB' : '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s', opacity: isEditing ? .6 : 1 }}
                  onFocus={e => (e.target.style.borderColor = '#3A8FA0')}
                  onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Your message</label>
                <MessageTabs mode={msgMode} onSwitch={setMsgMode} msg={msg} onMsgChange={setMsg} photoData={photoData} onPhoto={handlePhoto} onRetake={() => setPhotoData(null)} />
              </div>
            </>
          )}

          {/* Gift — shown when not editing, or when contribute-only */}
          {(!isEditing || contributeOnly) && (
            <div style={{ borderTop: '2px solid #E8E2F0', paddingTop: 20 }}>
              {noGift ? (
                <div style={{ background: '#F0ECFB', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#7C5CBF', marginBottom: 2 }}>Want to chip in anyway? <span style={{ fontWeight: 600, color: '#B0A8BC' }}>— optional</span></div>
                  <div style={{ fontSize: '.8rem', color: '#7A7585', lineHeight: 1.5, fontWeight: 600 }}>No gift was planned, but contributions are welcome. Completely your call.</div>
                </div>
              ) : (
                <div style={{ marginBottom: 14 }}>
                  <GiftProgress raised={campaign.funded_amount} target={campaign.target_amount} />
                  <div style={{ marginTop: 10, fontSize: '.82rem', color: '#7A7585', fontWeight: 600 }}>Every bit helps — no minimum, no pressure.</div>
                </div>
              )}
              <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2A2A2A', marginBottom: 10 }}>
                {noGift ? 'Optional amount' : 'Choose an amount'}
              </div>
              <GiftSelector
                selected={giftSel}
                onSelect={a => { setGiftSel(a); setGiftCustom(''); }}
                custom={giftCustom}
                onCustom={v => { setGiftCustom(v); setGiftSel(null); }}
              />
            </div>
          )}

          {submitError && <div style={{ color: '#E8724A', fontWeight: 700, fontSize: '.85rem', marginTop: 12 }}>{submitError}</div>}
        </div>

        {/* Sticky buttons */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '12px 18px', background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(8px)', borderTop: '1px solid #E8E2F0', zIndex: 100 }}>
          {isEditing ? (
            <>
              <Btn variant="teal" full disabled={!hasMsg || submitting} onClick={submitEdit}>{submitting ? 'Saving…' : 'Save changes →'}</Btn>
              <Btn variant="outline" full onClick={() => { setIsEditing(false); setPhase('card'); }} style={{ marginTop: 8 }}>Cancel</Btn>
            </>
          ) : contributeOnly ? (
            <>
              <Btn variant="coral" full disabled={submitting || !hasAmount} onClick={() => submitWithPayment(myContrib?.name, myContrib?.message)}>
                {submitting ? 'Starting checkout…' : `Contribute $${giftSel || giftCustom} →`}
              </Btn>
              <Btn variant="outline" full onClick={() => { setContributeOnly(false); setPhase('card'); }} style={{ marginTop: 8 }}>Cancel</Btn>
            </>
          ) : hasAmount ? (
            <>
              <Btn variant="coral" full disabled={!canSubmit || submitting} onClick={submitWithPayment}>
                {submitting ? 'Starting checkout…' : `Add message + contribute $${giftSel || giftCustom} →`}
              </Btn>
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

}
