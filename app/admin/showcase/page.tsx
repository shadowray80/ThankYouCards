'use client';

import { useEffect, useRef, useState } from 'react';
import { useOrganiserSession } from '@/lib/useOrganiserSession';
import { Nav } from '@/components/ui/Nav';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { CasualView } from '@/components/cards/CasualView';
import { CorporateView } from '@/components/cards/CorporateView';
import { CASUAL_PALETTES, CORPORATE_PALETTES } from '@/lib/palettes';
import { THEMES } from '@/lib/themes';

interface SampleMessage {
  contributor_name: string;
  message: string;
  photo_url: string | null;
  photo_label: string | null;
}

interface ShowcaseCard {
  id: string;
  kind: 'solo' | 'group';
  group_style: 'casual' | 'corporate' | null;
  recipient_name: string;
  occasion: string;
  card_message: string;
  card_note: string;
  card_image_url: string;
  card_palette: string;
  card_logo_url: string;
  card_logo_scale: number;
  sender_name: string;
  solo_message: string;
  sample_messages: SampleMessage[];
  display_order: number;
  is_live: boolean;
}

type Draft = Omit<ShowcaseCard, 'id'> & { id?: string };

const BLANK: Draft = {
  kind: 'solo', group_style: null, recipient_name: '', occasion: '', card_message: '',
  card_note: '', card_image_url: '', card_palette: 'sky', card_logo_url: '', card_logo_scale: 1,
  sender_name: '', solo_message: '', sample_messages: [], display_order: 0, is_live: false,
};

const inputStyle: React.CSSProperties = {
  width: '100%', border: '2px solid #E8E2F0', borderRadius: 10, padding: '9px 11px',
  fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '.85rem', color: '#2A2A2A',
  background: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: 10,
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '.66rem', fontWeight: 800, color: '#7A7585',
  letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 5,
};

