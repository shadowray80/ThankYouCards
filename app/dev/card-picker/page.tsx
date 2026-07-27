'use client';

import { useEffect, useRef, useState } from 'react';
import { Nav } from '@/components/ui/Nav';
import { Btn } from '@/components/ui/Button';
import { PreviewToggle } from '@/components/ui/PreviewToggle';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { CardPicker } from '@/components/cards/CardPicker';
import { THEMES } from '@/lib/themes';

export default function CardPickerDevPage() {
  const [selectedUrl, setSelectedUrl] = useState(THEMES[0].imgs[0]);
  const [customImgUrl, setCustomImgUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [to, setTo] = useState('');
  const [cardMsg, setCardMsg] = useState('');   // on-image cover message
  const [panelMsg, setPanelMsg] = useState('');  // longer message shown in the panel below
  const [from, setFrom] = useState('');
  const [includeGift, setIncludeGift] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const uploadRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const cardMsgRef = useRef<HTMLDivElement>(null);
  const msgPhotoRef = useRef<HTMLInputElement>(null);

  const imgUrl = customImgUrl || selectedUrl;

  // The on-image fields are contentEditable, which manages its own DOM text outside
  // React's normal render cycle. Leaving preview mode unmounts and remounts these divs,
  // so they come back empty even though state still holds the text — these re-sync it.
  useEffect(() => {
    const el = toRef.current;
    if (el && !el.textContent && to) el.textContent = to;
  }, [to, showPreview]);

  useEffect(() => {
    const el = cardMsgRef.current;
    if (el && el.textContent !== cardMsg) el.textContent = cardMsg;
  }, [cardMsg, showPreview]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setCustomImgUrl(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const handleMsgPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setPhotoData(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const canContinue = to.trim().length > 0;

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fff', position: 'relative' }}>
      <Nav onHome={() => {}} badge={null} />

      <div>
        {showPreview ? (
          /* ── Recipient preview — the real CardScrollView, exactly what SoloFlow uses.
               Nothing prompt-y renders here: an empty name/message just shows a clean photo. ── */
          <div style={{ margin: '16px 18px 0', position: 'relative' }}>
            <PreviewToggle active={showPreview} onClick={() => setShowPreview(false)} />
            <CardScrollView
              theme={THEMES[0]}
              customImgUrl={imgUrl}
              recipientName={to}
              fromText={from || 'A friend'}
              message={cardMsg}
              soloMessage={photoData === null ? (panelMsg || undefined) : undefined}
              soloPhotoData={photoData ?? undefined}
              messages={[]}
              landscapeCover
            />
          </div>
        ) : (
        <>
        {/* Cover image — its own boxed card now, so the picker below can sit flush
            against its bottom edge instead of sharing a box with the message panel. */}
        <div style={{ margin: '16px 18px 0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 56px rgba(60,50,100,.18)' }}>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img key={imgUrl} src={imgUrl} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />

            {/* Upload own photo — corner button */}
            <div
              onClick={() => customImgUrl ? setCustomImgUrl(null) : uploadRef.current?.click()}
              style={{
                position: 'absolute', top: 14, right: 14, zIndex: 5,
                width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                background: customImgUrl ? 'rgba(232,114,74,0.9)' : 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
              }}
              title={customImgUrl ? 'Remove your photo' : 'Use your own photo'}
            >
              {customImgUrl ? '✕' : '📷'}
            </div>
            <input ref={uploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />

            <PreviewToggle active={showPreview} onClick={() => setShowPreview(true)} />

            {/* On-image "To" — prompt text, contentEditable */}
            <div style={{ position: 'absolute', top: 22, left: 0, right: 0, textAlign: 'center', zIndex: 3, padding: '0 16px' }}>
              <div style={{ fontSize: '.58rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 2 }}>To</div>
              <div style={{ position: 'relative', width: '85%', margin: '0 auto' }}>
                {!to && (
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', textAlign: 'center', fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(2.4rem, 9vw, 3.2rem)', lineHeight: 1.1, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
                    The Legend&apos;s Name
                  </div>
                )}
                <div
                  ref={toRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  onInput={e => setTo(e.currentTarget.textContent ?? '')}
                  style={{ outline: 'none', cursor: 'text', textAlign: 'center', fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(2.4rem, 9vw, 3.2rem)', lineHeight: 1.1, color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,0.55)', caretColor: '#fff', padding: '6px 4px', minWidth: 40 }}
                />
              </div>
            </div>

            {/* On-image cover message — prompt text, contentEditable */}
            <div style={{ position: 'absolute', bottom: '8%', left: 0, right: 0, zIndex: 3, textAlign: 'center', padding: '0 16px' }}>
              <div style={{ position: 'relative', width: '90%', margin: '0 auto' }}>
                {!cardMsg && (
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', textAlign: 'center', fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(3.2rem, 12vw, 4.5rem)', lineHeight: 1.2, color: 'rgba(255,255,255,0.35)' }}>
                    Cover Message
                  </div>
                )}
                <div
                  ref={cardMsgRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  onInput={e => setCardMsg(e.currentTarget.textContent ?? '')}
                  style={{ outline: 'none', cursor: 'text', textAlign: 'center', fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(3.2rem, 12vw, 4.5rem)', lineHeight: 1.2, color: '#fff', textShadow: '0 3px 24px rgba(0,0,0,0.7)', caretColor: '#fff', wordBreak: 'break-word' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Card picker — sits in plain document flow immediately after the image, so
             it's always anchored exactly to the image's bottom edge with no measuring,
             and normal page scroll doubles as scrolling the picker. ── */}
        <div style={{ margin: '0 18px' }}>
          <CardPicker selectedUrl={selectedUrl} onSelect={url => { setSelectedUrl(url); setCustomImgUrl(null); }} />
        </div>

        <div style={{ margin: '0 18px', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: 'hidden', boxShadow: '0 16px 56px rgba(60,50,100,.18)' }}>
          {/* ── Message panel ── */}
          <div style={{ background: '#fff', padding: '20px 22px 8px' }}>
            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 4, fontSize: '.68rem', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#B0A8BC' }}>
              <span style={{ flexShrink: 0 }}>To</span>
              <span>{to || 'The Legend\'s Name'}</span>
            </div>
            {photoData ? (
              <img src={photoData} alt="Handwritten message" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
            ) : (
              <textarea
                value={panelMsg}
                onChange={e => setPanelMsg(e.target.value)}
                placeholder="Card message"
                rows={2}
                style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', textAlign: 'center', fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: '16px', lineHeight: 1.75, color: '#2A2A2A', background: 'transparent', caretColor: '#3A8FA0', boxSizing: 'border-box' }}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, marginBottom: 12 }}>
              <span style={{ fontSize: '.78rem', color: '#B0A8BC', fontWeight: 600, marginRight: 4 }}>-</span>
              <input
                value={from}
                onChange={e => setFrom(e.target.value)}
                placeholder="Your name"
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '16px', color: from ? '#7A7585' : '#B0A8BC', fontWeight: 600, flex: 1, caretColor: '#3A8FA0' }}
              />
            </div>
          </div>

          {/* ── Handwrite instead ── */}
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

          {/* ── Footer ── */}
          <div style={{ background: '#3A8FA0', padding: '16px 22px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, color: 'rgba(255,255,255,.9)', fontSize: '.95rem', marginBottom: 2 }}>
              thank<span style={{ color: '#F09070' }}>you</span>cards.au
            </div>
            <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '.68rem', letterSpacing: '.06em' }}>A card thoughtfully chosen just for you.</div>
          </div>
        </div>
        </>
        )}

        {/* ── Gift card — coming soon ── */}
        <div style={{ padding: '16px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAFA', border: '2px solid #E8E2F0', borderRadius: 12, padding: '14px 16px', opacity: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.4rem' }}>💳</span>
              <div style={{ fontWeight: 800, fontSize: '.93rem', color: '#2A2A2A', display: 'flex', alignItems: 'center', gap: 8 }}>
                Add a gift card
                <span style={{ background: '#F09070', color: '#fff', fontSize: '.58rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', borderRadius: 6, padding: '2px 7px' }}>Coming soon</span>
              </div>
            </div>
            <div onClick={() => setIncludeGift(v => !v)} style={{ width: 42, height: 24, borderRadius: 12, position: 'relative', flexShrink: 0, background: includeGift ? '#3A8FA0' : '#D1C8DC', cursor: 'pointer', transition: 'background .15s' }}>
              <div style={{ position: 'absolute', top: 3, left: includeGift ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .15s' }} />
            </div>
          </div>
        </div>

        {/* ── Continue ── */}
        <div style={{ padding: '16px 18px' }}>
          <Btn variant="teal" full disabled={!canContinue} onClick={() => setSubmitted(true)}>
            {submitted ? '✓ Ready to send (prototype — not saved)' : 'Continue → Send this card'}
          </Btn>
          {!canContinue && (
            <div style={{ textAlign: 'center', fontSize: '.75rem', color: '#B0A8BC', marginTop: 6 }}>
              Fill in a recipient name to continue
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
