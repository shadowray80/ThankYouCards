'use client';

import React, { useState, useRef } from 'react';
import { Nav } from '@/components/ui/Nav';
import { Btn } from '@/components/ui/Button';
import { FeatureOptIn } from '@/components/ui/FeatureOptIn';
import { EmailCardForm } from '@/components/forms/EmailCardForm';
import { PreviewToggle } from '@/components/ui/PreviewToggle';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { CardPicker } from '@/components/cards/CardPicker';
import { ImageOnlyButton, PhotoButton } from '@/components/cards/CoverToolbarButtons';
import { CoverTextButton, CoverTextPicker } from '@/components/cards/CoverTextPicker';
import { coverTextCss, coverTextFields, DEFAULT_COVER_TEXT, type CoverTextStyle } from '@/lib/coverText';
import { GiftSelector } from '@/components/forms/GiftSelector';
import { resizeImage } from '@/lib/resizeImage';
import { CoverField } from '@/components/ui/CoverField';
import { TintedIcon } from '@/components/ui/TintedIcon';
import { useOrganiserSession } from '@/lib/useOrganiserSession';
import { SignOffInput } from '@/components/ui/SignOffInput';
import { DEFAULT_SIGN_OFF } from '@/lib/signOff';

interface SoloFlowProps {
  onBack: () => void;
  onToast: (msg: string) => void;
  onNav: (view: string) => void;
}

