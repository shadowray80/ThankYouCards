'use client';

import { useEffect, useState } from 'react';
import { useOrganiserSession } from '@/lib/useOrganiserSession';
import { useIsAdmin } from '@/lib/useIsAdmin';
import { NotFound } from '@/components/ui/NotFound';
import { Nav } from '@/components/ui/Nav';

// The homepage gallery. Make an example card the normal way (solo or group, any style), paste
// its link here, then tick it onto the homepage carousel. The carousel draws the real card, so
// editing the card updates the homepage.

interface GalleryEntry {
  id: string;
  is_live: boolean;
  display_order: number;
  card: { slug: string; recipient_name: string; card_occasion: string | null; card_style: string | null; card_image_url: string | null; deadline: string | null } | null;
  legacy: { recipient_name: string; kind: string; group_style: string | null; card_image_url: string | null } | null;
}

const SANS = "'Nunito',sans-serif";
const smallButton: React.CSSProperties = {
  background: '#fff', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '6px 10px',
  fontWeight: 800, fontSize: '.78rem', color: '#7A7585', cursor: 'pointer', fontFamily: SANS,
};

function describe(e: GalleryEntry): { name: string; kind: string; image: string | null } {
  const styleName = (s: string | null) => s === 'corporate' ? 'Corporate' : s === 'casual' ? 'Casual' : 'Classic';
  if (e.card) {
    const kind = e.card.deadline ? `Group · ${styleName(e.card.card_style)}` : 'Solo';
    return { name: e.card.recipient_name, kind: e.card.card_occasion ? `${kind} · ${e.card.card_occasion}` : kind, image: e.card.card_image_url };
  }
  if (e.legacy) {
    return { name: e.legacy.recipient_name, kind: 'Old example (made in the builder)', image: e.legacy.card_image_url };
  }
  return { name: 'Card no longer exists', kind: '', image: null };
}

export default function AdminShowcasePage() {
  const { session } = useOrganiserSession();
  const adminStatus = useIsAdmin();
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [carouselSeconds, setCarouselSeconds] = useState('5');
  const [savingSpeed, setSavingSpeed] = useState(false);

  function reload() {
    if (!session) return;
    return fetch(`/api/admin/showcase?email=${encodeURIComponent(session.email)}&session_token=${encodeURIComponent(session.session_token)}`)
      .then(r => r.json())
      .then(json => { if (json.error) setError(json.error); else setEntries(json.cards ?? []); });
  }

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    reload()?.finally(() => setLoading(false));
    fetch('/api/site-settings')
      .then(r => r.json())
      .then(json => { if (json.carousel_interval_seconds) setCarouselSeconds(String(json.carousel_interval_seconds)); })
      .catch(() => {});
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  async function addToGallery() {
    if (!session || !link.trim()) return;
    setAdding(true); setError('');
    try {
      const res = await fetch('/api/admin/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, link }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setLink('');
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setAdding(false);
    }
  }

  function patch(id: string, fields: Record<string, unknown>) {
    if (!session) return;
    return fetch(`/api/admin/showcase/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...session, ...fields }),
    });
  }

  function toggleLive(entry: GalleryEntry) {
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, is_live: !e.is_live } : e));
    patch(entry.id, { is_live: !entry.is_live });
  }

  function move(index: number, by: -1 | 1) {
    const target = index + by;
    if (target < 0 || target >= entries.length) return;
    const next = [...entries];
    [next[index], next[target]] = [next[target], next[index]];
    setEntries(next);
    next.forEach((e, i) => { if (e.display_order !== i) patch(e.id, { display_order: i }); });
    setEntries(next.map((e, i) => ({ ...e, display_order: i })));
  }

  async function remove(entry: GalleryEntry) {
    if (!session || !confirm(`Take "${describe(entry).name}" out of the gallery? The card itself stays.`)) return;
    await fetch(`/api/admin/showcase/${entry.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    reload();
  }

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

  if (adminStatus !== 'admin') return <NotFound />;

  return (
    <div>
      <Nav onHome={() => { window.location.href = '/'; }} badge={null} />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 18px 80px', fontFamily: SANS }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2A2A2A', marginBottom: 4 }}>Example cards</h1>
        <p style={{ color: '#7A7585', fontSize: '.85rem', fontWeight: 600, marginBottom: 18, lineHeight: 1.5 }}>
          Make a card the normal way, paste its link here, then tick it onto the homepage.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={link} onChange={e => setLink(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addToGallery(); }}
            placeholder="Paste a card link"
            style={{ flex: 1, minWidth: 0, border: '2px solid #E8E2F0', borderRadius: 10, padding: '10px 12px', fontFamily: SANS, fontWeight: 700, fontSize: '15px', color: '#2A2A2A', background: '#fff', outline: 'none' }}
          />
          <button
            onClick={addToGallery} disabled={adding || !link.trim()}
            style={{ background: adding || !link.trim() ? '#B0A8BC' : '#3A8FA0', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#fff', fontWeight: 800, fontSize: '.85rem', cursor: adding || !link.trim() ? 'default' : 'pointer', fontFamily: SANS, whiteSpace: 'nowrap' }}
          >
            {adding ? 'Adding…' : 'Add to gallery'}
          </button>
        </div>
        {error && <div style={{ color: '#E8724A', fontWeight: 700, fontSize: '.82rem', marginBottom: 8 }}>{error}</div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '26px 0 10px', flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#2A2A2A' }}>Gallery</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', fontWeight: 700, color: '#7A7585' }}>
            Carousel speed
            <input
              type="number" min={2} max={30} value={carouselSeconds}
              onChange={e => setCarouselSeconds(e.target.value)}
              style={{ width: 56, border: '2px solid #E8E2F0', borderRadius: 8, padding: '5px 8px', fontFamily: SANS, fontWeight: 700, fontSize: '.85rem', color: '#2A2A2A', background: '#fff', outline: 'none' }}
            />
            seconds
            <button onClick={saveCarouselSpeed} disabled={savingSpeed} style={smallButton}>{savingSpeed ? 'Saving…' : 'Save'}</button>
          </div>
        </div>

        {loading ? (
          <div style={{ color: '#B0A8BC', fontWeight: 700 }}>Loading…</div>
        ) : entries.length === 0 ? (
          <div style={{ color: '#B0A8BC', fontWeight: 700 }}>No cards in the gallery yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {entries.map((e, i) => {
              const { name, kind, image } = describe(e);
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, padding: 10, flexWrap: 'wrap' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 8, background: '#F3F1F7', overflow: 'hidden', flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {image && <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontWeight: 800, color: '#2A2A2A' }}>
                      {e.card ? <a href={`/view/${e.card.slug}?preview=1`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{name}</a> : name}
                    </div>
                    <div style={{ fontSize: '.75rem', fontWeight: 600, color: '#7A7585', marginTop: 2 }}>{kind}</div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', fontWeight: 800, color: e.is_live ? '#2F7A4C' : '#7A7585', cursor: 'pointer' }}>
                    <input type="checkbox" checked={e.is_live} onChange={() => toggleLive(e)} style={{ width: 17, height: 17, accentColor: '#3A8FA0' }} />
                    On homepage
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" style={{ ...smallButton, opacity: i === 0 ? .4 : 1 }}>↑</button>
                    <button onClick={() => move(i, 1)} disabled={i === entries.length - 1} aria-label="Move down" style={{ ...smallButton, opacity: i === entries.length - 1 ? .4 : 1 }}>↓</button>
                    <button onClick={() => remove(e)} style={{ ...smallButton, color: '#E8724A' }}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
