'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Nav } from '@/components/ui/Nav';
import { Btn } from '@/components/ui/Button';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { ShareLink } from '@/components/dashboard/ShareLink';
import { THEMES } from '@/lib/themes';
import { CASUAL_PALETTES } from '@/lib/palettes';

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
  const [cardStyle, setCardStyle]           = useState<'classic' | 'casual'>('classic');
  const [cardPalette, setCardPalette]       = useState('sky');
  const [organiserEmail, setOrganiserEmail] = useState('');
  const [showDone, setShowDone]             = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [saveError, setSaveError]           = useState('');
  const [campaignSlug, setCampaignSlug]     = useState('');
  const [organiserToken, setOrganiserToken] = useState('');

  const uploadRef    = useRef<HTMLInputElement>(null);
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
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create campaign');
      setCampaignSlug(json.campaign.slug);
      setOrganiserToken(json.campaign.organiser_token);
      setShowDone(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  // ── Done screen ──
  if (showDone) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://thankyoucards.au';
    const shareText = `${recip} has a group card — add your message here: ${origin}/card/${campaignSlug}`;
    return (
      <div>
        <Nav onHome={onBack} onNav={onNav} badge="group" />
        <div style={{ padding: '22px 18px 60px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: '#2A2A2A' }}>🎉 Group card is live! 🎊</div>
            <div style={{ color: '#7A7585', fontSize: '.9rem', lineHeight: 1.6, fontWeight: 600, marginTop: 4 }}>
              Share the link — everyone adds their message and chips in.
            </div>
          </div>

          <div style={{ background: '#F0ECFB', border: '2px solid rgba(124,92,191,.2)', borderRadius: 14, padding: '16px', marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#2A2A2A', marginBottom: 8 }}>🔗 Share with contributors</div>
            <ShareLink link={`${origin}/card/${campaignSlug}`} onCopy={() => onToast('Link copied! 🎉')} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, background: '#25D366', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
                💬 WhatsApp
              </a>
              <a href={`sms:?body=${encodeURIComponent(shareText)}`}
                style={{ flex: 1, background: '#5AC8FA', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
                💬 SMS
              </a>
              <a href={`mailto:?subject=Add your message to ${recip}'s card&body=${encodeURIComponent(shareText)}`}
                style={{ flex: 1, background: '#3A8FA0', color: '#fff', borderRadius: 10, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none', fontFamily: "'Nunito',sans-serif" }}>
                ✉️ Email
              </a>
            </div>
          </div>

          <div style={{ background: '#EAF4FB', border: '2px solid rgba(58,143,160,.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#2A2A2A', marginBottom: 6 }}>🔐 Your organiser link</div>
            <div style={{ fontSize: '.76rem', color: '#7A7585', fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>Bookmark this — your private access to manage the card and see contributions.</div>
            <ShareLink link={`${origin}/manage/${campaignSlug}?token=${organiserToken}`} onCopy={() => onToast('Organiser link copied!')} />
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

          <Btn variant="outline" sm full onClick={() => window.open(`/card/${campaignSlug}`, '_blank')} style={{ marginBottom: 8 }}>👀 Preview contributor view</Btn>
          <Btn variant="coral" full onClick={() => { window.location.href = `/manage/${campaignSlug}?token=${organiserToken}`; }}>Go to Dashboard →</Btn>
          <Btn variant="outline" full onClick={onBack} style={{ marginTop: 10 }}>Back to home</Btn>
        </div>
      </div>
    );
  }

  // ── Builder ──
  return (
    <div>
      <Nav onHome={onBack} onNav={onNav} badge="group" />
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}>

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

        {/* Image film strip */}
        <div style={{ background: '#2A7E8F', padding: '10px 0 12px' }}>
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
        </div>

        {/* Inline editable card */}
        <div style={{ margin: '16px 18px 0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 56px rgba(60,50,100,.18)' }}>

          {/* Cover image */}
          <div style={{ position: 'relative', overflow: 'hidden', background: theme.color }}>
            <img key={imgUrl} src={imgUrl} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />

            <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, pointerEvents: 'none', zIndex: 2 }} />

            {/* Upload corner button */}
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

            {/* Recipient name */}
            <div style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', zIndex: 3, padding: '0 16px' }}>
              <div style={{ fontSize: '.58rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 4 }}>To</div>
              <div style={{ position: 'relative', width: '85%', margin: '0 auto' }}>
                {!recip && (
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
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  autoCapitalize="words"
                  onInput={e => {
                    const raw = e.currentTarget.textContent ?? '';
                    setRecip(raw.replace(/(?:^|\s)\S/g, c => c.toUpperCase()));
                  }}
                  style={{
                    outline: 'none', cursor: 'text', textAlign: 'center',
                    fontFamily: 'var(--font-dancing), cursive',
                    fontSize: 'clamp(2.4rem, 9vw, 3.2rem)',
                    lineHeight: 1.1, color: '#fff',
                    textShadow: '0 2px 20px rgba(0,0,0,0.55)',
                    caretColor: '#fff', padding: '6px 4px',
                    minWidth: 40, textTransform: 'capitalize',
                  }}
                />
              </div>
            </div>

            {/* Cover text + from line */}
            <div style={{ position: 'absolute', bottom: '8%', left: 0, right: 0, zIndex: 3, textAlign: 'center', padding: '0 16px' }}>
              <div style={{ position: 'relative', width: '90%', margin: '0 auto' }}>
                {!cardMsg && (
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', textAlign: 'center',
                    fontFamily: 'var(--font-dancing), cursive',
                    fontSize: 'clamp(2rem, 7.5vw, 2.8rem)',
                    lineHeight: 1.2, color: 'rgba(255,255,255,0.35)',
                  }}>
                    Add cover text…
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
                    fontSize: 'clamp(2rem, 7.5vw, 2.8rem)',
                    lineHeight: 1.2, color: '#fff',
                    textShadow: '0 3px 24px rgba(0,0,0,0.7)',
                    caretColor: '#fff', wordBreak: 'break-word',
                  }}
                />
                {/* From — uppercase label + editable team name (mirrors the TO / recipient pattern) */}
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <div style={{ fontSize: '.58rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 2 }}>From</div>
                  <div style={{ position: 'relative', width: '80%', margin: '0 auto' }}>
                    {!occasion && (
                      <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none', textAlign: 'center',
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 'clamp(1rem, 3.5vw, 1.2rem)',
                        lineHeight: 1.3, color: 'rgba(255,255,255,0.28)',
                        fontWeight: 700,
                      }}>
                        the Under 12s team
                      </div>
                    )}
                    <div
                      ref={occasionRef}
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onInput={e => setOccasion(e.currentTarget.textContent ?? '')}
                      style={{
                        outline: 'none', cursor: 'text', textAlign: 'center',
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 'clamp(1rem, 3.5vw, 1.2rem)',
                        fontWeight: 700, lineHeight: 1.3,
                        color: 'rgba(255,255,255,0.92)',
                        textShadow: '0 2px 14px rgba(0,0,0,0.65)',
                        caretColor: '#fff', wordBreak: 'break-word',
                        minWidth: 40, padding: '3px 4px',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Group messages banner */}
          <div style={{ background: '#3A8FA0', color: 'rgba(255,255,255,.9)', textAlign: 'center', padding: '10px 16px', fontSize: '.75rem', letterSpacing: '.07em', fontWeight: 700 }}>
            Messages from the Team ↓
          </div>

          {/* Messages placeholder */}
          <div style={{ background: '#FAFAF8', padding: '18px 22px', borderBottom: '1px solid #F0EDF5' }}>
            <div style={{ fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: '.95rem', color: '#C8C0D0', lineHeight: 1.7 }}>
              Contributors&apos; messages will appear here…
            </div>
          </div>

          {/* Card footer */}
          <div style={{ background: '#3A8FA0', padding: '16px 22px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, color: 'rgba(255,255,255,.9)', fontSize: '.95rem', marginBottom: 2 }}>
              thank<span style={{ color: '#F09070' }}>you</span>cards.au
            </div>
            <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '.68rem', letterSpacing: '.06em' }}>A card thoughtfully chosen just for you.</div>
          </div>
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

        {/* Group-specific fields */}
        <div style={{ padding: '16px 18px 0' }}>

          {/* Gift type — hidden until gift fund feature is reinstated
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>Gift</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {GIFT_TYPES.map(g => (
                <div
                  key={g.id}
                  onClick={() => setGiftType(g.id)}
                  style={{
                    border: giftType === g.id ? '2px solid #E8724A' : '2px solid #E8E2F0',
                    background: giftType === g.id ? '#FDF0E8' : '#fff',
                    borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all .2s',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: giftType === g.id ? '5px solid #E8724A' : '2px solid #C0B8CC', flexShrink: 0, marginTop: 2, transition: 'all .2s' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#2A2A2A' }}>{g.label}</div>
                    <div style={{ fontSize: '.76rem', color: '#7A7585', marginTop: 1 }}>{g.desc}</div>
                    {g.id === 'collect' && (
                      <div style={{ display: 'flex', gap: 7, marginTop: 10, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
                        {MINI_CARDS.map(card => (
                          <div key={card.name} style={{
                            flexShrink: 0, width: 54, height: 34, borderRadius: 5, position: 'relative', overflow: 'hidden',
                            background: card.bg, boxShadow: '0 2px 8px rgba(0,0,0,.18)',
                          }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,0) 60%)' }} />
                            <div style={{ position: 'absolute', top: 4, right: 5, width: 8, height: 6, borderRadius: 1, background: 'rgba(255,255,255,.25)' }} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {card.logo
                                ? <img src={card.logo} alt={card.name} style={{ height: card.logoH ?? 14, filter: card.logoFilter ?? 'brightness(0) invert(1)', objectFit: 'contain' }} />
                                : <span style={{ fontSize: card.fontSize ?? '.5rem', fontWeight: 900, color: card.textColor ?? '#fff', letterSpacing: card.letterSpacing ?? '.04em', textAlign: 'center', lineHeight: 1.2, padding: '0 4px' }}>{card.name}</span>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          */}

          {/* Card style */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>Card style</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {([
                { id: 'classic' as const, label: 'Classic', emoji: '✉️', desc: 'Elegant scroll with cover photo' },
                { id: 'casual' as const, label: 'Casual',  emoji: '🎉', desc: 'Masonry board with vibrant cards' },
              ] as { id: 'classic' | 'casual'; label: string; emoji: string; desc: string }[]).map(s => (
                <div
                  key={s.id}
                  onClick={() => setCardStyle(s.id)}
                  style={{
                    flex: 1, borderRadius: 14, padding: '14px 12px', cursor: 'pointer', textAlign: 'center',
                    border: cardStyle === s.id ? '2px solid #E8724A' : '2px solid #E8E2F0',
                    background: cardStyle === s.id ? '#FDF0E8' : '#fff',
                    transition: 'all .2s',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: '.85rem', color: '#2A2A2A', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: '.7rem', color: '#7A7585', fontWeight: 600, lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              ))}
            </div>

            {/* Palette swatches — only for casual */}
            {cardStyle === 'casual' && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Colour palette</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {CASUAL_PALETTES.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setCardPalette(p.id)}
                      style={{
                        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${p.headerFrom}, ${p.headerTo})`,
                        border: cardPalette === p.id ? '3px solid #E8724A' : '3px solid transparent',
                        boxShadow: cardPalette === p.id ? '0 0 0 2px rgba(232,114,74,.3)' : '0 2px 6px rgba(0,0,0,.12)',
                        transition: 'all .2s',
                      }} />
                      <div style={{ fontSize: '.65rem', fontWeight: 800, color: cardPalette === p.id ? '#E8724A' : '#7A7585' }}>{p.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Organiser email */}
          <div style={{ marginBottom: 24 }}>
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