export function SoloFlow({ onBack, onToast, onNav }: SoloFlowProps) {
  const [selectedUrl, setSelectedUrl] = useState('https://ofoboqojauitnmdbhcaz.supabase.co/storage/v1/object/public/cards/thank_you_beach_papercraft_04.png');
  const [customImgUrl, setCustomImgUrl] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [signOff, setSignOff] = useState(''); // empty = "From"
  const [cardMsg, setCardMsg] = useState('');
  // Message-area-only name — used only when the on-photo name is left blank, so someone
  // can fill in the recipient's name without ever putting text on the photo.
  const [msgAreaTo, setMsgAreaTo] = useState('');
  const [msg, setMsg] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [includeGift, setIncludeGift] = useState(false);
  const [giftSel, setGiftSel] = useState<string | null>('25');
  const [giftCustom, setGiftCustom] = useState('');

  const [showDone, setShowDone] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  // Image only: hides all text on the cover (editor, preview and the sent card).
  const [imageOnly, setImageOnly] = useState(false);
  // "Aa": the cover text's font, colour and outline.
  const [coverText, setCoverText] = useState<CoverTextStyle>(DEFAULT_COVER_TEXT);
  const [coverTextOpen, setCoverTextOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [organiserToken, setOrganiserToken] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const uploadRef = useRef<HTMLInputElement>(null);
  const msgPhotoRef = useRef<HTMLInputElement>(null);
  const msgTextareaRef = useRef<HTMLTextAreaElement>(null);


  const [featureOk, setFeatureOk] = useState(false);
  // Logged in: the card is saved to the account, so it shows up in My cards.
  const { session } = useOrganiserSession();

  async function handleSubmit() {
    setSaving(true);
    try {
      const imageUrl = customImgUrl || selectedUrl;
      const campaignRes = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: effectiveTo.trim(),
          occasion: '',
          target_amount: 0,
          card_theme: '',
          card_message: cardMsg.trim(),
          card_image_url: imageUrl,
          card_text_on_image: !imageOnly && (to.trim() !== '' || cardMsg.trim() !== ''),
          feature_ok: featureOk,
          ...coverTextFields(coverText),
          card_sign_off: signOff.trim(),
          ...(session ? { organiser_email: session.email, session_token: session.session_token } : {}),
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
          photo_url: photoData !== null ? photoUrl : null,
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
      setOrganiserToken(campaign.organiser_token);
      setShowDone(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Something went wrong - please try again');
    } finally {
      setSaving(false);
    }
  }

  const imgUrl = customImgUrl || selectedUrl;
  const effectiveTo = to || msgAreaTo;
  const canContinue = effectiveTo.trim().length > 0;
  const giftAmount = includeGift ? Number(giftSel || giftCustom) || 0 : 0;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('file', await resizeImage(f));
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) setCustomImgUrl(json.url);
      else onToast(json.error ?? 'Upload failed — please try again');
    } catch {
      onToast('Upload failed — please try again');
    } finally {
      setUploadingImg(false);
      if (uploadRef.current) uploadRef.current.value = '';
    }
  };

  const handleMsgPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Instant local preview while the real upload happens in the background.
    const r = new FileReader();
    r.onload = ev => setPhotoData(ev.target?.result as string);
    r.readAsDataURL(f);

    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', await resizeImage(f));
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) {
        setPhotoUrl(json.url);
      } else {
        onToast(json.error ?? 'Photo upload failed — please try again');
        setPhotoData(null);
        setPhotoUrl(null);
      }
    } catch {
      onToast('Photo upload failed — please try again');
      setPhotoData(null);
      setPhotoUrl(null);
    } finally {
      setUploadingPhoto(false);
      if (msgPhotoRef.current) msgPhotoRef.current.value = '';
    }
  };

  // ── Done screen ──────────────────────────────────────────────
  if (showDone && slug) {
    const recipientUrl = `thankyoucards.au/view/${slug}`;
    const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://thankyoucards.au'}/view/${slug}`;
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
                onClick={() => {
                  navigator.clipboard.writeText(fullUrl);
                  setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000);
                }}
                style={{ background: '#7C5CBF', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#fff', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito',sans-serif" }}
              >
                {copiedLink ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            {organiserToken && (
              <EmailCardForm
                slug={slug}
                token={organiserToken}
                isSolo
                recipientName={effectiveTo}
                fromName={from.trim()}
                imageUrl={imgUrl}
              />
            )}
          </div>
          <CardScrollView
            customImgUrl={imgUrl}
            recipientName={to}
            fromText={from || 'From a friend'}
            message={cardMsg}
            messageAreaName={effectiveTo}
            soloMessage={photoData === null ? msg : undefined}
            soloPhotoData={photoData ?? undefined}
            messages={[]}
            landscapeCover
            showCoverText={!imageOnly}
            coverText={coverText}
            signOff={signOff.trim() || DEFAULT_SIGN_OFF}
            giftAmount={giftAmount}
          />
          <a href={`/print/${slug}`} style={{ display: 'block', textAlign: 'center', fontSize: '.82rem', fontWeight: 700, color: '#7A7585', textDecoration: 'none', margin: '14px 0 0' }}>
            You can also <span style={{ color: '#3A8FA0', fontWeight: 800 }}>print it at home</span>
          </a>
          {session && organiserToken && (
            <a href={`/manage/${slug}?token=${organiserToken}`}
              style={{ display: 'block', textAlign: 'center', fontSize: '.82rem', fontWeight: 700, color: '#3A8FA0', textDecoration: 'none', margin: '14px 0' }}>
              Saved to your cards. Open it to edit, print or save.
            </a>
          )}
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
          <div style={{ padding: '16px 18px 0' }}>
            {/* Toggle positioned against the card itself (not the padded wrapper) so it sits
                in exactly the same spot as on the editing cover. */}
            <div style={{ position: 'relative' }}>
            <PreviewToggle active={showPreview} onClick={() => setShowPreview(v => !v)} />
            <CardScrollView
              customImgUrl={imgUrl}
              recipientName={to}
              fromText={from || 'From a friend'}
              message={cardMsg}
              messageAreaName={effectiveTo}
              soloMessage={photoData === null ? msg : undefined}
              soloPhotoData={photoData ?? undefined}
              messages={[]}
              landscapeCover
              showCoverText={!imageOnly}
              coverText={coverText}
              signOff={signOff.trim() || DEFAULT_SIGN_OFF}
              giftAmount={giftAmount}
            />
            </div>
          </div>
        ) : (
        <>

        {/* ── Cover image — its own boxed card, so the picker below can sit flush
            against its bottom edge instead of sharing a box with the message panel. ── */}
        <div style={{ margin: '16px 18px 0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 56px rgba(60,50,100,.18)' }}>

          {/* Cover image */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img
              key={imgUrl}
              src={imgUrl} alt=""
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />

            {/* Inset border */}
            <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, pointerEvents: 'none', zIndex: 2 }} />

            <input ref={uploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />

            <PreviewToggle active={showPreview} onClick={() => setShowPreview(v => !v)} />

            {/* Recipient name, typed on the cover */}
            <div style={{ position: 'absolute', top: 22, left: 0, right: 0, textAlign: 'center', zIndex: 3, padding: '0 16px', display: imageOnly ? 'none' : undefined }}>
              <div style={{ fontSize: '.58rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 2 }}>To</div>
              <div style={{ position: 'relative' }}>
                {!to && (
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', textAlign: 'center',
                    letterSpacing: '.01em', ...coverTextCss(coverText, 'clamp(2.4rem, 9vw, 3.2rem)'),
                    lineHeight: 1.1, whiteSpace: 'nowrap',
                  }}>
                    Legend&apos;s Name
                  </div>
                )}
                <CoverField value={to} onChange={setTo} capitalizeWords ariaLabel="Who it's for"
                  style={{ textAlign: 'center', letterSpacing: '.01em', ...coverTextCss(coverText, 'clamp(2.4rem, 9vw, 3.2rem)'), lineHeight: 1.1 }}
                />
              </div>
            </div>

            {/* Cover text — floating on image, wraps to two lines if long. Font size and
                position mirror CardScrollView's rendering exactly, so the preview never
                looks different from what you were just typing. Dimmed while it's a
                placeholder. It starts empty — nothing is sent unless you type here. */}
            <div style={{
              position: 'absolute', bottom: '8%', left: 0, right: 0, zIndex: 3,
              textAlign: 'center', padding: '0 16px', display: imageOnly ? 'none' : undefined,
            }}>
              <div style={{ position: 'relative' }}>
                {!cardMsg && (
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', textAlign: 'center',
                    ...coverTextCss(coverText, 'clamp(2.4rem, 9vw, 3.2rem)'),
                    lineHeight: 1.2,
                  }}>
                    Cover Message
                  </div>
                )}
                <CoverField value={cardMsg} onChange={setCardMsg} capitalizeWords ariaLabel="Cover message"
                  style={{ textAlign: 'center', ...coverTextCss(coverText, 'clamp(2.4rem, 9vw, 3.2rem)'), lineHeight: 1.2, wordBreak: 'break-word' }}
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
        </div>

        {/* ── Card picker — sits in plain document flow immediately after the image, so
             it's always anchored exactly to the image's bottom edge with no measuring,
             and normal page scroll doubles as scrolling the picker. ── */}
        <div style={{ margin: '0 18px' }}>
          <CardPicker
            browseHeader
            headerLead={<ImageOnlyButton imageOnly={imageOnly} onToggle={() => setImageOnly(v => !v)} />}
            headerAction={
              <div style={{ display: 'flex', gap: 8 }}>
                {!imageOnly && <CoverTextButton open={coverTextOpen} onToggle={() => setCoverTextOpen(v => !v)} />}
                <PhotoButton
                  hasPhoto={!!customImgUrl} uploading={uploadingImg}
                  onAdd={() => uploadRef.current?.click()} onRemove={() => setCustomImgUrl(null)}
                />
              </div>
            }
            selectedUrl={selectedUrl} onSelect={url => { setSelectedUrl(url); setCustomImgUrl(null); }} />
          {coverTextOpen && !imageOnly && <CoverTextPicker value={coverText} onChange={setCoverText} />}
        </div>

        <div style={{ margin: '0 18px', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: 'hidden', boxShadow: '0 16px 56px rgba(60,50,100,.18)' }}>

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
                  placeholder="Legend's Name"
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

            {/* Sign-off, like a paper card: "Love from" (tap for suggestions), then the name in script */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 10, marginBottom: 12 }}>
              <SignOffInput value={signOff} onChange={setSignOff} style={{ width: '100%' }} />
              <input
                value={from}
                onChange={e => setFrom(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%', border: 'none', outline: 'none', background: 'transparent', textAlign: 'center',
                  fontFamily: 'var(--font-dancing), cursive', fontSize: '1.9rem', lineHeight: 1.2,
                  color: from ? '#2A2A2A' : '#B0A8BC', caretColor: '#3A8FA0',
                }}
              />
            </div>
          </div>

          {/* Handwritten photo — between message and footer */}
          <div style={{ background: '#fff', borderTop: '1px solid #F0EDF5', padding: '10px 22px 14px' }}>
            <input ref={msgPhotoRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleMsgPhoto} />
            {photoData ? (
              <button
                onClick={() => { setPhotoData(null); setPhotoUrl(null); }}
                disabled={uploadingPhoto}
                style={{ background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '7px 14px', fontSize: '.75rem', fontWeight: 700, color: '#7A7585', cursor: uploadingPhoto ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}
              >
                {uploadingPhoto ? 'Uploading…' : '✕ Remove handwritten note'}
              </button>
            ) : (
              <button
                onClick={() => msgPhotoRef.current?.click()}
                style={{ width: '100%', background: 'none', border: '2px dashed #D4C8EE', borderRadius: 10, padding: '11px', fontSize: '.82rem', fontWeight: 700, color: '#7A7585', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><TintedIcon src="/Icons/written.png" size={20} color="#7A7585" />Handwrite your message instead</span>
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

        </>
        )}

        {/* ── Sticky continue button ── */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '12px 18px', background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #E8E2F0', zIndex: 100 }}>
          <FeatureOptIn checked={featureOk} onChange={setFeatureOk} />
          <Btn variant="teal" full disabled={!canContinue || saving || uploadingPhoto} onClick={handleSubmit}>
            {saving ? 'Saving…' : uploadingPhoto ? 'Uploading photo…' : 'Continue → Send this card'}
          </Btn>
        </div>

      </div>
    </div>
  );
}
