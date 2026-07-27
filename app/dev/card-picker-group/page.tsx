'use client';

import { useEffect, useRef, useState } from 'react';
import { Nav } from '@/components/ui/Nav';
import { Btn } from '@/components/ui/Button';
import { PreviewToggle } from '@/components/ui/PreviewToggle';
import { BrandKitPanel } from '@/components/ui/BrandKitPanel';
import { CASUAL_PALETTES, CORPORATE_PALETTES, buildCustomPalette } from '@/lib/palettes';
import { CasualView } from '@/components/cards/CasualView';
import { CorporateView } from '@/components/cards/CorporateView';
import { CardPicker } from '@/components/cards/CardPicker';
import { THEMES } from '@/lib/themes';

// Deliberately generic/occasion-agnostic — just to show the vibe of contributor
// messages, not tied to any one category, since the same preview shows regardless of
// which occasion the organiser ends up picking. Kept in sync with GroupFlow.tsx.
const CASUAL_PREVIEW_CONTRIBUTIONS = [
  { contributor_name: 'Sam',   message: "Great to catch up! 🙌", photo_url: null, photo_label: null },
  { contributor_name: 'Priya', message: null, photo_url: '/Team_Lunch.png', photo_label: 'Good times! 📸' },
  { contributor_name: 'Jess',  message: "Cheers, big ears! 🍻", photo_url: null, photo_label: null },
];

const CORPORATE_PREVIEW_CONTRIBUTIONS = [
  { contributor_name: 'Sarah', message: "You've been an amazing mentor — thank you for everything you do!", photo_url: null, photo_label: null },
  { contributor_name: 'James', message: null, photo_url: '/Team_Lunch.png', photo_label: 'Team lunch 2024 🎉' },
  { contributor_name: 'Priya', message: "Your positivity and energy inspire everyone around you 💙", photo_url: null, photo_label: null },
  { contributor_name: 'Liam',  message: "Thanks for always going above and beyond for the team!", photo_url: null, photo_label: null },
  { contributor_name: 'Emma',  message: "Working with you has been the highlight of my career — truly.", photo_url: null, photo_label: null },
];