function PhotoPicker({
  value, onChange, label, allowLibrary = true,
}: { value: string; onChange: (url: string) => void; label: string; allowLibrary?: boolean }) {
  const [mode, setMode] = useState<'closed' | 'library'>('closed');
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) onChange(json.url);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  const activeTheme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  return (
    <div style={{ marginBottom: 10 }}>
      <label style={labelStyle}>{label}</label>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F7F5FB', borderRadius: 10, padding: '8px 12px' }}>
          <img src={value} alt="" style={{ maxHeight: 40, borderRadius: 6, objectFit: 'cover' }} />
          <button type="button" onClick={() => onChange('')} style={{ marginLeft: 'auto', background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '4px 10px', fontSize: '.72rem', fontWeight: 800, color: '#7A7585', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>Remove</button>
        </div>
      ) : mode === 'closed' ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ flex: 1, background: '#fff', border: '2px dashed #E8E2F0', borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: '.78rem', color: '#7A7585', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
            {uploading ? 'Uploading…' : '⬆ Upload'}
          </button>
          {allowLibrary && (
            <button type="button" onClick={() => setMode('library')}
              style={{ flex: 1, background: '#fff', border: '2px dashed #D4C8EE', borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: '.78rem', color: '#7C5CBF', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
              🖼 From library
            </button>
          )}
        </div>
      ) : (
        <div style={{ border: '2px solid #E8E2F0', borderRadius: 10, padding: 10 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <select value={themeId} onChange={e => setThemeId(e.target.value)} style={{ ...inputStyle, marginBottom: 0, flex: 1 }}>
              {THEMES.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
            </select>
            <button type="button" onClick={() => setMode('closed')} style={{ background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '0 12px', fontWeight: 800, fontSize: '.78rem', color: '#7A7585', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 180, overflowY: 'auto' }}>
            {activeTheme.imgs.map((url, i) => (
              <img
                key={i} src={url} alt=""
                onClick={() => { onChange(url); setMode('closed'); }}
                style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: '2px solid transparent' }}
                onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.border = '2px solid #E8724A'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.border = '2px solid transparent'; }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminShowcasePage() {
  const { session } = useOrganiserSession();
  const [cards, setCards] = useState<ShowcaseCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [error, setError] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [carouselSeconds, setCarouselSeconds] = useState('5');
  const [savingSpeed, setSavingSpeed] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetch(`/api/admin/showcase?email=${encodeURIComponent(session.email)}&session_token=${encodeURIComponent(session.session_token)}`)
      .then(r => r.json())
      .then(json => { if (json.error) setError(json.error); else setCards(json.cards ?? []); })
      .finally(() => setLoading(false));
    fetch('/api/site-settings')
      .then(r => r.json())
      .then(json => { if (json.carousel_interval_seconds) setCarouselSeconds(String(json.carousel_interval_seconds)); })
      .catch(() => {});
  }, [session]);

  async function saveCarouselSpeed() {
    if (!session) return;
    setSavingSpeed(true); setError('');
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, carousel_interval_seconds: Number(carouselSeconds) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setCarouselSeconds(String(json.carousel_interval_seconds));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSavingSpeed(false);
    }
  }

  function reload() {
    if (!session) return;
    fetch(`/api/admin/showcase?email=${encodeURIComponent(session.email)}&session_token=${encodeURIComponent(session.session_token)}`)
      .then(r => r.json())
      .then(json => { if (!json.error) setCards(json.cards ?? []); });
  }

  async function save() {
    if (!session || !editing) return;
    setSaving(true); setError('');
    try {
      const isNew = !editing.id;
      const res = await fetch(isNew ? '/api/admin/showcase' : `/api/admin/showcase/${editing.id}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, ...editing }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setEditing(null);
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function toggleLive(card: ShowcaseCard) {
    if (!session) return;
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, is_live: !c.is_live } : c));
    await fetch(`/api/admin/showcase/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...session, is_live: !card.is_live }),
    });
  }

  async function remove(card: ShowcaseCard) {
    if (!session || !confirm(`Delete "${card.recipient_name}"?`)) return;
    await fetch(`/api/admin/showcase/${card.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    reload();
  }

  function handleDrop(targetIndex: number) {
    setDragOverIndex(null);
    if (dragIndex === null || dragIndex === targetIndex) { setDragIndex(null); return; }
    const next = [...cards];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    setCards(next);
    if (!session) return;
    Promise.all(next.map((c, i) =>
      fetch(`/api/admin/showcase/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, display_order: i }),
      })
    ));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !editing) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) setEditing({ ...editing, card_logo_url: json.url });
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  }

  function addSampleMessage() {
    if (!editing) return;
    setEditing({ ...editing, sample_messages: [...editing.sample_messages, { contributor_name: '', message: '', photo_url: null, photo_label: null }] });
  }
  function updateSampleMessage(i: number, patch: Partial<SampleMessage>) {
    if (!editing) return;
    const next = editing.sample_messages.map((m, idx) => idx === i ? { ...m, ...patch } : m);
    setEditing({ ...editing, sample_messages: next });
  }
  function removeSampleMessage(i: number) {
    if (!editing) return;
    setEditing({ ...editing, sample_messages: editing.sample_messages.filter((_, idx) => idx !== i) });
  }

  if (!session) {
    return (
      <div>
        <Nav onHome={() => { window.location.href = '/'; }} badge={null} />
        <div style={{ padding: '60px 24px', textAlign: 'center', fontFamily: "'Nunito',sans-serif", color: '#7A7585', fontWeight: 700 }}>
          Log in as admin from the menu above to manage homepage examples.
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav onHome={() => { window.location.href = '/'; }} badge={null} />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 18px 80px', fontFamily: "'Nunito',sans-serif" }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2A2A2A', marginBottom: 4 }}>Homepage example cards</h1>
        <p style={{ color: '#7A7585', fontSize: '.85rem', marginBottom: 20 }}>
          Create and manage the example cards shown on the home page. Only ones marked <strong>Live</strong> appear there.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, padding: '12px 14px', marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, fontSize: '.82rem', color: '#2A2A2A' }}>⏱ Carousel speed</span>
          <input
            type="number" min={2} max={30} value={carouselSeconds}
            onChange={e => setCarouselSeconds(e.target.value)}
            style={{ width: 70, border: '2px solid #E8E2F0', borderRadius: 8, padding: '6px 9px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '.85rem', color: '#2A2A2A', background: '#fff', outline: 'none' }}
          />
          <span style={{ fontSize: '.78rem', color: '#7A7585', fontWeight: 600 }}>seconds between cards</span>
          <button
            onClick={saveCarouselSpeed} disabled={savingSpeed}
            style={{ marginLeft: 'auto', background: '#3A8FA0', border: 'none', borderRadius: 8, padding: '7px 14px', color: '#fff', fontWeight: 800, fontSize: '.78rem', cursor: savingSpeed ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}
          >
            {savingSpeed ? 'Saving…' : 'Save'}
          </button>
        </div>

        {error && <div style={{ color: '#E8724A', fontWeight: 700, fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}

        {!editing ? (
          <>
            <button
              onClick={() => setEditing({ ...BLANK })}
              style={{ background: '#3A8FA0', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#fff', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}
            >
              + New example
            </button>

            {loading ? (
              <div style={{ marginTop: 20, color: '#B0A8BC', fontWeight: 700 }}>Loading…</div>
            ) : (
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cards.map((c, i) => (
                  <div
                    key={c.id}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDrop(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, background: '#fff',
                      border: dragOverIndex === i ? '2px solid #3A8FA0' : '2px solid #E8E2F0',
                      borderRadius: 12, padding: '12px 14px', flexWrap: 'wrap',
                      opacity: dragIndex === i ? 0.4 : 1,
                    }}
                  >
                    <div
                      draggable
                      onDragStart={() => setDragIndex(i)}
                      onDragEnter={() => setDragOverIndex(i)}
                      onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                      title="Drag to reorder"
                      style={{ cursor: 'grab', color: '#B0A8BC', fontSize: '1.1rem', lineHeight: 1, padding: '0 4px', userSelect: 'none' }}
                    >
                      ⠿
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 800, color: '#2A2A2A' }}>
                        {c.recipient_name || '(untitled)'}{' '}
                        <span style={{ fontWeight: 600, color: '#B0A8BC', fontSize: '.78rem' }}>
                          ({c.kind === 'solo' ? 'Solo' : c.group_style === 'corporate' ? 'Corporate' : 'Classic'})
                        </span>
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', fontWeight: 800, color: c.is_live ? '#4CAF82' : '#B0A8BC', cursor: 'pointer' }}>
                      <input type="checkbox" checked={c.is_live} onChange={() => toggleLive(c)} /> Live
                    </label>
                    <button onClick={() => setEditing({ ...c, card_logo_scale: c.card_logo_scale ?? 1 })} style={{ background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '6px 12px', fontWeight: 800, fontSize: '.78rem', color: '#7A7585', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>Edit</button>
                    <button onClick={() => remove(c)} style={{ background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '6px 12px', fontWeight: 800, fontSize: '.78rem', color: '#E8724A', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>Delete</button>
                  </div>
                ))}
                {cards.length === 0 && <div style={{ color: '#B0A8BC', fontWeight: 600 }}>No examples yet.</div>}
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* ── Form ── */}
            <div style={{ width: 360, flexShrink: 0 }}>
              <label style={labelStyle}>Type</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {(['solo', 'group'] as const).map(k => (
                  <button key={k} onClick={() => setEditing({ ...editing, kind: k, group_style: k === 'group' ? (editing.group_style ?? 'casual') : null })}
                    style={{ flex: 1, borderRadius: 10, padding: '9px', border: editing.kind === k ? '2px solid #E8724A' : '2px solid #E8E2F0', background: editing.kind === k ? '#FDF0E8' : '#fff', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                    {k === 'solo' ? 'Solo' : 'Group'}
                  </button>
                ))}
              </div>

              {editing.kind === 'group' && (
                <>
                  <label style={labelStyle}>Style</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    {(['casual', 'corporate'] as const).map(s => (
                      <button key={s} onClick={() => setEditing({ ...editing, group_style: s, card_palette: s === 'corporate' ? 'navy' : 'sky' })}
                        style={{ flex: 1, borderRadius: 10, padding: '9px', border: editing.group_style === s ? '2px solid #E8724A' : '2px solid #E8E2F0', background: editing.group_style === s ? '#FDF0E8' : '#fff', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                        {s === 'casual' ? 'Classic' : 'Corporate'}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <label style={labelStyle}>Recipient name</label>
              <input style={inputStyle} value={editing.recipient_name} onChange={e => setEditing({ ...editing, recipient_name: e.target.value })} placeholder="e.g. Coach Dave" />

              <label style={labelStyle}>{editing.kind === 'solo' ? 'From' : 'Occasion / From'}</label>
              <input style={inputStyle} value={editing.occasion} onChange={e => setEditing({ ...editing, occasion: e.target.value })} placeholder="e.g. the Under 12s team" />

              <label style={labelStyle}>Cover message</label>
              <input style={inputStyle} value={editing.card_message} onChange={e => setEditing({ ...editing, card_message: e.target.value })} placeholder="e.g. Thank you Coach!" />

              {editing.kind === 'group' && editing.group_style === 'casual' && (
                <>
                  <label style={labelStyle}>Card message (longer note, optional)</label>
                  <textarea style={{ ...inputStyle, minHeight: 70, fontFamily: "'Lora',serif", fontStyle: 'italic' }} value={editing.card_note} onChange={e => setEditing({ ...editing, card_note: e.target.value })} />
                </>
              )}

              {editing.kind === 'solo' && (
                <>
                  <label style={labelStyle}>Sender name</label>
                  <input style={inputStyle} value={editing.sender_name} onChange={e => setEditing({ ...editing, sender_name: e.target.value })} placeholder="e.g. Tim" />
                  <label style={labelStyle}>Message</label>
                  <textarea style={{ ...inputStyle, minHeight: 90, fontFamily: "'Lora',serif", fontStyle: 'italic' }} value={editing.solo_message} onChange={e => setEditing({ ...editing, solo_message: e.target.value })} />
                </>
              )}

              <PhotoPicker
                label="Cover photo"
                value={editing.card_image_url}
                onChange={url => setEditing({ ...editing, card_image_url: url })}
              />

              {editing.kind === 'group' && (
                <>
                  <label style={labelStyle}>Colour palette</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    {(editing.group_style === 'corporate' ? CORPORATE_PALETTES : CASUAL_PALETTES).map(p => (
                      <div key={p.id} onClick={() => setEditing({ ...editing, card_palette: p.id })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg, ${p.headerFrom}, ${p.headerTo})`, border: editing.card_palette === p.id ? '3px solid #E8724A' : '3px solid transparent' }} />
                        <div style={{ fontSize: '.58rem', fontWeight: 800, color: '#7A7585' }}>{p.name}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {editing.kind === 'group' && editing.group_style === 'corporate' && (
                <>
                  <label style={labelStyle}>Logo (optional)</label>
                  <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                  {editing.card_logo_url ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F7F5FB', borderRadius: 10, padding: '8px 12px', marginBottom: 10 }}>
                        <img src={editing.card_logo_url} alt="" style={{ maxHeight: 28, maxWidth: 90, objectFit: 'contain' }} />
                        <button onClick={() => setEditing({ ...editing, card_logo_url: '', card_logo_scale: 1 })} style={{ marginLeft: 'auto', background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '4px 10px', fontSize: '.72rem', fontWeight: 800, color: '#7A7585', cursor: 'pointer' }}>Remove</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#7A7585', whiteSpace: 'nowrap' }}>Logo size</span>
                        <input
                          type="range" min={0.5} max={3} step={0.1}
                          value={editing.card_logo_scale ?? 1}
                          onChange={e => setEditing({ ...editing, card_logo_scale: Number(e.target.value) })}
                          style={{ flex: 1 }}
                        />
                        <span style={{ fontSize: '.72rem', fontWeight: 800, color: '#2A2A2A', width: 32 }}>{(editing.card_logo_scale ?? 1).toFixed(1)}×</span>
                      </div>
                    </>
                  ) : (
                    <button onClick={() => logoInputRef.current?.click()} disabled={logoUploading} style={{ width: '100%', background: '#fff', border: '2px dashed #E8E2F0', borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: '.8rem', color: '#7A7585', cursor: 'pointer', marginBottom: 10, fontFamily: "'Nunito',sans-serif" }}>
                      {logoUploading ? 'Uploading…' : '⬆ Upload logo'}
                    </button>
                  )}
                </>
              )}

              {editing.kind === 'group' && (
                <>
                  <label style={labelStyle}>Sample contributor messages</label>
                  {editing.sample_messages.map((m, i) => (
                    <div key={i} style={{ border: '1.5px solid #E8E2F0', borderRadius: 10, padding: 10, marginBottom: 8 }}>
                      <input style={{ ...inputStyle, marginBottom: 6 }} value={m.contributor_name} onChange={e => updateSampleMessage(i, { contributor_name: e.target.value })} placeholder="Name" />
                      <textarea style={{ ...inputStyle, minHeight: 50, marginBottom: 6 }} value={m.message} onChange={e => updateSampleMessage(i, { message: e.target.value })} placeholder="Message" />
                      <PhotoPicker
                        label="Photo (optional)"
                        value={m.photo_url ?? ''}
                        onChange={url => updateSampleMessage(i, { photo_url: url || null })}
                      />
                      {m.photo_url && (
                        <input
                          style={{ ...inputStyle, marginBottom: 6 }}
                          value={m.photo_label ?? ''}
                          onChange={e => updateSampleMessage(i, { photo_label: e.target.value || null })}
                          placeholder="Photo caption (optional)"
                        />
                      )}
                      <button onClick={() => removeSampleMessage(i)} style={{ background: 'none', border: 'none', color: '#E8724A', fontWeight: 800, fontSize: '.75rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>Remove</button>
                    </div>
                  ))}
                  <button onClick={addSampleMessage} style={{ background: 'none', border: '2px dashed #D4C8EE', borderRadius: 10, padding: '8px 12px', width: '100%', color: '#7C5CBF', fontWeight: 800, fontSize: '.78rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", marginBottom: 14 }}>
                    + Add sample message
                  </button>
                </>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '.82rem', color: '#2A2A2A', marginBottom: 16, cursor: 'pointer' }}>
                <input type="checkbox" checked={editing.is_live} onChange={e => setEditing({ ...editing, is_live: e.target.checked })} /> Live on homepage
              </label>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={save} disabled={saving} style={{ flex: 1, background: '#3A8FA0', border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontWeight: 800, fontSize: '.85rem', cursor: saving ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setEditing(null)} style={{ background: 'none', border: '2px solid #E8E2F0', borderRadius: 10, padding: '11px 16px', fontWeight: 800, fontSize: '.85rem', color: '#7A7585', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                  Cancel
                </button>
              </div>
            </div>

            {/* ── Live preview ── */}
            <div style={{ flex: 1, minWidth: 300, maxWidth: 420 }}>
              <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>Preview</div>
              <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(60,50,100,.14)' }}>
                {editing.kind === 'group' && editing.group_style === 'casual' && (
                  <CasualView
                    campaign={{
                      slug: '', recipient_name: editing.recipient_name || 'Name', occasion: editing.occasion,
                      card_message: editing.card_message, card_note: editing.card_note,
                      card_image_url: editing.card_image_url || null, card_palette: editing.card_palette,
                    }}
                    contributions={editing.sample_messages.map(m => ({ contributor_name: m.contributor_name || 'Someone', message: m.message || null, photo_url: m.photo_url, photo_label: m.photo_label }))}
                    preview
                  />
                )}
                {editing.kind === 'group' && editing.group_style === 'corporate' && (
                  <CorporateView
                    campaign={{
                      slug: '', recipient_name: editing.recipient_name || 'Name', occasion: editing.occasion,
                      card_message: editing.card_message, card_image_url: editing.card_image_url || null,
                      card_palette: editing.card_palette, card_logo_url: editing.card_logo_url || null,
                    }}
                    contributions={editing.sample_messages.map(m => ({ contributor_name: m.contributor_name || 'Someone', message: m.message || null, photo_url: m.photo_url, photo_label: m.photo_label }))}
                    logoScale={editing.card_logo_scale}
                    preview
                  />
                )}
                {editing.kind === 'solo' && (
                  <CardScrollView
                    theme={THEMES[0]}
                    customImgUrl={editing.card_image_url || undefined}
                    recipientName={editing.recipient_name}
                    fromText={editing.sender_name || undefined}
                    message={editing.card_message}
                    soloMessage={editing.solo_message}
                    messages={[]}
                    landscapeCover
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
