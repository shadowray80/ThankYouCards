'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Nav } from '@/components/ui/Nav';
import { Btn } from '@/components/ui/Button';
import { PreviewToggle } from '@/components/ui/PreviewToggle';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { GiftSelector } from '@/components/forms/GiftSelector';
import { THEMES } from '@/lib/themes';

interface SoloFlowProps {
  onBack: () => void;
  onToast: (msg: string) => void;
  onNav: (view: string) => void;
}

export function SoloFlow({ onBack, onToast, onNav }: SoloFlowProps) {
  const [themeIdx, setThemeIdx] = useState(7);
  const [imgIdx, setImgIdx] = useState(0);
  const [customImgUrl, setCustomImgUrl] = useState<string | null>(null);
  const [failedImgs, setFailedImgs] = useState<Set<number>>(new Set());

  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [cardMsg, setCardMsg] = useState('');
  // Message-area-only name — used only when the on-photo name is left blank, so someone
  // can fill in the recipient's name without ever putting text on the photo.
  const [msgAreaTo, setMsgAreaTo] = useState('');
  const [msg, setMsg] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);

  const [includeGift, setIncludeGift] = useState(false);
  const [giftSel, setGiftSel] = useState<string | null>('25');
  const [giftCustom, setGiftCustom] = useState('');

  const [showDone, setShowDone] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const uploadRef = useRef<HTMLInputElement>(null);
  const msgPhotoRef = useRef<HTMLInputElement>(null);
  const msgTextareaRef = useRef<HTMLTextAreaElement>(null);
  const cardMsgRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Re-sync whenever the overlay remounts too — leaving Preview mode unmounts the whole
  // editable cover while previewing, so it comes back as a fresh, empty node that needs
  // its text restored (state never changes on that transition, so a plain [cardMsg]
  // dependency wouldn't catch it).
  useEffect(() => {
    const el = cardMsgRef.current;
    if (el && el.textContent !== cardMsg) el.textContent = cardMsg;
  }, [cardMsg, showPreview]);

  useEffect(() => {
    // Only restore text into a freshly (re)mounted, empty field — never while the
    // user is actively typing, since the DOM already reflects their keystrokes and
    // forcing textContent mid-edit resets the caret to the start.
    const el = toRef.current;
    if (el && !el.textContent && to) el.textContent = to;
  }, [to, showPreview]);

  async function handleSubmit() {
    setSaving(true);
    try {
      const imageUrl = customImgUrl || theme.imgs[imgIdx < 0 ? 0 : imgIdx];
      const campaignRes = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: effectiveTo.trim(),
          occasion: theme.name,
          target_amount: 0,
          card_theme: theme.id,
          card_message: cardMsg.trim(),
          card_image_url: imageUrl,
          card_text_on_image: to.trim() !== '' || cardMsg.trim() !== '',
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
          message: photoData === null && msg.trim() ? msg.trim() : null,
        }),
      });
      const contribData = await contribRes.json();
      if (!contribRes.ok) throw new Error(contribData.error ?? `HTTP ${contribRes.status}`);

      // Solo cards are free — mark as sent immediately so recipient can open the link
      await fetch(`/api/manage/${campaign.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: campaign.organiser_token, action: 'mark_sent' }),
      });

      setSlug(campaign.slug);
      setShowDone(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Something went wrong - please try again');
    } finally {
      setSaving(false);
    }
  }

  const theme = THEMES[themeIdx];
  const imgUrl = customImgUrl || theme.imgs[imgIdx < 0 ? 0 : imgIdx];
  const effectiveTo = to || msgAreaTo;
  const canContinue = effectiveTo.trim().length > 0;
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
  const selectTheme = (i: number) => { setThemeIdx(i); setImgIdx(0); setCustomImgUrl(null); setFailedImgs(new Set()); };

  // ── Done screen ──────────────────────────────────────────────
  if (showDone && slug) {
    const recipientUrl = `thankyoucards.au/view/${slug}`;
    const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://thankyoucards.au'}/view/${slug}`;
    const shareText = `I made you a card - open it here: ${fullUrl}`;
    return (
      <div>
        <Nav onHome={onBack} onNav={onNav} badge="solo" />
        <div style={{ padding: '22px 18px 60px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: '#2A2A2A' }}>🎉 Card ready! 🎊</div>
            <div style={{ color: '#7A7585', fontSize: '.9rem', lineHeight: 1.6, fontWeight: 600, marginTop: 4 }}>
              Share this link with {effectiveTo} to deliver their card.
            </div>
          </div>
          <div style={{ background: '#F0ECFB', border: '2px solid rgba(124,92,191,.2)', borderRadius: 14, padding: '16px', marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#2A2A2A', marginBottom: 8 }}>🔗 Share with {effectiveTo}</div>
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
              <a href={`sms:?body=${encodeURIComponent(shareText)}`}
                style={{ flex: 1, background: '#5AC8FA', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
                💬 SMS
              </a>
              <a href={`mailto:?subject=A card for you, ${effectiveTo}&body=${encodeURIComponent(shareText)}`}
                style={{ flex: 1, background: '#3A8FA0', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
                ✉️ Email
              </a>
            </div>
          </div>
          <CardScrollView
            theme={theme}
            imgIdx={imgIdx < 0 ? 0 : imgIdx}
            customImgUrl={customImgUrl ?? undefined}
            recipientName={to}
            fromText={from || 'From a friend'}
            message={cardMsg}
            messageAreaName={effectiveTo}
            soloMessage={photoData === null ? msg : undefined}
            soloPhotoData={photoData ?? undefined}
            messages={[]}
            landscapeCover
            giftAmount={giftAmount}
          />
          <Btn variant="outline" full onClick={onBack}>Make another card</Btn>
        </div>
      </div>
    );
  }

  // ── Builder ──────────────────────────────────────────────────
  return (
    <div>
      <Nav onHome={onBack} onNav={onNav} badge="solo" />
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}>

        {showPreview ? (
          <div style={{ padding: '16px 18px 0', position: 'relative' }}>
            <PreviewToggle active={showPreview} onClick={() => setShowPreview(v => !v)} />
            <CardScrollView
              theme={theme}
              imgIdx={imgIdx < 0 ? 0 : imgIdx}
              customImgUrl={customImgUrl ?? undefined}
              recipientName={to}
              fromText={from || 'From a friend'}
              message={cardMsg}
              messageAreaName={effectiveTo}
              soloMessage={photoData === null ? msg : undefined}
              soloPhotoData={photoData ?? undefined}
              messages={[]}
              landscapeCover
              giftAmount={giftAmount}
            />
          </div>
        ) : (
        <>

        {/* ── Occasion film strip ── */}
        <div style={{ background: '#fff', padding: '14px 0 16px' }}>
          <div style={{ fontSize: '.75rem', fontWeight: 800, color: '#7A7585', marginBottom: 10, letterSpacing: '.06em', textTransform: 'uppercase', padding: '0 14px' }}>What&apos;s the occasion?</div>
          <div style={{ position: 'relative' }}>
            <div onWheel={e => { e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY; }} style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none', padding: '0 14px' }}>
              {THEMES.map((t, i) => {
                const isSelected = themeIdx === i;
                return (
                  <div key={t.id} onClick={() => selectTheme(i)} style={{
                    flexShrink: 0, width: 120, height: 90, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', position: 'relative',
                    border: isSelected ? '2px solid #E8724A' : '2px solid #E8E2F0',
                    background: t.color, transition: 'all .2s',
                  }}>
                    <img src={t.imgs[0]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, rgba(0,0,0,.05) 55%)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 6px 6px', textAlign: 'center', fontSize: '.62rem', fontWeight: 800, color: '#fff', letterSpacing: '.03em', textTransform: 'uppercase', lineHeight: 1.25 }}>{t.name}</div>
                    {isSelected && <div style={{ position: 'absolute', top: 6, right: 6, background: '#E8724A', color: '#fff', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.62rem', fontWeight: 800 }}>✓</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 48, background: 'linear-gradient(to right, transparent, #fff)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* ── Image film strip ── */}
        <div style={{ background: '#F5F4F8', padding: '14px 0 16px' }}>
          <div style={{ fontSize: '.75rem', fontWeight: 800, color: '#7A7585', marginBottom: 10, letterSpacing: '.06em', textTransform: 'uppercase', padding: '0 14px' }}>Choose a vibe they&apos;ll love</div>
          <div style={{ position: 'relative' }}>
            <div onWheel={e => { e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY; }} style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none', padding: '0 14px' }}>
              {theme.imgs.map((url, j) => {
                if (failedImgs.has(j)) return null;
                const isSelected = !customImgUrl && imgIdx === j;
                return (
                  <div key={j} onClick={() => selectThemeImg(j)} style={{
                    flexShrink: 0, width: 120, height: 90, borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                    border: isSelected ? '2px solid #E8724A' : '2px solid #E8E2F0',
                    transition: 'all .2s', position: 'relative', background: '#fff',
                  }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setFailedImgs(prev => new Set([...prev, j]))} />
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 6, right: 6, background: '#E8724A', color: '#fff', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.62rem', fontWeight: 800 }}>✓</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 48, background: 'linear-gradient(to right, transparent, #F5F4F8)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* ── Inline editable card ── */}
        <div style={{ margin: '16px 18px 0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 56px rgba(60,50,100,.18)' }}>

          {/* Cover image */}
          <div style={{ position: 'relative', overflow: 'hidden', background: theme.color }}>
            <img
              key={imgUrl}
              src={imgUrl} alt=""
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />

            {/* Inset border */}
            <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, pointerEvents: 'none', zIndex: 2 }} />

            {/* Upload own photo — corner button */}
            <div
              onClick={() => customImgUrl ? (setCustomImgUrl(null), setImgIdx(0)) : uploadRef.current?.click()}
              style={{
                position: 'absolute', top: 14, right: 14, zIndex: 5,
                width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                background: customImgUrl ? 'rgba(232,114,74,0.9)' : 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                transition: 'background .2s',
              }}
              title={customImgUrl ? 'Remove your photo' : 'Use your own photo'}
            >
              {customImgUrl ? '✕' : '📷'}
            </div>
            <input ref={uploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />

            <PreviewToggle active={showPreview} onClick={() => setShowPreview(v => !v)} />

            {/* Recipient name — contentEditable so text-shadow isn't clipped */}
            <div style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', zIndex: 3, padding: '0 16px' }}>
              <div style={{ fontSize: '.58rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 4 }}>To</div>
              <div style={{ position: 'relative', width: '85%', margin: '0 auto' }}>
                {!to && (
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', textAlign: 'center',
                    fontFamily: 'var(--font-dancing), cursive',
                    fontSize: 'clamp(2.4rem, 9vw, 3.2rem)',
                    lineHeight: 1.1, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap',
                  }}>
                    The Legend&apos;s Name
                  </div>
                )}
                <div
                  ref={toRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  autoCapitalize="words"
                  onInput={e => {
                    const raw = e.currentTarget.textContent ?? '';
                    setTo(raw.replace(/(?:^|\s)\S/g, c => c.toUpperCase()));
                  }}
                  style={{
                    outline: 'none', cursor: 'text', textAlign: 'center',
                    fontFamily: 'var(--font-dancing), cursive',
                    fontSize: 'clamp(2.4rem, 9vw, 3.2rem)',
                    lineHeight: 1.1, color: '#fff',
                    textShadow: '0 2px 20px rgba(0,0,0,0.55)',
                    caretColor: '#fff', padding: '6px 4px',
                    minWidth: 40,
                    textTransform: 'capitalize',
                  }}
                />
              </div>
            </div>

            {/* Cover text — floating on image, wraps to two lines if long. Dimmed while it's
                It starts empty — nothing is sent unless you type something here. */}
            <div style={{
              position: 'absolute', bottom: '12%', left: 0, right: 0, zIndex: 3,
              textAlign: 'center', padding: '0 16px',
            }}>
              <div style={{ position: 'relative', width: '90%', margin: '0 auto' }}>
                {!cardMsg && (
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', textAlign: 'center',
                    fontFamily: 'var(--font-dancing), cursive',
                    fontSize: 'clamp(3.2rem, 12vw, 4.5rem)',
                    lineHeight: 1.2, color: 'rgba(255,255,255,0.35)',
                  }}>
                    Cover Message
                  </div>
                )}
                <div
                  ref={cardMsgRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  onInput={e => setCardMsg(e.currentTarget.textContent ?? '')}
                  style={{
                    outline: 'none', cursor: 'text', textAlign: 'center',
                    fontFamily: 'var(--font-dancing), cursive',
                    fontSize: 'clamp(3.2rem, 12vw, 4.5rem)',
                    lineHeight: 1.2, color: '#fff',
                    textShadow: '0 3px 24px rgba(0,0,0,0.7)',
                    caretColor: '#fff',
                    wordBreak: 'break-word',
                  }}
                />
              </div>
            </div>

            {/* Gift badge */}
            {giftAmount > 0 && (
              <div style={{
                position: 'absolute', bottom: 18, right: 16, zIndex: 4,
                background: 'linear-gradient(135deg,#1a237e,#1565c0)',
                borderRadius: 9, padding: '7px 11px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}>
                <div style={{ fontSize: '.5rem', color: 'rgba(255,255,255,.55)', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>VISA</div>
                <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 800, lineHeight: 1 }}>${giftAmount}</div>
              </div>
            )}
          </div>

          {/* Message panel */}
          <div style={{ background: '#fff', padding: '20px 22px 8px' }}>
            {/* Recap — mirrors the on-photo name so it's never typed twice. If the name is
                still blank on the photo, it becomes a real input right here instead — that way,
                someone who doesn't want text on the photo can fill in the name down here, and
                it stays down here only (typing here never puts anything on the photo). */}
            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 4, fontSize: '.68rem', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#B0A8BC' }}>
              <span style={{ flexShrink: 0 }}>To</span>
              {to ? (
                <span>{to}</span>
              ) : (
                <input
                  value={msgAreaTo}
                  onChange={e => setMsgAreaTo(e.target.value.replace(/(?:^|\s)\S/g, c => c.toUpperCase()))}
                  placeholder="The Legend's Name"
                  autoCapitalize="words"
                  style={{
                    flex: 1, minWidth: 40, border: 'none', outline: 'none', background: 'transparent',
                    font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit',
                    color: msgAreaTo ? '#2A2A2A' : '#B0A8BC', caretColor: '#3A8FA0',
                  }}
                />
              )}
            </div>
            {photoData ? (
              <img src={photoData} alt="Handwritten message" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
            ) : (
              <textarea
                ref={msgTextareaRef}
                value={msg}
                onChange={e => {
                  const v = e.target.value;
                  setMsg(v.charAt(0).toUpperCase() + v.slice(1));
                  const el = e.target;
                  el.style.height = 'auto';
                  el.style.height = el.scrollHeight + 'px';
                }}
                placeholder="Card message"
                rows={2}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  textAlign: 'center',
                  fontFamily: "'Lora',serif",
                  fontStyle: 'italic',
                  fontSize: '16px',
                  lineHeight: 1.75,
                  color: '#2A2A2A',
                  background: 'transparent',
                  caretColor: '#3A8FA0',
                  boxSizing: 'border-box',
                }}
              />
            )}

            {/* From — signed inline */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, marginBottom: 12 }}>
              <span style={{ fontSize: '.78rem', color: '#B0A8BC', fontWeight: 600, marginRight: 4, fontFamily: "'Nunito',sans-serif" }}>-</span>
              <input
                value={from}
                onChange={e => setFrom(e.target.value)}
                placeholder="Your name"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '16px',
                  color: from ? '#7A7585' : '#B0A8BC',
                  fontWeight: 600,
                  fontFamily: "'Nunito',sans-serif",
                  flex: 1,
                  caretColor: '#3A8FA0',
                }}
              />
            </div>
          </div>

          {/* Handwritten photo — between message and footer */}
          <div style={{ background: '#fff', borderTop: '1px solid #F0EDF5', padding: '10px 22px 14px' }}>
            <input ref={msgPhotoRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleMsgPhoto} />
            {photoData ? (
              <button
                onClick={() => setPhotoData(null)}
                style={{ background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '7px 14px', fontSize: '.75rem', fontWeight: 700, color: '#7A7585', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}
              >
                ✕ Remove handwritten note
              </button>
            ) : (
              <button
                onClick={() => msgPhotoRef.current?.click()}
                style={{ width: '100%', background: 'none', border: '2px dashed #D4C8EE', borderRadius: 10, padding: '11px', fontSize: '.82rem', fontWeight: 700, color: '#7A7585', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <span style={{ fontSize: '1.1rem' }}>📷</span> Handwrite your message instead
              </button>
            )}
          </div>

          {/* Card footer */}
          <div style={{ background: '#3A8FA0', padding: '16px 22px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, color: 'rgba(255,255,255,.9)', fontSize: '.95rem', marginBottom: 2 }}>
              thank<span style={{ color: '#F09070' }}>you</span>cards.au
            </div>
            <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '.68rem', letterSpacing: '.06em' }}>A card thoughtfully chosen just for you.</div>
          </div>
        </div>

        {/* ── Gift card — coming soon ── */}
        <div style={{ padding: '16px 18px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#FAFAFA', border: '2px solid #E8E2F0',
            borderRadius: 12, padding: '14px 16px', opacity: 0.6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.4rem' }}>💳</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: '.93rem', color: '#2A2A2A' }}>Add a gift card</div>
                  <div style={{ background: '#F09070', color: '#fff', fontSize: '.58rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', borderRadius: 6, padding: '2px 7px' }}>Coming soon</div>
                </div>
                <div style={{ fontSize: '.76rem', color: '#7A7585', marginTop: 1 }}>Spendable anywhere, any country</div>
              </div>
            </div>
            <div style={{ width: 42, height: 24, borderRadius: 12, position: 'relative', flexShrink: 0, background: '#D1C8DC' }}>
              <div style={{ position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
            </div>
          </div>
        </div>

        </>
        )}

        {/* ── Sticky continue button ── */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '12px 18px', background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #E8E2F0', zIndex: 100 }}>
          <Btn variant="teal" full disabled={!canContinue || saving} onClick={handleSubmit}>
            {saving ? 'Saving…' : 'Continue → Send this card'}
          </Btn>
        </div>

      </div>
    </div>
  );
}
