'use client';

import React, { useState, useRef } from 'react';
import { Nav } from '@/components/ui/Nav';
import { Btn } from '@/components/ui/Button';
import { BackBtn } from '@/components/ui/BackBtn';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { MessageTabs } from '@/components/forms/MessageTabs';
import { GiftSelector } from '@/components/forms/GiftSelector';
import { THEMES } from '@/lib/themes';

interface SoloFlowProps {
  onBack: () => void;
  onToast: (msg: string) => void;
  onNav: (view: string) => void;
}

export function SoloFlow({ onBack, onToast, onNav }: SoloFlowProps) {
  const [themeIdx, setThemeIdx] = useState(7); // Mates
  const [imgIdx, setImgIdx] = useState(0);
  const [customImgUrl, setCustomImgUrl] = useState<string | null>(null);
  const [themeOpen, setThemeOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [failedImgs, setFailedImgs] = useState<Set<number>>(new Set());

  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [cardMsg, setCardMsg] = useState(THEMES[7].frontMsg);

  // Message
  const [msgMode, setMsgMode] = useState<'typed' | 'handwritten'>('typed');
  const [msg, setMsg] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);

  // Gift
  const [includeGift, setIncludeGift] = useState(false);
  const [giftSel, setGiftSel] = useState<string | null>('25');
  const [giftCustom, setGiftCustom] = useState('');

  const [showDone, setShowDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const uploadRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    setSaving(true);
    try {
      const imageUrl = customImgUrl || theme.imgs[imgIdx < 0 ? 0 : imgIdx];
      const campaignRes = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: to.trim(),
          occasion: theme.name,
          target_amount: 0,
          card_theme: theme.id,
          card_message: cardMsg.trim(),
          card_image_url: imageUrl,
        }),
      });
      const campaignData = await campaignRes.json();
      if (!campaignRes.ok) throw new Error(campaignData.error ?? `HTTP ${campaignRes.status}`);
      const campaign = campaignData.campaign;
      const contribRes = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          contributor_name: from.trim() || 'From a friend',
          message: msgMode === 'typed' && msg.trim() ? msg.trim() : null,
        }),
      });
      const contribData = await contribRes.json();
      if (!contribRes.ok) throw new Error(contribData.error ?? `HTTP ${contribRes.status}`);
      setSlug(campaign.slug);
      setShowDone(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Something went wrong — please try again');
    } finally {
      setSaving(false);
    }
  }

  const theme = THEMES[themeIdx];
  const hasMsg = msgMode === 'typed' ? msg.trim().length > 0 : photoData !== null;
  const canContinue = to.trim().length > 0 && hasMsg;
  const giftAmount = includeGift ? Number(giftSel || giftCustom) || 0 : 0;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => { setCustomImgUrl(ev.target?.result as string); setImgIdx(-1); };
    r.readAsDataURL(f);
  };

  const handleMsgPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setPhotoData(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const selectThemeImg = (j: number) => { setImgIdx(j); setCustomImgUrl(null); };
  const selectTheme = (i: number) => { setThemeIdx(i); setImgIdx(0); setCustomImgUrl(null); setCardMsg(THEMES[i].frontMsg); setMoreOpen(false); setFailedImgs(new Set()); };

  if (showDone && slug) {
    const recipientUrl = `thankyoucards.au/view/${slug}`;
    const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://thankyoucards.au'}/view/${slug}`;
    const shareText = `I made you a card — open it here: ${fullUrl}`;
    return (
      <div>
        <Nav onHome={onBack} onNav={onNav} badge="solo" />
        <div style={{ padding: '22px 18px 60px', maxWidth: 480, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: '3.2rem', marginBottom: 8 }}>🎉</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#2A2A2A', marginBottom: 6 }}>Card ready!</div>
            <div style={{ color: '#7A7585', fontSize: '.9rem', lineHeight: 1.6, fontWeight: 600 }}>
              Share this link with {to} to deliver their card.
            </div>
          </div>

          <CardScrollView
            theme={theme}
            imgIdx={imgIdx < 0 ? 0 : imgIdx}
            customImgUrl={customImgUrl ?? undefined}
            recipientName={to}
            fromText={from || 'From a friend'}
            message={cardMsg}
            soloMessage={msgMode === 'typed' ? msg : undefined}
            soloPhotoData={msgMode === 'handwritten' ? (photoData ?? undefined) : undefined}
            messages={[]}
            landscapeCover
            giftAmount={giftAmount}
          />

          {/* Recipient share link */}
          <div style={{ background: '#F0ECFB', border: '2px solid rgba(124,92,191,.2)', borderRadius: 14, padding: '16px', marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#2A2A2A', marginBottom: 8 }}>🔗 Share with {to}</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, fontSize: '.78rem', color: '#7C5CBF', fontWeight: 700, wordBreak: 'break-all', background: '#fff', border: '1.5px solid #D4C8EE', borderRadius: 8, padding: '8px 10px' }}>
                {recipientUrl}
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(fullUrl); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }}
                style={{ background: '#7C5CBF', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#fff', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito',sans-serif" }}
              >
                {copiedLink ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, background: '#25D366', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
                💬 WhatsApp
              </a>
              <a href={`mailto:?subject=A card for you, ${to}&body=${encodeURIComponent(shareText)}`}
                style={{ flex: 1, background: '#3A8FA0', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
                ✉️ Email
              </a>
              <a href={`/view/${slug}`} target="_blank"
                style={{ flex: 1, background: '#fff', color: '#7C5CBF', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', border: '2px solid #D4C8EE', fontFamily: "'Nunito',sans-serif" }}>
                👁 Preview
              </a>
            </div>
          </div>

          <Btn variant="outline" full onClick={onBack}>Make another card</Btn>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav onHome={onBack} onNav={onNav} badge="solo" />

      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}>
        <div style={{ padding: '16px 18px 0' }}>
          <BackBtn onClick={onBack} />
        </div>

        {/* ── Live card preview ── */}
        <div style={{ padding: '0 18px' }}>
          <CardScrollView
            theme={theme}
            imgIdx={imgIdx < 0 ? 0 : imgIdx}
            customImgUrl={customImgUrl ?? undefined}
            recipientName={to}
            fromText={from || 'From'}
            message={cardMsg}
            soloMessage={msgMode === 'typed' ? msg : undefined}
            soloPhotoData={msgMode === 'handwritten' ? (photoData ?? undefined) : undefined}
            messages={[]}
            landscapeCover
            giftAmount={giftAmount}
          />
        </div>

        {/* ── Theme strip ── */}
        <div style={{ background: '#B8DCEA', padding: '10px 14px 12px' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#1F6B7A', marginBottom: 8, letterSpacing: '.06em', textTransform: 'uppercase' }}>What's the occasion?</div>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
            {THEMES.slice(0, 4).map((t, i) => {
              const isSelected = themeIdx === i;
              return (
                <div
                  key={t.id}
                  onClick={() => selectTheme(i)}
                  style={{
                    flexShrink: 0, width: 80, height: 60, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', position: 'relative',
                    border: isSelected ? '3px solid #3A8FA0' : '3px solid rgba(58,143,160,.2)',
                    boxShadow: isSelected ? '0 0 0 2px rgba(58,143,160,.3)' : 'none',
                    background: t.color, transition: 'all .2s',
                  }}
                >
                  <img src={t.imgs[0]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,.1) 60%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 5px 5px', textAlign: 'center', fontSize: '.57rem', fontWeight: 800, color: '#fff', letterSpacing: '.03em', textTransform: 'uppercase', lineHeight: 1.25 }}>
                    {t.name}
                  </div>
                  {isSelected && (
                    <div style={{ position: 'absolute', top: 5, right: 5, background: '#3A8FA0', color: '#fff', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', fontWeight: 800 }}>✓</div>
                  )}
                </div>
              );
            })}

            {/* More button */}
            <div
              onClick={() => setThemeOpen(o => !o)}
              style={{
                flexShrink: 0, width: 80, height: 60, borderRadius: 8, cursor: 'pointer',
                border: themeOpen ? '3px solid #3A8FA0' : '3px solid rgba(58,143,160,.2)',
                background: themeOpen ? 'rgba(58,143,160,.25)' : 'rgba(58,143,160,.12)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                transition: 'all .2s',
              }}
            >
              <span style={{ fontSize: '1rem', color: '#3A8FA0', fontWeight: 800 }}>{themeOpen ? '✕' : '⊞'}</span>
              <span style={{ fontSize: '.55rem', color: '#3A8FA0', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{themeOpen ? 'Close' : 'More'}</span>
            </div>
          </div>
        </div>

        {/* ── Theme More accordion ── */}
        {themeOpen && (
          <div style={{ background: '#A3CFDF', padding: '12px 14px 16px' }}>
            <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#3A8FA0', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>All themes</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {THEMES.map((t, i) => (
                <div
                  key={t.id}
                  onClick={() => selectTheme(i)}
                  style={{
                    borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative',
                    aspectRatio: '4/3', background: t.color,
                    border: themeIdx === i ? '3px solid #3A8FA0' : '3px solid transparent',
                    boxShadow: themeIdx === i ? '0 0 0 2px rgba(58,143,160,.4)' : 'none',
                    transition: 'all .2s',
                  }}
                >
                  <img src={t.imgs[0]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,.75))', padding: '20px 10px 8px' }}>
                    <div style={{ color: '#fff', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>{t.name}</div>
                  </div>
                  <div style={{ position: 'absolute', top: 6, right: 6, fontSize: '1.1rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.5))' }}>{t.emoji}</div>
                  {themeIdx === i && (
                    <div style={{ position: 'absolute', top: 6, left: 6, background: '#3A8FA0', color: '#fff', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800 }}>✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Image strip ── */}
        <div style={{ background: '#2A7E8F', padding: '10px 14px 12px' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: 'rgba(255,255,255,.7)', marginBottom: 8, letterSpacing: '.06em', textTransform: 'uppercase' }}>Choose a vibe they'll love</div>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
            {/* Upload button */}
            <div
              onClick={() => uploadRef.current?.click()}
              style={{
                flexShrink: 0, width: 80, height: 60, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                border: customImgUrl ? '3px solid #fff' : '3px solid rgba(255,255,255,.35)',
                background: 'rgba(255,255,255,.12)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                transition: 'all .2s',
              }}
            >
              {customImgUrl
                ? <img src={customImgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <>
                    <span style={{ fontSize: '1.2rem' }}>📷</span>
                    <span style={{ fontSize: '.55rem', color: 'rgba(255,255,255,.8)', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>Your photo</span>
                  </>
              }
            </div>
            <input ref={uploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />

            {theme.imgs.slice(0, 3).map((url, j) => {
              if (failedImgs.has(j)) return null;
              const isSelected = !customImgUrl && imgIdx === j;
              return (
                <div
                  key={j}
                  onClick={() => selectThemeImg(j)}
                  style={{
                    flexShrink: 0, width: 80, height: 60, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    border: isSelected ? '3px solid #fff' : '3px solid rgba(255,255,255,.2)',
                    boxShadow: isSelected ? '0 0 0 2px rgba(255,255,255,.4)' : 'none',
                    transition: 'all .2s', position: 'relative',
                    background: 'rgba(255,255,255,.1)',
                  }}
                >
                  <img
                    src={url} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setFailedImgs(prev => new Set([...prev, j]))}
                  />
                  {isSelected && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.15)' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', color: '#2A7E8F', fontWeight: 800 }}>✓</div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* More button */}
            <div
              onClick={() => setMoreOpen(o => !o)}
              style={{
                flexShrink: 0, width: 80, height: 60, borderRadius: 8, cursor: 'pointer',
                border: moreOpen ? '3px solid #fff' : '3px solid rgba(255,255,255,.35)',
                background: moreOpen ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.12)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                transition: 'all .2s',
              }}
            >
              <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 800 }}>{moreOpen ? '✕' : '⊞'}</span>
              <span style={{ fontSize: '.55rem', color: 'rgba(255,255,255,.85)', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{moreOpen ? 'Close' : 'More'}</span>
            </div>
          </div>
        </div>

        {/* ── More images accordion ── */}
        {moreOpen && (
          <div style={{ background: '#1F6B7A', padding: '12px 14px 16px' }}>
            <div style={{ fontSize: '.68rem', fontWeight: 800, color: 'rgba(255,255,255,.6)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>All images for this theme</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {theme.imgs.map((url, j) => {
                if (failedImgs.has(j)) return null;
                const isSelected = !customImgUrl && imgIdx === j;
                return (
                  <div
                    key={j}
                    onClick={() => selectThemeImg(j)}
                    style={{
                      borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative',
                      aspectRatio: '4/3', background: 'rgba(255,255,255,.1)',
                      border: isSelected ? '3px solid #fff' : '3px solid transparent',
                      boxShadow: isSelected ? '0 0 0 2px rgba(255,255,255,.4)' : 'none',
                      transition: 'all .2s',
                    }}
                  >
                    <img src={url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setFailedImgs(prev => new Set([...prev, j]))} />
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 8, left: 8, background: '#fff', color: '#2A7E8F', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800 }}>✓</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Form fields ── */}
        <div style={{ padding: '22px 18px 0' }}>

          {/* Recipient name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              Recipient name
            </label>
            <input
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="The Absolute Legend"
              style={{
                width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px',
                fontFamily: 'var(--font-dancing), cursive', fontSize: '1.3rem', color: '#2A2A2A',
                background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#3A8FA0')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
            <div style={{ fontSize: '.72rem', color: '#B0A8BC', marginTop: 4 }}>Appears on the card in a beautiful script font</div>
          </div>

          {/* Card message */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              Cover message
            </label>
            <input
              value={cardMsg}
              onChange={e => setCardMsg(e.target.value)}
              style={{
                width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px',
                fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: '1rem', color: '#2A2A2A',
                background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#3A8FA0')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
            <div style={{ fontSize: '.72rem', color: '#B0A8BC', marginTop: 4 }}>Shown on the cover — pre-filled from your theme</div>
          </div>

          {/* From */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              From
            </label>
            <input
              value={from}
              onChange={e => setFrom(e.target.value)}
              placeholder="e.g. Tim & family"
              style={{
                width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px',
                fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#2A2A2A',
                background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#3A8FA0')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
          </div>

          {/* Message — typed or handwritten */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              Your message
            </label>
            <MessageTabs
              mode={msgMode}
              onSwitch={m => { setMsgMode(m); setPhotoData(null); setMsg(''); }}
              msg={msg}
              onMsgChange={setMsg}
              photoData={photoData}
              onPhoto={handleMsgPhoto}
              onRetake={() => setPhotoData(null)}
            />
          </div>

          {/* Gift voucher */}
          <div style={{ marginBottom: 24 }}>
            <div
              onClick={() => setIncludeGift(g => !g)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: includeGift ? '#EAF4FB' : '#FAFAFA',
                border: includeGift ? '2px solid #3A8FA0' : '2px solid #E8E2F0',
                borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all .2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>💳</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.93rem', color: '#2A2A2A' }}>Add a Visa gift card</div>
                  <div style={{ fontSize: '.76rem', color: '#7A7585', marginTop: 1 }}>Spendable anywhere, any country</div>
                </div>
              </div>
              {/* Toggle */}
              <div style={{
                width: 42, height: 24, borderRadius: 12, position: 'relative', flexShrink: 0,
                background: includeGift ? '#3A8FA0' : '#D1C8DC', transition: 'background .2s',
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: includeGift ? 21 : 3, width: 18, height: 18,
                  borderRadius: '50%', background: '#fff', transition: 'left .2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,.2)',
                }} />
              </div>
            </div>

            {includeGift && (
              <div style={{ marginTop: 12, padding: '16px 16px 4px', background: '#EAF4FB', borderRadius: 12, border: '2px solid rgba(58,143,160,.2)' }}>
                <div style={{ fontSize: '.75rem', fontWeight: 800, color: '#3A8FA0', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>Choose amount</div>
                <GiftSelector
                  selected={giftSel}
                  onSelect={a => { setGiftSel(a); setGiftCustom(''); }}
                  custom={giftCustom}
                  onCustom={v => { setGiftCustom(v); setGiftSel(null); }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky continue button ── */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '12px 18px', background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #E8E2F0', zIndex: 100 }}>
          <Btn variant="teal" full disabled={!canContinue || saving} onClick={handleSubmit}>
            {saving ? 'Saving…' : includeGift && giftAmount > 0 ? `Continue → Card + $${giftAmount} gift` : 'Continue → Send this card'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
