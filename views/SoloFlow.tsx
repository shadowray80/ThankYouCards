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
}

export function SoloFlow({ onBack, onToast }: SoloFlowProps) {
  const [themeIdx, setThemeIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [customImgUrl, setCustomImgUrl] = useState<string | null>(null);

  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [cardMsg, setCardMsg] = useState(THEMES[0].frontMsg);

  // Message
  const [msgMode, setMsgMode] = useState<'typed' | 'handwritten'>('typed');
  const [msg, setMsg] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);

  // Gift
  const [includeGift, setIncludeGift] = useState(false);
  const [giftSel, setGiftSel] = useState<string | null>('25');
  const [giftCustom, setGiftCustom] = useState('');

  const [showDone, setShowDone] = useState(false);

  const uploadRef = useRef<HTMLInputElement>(null);

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
  const selectTheme = (i: number) => { setThemeIdx(i); setImgIdx(0); setCustomImgUrl(null); setCardMsg(THEMES[i].frontMsg); };

  if (showDone) {
    return (
      <div>
        <Nav onHome={onBack} badge="solo" />
        <div style={{ padding: '22px 18px 60px', maxWidth: 480, margin: '0 auto' }}>
          <BackBtn onClick={() => setShowDone(false)} />
          <div style={{ textAlign: 'center', fontSize: '3.2rem', margin: '16px 0 10px' }}>🎉</div>
          <div style={{ textAlign: 'center', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#2A2A2A', marginBottom: 6 }}>Card ready!</div>
          <div style={{ textAlign: 'center', color: '#7A7585', fontSize: '.9rem', lineHeight: 1.6, marginBottom: 22, fontWeight: 600 }}>Download and share digitally, or print it anywhere in the world.</div>

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
            giftAmount={giftAmount}
          />

          {giftAmount > 0 && (
            <div style={{ background: 'linear-gradient(135deg,#EAF4FB,#E8F5EF)', border: '2px solid rgba(58,143,160,.2)', borderRadius: 14, padding: '16px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: '2rem' }}>💳</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '.95rem', color: '#2A2A2A' }}>Visa gift card included</div>
                <div style={{ fontSize: '.82rem', color: '#7A7585', fontWeight: 600 }}>A ${giftAmount} Visa gift card will be delivered with this card</div>
              </div>
            </div>
          )}

          <div style={{ background: '#EAF4FB', border: '2px solid rgba(58,143,160,.2)', borderRadius: 14, padding: '18px 20px', margin: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#7A7585' }}>Solo card{giftAmount > 0 ? ` + $${giftAmount} gift` : ''}</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#3A8FA0' }}>${(4.99 + giftAmount).toFixed(2)}</div>
            </div>
            <div style={{ fontSize: '.82rem', color: '#7A7585', fontWeight: 600, textAlign: 'right' }}>Print anywhere.<br />Keep forever.</div>
          </div>

          {[['📄', 'Download PDF', 'Print-ready A5 — perfect for any printer'], ['🖼️', 'Download Image', 'Share via WhatsApp, email or iMessage']].map(([icon, title, desc], i) => (
            <div key={i} onClick={() => onToast(`Preparing your ${(title as string).split(' ')[1]}… ${icon}`)} style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 14, padding: 18, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, cursor: 'pointer' }}>
              <div style={{ fontSize: '1.8rem' }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 800 }}>{title}</div>
                <div style={{ fontSize: '.8rem', color: '#7A7585', fontWeight: 600 }}>{desc}</div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, margin: '16px 0' }}>
            {['💬 WhatsApp', '✉️ Email', '🔗 Copy'].map((s, i) => (
              <Btn key={i} variant="ghost" sm onClick={() => onToast(`${s.split(' ')[0]} opening…`)} style={{ flex: 1 }}>{s}</Btn>
            ))}
          </div>
          <Btn variant="outline" full onClick={onBack}>Make another card</Btn>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav onHome={onBack} badge="solo" />

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
            giftAmount={giftAmount}
          />
        </div>

        {/* ── Theme strip ── */}
        <div style={{ background: '#EAF4FB', padding: '10px 14px 0' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#3A8FA0', marginBottom: 8, letterSpacing: '.06em', textTransform: 'uppercase' }}>Theme</div>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'none' }}>
            {THEMES.map((t, i) => (
              <div
                key={t.id}
                onClick={() => selectTheme(i)}
                style={{
                  flexShrink: 0, padding: '6px 13px', borderRadius: 20,
                  background: themeIdx === i ? '#3A8FA0' : '#fff',
                  color: themeIdx === i ? '#fff' : '#7A7585',
                  border: themeIdx === i ? '2px solid #3A8FA0' : '2px solid #E8E2F0',
                  fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap',
                }}
              >
                {t.name}
              </div>
            ))}
          </div>
        </div>

        {/* ── Image strip ── */}
        <div style={{ background: '#2A7E8F', padding: '10px 14px 12px' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: 'rgba(255,255,255,.7)', marginBottom: 8, letterSpacing: '.06em', textTransform: 'uppercase' }}>Select image</div>
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

            {theme.imgs.map((url, j) => {
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
                    background: theme.color,
                  }}
                >
                  <img
                    src={url} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {/* Selected checkmark */}
                  {isSelected && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.15)' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', color: '#2A7E8F', fontWeight: 800 }}>✓</div>
                    </div>
                  )}
                  {/* Image number label for when image fails */}
                  <div style={{ position: 'absolute', bottom: 3, left: 0, right: 0, textAlign: 'center', fontSize: '.55rem', color: 'rgba(255,255,255,.6)', fontWeight: 700 }}>
                    {j + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
              placeholder="e.g. Mum"
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
              Card message
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
            <div style={{ fontSize: '.72rem', color: '#B0A8BC', marginTop: 4 }}>Shown on the card cover — pre-filled from your theme</div>
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

          {/* From */}
          <div style={{ marginBottom: 24 }}>
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
          <Btn variant="teal" full disabled={!canContinue} onClick={() => setShowDone(true)}>
            {includeGift && giftAmount > 0 ? `Continue → Card + $${giftAmount} gift` : 'Continue → Send this card'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
