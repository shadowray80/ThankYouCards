'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Nav } from '@/components/ui/Nav';
import { Btn } from '@/components/ui/Button';
import { THEMES } from '@/lib/themes';
import { CASUAL_PALETTES, CORPORATE_PALETTES, buildCustomPalette } from '@/lib/palettes';
import { CasualView } from '@/components/cards/CasualView';
import { CorporateView } from '@/components/cards/CorporateView';

const PREVIEW_CONTRIBUTIONS = [
  { contributor_name: 'Sarah',  message: "You've been an amazing mentor — thank you for everything you do!", photo_url: null, photo_label: null },
  { contributor_name: 'James',  message: null, photo_url: '/Team_Lunch.png', photo_label: 'Team lunch 2024 🎉' },
  { contributor_name: 'Priya',  message: "Your positivity and energy inspire everyone around you 💙", photo_url: null, photo_label: null },
  { contributor_name: 'Liam',   message: "Thanks for always going above and beyond for the team!", photo_url: null, photo_label: null },
  { contributor_name: 'Emma',   message: "Working with you has been the highlight of my career — truly.", photo_url: null, photo_label: null },
];

interface GroupFlowProps {
  onBack: () => void;
  onToDash: () => void;
  onToast: (msg: string) => void;
  onNav: (view: string) => void;
}

interface MiniCard { name: string; bg: string; logo?: string; logoH?: number; logoFilter?: string; textColor?: string; fontSize?: string; letterSpacing?: string; }
const MINI_CARDS: MiniCard[] = [
  { name: 'Visa',          bg: 'linear-gradient(135deg,#1A1F71,#2E3DA8)', logo: 'https://cdn.simpleicons.org/visa/ffffff', logoH: 18 },
  { name: 'Mastercard',    bg: 'linear-gradient(135deg,#252525,#444)', logo: 'https://cdn.simpleicons.org/mastercard/ffffff', logoH: 18 },
  { name: 'amazon',        bg: 'linear-gradient(135deg,#232F3E,#37475A)', textColor: '#FF9900', fontSize: '.52rem', letterSpacing: '.01em' },
  { name: 'Apple',         bg: 'linear-gradient(135deg,#1C1C1E,#3A3A3C)', logo: 'https://cdn.simpleicons.org/apple/ffffff', logoH: 16 },
  { name: 'JB HI-FI',     bg: 'linear-gradient(135deg,#FFD200,#FFC000)', textColor: '#1A1A1A', fontSize: '.48rem', letterSpacing: '.02em' },
  { name: 'Myer',          bg: 'linear-gradient(135deg,#C8102E,#A00C24)', fontSize: '.52rem', letterSpacing: '.08em' },
  { name: 'Starbucks',     bg: 'linear-gradient(135deg,#00704A,#005C3A)', logo: 'https://cdn.simpleicons.org/starbucks/ffffff', logoH: 20 },
  { name: 'Event Cinemas', bg: 'linear-gradient(135deg,#E31837,#B5122B)', fontSize: '.42rem', letterSpacing: '.03em' },
  { name: "Dan Murphy's",  bg: 'linear-gradient(135deg,#003087,#00246B)', fontSize: '.44rem', letterSpacing: '.02em' },
  { name: 'Bunnings',      bg: 'linear-gradient(135deg,#D62B27,#B02220)', fontSize: '.48rem', letterSpacing: '.03em' },
];

const GIFT_TYPES = [
  { id: 'collect', label: '🎁 Add a gift fund', desc: 'Set a target, everyone contributes what they can' },
  { id: 'none',    label: '💌 Card only',        desc: 'Just the messages, no gift collection' },
];

