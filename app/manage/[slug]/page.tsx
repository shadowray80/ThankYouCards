'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { CasualView } from '@/components/cards/CasualView';
import { CorporateView } from '@/components/cards/CorporateView';
import { THEMES } from '@/lib/themes';
import { CORPORATE_PALETTES } from '@/lib/palettes';
import { resizeImage } from '@/lib/resizeImage';
import { EmailCardForm } from '@/components/forms/EmailCardForm';
import { BrandKitPanel } from '@/components/ui/BrandKitPanel';
import { LineIcon } from '@/components/ui/LineIcon';
import { TintedIcon } from '@/components/ui/TintedIcon';
import { Accordion, UiIcon, timeAgo } from '@/components/dashboard/DashboardParts';
import { KeepsakeButtons } from '@/components/ui/KeepsakeButtons';
import { Nav } from '@/components/ui/Nav';
import { useMyCards, manageUrl, type MyCard } from '@/lib/useMyCards';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

interface Campaign {
  id: string;
  slug: string;
  recipient_name: string;
  occasion: string | null;
  card_theme: string | null;
  card_message: string | null;
  card_note: string | null;
  card_image_url: string | null;
  funded_amount: number;
  target_amount: number;
  deadline: string | null;
  status: string;
  organiser_email: string;
  card_style: string | null;
  card_palette: string | null;
  card_logo_url: string | null;
  card_logo_scale: number | null;
  card_logo_position: 'left' | 'center' | 'right' | null;
  card_accent: string | null;
  card_text_on_image: boolean | null;
  card_occasion: string | null;
  created_at?: string;
}

interface Contribution {
  id: string;
  contributor_name: string;
  message: string | null;
  photo_url?: string | null;
  photo_label?: string | null;
  amount: number;
  created_at: string;
}

// The card selector at the top of the dashboard: "Lance's card / Appreciation · 12 October 2026".
// Logged-in organisers with other cards get a dropdown (Current, then Previous); the native select
// sits invisibly over the box, so the phone's own picker opens.
function CardSelector({ cards, currentSlug, title, subtitle }: {
  cards: MyCard[] | null;
  currentSlug: string;
  title: string;
  subtitle: string;
}) {
  const label = (c: MyCard) =>
    `${c.recipient_name}${c.card_occasion ? ` · ${c.card_occasion}` : ''} · ${new Date(c.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`;
  const choices = cards ?? [];
  const canSwitch = choices.some(c => c.slug !== currentSlug);
  const current = choices.filter(c => c.status !== 'sent');
  const previous = choices.filter(c => c.status === 'sent');
  const isListed = choices.some(c => c.slug === currentSlug);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 12, padding: '10px 14px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: '1.02rem', color: '#2A2A2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '.78rem', color: '#7A7585', fontWeight: 600, marginTop: 1 }}>{subtitle}</div>}
      </div>
      {canSwitch && (
        <>
          <UiIcon name="chevron-down" size={20} style={{ color: '#5A5566' }} />
          <select
            value={isListed ? currentSlug : ''}
            onChange={e => {
              const card = choices.find(c => c.slug === e.target.value);
              if (card) window.location.assign(manageUrl(card));
            }}
            aria-label="Switch to another of your cards"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
          >
            {!isListed && <option value="">Your cards…</option>}
            {current.length > 0 && (
              <optgroup label="Current">
                {current.map(c => <option key={c.slug} value={c.slug}>{label(c)}</option>)}
              </optgroup>
            )}
            {previous.length > 0 && (
              <optgroup label="Previous">
                {previous.map(c => <option key={c.slug} value={c.slug}>{label(c)}</option>)}
              </optgroup>
            )}
          </select>
        </>
      )}
    </div>
  );
}

