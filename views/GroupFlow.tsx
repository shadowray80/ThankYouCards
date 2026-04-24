'use client';

import React, { useState, useRef } from 'react';
import { Nav } from '@/components/ui/Nav';
import { Btn } from '@/components/ui/Button';
import { BackBtn } from '@/components/ui/BackBtn';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { ShareLink } from '@/components/dashboard/ShareLink';
import { THEMES } from '@/lib/themes';

interface GroupFlowProps {
  onBack: () => void;
  onToDash: () => void;
  onToast: (msg: string) => void;
  onNav: (view: string) => void;
}

const GIFT_TYPES = [
  { id: 'visa',   label: '💳 Visa gift card',            desc: 'Spendable anywhere, any country' },
  { id: 'amazon', label: '📦 Amazon voucher',             desc: 'Online shopping, great for gift ideas' },
  { id: 'custom', label: '🎁 We\'re organising our own gift', desc: 'Add a description below' },
  { id: 'none',   label: '💌 No gift — card only',        desc: 'Just the messages' },
];

export function GroupFlow({ onBack, onToDash, onToast, onNav }: GroupFlowProps) {
  const [themeIdx, setThemeIdx]     = useState(11); // Coach
  const [imgIdx, setImgIdx]         = useState(0);
  const [customImgUrl, setCustomImgUrl] = useState<string | null>(null);
  const [themeOpen, setThemeOpen]   = useState(false);
  const [moreOpen, setMoreOpen]     = useState(false);
  const [failedImgs, setFailedImgs] = useState<Set<number>>(new Set());

  const [recip, setRecip]           = useState('');
  const [occasion, setOccasion]     = useState('');
  const [deadline, setDeadline]     = useState('');
  const [cardMsg, setCardMsg]       = useState(THEMES[11].frontMsg);

  const [giftType, setGiftType]     = useState('visa');
  const [giftDesc, setGiftDesc]     = useState('');

  const [organiserEmail, setOrganiserEmail] = useState('');
  const [targetAmount, setTargetAmount]     = useState('');
  const [showDone, setShowDone]             = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [saveError, setSaveError]           = useState('');
  const [campaignSlug, setCampaignSlug]     = useState('');

  const uploadRef = useRef<HTMLInputElement>(null);

  const theme = THEMES[themeIdx];
  const needsTarget = giftType !== 'none';
  const canCreate = recip.trim() && occasion.trim() && deadline && organiserEmail.trim() &&
    (!needsTarget || (targetAmount && Number(targetAmount) > 0));

  async function handleCreate() {
    setSaveError('');
    setSaving(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: recip.trim(),
          occasion: occasion.trim() || null,
          target_amount: needsTarget ? Number(targetAmount) : 0,
          deadline: deadline || null,
          organiser_email: organiserEmail.trim(),
          card_theme: theme.id,
          card_message: cardMsg,
          card_image_url: customImgUrl || theme.imgs[imgIdx] || theme.imgs[0],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create campaign');
      setCampaignSlug(json.campaign.slug);
      setShowDone(true);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  const selectTheme = (i: number) => {
    setThemeIdx(i);
    setImgIdx(0);
    setCustomImgUrl(null);
    setCardMsg(THEMES[i].frontMsg);
    setMoreOpen(false);
    setFailedImgs(new Set());
  };

  const selectThemeImg = (j: number) => { setImgIdx(j); setCustomImgUrl(null); };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => { setCustomImgUrl(ev.target?.result as string); setImgIdx(-1); };
    r.readAsDataURL(f);
  };

  // ── Done / share screen ──
  if (showDone) {
    const giftLabel = GIFT_TYPES.find(g => g.id === giftType)?.label || '';
    return (
      <div>
        <Nav onHome={onBack} onNav={onNav} badge="group" />
        <div style={{ padding: '22px 18px 60px', maxWidth: 480, margin: '0 auto' }}>
          <BackBtn onClick={() => setShowDone(false)} />
          <div style={{ textAlign: 'center', fontSize: '3.2rem', margin: '16px 0 10px' }}>🎉</div>
          <div style={{ textAlign: 'center', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#2A2A2A', marginBottom: 6 }}>Your group card is live!</div>
          <div style={{ textAlign: 'center', color: '#7A7585', fontSize: '.9rem', lineHeight: 1.6, marginBottom: 24, fontWeight: 600 }}>
            Share this link. Everyone adds their message and chips in — we send the reminders so you don't have to.
          </div>

          <CardScrollView
            theme={theme}
            imgIdx={imgIdx < 0 ? 0 : imgIdx}
            customImgUrl={customImgUrl ?? undefined}
            recipientName={recip}
            fromText={occasion}
            message={cardMsg}
            messages={[]}
            landscapeCover
          />

          <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2A2A2A', margin: '20px 0 10px' }}>Your shareable link</div>
          <ShareLink link={`thankyoucards.au/card/${campaignSlug}`} onCopy={() => onToast('Link copied! 🎉')} />

          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <Btn variant="ghost" sm onClick={() => onToast('Opening WhatsApp… 💬')} style={{ flex: 1 }}>💬 WhatsApp</Btn>
            <Btn variant="ghost" sm onClick={() => onToast('Opening email… ✉️')} style={{ flex: 1 }}>✉️ Email</Btn>
          </div>

          <div style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
            {([
              ['Recipient', recip || '—'],
              ['From', occasion || '—'],
              ['Theme', `${theme.emoji} ${theme.name}`],
              ['Deadline', deadline ? new Date(deadline).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'],
              ['Gift', giftType === 'none' ? 'Card only' : giftLabel],
              ['Target', giftType === 'none' ? '—' : `$${targetAmount}`],
            ] as [string, string][]).map(([l, v], i, arr) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #E8E2F0' : 'none', fontSize: '.87rem' }}>
                <span style={{ color: '#7A7585', fontWeight: 600 }}>{l}</span>
                <span style={{ fontWeight: 800 }}>{v}</span>
              </div>
            ))}
          </div>

          <Btn variant="outline" sm full onClick={() => onNav(`contrib:${campaignSlug}`)} style={{ marginBottom: 8 }}>👀 Preview contributor view</Btn>
          <Btn variant="coral" full onClick={onToDash}>Go to Dashboard →</Btn>
          <Btn variant="outline" full onClick={onBack} style={{ marginTop: 10 }}>Back to home</Btn>
        </div>
      </div>
    );
  }

  // ── Main creation screen ──
  return (
    <div>
      <Nav onHome={onBack} onNav={onNav} badge="group" />

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
            recipientName={recip}
            fromText={occasion || undefined}
            message={cardMsg}
            messages={[]}
            landscapeCover
          />
        </div>

        {/* ── Theme strip ── */}
        <div style={{ background: '#B8DCEA', padding: '10px 14px 12px' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#1F6B7A', marginBottom: 8, letterSpacing: '.06em', textTransform: 'uppercase' }}>Choose your theme</div>
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
            <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#1F6B7A', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>All themes</div>
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
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: 'rgba(255,255,255,.7)', marginBottom: 8, letterSpacing: '.06em', textTransform: 'uppercase' }}>Select image</div>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
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
                : <><span style={{ fontSize: '1.2rem' }}>📷</span><span style={{ fontSize: '.55rem', color: 'rgba(255,255,255,.8)', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>Your photo</span></>
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
                    position: 'relative', background: 'rgba(255,255,255,.1)', transition: 'all .2s',
                  }}
                >
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setFailedImgs(prev => new Set([...prev, j]))} />
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

          {/* Recipient */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Recipient name</label>
            <input
              value={recip} onChange={e => setRecip(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
              placeholder="e.g. Coach Dave"
              style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px', fontFamily: 'var(--font-dancing), cursive', fontSize: '1.3rem', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
              onFocus={e => (e.target.style.borderColor = '#E8724A')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
          </div>

          {/* Card message */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Card message</label>
            <input
              value={cardMsg} onChange={e => setCardMsg(e.target.value)}
              style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px', fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: '1rem', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
              onFocus={e => (e.target.style.borderColor = '#E8724A')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
            <div style={{ fontSize: '.72rem', color: '#B0A8BC', marginTop: 4 }}>Shown on the card cover — pre-filled from your theme</div>
          </div>

          {/* Occasion / from group */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>From / occasion</label>
            <input
              value={occasion} onChange={e => setOccasion(e.target.value)}
              placeholder="e.g. From the Under 12s — End of Season"
              style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
              onFocus={e => (e.target.style.borderColor = '#E8724A')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
          </div>

          {/* Deadline */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Deadline</label>
            <input
              type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
              onFocus={e => (e.target.style.borderColor = '#E8724A')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
            <div style={{ fontSize: '.72rem', color: '#B0A8BC', marginTop: 4 }}>Contributors won't be able to add messages after this date</div>
          </div>

          {/* Gift type */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>Gift type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {GIFT_TYPES.map(g => (
                <div
                  key={g.id}
                  onClick={() => setGiftType(g.id)}
                  style={{
                    border: giftType === g.id ? '2px solid #E8724A' : '2px solid #E8E2F0',
                    background: giftType === g.id ? '#FDF0E8' : '#fff',
                    borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all .2s',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: giftType === g.id ? '5px solid #E8724A' : '2px solid #C0B8CC', flexShrink: 0, transition: 'all .2s' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#2A2A2A' }}>{g.label}</div>
                    <div style={{ fontSize: '.76rem', color: '#7A7585', marginTop: 1 }}>{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {giftType === 'custom' && (
              <input
                value={giftDesc} onChange={e => setGiftDesc(e.target.value)}
                placeholder="e.g. Team hoodie with name on the back"
                style={{ marginTop: 10, width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box' }}
              />
            )}

            {giftType !== 'none' && (
              <>
                <div style={{ background: '#FDF0E8', borderRadius: 12, padding: '13px 15px', fontSize: '.83rem', color: '#E8724A', fontWeight: 700, marginTop: 10 }}>
                  💡 We suggest $10 per person. People can give more — no one is shamed for giving less.
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Collection target ($)</label>
                  <input
                    type="number" min="1" value={targetAmount} onChange={e => setTargetAmount(e.target.value)}
                    placeholder="e.g. 150"
                    style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
                    onFocus={e => (e.target.style.borderColor = '#E8724A')}
                    onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
                  />
                  <div style={{ fontSize: '.72rem', color: '#B0A8BC', marginTop: 4 }}>Total you're hoping to collect across all contributors</div>
                </div>
              </>
            )}
          </div>

          {/* Organiser email */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Your email</label>
            <input
              type="email" value={organiserEmail} onChange={e => setOrganiserEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
              onFocus={e => (e.target.style.borderColor = '#E8724A')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
            <div style={{ fontSize: '.72rem', color: '#B0A8BC', marginTop: 4 }}>We'll send you updates when people contribute</div>
          </div>
        </div>

        {/* ── Sticky create button ── */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '12px 18px', background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #E8E2F0', zIndex: 100 }}>
          {saveError && (
            <div style={{ fontSize: '.8rem', color: '#E8724A', fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{saveError}</div>
          )}
          <Btn variant="coral" full disabled={!canCreate || saving} onClick={handleCreate}>
            {saving ? 'Creating…' : 'Create card & get link →'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