export default function CardPickerGroupDevPage() {
  const [selectedUrl, setSelectedUrl] = useState(THEMES[0].imgs[0]);
  const [customImgUrl, setCustomImgUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [cardStyle, setCardStyle] = useState<'casual' | 'corporate'>('casual');
  const [cardPalette, setCardPalette] = useState('sky');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(1);

  const [recip, setRecip] = useState('');
  const [msgAreaRecip, setMsgAreaRecip] = useState('');
  const [cardMsg, setCardMsg] = useState('');
  const [msgAreaCardMsg, setMsgAreaCardMsg] = useState('');
  const [occasion, setOccasion] = useState('');
  const [msgAreaOccasion, setMsgAreaOccasion] = useState('');
  const [cardNote, setCardNote] = useState('');
  const [deadline, setDeadline] = useState('');
  const [organiserEmail, setOrganiserEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const uploadRef = useRef<HTMLInputElement>(null);
  const logoUploadRef = useRef<HTMLInputElement>(null);
  const recipRef = useRef<HTMLDivElement>(null);
  const cardMsgRef = useRef<HTMLDivElement>(null);
  const occasionRef = useRef<HTMLDivElement>(null);

  const imgUrl = customImgUrl || selectedUrl;
  const effectiveRecip = recip || msgAreaRecip;
  const effectiveCardMsg = cardMsg || msgAreaCardMsg;
  const effectiveOccasion = occasion || msgAreaOccasion;
  const canCreate = effectiveRecip.trim() && effectiveOccasion.trim() && deadline && organiserEmail.trim();

  const corpPalette = CORPORATE_PALETTES.find(p => p.id === cardPalette)
    ?? (cardPalette?.startsWith('#') ? buildCustomPalette(cardPalette) : CORPORATE_PALETTES[0]);

  // Re-sync contentEditable fields whenever their DOM node remounts (style switch, or
  // leaving preview mode) — state doesn't change on that transition so a plain dependency
  // on the value alone wouldn't catch it. Same fix as Solo/live GroupFlow.
  useEffect(() => {
    const el = recipRef.current;
    if (el && !el.textContent && recip) el.textContent = recip;
  }, [recip, cardStyle, showPreview]);
  useEffect(() => {
    const el = cardMsgRef.current;
    if (el && el.textContent !== cardMsg) el.textContent = cardMsg;
  }, [cardMsg, cardStyle, showPreview]);
  useEffect(() => {
    const el = occasionRef.current;
    if (el && el.textContent !== occasion) el.textContent = occasion;
  }, [occasion, cardStyle, showPreview]);

  const handleCardStyleChange = (style: 'casual' | 'corporate') => {
    setCardStyle(style);
    if (style === 'corporate') {
      const valid = CORPORATE_PALETTES.some(p => p.id === cardPalette) || (cardPalette?.startsWith('#') ?? false);
      if (!valid) setCardPalette('navy');
      setCardMsg('Thank you for everything');
    }
    if (style === 'casual') {
      const valid = CASUAL_PALETTES.some(p => p.id === cardPalette);
      if (!valid) setCardPalette('sky');
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setCustomImgUrl(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setLogoUrl(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fff', position: 'relative' }}>
      <Nav onHome={() => {}} badge="group" />

      <div>
        {showPreview ? (
          <div style={{ padding: '16px 18px 0', position: 'relative' }}>
            <PreviewToggle active={showPreview} onClick={() => setShowPreview(v => !v)} />
            {cardStyle === 'casual' ? (
              <CasualView
                campaign={{ slug: '', recipient_name: recip, occasion, card_message: cardMsg, card_note: cardNote, card_image_url: imgUrl, card_palette: cardPalette }}
                contributions={[]}
                messageAreaName={effectiveRecip}
                messageAreaCoverMessage={effectiveCardMsg}
                messageAreaOccasion={effectiveOccasion}
              />
            ) : (
              <CorporateView
                campaign={{ slug: '', recipient_name: recip, occasion, card_message: cardMsg, card_image_url: customImgUrl, card_palette: cardPalette, card_logo_url: logoUrl }}
                logoScale={logoScale}
                contributions={[]}
              />
            )}
          </div>
        ) : (
        <>
          {/* ── Card style + palette ── */}
          <div style={{ padding: '14px 18px 0' }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>Card style</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {([
                { id: 'casual' as const, label: 'Classic', emoji: '🎉', desc: 'Vibrant masonry with colourful cards' },
                { id: 'corporate' as const, label: 'Corporate', emoji: '🏢', desc: 'Polished navy & gold, clean typography' },
              ]).map(s => (
                <div key={s.id} onClick={() => handleCardStyleChange(s.id)} style={{ flex: 1, borderRadius: 14, padding: '14px 12px', cursor: 'pointer', textAlign: 'center', border: cardStyle === s.id ? '2px solid #E8724A' : '2px solid #E8E2F0', background: cardStyle === s.id ? '#FDF0E8' : '#fff' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: '.85rem', color: '#2A2A2A', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: '.7rem', color: '#7A7585', fontWeight: 600, lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              ))}
            </div>

            {cardStyle === 'casual' && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Colour palette</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {CASUAL_PALETTES.map(p => (
                    <div key={p.id} onClick={() => setCardPalette(p.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${p.headerFrom}, ${p.headerTo})`, border: cardPalette === p.id ? '3px solid #E8724A' : '3px solid transparent' }} />
                      <div style={{ fontSize: '.65rem', fontWeight: 800, color: cardPalette === p.id ? '#E8724A' : '#7A7585' }}>{p.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cardStyle === 'corporate' && (
              <BrandKitPanel cardPalette={cardPalette} logoUrl={logoUrl} onApply={(palette, kitLogoUrl) => { setCardPalette(palette); setLogoUrl(kitLogoUrl); }}>
                <div>
                  <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Header colour</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {CORPORATE_PALETTES.map(p => (
                      <div key={p.id} onClick={() => setCardPalette(p.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${p.headerFrom}, ${p.headerTo})`, border: cardPalette === p.id ? '3px solid #E8724A' : '3px solid transparent' }} />
                        <div style={{ fontSize: '.6rem', fontWeight: 800, color: cardPalette === p.id ? '#E8724A' : '#7A7585' }}>{p.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Logo</div>
                  <input ref={logoUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                  {logoUrl ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 10, padding: '8px 12px' }}>
                        <img src={logoUrl} alt="" style={{ maxHeight: 28 * logoScale, maxWidth: 90 * logoScale, objectFit: 'contain' }} />
                        <button onClick={() => { setLogoUrl(null); setLogoScale(1); }} style={{ marginLeft: 'auto', background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '4px 10px', fontSize: '.72rem', fontWeight: 800, color: '#7A7585', cursor: 'pointer' }}>Remove</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                        <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#7A7585', whiteSpace: 'nowrap' }}>Logo size</span>
                        <input
                          type="range" min={0.5} max={3} step={0.1}
                          value={logoScale}
                          onChange={e => setLogoScale(Number(e.target.value))}
                          style={{ flex: 1 }}
                        />
                        <span style={{ fontSize: '.72rem', fontWeight: 800, color: '#2A2A2A', width: 32 }}>{logoScale.toFixed(1)}×</span>
                      </div>
                    </>
                  ) : (
                    <button onClick={() => logoUploadRef.current?.click()} style={{ width: '100%', background: '#fff', border: '2px dashed #E8E2F0', borderRadius: 10, padding: '11px', fontWeight: 700, fontSize: '.82rem', color: '#7A7585', cursor: 'pointer' }}>
                      ⬆ Upload your logo
                    </button>
                  )}
                </div>
              </BrandKitPanel>
            )}
          </div>

          {/* ── Inline editable card ── */}
          {cardStyle === 'corporate' ? (
          <div style={{ margin: '16px 18px 0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 56px rgba(60,50,100,.18)' }}>
            {/* ── Corporate header — untouched, no card picker here (upload-only, per scope) ── */}
            <div style={{ display: 'flex', minHeight: 240, position: 'relative', background: `linear-gradient(135deg, ${corpPalette.headerFrom}, ${corpPalette.headerTo})` }}>
              <PreviewToggle active={showPreview} onClick={() => setShowPreview(v => !v)} />
              <div style={{ flex: 1, padding: '28px 18px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', zIndex: 2 }}>
                <div style={{ fontSize: '.52rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: 8 }}>To</div>
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  {!recip && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 7vw, 2.2rem)', lineHeight: 1.05, color: 'rgba(255,255,255,.28)' }}>The legend</div>}
                  <div ref={recipRef} contentEditable suppressContentEditableWarning spellCheck={false}
                    onInput={e => setRecip(e.currentTarget.textContent ?? '')}
                    style={{ outline: 'none', cursor: 'text', fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 7vw, 2.2rem)', lineHeight: 1.05, color: '#fff', caretColor: '#fff', minWidth: 40 }}
                  />
                </div>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  {!cardMsg && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: 'Georgia, serif', fontSize: 'clamp(.82rem, 3vw, 1rem)', fontStyle: 'italic', color: 'rgba(255,255,255,.25)' }}>Add a tagline…</div>}
                  <div ref={cardMsgRef} contentEditable suppressContentEditableWarning spellCheck={false}
                    onInput={e => setCardMsg(e.currentTarget.textContent ?? '')}
                    style={{ outline: 'none', cursor: 'text', fontFamily: 'Georgia, serif', fontSize: 'clamp(.82rem, 3vw, 1rem)', fontStyle: 'italic', color: corpPalette.accent, caretColor: '#fff' }}
                  />
                </div>
                <div style={{ fontSize: '.52rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 2 }}>From</div>
                <div style={{ position: 'relative' }}>
                  {!occasion && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: "'Nunito', sans-serif", fontSize: '.88rem', color: 'rgba(255,255,255,.22)', fontWeight: 700 }}>the team</div>}
                  <div ref={occasionRef} contentEditable suppressContentEditableWarning spellCheck={false}
                    onInput={e => setOccasion(e.currentTarget.textContent ?? '')}
                    style={{ outline: 'none', cursor: 'text', fontFamily: "'Nunito', sans-serif", fontSize: '.88rem', fontWeight: 700, color: 'rgba(255,255,255,.7)', caretColor: '#fff', minWidth: 40 }}
                  />
                </div>
              </div>
              <div style={{ width: '42%', flexShrink: 0, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${corpPalette.headerTo}80, ${corpPalette.headerFrom}40)` }}>
                {/* Placeholder image — faded to signal it's replaceable */}
                {!customImgUrl && (
                  <>
                    <img src="/Henry.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${corpPalette.headerFrom} 0%, ${corpPalette.headerFrom}C0 25%, ${corpPalette.headerFrom}60 55%, transparent 80%)` }} />
                  </>
                )}
                {customImgUrl && <>
                  <img src={customImgUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${corpPalette.headerFrom} 0%, ${corpPalette.headerFrom}C0 20%, transparent 60%)` }} />
                </>}
                <input ref={uploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
                <div onClick={() => customImgUrl ? setCustomImgUrl(null) : uploadRef.current?.click()}
                  style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 5, width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', background: customImgUrl ? 'rgba(232,114,74,.9)' : 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem' }}
                >{customImgUrl ? '✕' : '📷'}</div>
              </div>
            </div>

            {/* Messages preview — banner makes clear these are examples, not real contributions */}
            <div style={{ background: '#FFF8E8', padding: '8px 16px', textAlign: 'center', fontSize: '.7rem', fontWeight: 700, color: '#9A7A4A', letterSpacing: '.02em' }}>
              💬 Example messages — your contributors&apos; real ones will appear here
            </div>
            <CorporateView
              campaign={{ slug: '', recipient_name: recip || 'Name', occasion, card_message: cardMsg, card_image_url: null, card_palette: cardPalette, card_logo_url: logoUrl }}
              logoScale={logoScale}
              contributions={CORPORATE_PREVIEW_CONTRIBUTIONS}
              preview
              noHeader
            />
          </div>
          ) : (
          <>
            {/* ── Classic/Casual cover — its own boxed card, so the picker below can sit
                 flush against its bottom edge instead of sharing a box with the recap
                 panel and messages preview. ── */}
            <div style={{ margin: '16px 18px 0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 56px rgba(60,50,100,.18)' }}>
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img key={imgUrl} src={imgUrl} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
                <div onClick={() => customImgUrl ? setCustomImgUrl(null) : uploadRef.current?.click()}
                  style={{ position: 'absolute', top: 14, right: 14, zIndex: 5, width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', background: customImgUrl ? 'rgba(232,114,74,0.9)' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}
                >{customImgUrl ? '✕' : '📷'}</div>
                <input ref={uploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />

                <PreviewToggle active={showPreview} onClick={() => setShowPreview(v => !v)} />

                {/* Name/message/from — positioned to match CasualView's actual cover exactly
                    (bottom-anchored, left-aligned, stacked). */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '48px 24px 28px' }}>
                  <div style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', marginBottom: 4, textShadow: '0 2px 14px rgba(0,0,0,.55)' }}>To</div>
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    {!recip && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(3rem, 13vw, 4.5rem)', lineHeight: 1, color: 'rgba(255,255,255,0.3)' }}>The Legend&apos;s Name</div>}
                    <div ref={recipRef} contentEditable suppressContentEditableWarning spellCheck={false}
                      onInput={e => setRecip(e.currentTarget.textContent ?? '')}
                      style={{ outline: 'none', cursor: 'text', fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(3rem, 13vw, 4.5rem)', lineHeight: 1, color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,.55)', caretColor: '#fff', minWidth: 40 }}
                    />
                  </div>
                  <div style={{ position: 'relative', marginBottom: 6 }}>
                    {!cardMsg && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(1.4rem, 6vw, 2rem)', lineHeight: 1.3, color: 'rgba(255,255,255,0.28)' }}>Cover Message</div>}
                    <div ref={cardMsgRef} contentEditable suppressContentEditableWarning spellCheck={false}
                      onInput={e => setCardMsg(e.currentTarget.textContent ?? '')}
                      style={{ outline: 'none', cursor: 'text', fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(1.4rem, 6vw, 2rem)', lineHeight: 1.3, color: 'rgba(255,255,255,.92)', textShadow: '0 3px 24px rgba(0,0,0,.7)', caretColor: '#fff' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'rgba(255,255,255,.72)', textShadow: '0 2px 14px rgba(0,0,0,.55)', flexShrink: 0 }}>From</span>
                    <div style={{ position: 'relative', flex: 1, minWidth: 30 }}>
                      {!occasion && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: "'Nunito', sans-serif", fontSize: '.82rem', color: 'rgba(255,255,255,0.28)', fontWeight: 700 }}>the team</div>}
                      <div ref={occasionRef} contentEditable suppressContentEditableWarning spellCheck={false}
                        onInput={e => setOccasion(e.currentTarget.textContent ?? '')}
                        style={{ outline: 'none', cursor: 'text', fontFamily: "'Nunito', sans-serif", fontSize: '.82rem', fontWeight: 700, color: 'rgba(255,255,255,.92)', textShadow: '0 2px 14px rgba(0,0,0,.55)', caretColor: '#fff', minWidth: 40 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card picker — sits in plain document flow immediately after the image,
                 so it's always anchored exactly to its bottom edge, and normal page scroll
                 doubles as scrolling the picker. ── */}
            <div style={{ margin: '0 18px' }}>
              <CardPicker selectedUrl={selectedUrl} onSelect={url => { setSelectedUrl(url); setCustomImgUrl(null); }} />
            </div>

            <div style={{ margin: '0 18px', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: 'hidden', boxShadow: '0 16px 56px rgba(60,50,100,.18)' }}>
              {/* Recap panel */}
              <div style={{ background: '#fff', padding: '18px 22px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, fontSize: '.68rem', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#B0A8BC' }}>
                  <span style={{ flexShrink: 0 }}>To</span>
                  {recip ? <span>{recip}</span> : (
                    <input value={msgAreaRecip} onChange={e => setMsgAreaRecip(e.target.value)} placeholder="The Legend's Name"
                      style={{ flex: 1, minWidth: 40, border: 'none', outline: 'none', background: 'transparent', font: 'inherit', color: msgAreaRecip ? '#2A2A2A' : '#B0A8BC', caretColor: '#3A8FA0' }} />
                  )}
                </div>
                {cardMsg ? (
                  <div style={{ fontFamily: 'var(--font-dancing), cursive', fontSize: '2rem', color: '#3A8FA0', lineHeight: 1.2, marginTop: 6 }}>{cardMsg}</div>
                ) : (
                  <input value={msgAreaCardMsg} onChange={e => setMsgAreaCardMsg(e.target.value)} placeholder="Cover Message"
                    style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-dancing), cursive', fontSize: '2rem', color: msgAreaCardMsg ? '#3A8FA0' : '#B0A8BC', caretColor: '#3A8FA0', marginTop: 6, boxSizing: 'border-box' }} />
                )}
                <textarea value={cardNote} onChange={e => setCardNote(e.target.value)} placeholder="Card message" rows={2}
                  style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', textAlign: 'center', fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.7, color: '#2A2A2A', background: 'transparent', caretColor: '#3A8FA0', marginTop: 10, boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, fontSize: '.78rem', color: '#7A7585', fontWeight: 700, marginTop: 6 }}>
                  <span style={{ flexShrink: 0 }}>From</span>
                  {occasion ? <span>{occasion}</span> : (
                    <input value={msgAreaOccasion} onChange={e => setMsgAreaOccasion(e.target.value)} placeholder="the team"
                      style={{ flex: 1, minWidth: 40, border: 'none', outline: 'none', background: 'transparent', font: 'inherit', color: msgAreaOccasion ? '#7A7585' : '#B0A8BC', caretColor: '#3A8FA0' }} />
                  )}
                </div>
              </div>

              {/* Messages preview — banner makes clear these are examples, not real contributions */}
              <div style={{ background: '#FFF8E8', padding: '8px 16px', textAlign: 'center', fontSize: '.7rem', fontWeight: 700, color: '#9A7A4A', letterSpacing: '.02em' }}>
                💬 Example messages — your contributors&apos; real ones will appear here
              </div>
              <CasualView
                campaign={{ slug: '', recipient_name: recip, occasion, card_message: cardMsg, card_note: cardNote, card_image_url: null, card_palette: cardPalette }}
                contributions={CASUAL_PREVIEW_CONTRIBUTIONS}
                messageAreaName={effectiveRecip}
                messageAreaCoverMessage={effectiveCardMsg}
                messageAreaOccasion={effectiveOccasion}
                preview
                noHeader
              />
            </div>
          </>
          )}
        </>
        )}

        {/* ── Deadline ── */}
        <div style={{ margin: '12px 18px 0', background: '#FFFDF8', border: '2px solid #E8E2F0', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.4rem' }}>📅</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 3 }}>Deadline</div>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', fontWeight: 700, fontSize: '16px', color: deadline ? '#2A2A2A' : '#B0A8BC', background: 'transparent', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* ── Organiser email ── */}
        <div style={{ padding: '16px 18px 0' }}>
          <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Your email</label>
          <input type="email" value={organiserEmail} onChange={e => setOrganiserEmail(e.target.value)} placeholder="you@example.com"
            style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px', fontWeight: 700, fontSize: '16px', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {/* ── Create ── */}
        <div style={{ padding: '16px 18px' }}>
          <Btn variant="coral" full disabled={!canCreate} onClick={() => setSubmitted(true)}>
            {submitted ? '✓ Ready to create (prototype — not saved)' : 'Create card & get link →'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
