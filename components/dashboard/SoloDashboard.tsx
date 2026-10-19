'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/ui/Nav';
import { LiveCard, type LiveCampaign } from '@/components/cards/LiveCard';
import { CardPicker } from '@/components/cards/CardPicker';
import { EmailCardForm } from '@/components/forms/EmailCardForm';
import { KeepsakeButtons } from '@/components/ui/KeepsakeButtons';
import { FeatureOptIn } from '@/components/ui/FeatureOptIn';
import { LineIcon } from '@/components/ui/LineIcon';
import { TintedIcon } from '@/components/ui/TintedIcon';
import { Accordion, UiIcon } from '@/components/dashboard/DashboardParts';
import { resizeImage } from '@/lib/resizeImage';
import { CoverTextPicker } from '@/components/cards/CoverTextPicker';
import { coverTextFrom, type CoverTextStyle } from '@/lib/coverText';
import { SignOffInput } from '@/components/ui/SignOffInput';

export interface SoloCampaign extends LiveCampaign {
  feature_ok: boolean | null;
  created_at?: string;
}

export interface SoloContribution {
  id: string;
  contributor_name: string;
  message: string | null;
  photo_url?: string | null;
}

const SANS = "'Nunito',sans-serif";
const label: React.CSSProperties = { display: 'block', fontSize: '.68rem', fontWeight: 800, color: '#7A7585', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 };
const field: React.CSSProperties = { width: '100%', border: '2px solid #E8E2F0', borderRadius: 10, padding: '10px 12px', fontFamily: SANS, fontWeight: 700, fontSize: '15px', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box' };

// The organiser page for a solo card (one made while logged in, opened from My cards). Same look
// as the group dashboard, minus contributors, deadline and payment: the finished card, sending
// it, print / save, the editor, and the "feature this card" tick.
export function SoloDashboard({ campaign, contribution, slug, token, selector, onCampaignChange, onContributionChange, onCoverStyleChange }: {
  campaign: SoloCampaign;
  contribution: SoloContribution | null;
  slug: string;
  token: string;
  selector: React.ReactNode;
  onCampaignChange: (next: SoloCampaign) => void;
  onContributionChange: (next: SoloContribution) => void;
  onCoverStyleChange: (style: CoverTextStyle) => void; // saves straight away
}) {
  const router = useRouter();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://thankyoucards.au';
  const recipientName = campaign.recipient_name.charAt(0).toUpperCase() + campaign.recipient_name.slice(1);
  const fromName = contribution?.contributor_name ?? '';

  const [previewOpen, setPreviewOpen] = useState(true);
  const [editOpen, setEditOpen]       = useState(false);
  const [copied, setCopied]           = useState(false);
  const [copiedPrivate, setCopiedPrivate] = useState(false);

  const [editTo, setEditTo]           = useState(campaign.recipient_name);
  const [editCover, setEditCover]     = useState(campaign.card_message ?? '');
  const [editMessage, setEditMessage] = useState(contribution?.message ?? '');
  const [editFrom, setEditFrom]       = useState(fromName);
  const [editSignOff, setEditSignOff] = useState(campaign.card_sign_off ?? '');
  const [editImageUrl, setEditImageUrl] = useState(campaign.card_image_url);
  const [uploading, setUploading]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [saveError, setSaveError]     = useState('');
  const uploadRef = useRef<HTMLInputElement>(null);

  const patch = (body: Record<string, unknown>) => fetch(`/api/manage/${slug}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, ...body }),
  });

  const copyLink = () => {
    navigator.clipboard.writeText(`${origin}/view/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: `A card for ${recipientName}`, url: `${origin}/view/${slug}` }); return; }
      catch (err) { if (err instanceof DOMException && err.name === 'AbortError') return; }
    }
    copyLink();
  };

  // Instant switches, like the group dashboard: show the change, then save it.
  const saveCoverText = async (show: boolean) => {
    onCampaignChange({ ...campaign, card_text_on_image: show });
    await patch({ action: 'update_cover_text', card_text_on_image: show });
  };

  const saveFeature = async (ok: boolean) => {
    onCampaignChange({ ...campaign, feature_ok: ok });
    const res = await patch({ action: 'update_feature', feature_ok: ok });
    if (!res.ok) onCampaignChange({ ...campaign, feature_ok: !ok });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', await resizeImage(file));
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) setEditImageUrl(json.url);
    } finally {
      setUploading(false);
      if (uploadRef.current) uploadRef.current.value = '';
    }
  };

  const saveChanges = async () => {
    if (!editTo.trim()) { setSaveError('The card needs a name.'); return; }
    setSaving(true); setSaved(false); setSaveError('');
    try {
      const cardRes = await patch({
        action: 'update_card', recipient_name: editTo.trim(), card_message: editCover.trim() || null,
        card_note: campaign.card_note, occasion: campaign.occasion, card_image_url: editImageUrl,
        card_text_on_image: campaign.card_text_on_image ?? true,
        card_sign_off: editSignOff.trim(),
      });
      let messageOk = true;
      if (contribution) {
        const res = await fetch(`/api/contributions/${contribution.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          // A handwritten note (photo) has no typed message to keep.
          body: JSON.stringify({ token, message: contribution.photo_url ? contribution.message : (editMessage.trim() || null), contributor_name: editFrom }),
        });
        messageOk = res.ok;
        if (res.ok) onContributionChange({ ...contribution, message: contribution.photo_url ? contribution.message : (editMessage.trim() || null), contributor_name: editFrom.trim() || contribution.contributor_name });
      }
      if (cardRes.ok) onCampaignChange({ ...campaign, recipient_name: editTo.trim(), card_message: editCover.trim() || null, card_image_url: editImageUrl, card_sign_off: editSignOff.trim() || null });
      if (cardRes.ok && messageOk) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setSaveError('Some changes didn’t save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const showCoverText = campaign.card_text_on_image ?? true;

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFDF8', fontFamily: SANS }}>
      <Nav onHome={() => router.push('/')} badge={null} />

      {/* Header — card selector */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 14px 0' }}>
        <div style={{ background: 'linear-gradient(135deg,#3A8FA0,#5AAFBF)', borderRadius: 18, padding: 14, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '.7rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.92)' }}>
            Solo card
            <span style={{ background: 'rgba(74,222,128,.35)', borderRadius: 10, padding: '2px 8px', letterSpacing: '.06em' }}>Sent</span>
          </div>
          {selector}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 14px 40px' }}>

        <Accordion
          icon={<TintedIcon src="/Icons/image.png" size={24} color="#5A5566" />}
          title="Card preview"
          open={previewOpen} onToggle={() => setPreviewOpen(v => !v)}
        >
          <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(60,50,100,.14)' }}>
            <LiveCard campaign={campaign} contributions={contribution ? [contribution] : []} preview />
          </div>
        </Accordion>

        {/* Send it, then keepsakes */}
        {/* Peach, not blue: the recipient block must never be mistaken for the contributor one */}
        <div style={{ background: '#FDF0E8', border: '1px solid #F0D0B8', boxShadow: '0 1px 3px rgba(60,50,100,.05)', borderRadius: 16, padding: '16px', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1rem', color: '#2A2A2A', marginBottom: 12 }}>
            <LineIcon name="Fireworks" size={26} />
            Send it to {recipientName}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <div style={{ flex: 1, minWidth: 0, fontSize: '.78rem', color: '#7C5CBF', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: '#fff', border: '1.5px solid #D4C8EE', borderRadius: 10, padding: '10px 12px' }}>
              {origin}/view/{slug}
            </div>
            <button onClick={copyLink} style={{ background: '#7C5CBF', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#fff', fontWeight: 800, fontSize: '.82rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: SANS }}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <button
            onClick={shareLink}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#7C5CBF', border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontWeight: 800, fontSize: '.88rem', cursor: 'pointer', fontFamily: SANS, marginBottom: 10 }}
          >
            <UiIcon name="share" size={17} />Share link
          </button>
          <EmailCardForm
            slug={slug}
            token={token}
            isSolo
            recipientName={recipientName}
            fromName={fromName}
            imageUrl={campaign.card_image_url}
          />
          <div style={{ borderTop: '1px solid #F0D0B8', margin: '14px 0 12px' }} />
          <KeepsakeButtons slug={slug} openHref={`/view/${slug}`} />
        </div>

        {/* Edit card — the builder's options: name, cover message, message, from, photo/design, text on photo */}
        <Accordion
          icon={<TintedIcon src="/Icons/written.png" size={24} color="#5A5566" />}
          title="Edit card"
          subtitle="Name, cover, message and photo."
          open={editOpen} onToggle={() => setEditOpen(v => !v)}
        >
          <div style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: '.74rem', color: '#B0A8BC', fontWeight: 600, marginBottom: 14 }}>
              The card {recipientName} opens changes as soon as you save.
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={label}>To</label>
              <input value={editTo} onChange={e => setEditTo(e.target.value)} placeholder="Legend's name" autoCapitalize="words" style={field} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={label}>Cover message</label>
              <input value={editCover} onChange={e => setEditCover(e.target.value)} placeholder="e.g. Thank you" style={field} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={label}>Your message</label>
              {contribution?.photo_url ? (
                <img src={contribution.photo_url} alt="Handwritten message" style={{ width: '100%', height: 'auto', borderRadius: 8, display: 'block' }} />
              ) : (
                <textarea value={editMessage} onChange={e => setEditMessage(e.target.value)} rows={5} placeholder="Card message"
                  style={{ ...field, fontFamily: "'Lora',serif", fontStyle: 'italic', fontWeight: 400, resize: 'vertical', lineHeight: 1.6 }} />
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={label}>Sign-off</label>
                <SignOffInput value={editSignOff} onChange={setEditSignOff} align="left" style={{ ...field, fontWeight: 400 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={label}>Name</label>
                <input value={editFrom} onChange={e => setEditFrom(e.target.value)} placeholder="Your name" style={field} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={label}>Cover photo</label>
              <input ref={uploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {editImageUrl && <img src={editImageUrl} alt="" style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
                <button onClick={() => uploadRef.current?.click()} disabled={uploading}
                  style={{ background: '#3A8FA0', border: 'none', borderRadius: 8, padding: '7px 12px', color: '#fff', fontWeight: 800, fontSize: '.76rem', cursor: uploading ? 'default' : 'pointer', fontFamily: SANS }}>
                  {uploading ? 'Uploading…' : 'Upload your own'}
                </button>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: '.72rem', color: '#B0A8BC', fontWeight: 600, marginBottom: 6 }}>Or choose one of our designs:</div>
                <CardPicker browseHeader selectedUrl={editImageUrl ?? ''} onSelect={url => setEditImageUrl(url)} />
              </div>
            </div>

            <div onClick={() => saveCoverText(!showCoverText)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '.82rem', color: '#2A2A2A' }}>Show name &amp; text on photo</div>
                <div style={{ fontSize: '.72rem', color: '#B0A8BC', fontWeight: 600, marginTop: 1 }}>Turn off for an image-only cover.</div>
              </div>
              <div style={{ width: 38, height: 22, borderRadius: 14, position: 'relative', flexShrink: 0, background: showCoverText ? '#4CAF82' : '#D1C8DC', transition: 'background .2s' }}>
                <div style={{ position: 'absolute', top: 3, left: showCoverText ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .2s' }} />
              </div>
            </div>

            {showCoverText && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: '.82rem', color: '#2A2A2A' }}>Font &amp; colour</div>
                <div style={{ fontSize: '.72rem', color: '#B0A8BC', fontWeight: 600, marginTop: 1 }}>For the name and message on the photo. Saves as you pick.</div>
                <CoverTextPicker value={coverTextFrom(campaign)} onChange={onCoverStyleChange} />
              </div>
            )}

            {saveError && <div style={{ fontSize: '.78rem', color: '#E8724A', fontWeight: 700, marginBottom: 8 }}>{saveError}</div>}
            <button onClick={saveChanges} disabled={saving}
              style={{ width: '100%', background: saved ? '#4CAF82' : '#3A8FA0', border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontWeight: 800, fontSize: '.9rem', cursor: saving ? 'default' : 'pointer', fontFamily: SANS, transition: 'background .3s' }}>
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
            </button>
          </div>
        </Accordion>

        {/* Feature opt-in — changeable any time; saying no takes it off the homepage */}
        <div style={{ background: '#EAF4FB', border: '1px solid #D3E6F2', borderRadius: 16, padding: '14px 16px', marginBottom: 10 }}>
          <FeatureOptIn checked={!!campaign.feature_ok} onChange={saveFeature} />
        </div>

        <button onClick={() => router.push('/?v=solo')}
          style={{ width: '100%', background: '#fff', border: '2px solid #3A8FA0', borderRadius: 12, padding: '12px', color: '#3A8FA0', fontWeight: 800, fontSize: '.9rem', cursor: 'pointer', fontFamily: SANS, marginBottom: 10 }}>
          Make another card
        </button>

        {/* Private link — bookmark / return access */}
        <div style={{ background: '#EAF4FB', border: '1px solid #D3E6F2', borderRadius: 16, padding: '14px 16px' }}>
          <div style={{ fontWeight: 800, fontSize: '.82rem', color: '#7A7585', marginBottom: 4 }}>Your private link</div>
          <div style={{ fontSize: '.74rem', color: '#B0A8BC', fontWeight: 600, marginBottom: 8, lineHeight: 1.5 }}>
            Comes back to this page. Keep it private — anyone with this link can edit the card.
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, fontSize: '.72rem', color: '#7A7585', fontWeight: 700, wordBreak: 'break-all', background: '#fff', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '8px 10px' }}>
              {origin}/manage/{slug}?token={token}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`${origin}/manage/${slug}?token=${token}`); setCopiedPrivate(true); setTimeout(() => setCopiedPrivate(false), 2000); }}
              style={{ background: '#7A7585', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: SANS }}>
              {copiedPrivate ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