function ManageContent() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const slug         = typeof params.slug === 'string' ? params.slug : '';
  const token        = searchParams.get('token') ?? '';
  const paidParam    = searchParams.get('paid') === '1';
  const sessionId    = searchParams.get('session_id') ?? '';

  const [campaign, setCampaign]           = useState<Campaign | null>(null);
  const myCards                           = useMyCards();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [copied, setCopied]               = useState(false);
  const [copiedRecipient, setCopiedRecipient] = useState(false);
  const [copiedManage, setCopiedManage]   = useState(false);
  const [copiedUpdate, setCopiedUpdate]   = useState(false);
  const [updateMsgEdit, setUpdateMsgEdit] = useState<string | null>(null);
  const [paying, setPaying]               = useState(false);
  const [refreshing, setRefreshing]       = useState(false);
  const [savingPalette, setSavingPalette] = useState(false);
  const [savingLogo, setSavingLogo]       = useState(false);
  const [editMsg, setEditMsg]             = useState('');
  const [editNote, setEditNote]           = useState('');
  const [editOccasion, setEditOccasion]   = useState('');
  const [editImageUrl, setEditImageUrl]   = useState<string | null>(null);
  const [editShowCoverText, setEditShowCoverText] = useState(true);
  const [editingContribId, setEditingContribId] = useState<string | null>(null);
  const [editingContribText, setEditingContribText] = useState('');
  const [contribBusyId, setContribBusyId] = useState<string | null>(null);
  const [savingCard, setSavingCard]       = useState(false);
  const [cardSaved, setCardSaved]         = useState(false);
  const [editImageUploading, setEditImageUploading] = useState(false);
  const [previewOpen, setPreviewOpen]     = useState(true);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [shareOpen, setShareOpen]         = useState(true);
  const [contribOpen, setContribOpen]     = useState(false);
  const [reminderOpen, setReminderOpen]   = useState(false);
  const [editOpen, setEditOpen]           = useState(false);
  const [menuOpenId, setMenuOpenId]       = useState<string | null>(null);
  const logoUploadRef      = useRef<HTMLInputElement>(null);
  const editImageUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (slug && token) {
      const sessions = JSON.parse(localStorage.getItem('tyc_manage') ?? '{}');
      sessions[slug] = token;
      localStorage.setItem('tyc_manage', JSON.stringify(sessions));
    }
  }, [slug, token]);

  const loadData = (isRefresh = false) => {
    if (!slug || !token) { setError('Invalid link'); setLoading(false); return; }
    if (isRefresh) setRefreshing(true); else setLoading(true);
    fetch(`/api/manage/${slug}?token=${token}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) { setError(json.error); return; }
        setCampaign(json.campaign);
        setContributions(json.contributions ?? []);
      })
      .catch(() => setError('Could not load campaign'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => {
    if (campaign) {
      setEditMsg(campaign.card_message ?? '');
      setEditNote(campaign.card_note ?? '');
      setEditOccasion(campaign.occasion ?? '');
      setEditImageUrl(campaign.card_image_url);
      setEditShowCoverText(campaign.card_text_on_image ?? true);
    }
  }, [campaign?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData();
    if (paidParam && token) {
      fetch(`/api/manage/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'mark_sent', session_id: sessionId }),
      })
      .then(() => loadData()) // reload so DB status is 'sent' before user clicks recipient link
      .catch(err => console.error('mark_sent failed:', err));
    }
  }, [slug, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://thankyoucards.au';

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${origin}/card/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = async (text: string, fallback: () => void, url?: string) => {
    if (navigator.share) {
      try { await navigator.share(url ? { text, url } : { text }); return; }
      catch (err) { if (err instanceof DOMException && err.name === 'AbortError') return; }
    }
    fallback();
  };

  const copyRecipientLink = () => {
    navigator.clipboard.writeText(`${origin}/view/${slug}`);
    setCopiedRecipient(true);
    setTimeout(() => setCopiedRecipient(false), 2000);
  };

  const copyManageLink = () => {
    navigator.clipboard.writeText(`${origin}/manage/${slug}?token=${token}`);
    setCopiedManage(true);
    setTimeout(() => setCopiedManage(false), 2000);
  };

  const savePalette = async (paletteId: string) => {
    setSavingPalette(true);
    try {
      await fetch(`/api/manage/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'update_palette', card_palette: paletteId, card_accent: campaign?.card_accent ?? null }),
      });
      setCampaign(prev => prev ? { ...prev, card_palette: paletteId } : prev);
    } finally {
      setSavingPalette(false);
    }
  };

  // Same live-preview-then-save-on-release pattern as the logo scale slider.
  const saveAccent = async (accent: string | null) => {
    await fetch(`/api/manage/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'update_palette', card_palette: campaign?.card_palette ?? 'navy', card_accent: accent }),
    });
  };

  const saveCardDetails = async () => {
    setSavingCard(true); setCardSaved(false);
    try {
      const res = await fetch(`/api/manage/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'update_card', card_message: editMsg || null, card_note: editNote || null, occasion: editOccasion || null, card_image_url: editImageUrl, card_text_on_image: editShowCoverText }),
      });
      if (res.ok) {
        setCampaign(prev => prev ? { ...prev, card_message: editMsg || null, card_note: editNote || null, occasion: editOccasion || null, card_image_url: editImageUrl, card_text_on_image: editShowCoverText } : prev);
        setCardSaved(true);
        setTimeout(() => setCardSaved(false), 3000);
      }
    } finally {
      setSavingCard(false);
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', await resizeImage(file));
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) setEditImageUrl(json.url);
    } finally {
      setEditImageUploading(false);
      if (editImageUploadRef.current) editImageUploadRef.current.value = '';
    }
  };

  const saveLogo = async (url: string | null) => {
    setSavingLogo(true);
    try {
      await fetch(`/api/manage/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'update_logo', card_logo_url: url, card_logo_scale: campaign?.card_logo_scale ?? 1, card_logo_position: campaign?.card_logo_position ?? 'left' }),
      });
      setCampaign(prev => prev ? { ...prev, card_logo_url: url } : prev);
    } finally {
      setSavingLogo(false);
    }
  };

  // Range inputs fire onChange continuously while dragging — update the preview live on
  // every tick, but only save to the server once, on release, so dragging the slider
  // doesn't spam the API with a request per pixel of movement.
  const saveLogoScale = async (scale: number) => {
    await fetch(`/api/manage/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'update_logo', card_logo_url: campaign?.card_logo_url ?? null, card_logo_scale: scale, card_logo_position: campaign?.card_logo_position ?? 'left' }),
    });
  };

  const saveLogoPosition = async (position: 'left' | 'center' | 'right') => {
    setCampaign(prev => prev ? { ...prev, card_logo_position: position } : prev);
    await fetch(`/api/manage/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'update_logo', card_logo_url: campaign?.card_logo_url ?? null, card_logo_scale: campaign?.card_logo_scale ?? 1, card_logo_position: position }),
    });
  };

  // Picking a saved brand template applies its colours + logo to this card and saves them.
  const applyTemplate = async (palette: string, logoUrl: string | null, logoScale: number, logoPosition: 'left' | 'center' | 'right', accent: string | null) => {
    setCampaign(prev => prev ? { ...prev, card_palette: palette, card_accent: accent, card_logo_url: logoUrl, card_logo_scale: logoScale, card_logo_position: logoPosition } : prev);
    await Promise.all([
      fetch(`/api/manage/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'update_palette', card_palette: palette, card_accent: accent }),
      }),
      fetch(`/api/manage/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'update_logo', card_logo_url: logoUrl, card_logo_scale: logoScale, card_logo_position: logoPosition }),
      }),
    ]);
  };

  const startEditContrib = (c: Contribution) => {
    setEditingContribId(c.id);
    setEditingContribText(c.message ?? '');
  };

  const saveEditContrib = async () => {
    if (!editingContribId) return;
    const id = editingContribId;
    setContribBusyId(id);
    try {
      const res = await fetch(`/api/contributions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, message: editingContribText.trim() || null }),
      });
      if (res.ok) {
        setContributions(prev => prev.map(c => c.id === id ? { ...c, message: editingContribText.trim() || null } : c));
        setEditingContribId(null);
      }
    } finally {
      setContribBusyId(null);
    }
  };

  const deleteContrib = async (id: string) => {
    if (!window.confirm('Remove this message from the card? This can\'t be undone.')) return;
    setContribBusyId(id);
    try {
      const res = await fetch(`/api/contributions/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (res.ok) setContributions(prev => prev.filter(c => c.id !== id));
    } finally {
      setContribBusyId(null);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSavingLogo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) await saveLogo(json.url);
    } finally {
      setSavingLogo(false);
      if (logoUploadRef.current) logoUploadRef.current.value = '';
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch('/api/checkout/send-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, token }),
      });
      const json = await res.json();
      if (json.error) { alert(json.error); setPaying(false); return; }
      window.location.href = json.url;
    } catch {
      alert('Something went wrong — please try again.');
      setPaying(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: '#7A7585' }}>
      Loading…
    </div>
  );

  if (error || !campaign) return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", gap: 16, padding: 24 }}>
      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#E8724A' }}>This link isn't valid</div>
      <div style={{ fontSize: '.85rem', color: '#7A7585', fontWeight: 600 }}>Check you copied the full organiser link.</div>
      <button onClick={() => router.push('/')} style={{ background: '#3A8FA0', border: 'none', borderRadius: 10, padding: '11px 22px', color: '#fff', fontWeight: 800, fontSize: '.9rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>← Home</button>
    </div>
  );

  const isSent        = campaign.status === 'sent' || paidParam;
  const theme         = THEMES.find(t => t.id === campaign.card_theme) ?? THEMES[0];
  const recipientName = campaign.recipient_name.charAt(0).toUpperCase() + campaign.recipient_name.slice(1);
  const daysLeft = campaign.deadline
    ? Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86400000)
    : null;
  const totalContributors = contributions.length;
  const previewContributions = contributions.map(c => ({ contributor_name: c.contributor_name, message: c.message, photo_url: c.photo_url, photo_label: c.photo_label }));
  const shownContributions = showAllMessages ? previewContributions : previewContributions.slice(0, 4);
  const hiddenCount = previewContributions.length - shownContributions.length;

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFDF8', fontFamily: "'Nunito',sans-serif" }}>

      <Nav onHome={() => router.push('/')} badge={null} />

      {/* Header — card selector + the two counters */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 14px 0' }}>
        <div style={{ background: 'linear-gradient(135deg,#3A8FA0,#5AAFBF)', borderRadius: 18, padding: 14, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.7rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.92)' }}>
              Group card dashboard
              {isSent && <span style={{ background: 'rgba(74,222,128,.35)', borderRadius: 10, padding: '2px 8px', letterSpacing: '.06em' }}>Sent</span>}
            </div>
            <button onClick={() => loadData(true)} disabled={refreshing}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: 0, color: '#fff', fontWeight: 800, fontSize: '.78rem', cursor: refreshing ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}>
              <UiIcon name="refresh" size={15} />{refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          <CardSelector
            cards={myCards} currentSlug={slug}
            title={`${recipientName}'s card`}
            subtitle={[campaign.card_occasion, campaign.created_at ? new Date(campaign.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : null].filter(Boolean).join(' · ')}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
            {[
              { icon: '/Icons/people.png', value: String(totalContributors), label: 'Signed' },
              {
                icon: '/Icons/Calendar.png',
                value: daysLeft === null ? '—' : daysLeft > 0 ? String(daysLeft) : '0',
                label: daysLeft === null ? 'No deadline' : daysLeft > 0 ? (daysLeft === 1 ? 'Day left' : 'Days left') : 'Deadline passed',
              },
            ].map(t => (
              <div key={t.icon} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.16)', borderRadius: 12, padding: '10px 14px' }}>
                <TintedIcon src={t.icon} size={28} color="#fff" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1 }}>{t.value}</div>
                  <div style={{ fontSize: '.74rem', fontWeight: 700, color: 'rgba(255,255,255,.9)' }}>{t.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 14px 40px' }}>

        {/* Send section — top when sent, bottom when not */}
        {isSent && (
          <div style={{ background: '#fff', border: '1px solid #ECE8F1', boxShadow: '0 1px 3px rgba(60,50,100,.05)', borderRadius: 16, padding: '18px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1rem', color: '#2A2A2A', marginBottom: 4 }}><LineIcon name="Fireworks" size={26} />Ready to send!</div>
            <div style={{ fontSize: '.82rem', color: '#7A7585', fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>
              Share this link directly with {recipientName} — they&apos;ll see the full card with all the messages.
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, fontSize: '.78rem', color: '#7C5CBF', fontWeight: 700, wordBreak: 'break-all', background: '#fff', border: '1.5px solid #D4C8EE', borderRadius: 8, padding: '8px 10px' }}>
                {origin}/view/{slug}
              </div>
              <button onClick={copyRecipientLink} style={{ background: '#7C5CBF', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#fff', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito',sans-serif" }}>
                {copiedRecipient ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <a href={`/view/${slug}`} target="_blank"
              style={{ display: 'block', textAlign: 'center', color: '#7C5CBF', fontWeight: 700, fontSize: '.82rem', textDecoration: 'none' }}>
              Preview what {recipientName} will see →
            </a>
            <div style={{ marginTop: 14 }}>
              <EmailCardForm
                slug={slug}
                token={token}
                isSolo={false}
                recipientName={recipientName}
                fromName={(campaign.occasion ?? '').replace(/^From\s+/i, '')}
                cardOccasion={campaign.card_occasion}
                messageCount={totalContributors}
                imageUrl={campaign.card_image_url}
                defaultSenderEmail={campaign.organiser_email}
              />
            </div>
          </div>
        )}

        {/* Card preview — the whole cover and a couple of messages; the footer expands to all of them */}
        <Accordion
          icon={<TintedIcon src="/Icons/image.png" size={24} color="#5A5566" />}
          title="Card preview"
          open={previewOpen} onToggle={() => setPreviewOpen(v => !v)}
        >
          <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(60,50,100,.14)' }}>
            {campaign.card_style === 'casual' ? (
              <CasualView campaign={campaign} contributions={shownContributions} allContributions={previewContributions} preview />
            ) : campaign.card_style === 'corporate' ? (
              <CorporateView
                campaign={campaign}
                contributions={shownContributions}
                allContributions={previewContributions}
                preview
                logoScale={campaign.card_logo_scale ?? 1}
                logoPosition={campaign.card_logo_position ?? 'left'}
              />
            ) : (
              <CardScrollView
                theme={theme}
                imgIdx={0}
                customImgUrl={campaign.card_image_url ?? undefined}
                recipientName={recipientName}
                fromText={campaign.occasion ?? undefined}
                message={campaign.card_message ?? ''}
                messages={shownContributions.map(c => ({ name: c.contributor_name, msg: c.message ?? '' }))}
                landscapeCover
                showCoverText={campaign.card_text_on_image ?? true}
                alwaysShowCoverMessage
              />
            )}
            {/* Footer doubles as the "show all messages" toggle */}
            <button
              onClick={() => setShowAllMessages(v => !v)}
              disabled={hiddenCount === 0 && !showAllMessages}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#2E7E90,#3A8FA0)',
                border: 'none', padding: '12px 16px', color: '#fff', cursor: hiddenCount === 0 && !showAllMessages ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif",
              }}
            >
              <span style={{ flex: 1, textAlign: 'center' }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: '1rem' }}>thank<span style={{ color: '#F09070' }}>you</span>cards.au</span>
                <span style={{ display: 'block', fontSize: '.7rem', color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>
                  {hiddenCount > 0 && !showAllMessages ? `+${hiddenCount} more message${hiddenCount === 1 ? '' : 's'} · tap to show all` : 'A card thoughtfully chosen just for you.'}
                </span>
              </span>
              {(hiddenCount > 0 || showAllMessages) && (
                <UiIcon name="chevrons-down" size={20} style={{ transform: showAllMessages ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} />
              )}
            </button>
          </div>
          <KeepsakeButtons
            slug={slug} preview={!isSent} locked={!isSent}
            openHref={`/view/${slug}?preview=1`} style={{ marginTop: 10 }}
          />
        </Accordion>

        {/* Share with contributors — stays available after sending, for latecomers */}
        <Accordion
          icon={<TintedIcon src="/Icons/people.png" size={26} color="#3A8FA0" />}
          title="Share with contributors"
          subtitle={`Share this link with the group so they can add their messages, photos and jokes to ${recipientName}'s card.`}
          open={shareOpen} onToggle={() => setShareOpen(v => !v)}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <div style={{ flex: 1, minWidth: 0, fontSize: '.78rem', color: '#3A8FA0', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: '#fff', border: '1.5px solid #C8E8F0', borderRadius: 10, padding: '10px 12px' }}>
              {origin}/card/{slug}
            </div>
            <button onClick={copyShareLink} style={{ background: '#3A8FA0', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#fff', fontWeight: 800, fontSize: '.82rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito',sans-serif" }}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => shareText(`Add your message to ${recipientName}'s card`, copyShareLink, `${origin}/card/${slug}`)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#2E7E90', border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontWeight: 800, fontSize: '.88rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}
          >
            <UiIcon name="share" size={17} />Share link
          </button>
        </Accordion>

        {/* Contributors — who's signed, with edit / remove, and adding one on someone's behalf */}
        <Accordion
          icon={<TintedIcon src="/Icons/people.png" size={26} color="#5A5566" />}
          title={`Contributors (${totalContributors})`}
          subtitle="Manage, edit or remove contributor messages."
          open={contribOpen} onToggle={() => setContribOpen(v => !v)}
        >
          {contributions.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, padding: '16px', textAlign: 'center', color: '#B0A8BC', fontWeight: 700, fontSize: '.85rem', marginBottom: 8 }}>
              No one has signed yet. Share the link to get started.
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'visible', marginBottom: 8 }}>
              {contributions.map((c, i) => {
                const isEditing = editingContribId === c.id;
                const isBusy = contribBusyId === c.id;
                return (
                  <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: isEditing ? 'flex-start' : 'center', padding: '10px 12px', borderTop: i === 0 ? 'none' : '1px solid #F0ECF5', position: 'relative' }}>
                    {c.photo_url ? (
                      <img src={c.photo_url} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#3A8FA0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.85rem', color: '#fff', flexShrink: 0 }}>
                        {c.contributor_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '.85rem', color: '#2A2A2A' }}>{c.contributor_name}</div>
                      {isEditing ? (
                        <div style={{ marginTop: 6 }}>
                          <textarea
                            value={editingContribText}
                            onChange={e => setEditingContribText(e.target.value)}
                            rows={3}
                            autoFocus
                            style={{ width: '100%', border: '2px solid #3A8FA0', borderRadius: 8, padding: '8px 10px', fontFamily: "'Nunito',sans-serif", fontSize: '.82rem', color: '#2A2A2A', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                          />
                          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                            <button onClick={saveEditContrib} disabled={isBusy}
                              style={{ background: '#3A8FA0', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', fontWeight: 800, fontSize: '.74rem', cursor: isBusy ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                              {isBusy ? 'Saving…' : 'Save'}
                            </button>
                            <button onClick={() => setEditingContribId(null)} disabled={isBusy}
                              style={{ background: 'none', border: '2px solid #E8E2F0', borderRadius: 8, padding: '6px 12px', color: '#7A7585', fontWeight: 800, fontSize: '.74rem', cursor: isBusy ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '.76rem', color: '#7A7585', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.message ?? (c.photo_url ? 'Photo' : '')}
                        </div>
                      )}
                    </div>
                    {!isEditing && (
                      <>
                        <div style={{ fontSize: '.7rem', color: '#B0A8BC', fontWeight: 700, flexShrink: 0 }}>{timeAgo(c.created_at)}</div>
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)} disabled={isBusy}
                          aria-label={`Options for ${c.contributor_name}'s message`}
                          style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#7A7585', flexShrink: 0 }}
                        >
                          {isBusy ? '…' : <UiIcon name="more" size={18} />}
                        </button>
                        {menuOpenId === c.id && (
                          <>
                            <div onClick={() => setMenuOpenId(null)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                            <div style={{ position: 'absolute', right: 10, top: '100%', marginTop: -6, zIndex: 41, background: '#fff', border: '1.5px solid #E8E2F0', borderRadius: 10, boxShadow: '0 8px 24px rgba(60,50,100,.15)', overflow: 'hidden', minWidth: 130 }}>
                              <button onClick={() => { setMenuOpenId(null); startEditContrib(c); }}
                                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '10px 14px', fontWeight: 700, fontSize: '.82rem', color: '#2A2A2A', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                                Edit message
                              </button>
                              <button onClick={() => { setMenuOpenId(null); deleteContrib(c.id); }}
                                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderTop: '1px solid #F0ECF5', padding: '10px 14px', fontWeight: 700, fontSize: '.82rem', color: '#E8724A', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                                Remove
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <a href={`/card/${slug}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', border: '1.5px solid #E8E2F0', borderRadius: 10, padding: '9px', color: '#3A8FA0', fontWeight: 800, fontSize: '.8rem', textDecoration: 'none' }}>
            <UiIcon name="plus" size={15} />Add a message manually
          </a>
        </Accordion>

        {/* Send a reminder — stays available after sending, for latecomers. Framed as coming from TYC, not the
            organiser, so re-sharing it doesn't feel like the organiser nagging their own
            friends/colleagues. Editable, and never persisted — it's regenerated fresh (with
            the current day-count and contributor count) every time the dashboard loads, and
            any edit only lasts for this visit. */}
        {(() => {
          const joinedLine = totalContributors > 0
            ? `A huge thank you to everyone who's already joined the card ❤️\n\nIf you'd like to be part of it too, we'd love to include your message.`
            : `We'd love to include your message — it only takes a minute.`;
          const dayLine = isSent
            ? `${recipientName}'s card has already gone out, but there's still time to add your message — it'll appear on the card straight away.`
            : daysLeft !== null
            ? (daysLeft > 0
                ? `${recipientName}'s card is only ${daysLeft} day${daysLeft !== 1 ? 's' : ''} away, and it's already looking fantastic.`
                : `${recipientName}'s card is ready to send any day now, and it's already looking fantastic.`)
            : `${recipientName}'s card is coming together, and it's already looking fantastic.`;
          const defaultUpdateMsg = `🎉 We're creating something special for ${recipientName}!

${dayLine}

${joinedLine}

👉 Join the card:
${origin}/card/${slug}

— sent via thankyoucards.au 💌`;
          const updateMsg = updateMsgEdit ?? defaultUpdateMsg;
          return (
            <Accordion
              icon={<UiIcon name="bell" size={22} />}
              title="Send a reminder"
              subtitle="A friendly nudge from TYC, not from you."
              open={reminderOpen} onToggle={() => setReminderOpen(v => !v)}
            >
              <div style={{ fontSize: '.76rem', color: '#9A7A6A', fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>
                Edit it if you like, then share it back into the group.
              </div>
              <textarea
                value={updateMsg}
                onChange={e => setUpdateMsgEdit(e.target.value)}
                rows={9}
                style={{
                  width: '100%', border: '1.5px solid #F0D0B8', borderRadius: 8, padding: '10px 12px',
                  fontSize: '.78rem', color: '#2A2A2A', fontFamily: "'Nunito',sans-serif", lineHeight: 1.55,
                  resize: 'vertical', background: '#fff', boxSizing: 'border-box', marginBottom: 8,
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { navigator.clipboard.writeText(updateMsg); setCopiedUpdate(true); setTimeout(() => setCopiedUpdate(false), 2000); }}
                  style={{ flex: 1, background: '#fff', border: '2px solid #E8724A', borderRadius: 10, padding: '9px 0', color: '#E8724A', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}
                >
                  {copiedUpdate ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => shareText(updateMsg, () => { navigator.clipboard.writeText(updateMsg); setCopiedUpdate(true); setTimeout(() => setCopiedUpdate(false), 2000); })}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#E8724A', border: 'none', borderRadius: 10, padding: '10px 0', color: '#fff', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}
                >
                  <UiIcon name="share" size={16} />Share
                </button>
                {updateMsgEdit !== null && (
                  <button onClick={() => setUpdateMsgEdit(null)}
                    style={{ background: 'none', border: '1.5px solid #F0D0B8', borderRadius: 10, padding: '10px 12px', color: '#9A7A6A', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                    Reset
                  </button>
                )}
              </div>
            </Accordion>
          );
        })()}

        {/* Edit card — cover, messages, photo, colours, logo and brand template, collapsed */}
        <Accordion
          icon={<TintedIcon src="/Icons/written.png" size={24} color="#5A5566" />}
          title="Edit card"
          subtitle="Cover, message, photo, logo and settings."
          open={editOpen} onToggle={() => setEditOpen(v => !v)}
        >
        {/* Edit card details */}
        <div style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: '.74rem', color: '#B0A8BC', fontWeight: 600, marginBottom: 14 }}>Changes show in the card preview as soon as you save.</div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '.68rem', fontWeight: 800, color: '#7A7585', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Cover message</label>
            <input value={editMsg} onChange={e => setEditMsg(e.target.value)} placeholder="e.g. Thank you for everything"
              style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 10, padding: '10px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '15px', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#E8724A')} onBlur={e => (e.target.style.borderColor = '#E8E2F0')} />
          </div>

          {campaign.card_style === 'casual' && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '.68rem', fontWeight: 800, color: '#7A7585', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Card message</label>
              <textarea value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="A longer personal note (optional)" rows={3}
                style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 10, padding: '10px 12px', fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: '15px', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                onFocus={e => (e.target.style.borderColor = '#E8724A')} onBlur={e => (e.target.style.borderColor = '#E8E2F0')} />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '.68rem', fontWeight: 800, color: '#7A7585', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>From</label>
            <input value={editOccasion} onChange={e => setEditOccasion(e.target.value)} placeholder="e.g. the team"
              style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 10, padding: '10px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '15px', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#E8724A')} onBlur={e => (e.target.style.borderColor = '#E8E2F0')} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '.68rem', fontWeight: 800, color: '#7A7585', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>
              {campaign.card_style === 'corporate' ? 'Photo (optional)' : 'Cover photo'}
            </label>
            <input ref={editImageUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleEditImageUpload} />
            {editImageUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={editImageUrl} alt="" style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => editImageUploadRef.current?.click()} disabled={editImageUploading}
                    style={{ background: '#3A8FA0', border: 'none', borderRadius: 8, padding: '7px 12px', color: '#fff', fontWeight: 800, fontSize: '.76rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                    {editImageUploading ? '…' : 'Change'}
                  </button>
                  <button onClick={() => setEditImageUrl(null)}
                    style={{ background: 'none', border: '2px solid #E8E2F0', borderRadius: 8, padding: '5px 12px', color: '#B0A8BC', fontWeight: 800, fontSize: '.76rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => editImageUploadRef.current?.click()} disabled={editImageUploading}
                style={{ width: '100%', border: '2px dashed #E8E2F0', borderRadius: 10, padding: '12px', background: '#FAFAFA', cursor: editImageUploading ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif", color: '#7A7585', fontWeight: 700, fontSize: '.82rem' }}>
                {editImageUploading ? 'Uploading…' : '+ Upload cover photo'}
              </button>
            )}
          </div>

          {campaign.card_style !== 'corporate' && (
            <div
              onClick={() => setEditShowCoverText(v => !v)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, cursor: 'pointer' }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '.82rem', color: '#2A2A2A' }}>Show name &amp; text on photo</div>
                <div style={{ fontSize: '.72rem', color: '#B0A8BC', fontWeight: 600, marginTop: 1 }}>Turn off if the photo is busy — name &amp; text move below it instead</div>
              </div>
              <div style={{ width: 38, height: 22, borderRadius: 14, position: 'relative', flexShrink: 0, background: editShowCoverText ? '#4CAF82' : '#D1C8DC', transition: 'background .2s' }}>
                <div style={{ position: 'absolute', top: 3, left: editShowCoverText ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .2s' }} />
              </div>
            </div>
          )}

          <button onClick={saveCardDetails} disabled={savingCard}
            style={{ width: '100%', background: cardSaved ? '#4CAF82' : '#3A8FA0', border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontWeight: 800, fontSize: '.9rem', cursor: savingCard ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif", transition: 'background .3s' }}>
            {savingCard ? 'Saving…' : cardSaved ? '✓ Saved' : 'Save changes'}
          </button>
        </div>

        {/* Corporate colour picker */}
        {campaign.card_style === 'corporate' && (
          <div style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: '.82rem', color: '#2A2A2A', marginBottom: 4 }}>Header colour</div>
            <div style={{ fontSize: '.74rem', color: '#B0A8BC', fontWeight: 600, marginBottom: 10 }}>Change the colour of your card header anytime before sending.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {CORPORATE_PALETTES.map(p => (
                <div key={p.id} onClick={() => !savingPalette && savePalette(p.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: savingPalette ? 'default' : 'pointer' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${p.headerFrom}, ${p.headerTo})`,
                    border: (campaign.card_palette ?? 'navy') === p.id ? '3px solid #E8724A' : '3px solid transparent',
                    boxShadow: (campaign.card_palette ?? 'navy') === p.id ? '0 0 0 2px rgba(232,114,74,.3)' : '0 2px 6px rgba(0,0,0,.12)',
                    transition: 'all .2s', opacity: savingPalette ? 0.6 : 1,
                  }} />
                  <div style={{ fontSize: '.58rem', fontWeight: 800, color: (campaign.card_palette ?? 'navy') === p.id ? '#E8724A' : '#7A7585' }}>{p.name}</div>
                </div>
              ))}
              {/* Custom colour */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', position: 'relative', overflow: 'hidden', background: (campaign.card_palette?.startsWith('#')) ? campaign.card_palette : 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)', border: (campaign.card_palette?.startsWith('#')) ? '3px solid #E8724A' : '3px solid transparent', boxShadow: (campaign.card_palette?.startsWith('#')) ? '0 0 0 2px rgba(232,114,74,.3)' : '0 2px 6px rgba(0,0,0,.12)', opacity: savingPalette ? 0.6 : 1 }}>
                  <input type="color"
                    value={campaign.card_palette?.startsWith('#') ? campaign.card_palette : '#1A2744'}
                    onChange={e => !savingPalette && savePalette(e.target.value)}
                    style={{ position: 'absolute', inset: '-4px', opacity: 0, cursor: savingPalette ? 'default' : 'pointer', width: 'calc(100% + 8px)', height: 'calc(100% + 8px)' }}
                  />
                </div>
                <div style={{ fontSize: '.58rem', fontWeight: 800, color: (campaign.card_palette?.startsWith('#')) ? '#E8724A' : '#7A7585' }}>Custom</div>
              </div>
            </div>
          </div>
        )}

        {/* Corporate text colour */}
        {campaign.card_style === 'corporate' && (() => {
          const corpPalette = CORPORATE_PALETTES.find(p => p.id === (campaign.card_palette ?? 'navy')) ?? CORPORATE_PALETTES[0];
          return (
            <div style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: '.82rem', color: '#2A2A2A', marginBottom: 4 }}>Text colour</div>
              <div style={{ fontSize: '.74rem', color: '#B0A8BC', fontWeight: 600, marginBottom: 10 }}>Used for the tagline and highlights throughout the card.</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', position: 'relative', overflow: 'hidden', background: campaign.card_accent ?? corpPalette.accent, border: '3px solid #fff', boxShadow: '0 0 0 2px #E8E2F0', flexShrink: 0 }}>
                  <input type="color"
                    value={campaign.card_accent ?? corpPalette.accent}
                    onChange={e => { setCampaign(prev => prev ? { ...prev, card_accent: e.target.value } : prev); saveAccent(e.target.value); }}
                    style={{ position: 'absolute', inset: '-4px', opacity: 0, cursor: 'pointer', width: 'calc(100% + 8px)', height: 'calc(100% + 8px)' }}
                  />
                </div>
                {campaign.card_accent && (
                  <button onClick={() => { setCampaign(prev => prev ? { ...prev, card_accent: null } : prev); saveAccent(null); }}
                    style={{ background: 'none', border: '2px solid #E8E2F0', borderRadius: 8, padding: '6px 12px', color: '#B0A8BC', fontWeight: 800, fontSize: '.76rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                    Reset to palette default
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Logo upload — Corporate (company logo in the header) and Classic (team logo,
            bottom right of the cover photo; no position choice) */}
        {(campaign.card_style === 'corporate' || campaign.card_style === 'casual') && (
          <div style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: '.82rem', color: '#2A2A2A', marginBottom: 4 }}>{campaign.card_style === 'corporate' ? 'Company logo' : 'Team logo'}</div>
            <div style={{ fontSize: '.74rem', color: '#B0A8BC', fontWeight: 600, marginBottom: 10 }}>
              {campaign.card_style === 'corporate'
                ? 'Upload a PNG logo to display in the card header. Transparent PNG works best.'
                : 'Optional. Shows at the bottom right of the cover photo. Transparent PNG works best.'}
            </div>
            <input ref={logoUploadRef} type="file" accept="image/png,image/svg+xml,image/webp" style={{ display: 'none' }} onChange={handleLogoUpload} />
            {campaign.card_logo_url ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#1A2744', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <img src={campaign.card_logo_url} alt="Logo" style={{ maxHeight: 36 * (campaign.card_logo_scale ?? 1), maxWidth: 120 * (campaign.card_logo_scale ?? 1), objectFit: 'contain' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button onClick={() => logoUploadRef.current?.click()} disabled={savingLogo}
                      style={{ background: '#3A8FA0', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', fontWeight: 800, fontSize: '.76rem', cursor: savingLogo ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif", opacity: savingLogo ? 0.6 : 1 }}>
                      {savingLogo ? '…' : 'Replace'}
                    </button>
                    <button onClick={() => saveLogo(null)} disabled={savingLogo}
                      style={{ background: 'none', border: '2px solid #E8E2F0', borderRadius: 8, padding: '6px 12px', color: '#B0A8BC', fontWeight: 800, fontSize: '.76rem', cursor: savingLogo ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                      Remove
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                  <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#7A7585', whiteSpace: 'nowrap' }}>Logo size</span>
                  <input
                    type="range" min={0.5} max={3} step={0.1}
                    value={campaign.card_logo_scale ?? 1}
                    onChange={e => {
                      const scale = Number(e.target.value);
                      setCampaign(prev => prev ? { ...prev, card_logo_scale: scale } : prev);
                    }}
                    onMouseUp={e => saveLogoScale(Number((e.target as HTMLInputElement).value))}
                    onTouchEnd={e => saveLogoScale(Number((e.target as HTMLInputElement).value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: '.72rem', fontWeight: 800, color: '#2A2A2A', width: 32 }}>{(campaign.card_logo_scale ?? 1).toFixed(1)}×</span>
                </div>
                {campaign.card_style === 'corporate' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#7A7585', whiteSpace: 'nowrap' }}>Position</span>
                    {(['left', 'center', 'right'] as const).map(pos => (
                      <button key={pos} onClick={() => saveLogoPosition(pos)} style={{
                        flex: 1, textTransform: 'capitalize', padding: '6px 0', borderRadius: 8, fontSize: '.74rem', fontWeight: 800,
                        fontFamily: "'Nunito',sans-serif", cursor: 'pointer',
                        background: (campaign.card_logo_position ?? 'left') === pos ? '#7C5CBF' : '#fff',
                        color: (campaign.card_logo_position ?? 'left') === pos ? '#fff' : '#7A7585',
                        border: (campaign.card_logo_position ?? 'left') === pos ? '1.5px solid #7C5CBF' : '1.5px solid #E8E2F0',
                      }}>
                        {pos}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <button onClick={() => logoUploadRef.current?.click()} disabled={savingLogo}
                style={{ width: '100%', border: '2px dashed #C8D8F0', borderRadius: 10, padding: '16px', background: '#F7F9FC', cursor: savingLogo ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif", color: '#7A7585', fontWeight: 800, fontSize: '.82rem' }}>
                {savingLogo ? 'Uploading…' : '+ Upload logo'}
              </button>
            )}
          </div>
        )}

        {/* Corporate brand template — save this card's colours + logo, or apply a saved one */}
        {campaign.card_style === 'corporate' && (
          <div style={{ marginBottom: 20 }}>
            <BrandKitPanel
              cardPalette={campaign.card_palette ?? 'navy'}
              logoUrl={campaign.card_logo_url}
              logoScale={campaign.card_logo_scale ?? 1}
              logoPosition={campaign.card_logo_position ?? 'left'}
              accentColor={campaign.card_accent}
              onApply={applyTemplate}
            />
          </div>
        )}

        </Accordion>

        {/* Send card section — only shown before sending; sent state is at top */}
        {!isSent && (
          <div style={{ background: '#fff', border: '1px solid #ECE8F1', boxShadow: '0 1px 3px rgba(60,50,100,.05)', borderRadius: 16, padding: '18px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1rem', color: '#2A2A2A', marginBottom: 4 }}><LineIcon name="Party Popper" size={28} />Ready to send?</div>
            <div style={{ fontSize: '.82rem', color: '#7A7585', fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>
              Pay $15 to send the card to {recipientName}. That also unlocks printing and saving it.
            </div>
            <button
              onClick={handlePay}
              disabled={paying}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, background: paying ? '#B0A8BC' : '#E8724A', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 800, fontSize: '1rem', cursor: paying ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}
            >
              {paying ? 'Redirecting…' : <>Send the card for $15<TintedIcon src="/Icons/Send.png" size={20} color="#fff" /></>}
            </button>
            <div style={{ fontSize: '.75rem', color: '#C07A5A', fontWeight: 600, marginTop: 10, textAlign: 'center' }}>
              People can still add messages after it&apos;s sent.
            </div>
          </div>
        )}

        {/* Organiser link — bookmark / return access */}
        <div style={{ background: '#fff', border: '1px solid #ECE8F1', boxShadow: '0 1px 3px rgba(60,50,100,.05)', borderRadius: 16, padding: '14px 16px' }}>
          <div style={{ fontWeight: 800, fontSize: '.82rem', color: '#7A7585', marginBottom: 4 }}>Your organiser link</div>
          <div style={{ fontSize: '.74rem', color: '#B0A8BC', fontWeight: 600, marginBottom: 8, lineHeight: 1.5 }}>
            Bookmark this to return to your dashboard at any time. Keep it private — anyone with this link can manage the card.
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, fontSize: '.72rem', color: '#7A7585', fontWeight: 700, wordBreak: 'break-all', background: '#fff', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '8px 10px' }}>
              {origin}/manage/{slug}?token={token}
            </div>
            <button onClick={copyManageLink} style={{ background: '#7A7585', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito',sans-serif" }}>
              {copiedManage ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        {campaign.organiser_email && (
          <div style={{ fontSize: '.72rem', color: '#B0A8BC', fontWeight: 600, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
            These links were also emailed to {campaign.organiser_email}.
          </div>
        )}

      </div>
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: '#7A7585' }}>Loading…</div>}>
      <ManageContent />
    </Suspense>
  );
}
