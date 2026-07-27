'use client';

import { useEffect, useState } from 'react';
import { useOrganiserSession } from '@/lib/useOrganiserSession';
import { useIsAdmin } from '@/lib/useIsAdmin';
import { NotFound } from '@/components/ui/NotFound';
import { Nav } from '@/components/ui/Nav';
import { CATEGORIES, TAGS } from '@/lib/cardTaxonomy';

interface Card {
  id: string;
  file_name: string;
  image_url: string;
  category: string;
  subcategory: string | null;
  style: string;
  tags: string[];
  is_active: boolean;
}

const GREEN = '#3FAE6A';
const ORANGE = '#E8724A';

function categoryLabel(id: string): string {
  return CATEGORIES.find(c => c.id === id)?.label ?? id;
}

function pillStyle(active: boolean, color: string): React.CSSProperties {
  return {
    padding: '5px 11px', borderRadius: 20, fontSize: '.72rem', fontWeight: 700,
    fontFamily: "'Nunito',sans-serif", cursor: 'pointer',
    background: active ? color : '#fff',
    color: active ? '#fff' : '#7A7585',
    border: active ? `1.5px solid ${color}` : '1.5px solid #E8E2F0',
  };
}

export default function AdminCardsPage() {
  const { session } = useOrganiserSession();
  const adminStatus = useIsAdmin();

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; skipped: string[] } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  function reload() {
    if (!session) return;
    setLoading(true);
    fetch(`/api/admin/cards?email=${encodeURIComponent(session.email)}&session_token=${encodeURIComponent(session.session_token)}`)
      .then(r => r.json())
      .then(json => { if (json.error) setError(json.error); else setCards(json.cards ?? []); })
      .finally(() => setLoading(false));
  }

  useEffect(reload, [session]);

  async function sync() {
    if (!session) return;
    setSyncing(true); setError(''); setSyncResult(null);
    try {
      const res = await fetch('/api/admin/cards/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Sync failed');
      setSyncResult({ synced: json.synced, skipped: json.skipped ?? [] });
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSyncing(false);
    }
  }

  async function toggleTag(card: Card, tagId: string) {
    if (!session) return;
    const nextTags = card.tags.includes(tagId) ? card.tags.filter(t => t !== tagId) : [...card.tags, tagId];
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, tags: nextTags } : c));
    await fetch(`/api/admin/cards/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...session, tags: nextTags }),
    });
  }

  async function toggleActive(card: Card) {
    if (!session) return;
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, is_active: !c.is_active } : c));
    await fetch(`/api/admin/cards/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...session, is_active: !card.is_active }),
    });
  }

  if (adminStatus !== 'admin') return <NotFound />;

  const visibleCards = cards.filter(c =>
    (showInactive || c.is_active) && (!categoryFilter || c.category === categoryFilter)
  );
  const categoriesInUse = [...new Set(cards.map(c => c.category))];

  return (
    <div>
      <Nav onHome={() => { window.location.href = '/'; }} badge={null} />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 18px 80px', fontFamily: "'Nunito',sans-serif" }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2A2A2A', marginBottom: 4 }}>Card library</h1>
        <p style={{ color: '#7A7585', fontSize: '.85rem', marginBottom: 20 }}>
          Sync pulls in whatever&apos;s in the <code>cards</code> Storage bucket and parses category/subcategory/style
          straight from each filename. Tags and the active toggle are never touched by sync — set those by hand here.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, padding: '12px 14px', marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={sync} disabled={syncing}
            style={{ background: '#3A8FA0', border: 'none', borderRadius: 8, padding: '9px 16px', color: '#fff', fontWeight: 800, fontSize: '.82rem', cursor: syncing ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}
          >
            {syncing ? 'Syncing…' : '🔄 Sync from Storage'}
          </button>
          {syncResult && (
            <span style={{ fontSize: '.8rem', color: '#7A7585', fontWeight: 600 }}>
              Synced {syncResult.synced}{syncResult.skipped.length > 0 && `, skipped ${syncResult.skipped.length} (didn't match the naming convention)`}
            </span>
          )}
        </div>

        {syncResult && syncResult.skipped.length > 0 && (
          <div style={{ background: '#FFF8E8', border: '1.5px solid #F0D8A8', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: '.78rem', color: '#9A7A4A' }}>
            <strong>Skipped files:</strong> {syncResult.skipped.join(', ')}
          </div>
        )}

        {error && <div style={{ color: '#E8724A', fontWeight: 700, fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          <button onClick={() => setCategoryFilter(null)} style={pillStyle(categoryFilter === null, GREEN)}>All</button>
          {CATEGORIES.filter(c => categoriesInUse.includes(c.id)).map(c => (
            <button key={c.id} onClick={() => setCategoryFilter(c.id)} style={pillStyle(categoryFilter === c.id, GREEN)}>
              {c.label}
            </button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', color: '#7A7585', fontWeight: 600, marginBottom: 20, cursor: 'pointer' }}>
          <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />
          Show inactive cards too
        </label>

        {loading ? (
          <div style={{ color: '#B0A8BC', fontWeight: 700 }}>Loading…</div>
        ) : visibleCards.length === 0 ? (
          <div style={{ color: '#B0A8BC', fontWeight: 700 }}>
            {cards.length === 0 ? 'No cards yet — upload some to the "cards" bucket in Supabase Storage, then hit Sync.' : 'No cards match this filter.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {visibleCards.map(card => (
              <div key={card.id} style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, overflow: 'hidden', opacity: card.is_active ? 1 : 0.5 }}>
                <div style={{ position: 'relative', aspectRatio: '3 / 4' }}>
                  <img src={card.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#2A2A2A' }}>{categoryLabel(card.category)}</div>
                  <div style={{ fontSize: '.68rem', color: '#B0A8BC', fontWeight: 600, marginBottom: 6 }}>
                    {[card.subcategory, card.style].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {TAGS.map(t => (
                      <button key={t.id} onClick={() => toggleTag(card, t.id)} style={{ ...pillStyle(card.tags.includes(t.id), ORANGE), padding: '3px 8px', fontSize: '.62rem' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#7A7585', fontWeight: 700, cursor: 'pointer' }}>
                    <input type="checkbox" checked={card.is_active} onChange={() => toggleActive(card)} />
                    Active
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