export function GroupFlow({ onBack, onToDash, onToast, onNav }: GroupFlowProps) {
  const [themeIdx, setThemeIdx]         = useState(11);
  const [imgIdx, setImgIdx]             = useState(0);
  const [customImgUrl, setCustomImgUrl] = useState<string | null>(null);
  const [failedImgs, setFailedImgs]     = useState<Set<number>>(new Set());

  const [recip, setRecip]       = useState('');
  const [occasion, setOccasion] = useState('');
  const [deadline, setDeadline] = useState('');
  const [cardMsg, setCardMsg]   = useState(THEMES[11].frontMsg);

  const [giftType, setGiftType]             = useState('collect');
  const [cardStyle, setCardStyle]           = useState<'classic' | 'casual' | 'corporate'>('classic');
  const [cardPalette, setCardPalette]       = useState('sky');
  const [organiserEmail, setOrganiserEmail] = useState('');
  const [saving, setSaving]                 = useState(false);
  const [saveError, setSaveError]           = useState('');

  const [logoUrl, setLogoUrl]           = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const uploadRef    = useRef<HTMLInputElement>(null);
  const logoUploadRef = useRef<HTMLInputElement>(null);
  const cardMsgRef   = useRef<HTMLDivElement>(null);
  const occasionRef  = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  useEffect(() => {
    const el = cardMsgRef.current;
    if (el && el.textContent !== cardMsg) el.textContent = cardMsg;
  }, [cardMsg]);

  useEffect(() => {
    const el = occasionRef.current;
    if (el && el.textContent !== occasion) el.textContent = occasion;
  }, [occasion]);

  const theme  = THEMES[themeIdx];
  const imgUrl = customImgUrl || theme.imgs[imgIdx < 0 ? 0 : imgIdx];
  const canCreate = recip.trim() && occasion.trim() && deadline && organiserEmail.trim();

  const corpPalette = CORPORATE_PALETTES.find(p => p.id === cardPalette)
    ?? (cardPalette?.startsWith('#') ? buildCustomPalette(cardPalette) : CORPORATE_PALETTES[0]);

  const handleCardStyleChange = (style: 'classic' | 'casual' | 'corporate') => {
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

  const selectTheme = (i: number) => {
    setThemeIdx(i); setImgIdx(0); setCustomImgUrl(null);
    setCardMsg(THEMES[i].frontMsg); setFailedImgs(new Set());
  };
  const selectThemeImg = (j: number) => { setImgIdx(j); setCustomImgUrl(null); };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => { setCustomImgUrl(ev.target?.result as string); setImgIdx(-1); };
    r.readAsDataURL(f);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) setLogoUrl(json.url);
    } finally {
      setLogoUploading(false);
      if (logoUploadRef.current) logoUploadRef.current.value = '';
    }
  };

  async function handleCreate() {
    setSaveError(''); setSaving(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: recip.trim(),
          occasion: occasion.trim() || null,
          target_amount: 0,
          deadline: deadline || null,
          organiser_email: organiserEmail.trim(),
          card_theme: theme.id,
          card_message: cardMsg,
          card_image_url: customImgUrl || theme.imgs[imgIdx] || theme.imgs[0],
          card_style: cardStyle,
          card_palette: cardPalette,
          card_logo_url: logoUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create campaign');
      window.location.href = `/manage/${json.campaign.slug}?token=${json.campaign.organiser_token}`;
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  }

  // ── Builder ──
  return (
    <div>
      <Nav onHome={onBack} onNav={onNav} badge="group" />
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}>

        {/* Step 1 banner */}
        <div style={{ background: '#FDF0E8', borderBottom: '1.5px solid #F5D9C8', padding: '12px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ background: '#E8724A', color: '#fff', borderRadius: 8, padding: '3px 9px', fontSize: '.65rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', flexShrink: 0, marginTop: 1 }}>Step 1</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '.85rem', color: '#2A2A2A', marginBottom: 2 }}>Set up your card</div>
            <div style={{ fontSize: '.76rem', color: '#9A7A6A', fontWeight: 600, lineHeight: 1.5 }}>Just fill in the basics — you can tweak the design, colours, and photo any time from your organiser dashboard before you send it.</div>
          </div>
        </div>

        {/* Occasion film strip */}
        <div style={{ background: '#B8DCEA', padding: '10px 0 12px' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#1F6B7A', marginBottom: 8, letterSpacing: '.06em', textTransform: 'uppercase', padding: '0 14px' }}>What&apos;s the occasion?</div>
          <div style={{ position: 'relative' }}>
            <div onWheel={e => { e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY; }} style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none', padding: '0 14px' }}>
              {THEMES.map((t, i) => {
                const isSelected = themeIdx === i;
                return (
                  <div key={t.id} onClick={() => selectTheme(i)} style={{
                    flexShrink: 0, width: 80, height: 60, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', position: 'relative',
                    border: isSelected ? '3px solid #3A8FA0' : '3px solid rgba(58,143,160,.2)',
                    boxShadow: isSelected ? '0 0 0 2px rgba(58,143,160,.3)' : 'none',
                    background: t.color, transition: 'all .2s',
                  }}>
                    <img src={t.imgs[0]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,.1) 60%)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 5px 5px', textAlign: 'center', fontSize: '.57rem', fontWeight: 800, color: '#fff', letterSpacing: '.03em', textTransform: 'uppercase', lineHeight: 1.25 }}>{t.name}</div>
                    {isSelected && <div style={{ position: 'absolute', top: 5, right: 5, background: '#3A8FA0', color: '#fff', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', fontWeight: 800 }}>✓</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 48, background: 'linear-gradient(to right, transparent, #B8DCEA)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Image film strip — hidden for corporate (colour is the header, photo optional via card) */}
        {cardStyle !== 'corporate' && <div style={{ background: '#2A7E8F', padding: '10px 0 12px' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: 'rgba(255,255,255,.7)', marginBottom: 8, letterSpacing: '.06em', textTransform: 'uppercase', padding: '0 14px' }}>Choose a vibe they&apos;ll love</div>
          <div style={{ position: 'relative' }}>
            <div onWheel={e => { e.preventDefault(); e.currentTarget.scrollLeft += e.deltaY; }} style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none', padding: '0 14px' }}>
              {theme.imgs.map((url, j) => {
                if (failedImgs.has(j)) return null;
                const isSelected = !customImgUrl && imgIdx === j;
                return (
                  <div key={j} onClick={() => selectThemeImg(j)} style={{
                    flexShrink: 0, width: 80, height: 60, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    border: isSelected ? '3px solid #fff' : '3px solid rgba(255,255,255,.2)',
                    boxShadow: isSelected ? '0 0 0 2px rgba(255,255,255,.4)' : 'none',
                    transition: 'all .2s', position: 'relative', background: 'rgba(255,255,255,.1)',
                  }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setFailedImgs(prev => new Set([...prev, j]))} />
                    {isSelected && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.15)' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', color: '#2A7E8F', fontWeight: 800 }}>✓</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 48, background: 'linear-gradient(to right, transparent, #2A7E8F)', pointerEvents: 'none' }} />
          </div>
        </div>}

        {/* Card style + palette */}
        <div style={{ padding: '14px 18px 0' }}>
          <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>Card style</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {([
              { id: 'classic'    as const, label: 'Classic',    emoji: '✉️', desc: 'Elegant scroll with cover photo' },
              { id: 'casual'     as const, label: 'Casual',     emoji: '🎉', desc: 'Vibrant masonry with colourful cards' },
              { id: 'corporate'  as const, label: 'Corporate',  emoji: '🏢', desc: 'Polished navy & gold, clean typography' },
            ] as { id: 'classic' | 'casual' | 'corporate'; label: string; emoji: string; desc: string }[]).map(s => (
              <div key={s.id} onClick={() => handleCardStyleChange(s.id)} style={{ flex: 1, borderRadius: 14, padding: '14px 12px', cursor: 'pointer', textAlign: 'center', border: cardStyle === s.id ? '2px solid #E8724A' : '2px solid #E8E2F0', background: cardStyle === s.id ? '#FDF0E8' : '#fff', transition: 'all .2s' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: '.85rem', color: '#2A2A2A', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: '.7rem', color: '#7A7585', fontWeight: 600, lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Palette swatches — casual */}
          {cardStyle === 'casual' && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Colour palette</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {CASUAL_PALETTES.map(p => (
                  <div key={p.id} onClick={() => setCardPalette(p.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${p.headerFrom}, ${p.headerTo})`, border: cardPalette === p.id ? '3px solid #E8724A' : '3px solid transparent', boxShadow: cardPalette === p.id ? '0 0 0 2px rgba(232,114,74,.3)' : '0 2px 6px rgba(0,0,0,.12)', transition: 'all .2s' }} />
                    <div style={{ fontSize: '.65rem', fontWeight: 800, color: cardPalette === p.id ? '#E8724A' : '#7A7585' }}>{p.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Palette + logo — corporate */}
          {cardStyle === 'corporate' && (
            <>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Header colour</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {CORPORATE_PALETTES.map(p => (
                    <div key={p.id} onClick={() => setCardPalette(p.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${p.headerFrom}, ${p.headerTo})`, border: cardPalette === p.id ? '3px solid #E8724A' : '3px solid transparent', boxShadow: cardPalette === p.id ? '0 0 0 2px rgba(232,114,74,.3)' : '0 2px 6px rgba(0,0,0,.12)', transition: 'all .2s' }} />
                      <div style={{ fontSize: '.6rem', fontWeight: 800, color: cardPalette === p.id ? '#E8724A' : '#7A7585' }}>{p.name}</div>
                    </div>
                  ))}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', position: 'relative', overflow: 'hidden', background: cardPalette?.startsWith('#') ? cardPalette : 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)', border: cardPalette?.startsWith('#') ? '3px solid #E8724A' : '3px solid transparent', boxShadow: cardPalette?.startsWith('#') ? '0 0 0 2px rgba(232,114,74,.3)' : '0 2px 6px rgba(0,0,0,.12)' }}>
                      <input type="color" value={cardPalette?.startsWith('#') ? cardPalette : '#1A2744'} onChange={e => setCardPalette(e.target.value)} style={{ position: 'absolute', inset: '-4px', opacity: 0, cursor: 'pointer', width: 'calc(100% + 8px)', height: 'calc(100% + 8px)' }} />
                    </div>
                    <div style={{ fontSize: '.6rem', fontWeight: 800, color: cardPalette?.startsWith('#') ? '#E8724A' : '#7A7585' }}>Custom</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Logo <span style={{ fontWeight: 600, letterSpacing: 0, textTransform: 'none', color: '#B0A8BC' }}>(optional)</span></div>
                <input ref={logoUploadRef} type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" style={{ display: 'none' }} onChange={handleLogoUpload} />
                {logoUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F7F5FB', borderRadius: 10, padding: '8px 12px' }}>
                    <img src={logoUrl} alt="" style={{ maxHeight: 28, maxWidth: 90, objectFit: 'contain' }} />
                    <button onClick={() => setLogoUrl(null)} style={{ marginLeft: 'auto', background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '4px 10px', fontSize: '.72rem', fontWeight: 800, color: '#7A7585', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>Remove</button>
                  </div>
                ) : (
                  <button onClick={() => logoUploadRef.current?.click()} disabled={logoUploading} style={{ width: '100%', background: '#fff', border: '2px dashed #E8E2F0', borderRadius: 10, padding: '11px', fontWeight: 700, fontSize: '.82rem', color: logoUploading ? '#B0A8BC' : '#7A7585', cursor: logoUploading ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                    {logoUploading ? 'Uploading…' : '⬆ Upload your logo (PNG or SVG)'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Inline editable card */}
        <div style={{ margin: '16px 18px 0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 56px rgba(60,50,100,.18)' }}>

          {/* Cover — corporate shows split header; classic/casual shows full-width image */}
          {cardStyle === 'corporate' ? (
            /* ── Corporate header ── */
            <div style={{ display: 'flex', minHeight: 240, background: `linear-gradient(135deg, ${corpPalette.headerFrom}, ${corpPalette.headerTo})` }}>
              {/* Text side */}
              <div style={{ flex: 1, padding: '28px 18px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', zIndex: 2 }}>
                <div style={{ fontSize: '.52rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: 8 }}>To</div>

                {/* Recipient */}
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  {!recip && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 7vw, 2.2rem)', lineHeight: 1.05, color: 'rgba(255,255,255,.28)' }}>The legend</div>}
                  <div contentEditable suppressContentEditableWarning spellCheck={false} autoCapitalize="words"
                    onInput={e => { const raw = e.currentTarget.textContent ?? ''; setRecip(raw.replace(/(?:^|\s)\S/g, c => c.toUpperCase())); }}
                    style={{ outline: 'none', cursor: 'text', fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 7vw, 2.2rem)', lineHeight: 1.05, color: '#fff', caretColor: '#fff', minWidth: 40, textTransform: 'capitalize' }}
                  />
                </div>

                {/* Message */}
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  {!cardMsg && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: 'Georgia, serif', fontSize: 'clamp(.82rem, 3vw, 1rem)', fontStyle: 'italic', color: 'rgba(255,255,255,.25)', lineHeight: 1.4 }}>Add a tagline…</div>}
                  <div ref={cardMsgRef} contentEditable suppressContentEditableWarning spellCheck={false}
                    onInput={e => setCardMsg(e.currentTarget.textContent ?? '')}
                    style={{ outline: 'none', cursor: 'text', fontFamily: 'Georgia, serif', fontSize: 'clamp(.82rem, 3vw, 1rem)', fontStyle: 'italic', lineHeight: 1.4, color: corpPalette.accent, caretColor: '#fff', wordBreak: 'break-word' }}
                  />
                </div>

                {/* From */}
                <div style={{ fontSize: '.52rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 2 }}>From</div>
                <div style={{ position: 'relative' }}>
                  {!occasion && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: "'Nunito', sans-serif", fontSize: '.88rem', color: 'rgba(255,255,255,.22)', fontWeight: 700 }}>the team</div>}
                  <div ref={occasionRef} contentEditable suppressContentEditableWarning spellCheck={false}
                    onInput={e => setOccasion(e.currentTarget.textContent ?? '')}
                    style={{ outline: 'none', cursor: 'text', fontFamily: "'Nunito', sans-serif", fontSize: '.88rem', fontWeight: 700, color: 'rgba(255,255,255,.7)', caretColor: '#fff', wordBreak: 'break-word', minWidth: 40 }}
                  />
                </div>
                {/* Logo preview — pushed to bottom */}
                {logoUrl && (
                  <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={logoUrl} alt="" style={{ maxHeight: 28, maxWidth: 90, objectFit: 'contain', opacity: 0.9 }} />
                    <button onClick={() => setLogoUrl(null)} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', color: '#fff', fontSize: '.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                )}
              </div>

              {/* Colour/photo side */}
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
                <div onClick={() => customImgUrl ? (setCustomImgUrl(null), setImgIdx(0)) : uploadRef.current?.click()}
                  style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 5, width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', background: customImgUrl ? 'rgba(232,114,74,.9)' : 'rgba(255,255,255,.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', boxShadow: '0 2px 8px rgba(0,0,0,.3)' }}
                  title={customImgUrl ? 'Remove photo' : 'Add a photo (optional)'}
                >{customImgUrl ? '✕' : '📷'}</div>
              </div>
            </div>
          ) : (
            /* ── Classic / Casual cover ── */
            <div style={{ position: 'relative', overflow: 'hidden', background: theme.color }}>
              <img key={imgUrl} src={imgUrl} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, pointerEvents: 'none', zIndex: 2 }} />
              <div onClick={() => customImgUrl ? (setCustomImgUrl(null), setImgIdx(0)) : uploadRef.current?.click()}
                style={{ position: 'absolute', top: 14, right: 14, zIndex: 5, width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', background: customImgUrl ? 'rgba(232,114,74,0.9)' : 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.35)', transition: 'background .2s' }}
                title={customImgUrl ? 'Remove your photo' : 'Use your own photo'}
              >{customImgUrl ? '✕' : '📷'}</div>
              <input ref={uploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />

              {/* Recipient name */}
              <div style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', zIndex: 3, padding: '0 16px' }}>
                <div style={{ fontSize: '.58rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 4 }}>To</div>
                <div style={{ position: 'relative', width: '85%', margin: '0 auto' }}>
                  {!recip && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', textAlign: 'center', fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(2.4rem, 9vw, 3.2rem)', lineHeight: 1.1, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>The Legend&apos;s Name</div>}
                  <div contentEditable suppressContentEditableWarning spellCheck={false} autoCapitalize="words"
                    onInput={e => { const raw = e.currentTarget.textContent ?? ''; setRecip(raw.replace(/(?:^|\s)\S/g, c => c.toUpperCase())); }}
                    style={{ outline: 'none', cursor: 'text', textAlign: 'center', fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(2.4rem, 9vw, 3.2rem)', lineHeight: 1.1, color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,0.55)', caretColor: '#fff', padding: '6px 4px', minWidth: 40, textTransform: 'capitalize' }}
                  />
                </div>
              </div>

              {/* Cover text + from */}
              <div style={{ position: 'absolute', bottom: '8%', left: 0, right: 0, zIndex: 3, textAlign: 'center', padding: '0 16px' }}>
                <div style={{ position: 'relative', width: '90%', margin: '0 auto' }}>
                  {!cardMsg && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', textAlign: 'center', fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(2rem, 7.5vw, 2.8rem)', lineHeight: 1.2, color: 'rgba(255,255,255,0.35)' }}>Add cover text…</div>}
                  <div ref={cardMsgRef} contentEditable suppressContentEditableWarning spellCheck={false}
                    onInput={e => setCardMsg(e.currentTarget.textContent ?? '')}
                    style={{ outline: 'none', cursor: 'text', textAlign: 'center', fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(2rem, 7.5vw, 2.8rem)', lineHeight: 1.2, color: '#fff', textShadow: '0 3px 24px rgba(0,0,0,0.7)', caretColor: '#fff', wordBreak: 'break-word' }}
                  />
                  <div style={{ textAlign: 'center', marginTop: 10 }}>
                    <div style={{ fontSize: '.58rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 2 }}>From</div>
                    <div style={{ position: 'relative', width: '80%', margin: '0 auto' }}>
                      {!occasion && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', textAlign: 'center', fontFamily: "'Nunito', sans-serif", fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', lineHeight: 1.3, color: 'rgba(255,255,255,0.28)', fontWeight: 700 }}>the Under 12s team</div>}
                      <div ref={occasionRef} contentEditable suppressContentEditableWarning spellCheck={false}
                        onInput={e => setOccasion(e.currentTarget.textContent ?? '')}
                        style={{ outline: 'none', cursor: 'text', textAlign: 'center', fontFamily: "'Nunito', sans-serif", fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', fontWeight: 700, lineHeight: 1.3, color: 'rgba(255,255,255,0.92)', textShadow: '0 2px 14px rgba(0,0,0,0.65)', caretColor: '#fff', wordBreak: 'break-word', minWidth: 40, padding: '3px 4px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages preview — style-aware */}
          {cardStyle === 'casual' ? (
            <CasualView
              campaign={{ slug: '', recipient_name: recip || 'Name', occasion, card_message: cardMsg, card_image_url: null, card_palette: cardPalette }}
              contributions={PREVIEW_CONTRIBUTIONS}
              preview
              noHeader
            />
          ) : cardStyle === 'corporate' ? (
            <CorporateView
              campaign={{ slug: '', recipient_name: recip || 'Name', occasion, card_message: cardMsg, card_image_url: null, card_palette: cardPalette, card_logo_url: logoUrl }}
              contributions={PREVIEW_CONTRIBUTIONS}
              preview
              noHeader
            />
          ) : (
            <>
              <div style={{ background: '#3A8FA0', color: 'rgba(255,255,255,.9)', textAlign: 'center', padding: '10px 16px', fontSize: '.75rem', letterSpacing: '.07em', fontWeight: 700 }}>
                Messages from the Team ↓
              </div>
              <div style={{ background: '#FAFAF8', padding: '18px 22px', borderBottom: '1px solid #F0EDF5' }}>
                <div style={{ fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: '.95rem', color: '#C8C0D0', lineHeight: 1.7 }}>
                  Contributors&apos; messages will appear here…
                </div>
              </div>
              <div style={{ background: '#3A8FA0', padding: '16px 22px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, color: 'rgba(255,255,255,.9)', fontSize: '.95rem', marginBottom: 2 }}>
                  thank<span style={{ color: '#F09070' }}>you</span>cards.au
                </div>
                <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '.68rem', letterSpacing: '.06em' }}>A card thoughtfully chosen just for you.</div>
              </div>
            </>
          )}
        </div>

        {/* Deadline — same width as card */}
        <div
          style={{ margin: '12px 18px 0', background: '#FFFDF8', border: '2px solid #E8E2F0', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color .2s', cursor: 'pointer' }}
          onClick={() => (document.getElementById('group-deadline') as HTMLInputElement)?.showPicker?.()}
        >
          <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>📅</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 3 }}>Deadline</div>
            <input
              id="group-deadline"
              type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '16px', color: deadline ? '#2A2A2A' : '#B0A8BC', background: 'transparent', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <div style={{ margin: '4px 18px 0', fontSize: '.72rem', color: '#B0A8BC', fontWeight: 600 }}>Contributors won&apos;t be able to add messages after this date</div>

        {/* Organiser email */}
        <div style={{ padding: '16px 18px 0' }}>
          <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Your email</label>
          <input
            type="email" value={organiserEmail} onChange={e => setOrganiserEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '16px', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
            onFocus={e => (e.target.style.borderColor = '#E8724A')}
            onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
          />
          <div style={{ fontSize: '.72rem', color: '#B0A8BC', marginTop: 4 }}>We&apos;ll send you updates when people contribute</div>
        </div>

        {/* Sticky create button */}
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
