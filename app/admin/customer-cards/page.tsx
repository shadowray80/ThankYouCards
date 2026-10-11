'use client';

import { useEffect, useState } from 'react';
import { useOrganiserSession } from '@/lib/useOrganiserSession';
import { useIsAdmin } from '@/lib/useIsAdmin';
import { NotFound } from '@/components/ui/NotFound';
import { Nav } from '@/components/ui/Nav';
import { renderInstagramImage } from '@/lib/instagramImage';

interface CustomerCard {
  id: string;
  slug: string;
  recipient_name: string;
  occasion: string | null;
  card_message: string | null;
  card_image_url: string | null;
  card_style: string | null;
  card_palette: string | null;
  card_logo_url: string | null;
  card_text_on_image: boolean | null;
  deadline: string | null;
  created_at: string;
  feature_dismissed: boolean;
  feature_exported_at: string | null;
  feature_showcase_id: string | null;
}

const PURPLE = '#7C5CBF';
const GREEN = '#3FAE6A';

const smallButton: React.CSSProperties = {
  background: '#fff', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '6px 8px', color: '#7A7585',
  fontWeight: 800, fontSize: '.68rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", flex: 1,
};

function badge(color: string): React.CSSProperties {
  return { fontSize: '.6rem', fontWeight: 800, color: '#fff', background: color, borderRadius: 10, padding: '2px 7px' };
}

function slugToFile(c: CustomerCard) {
  return `thankyoucards-${c.slug}.jpg`;
}

export default function AdminCustomerCardsPage() {
  const { session } = useOrganiserSession();
  const adminStatus = useIsAdmin();

  const [cards, setCards] = useState<CustomerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'new' | 'dismissed'>('new');
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState('');
  const [busyId, setBusyId] = useState('');

  function load() {
    if (!session) return;
    fetch(`/api/admin/customer-cards?email=${encodeURIComponent(session.email)}&session_token=${encodeURIComponent(session.session_token)}`)
      .then(r => r.json())
      .then(json => { if (json.error) setError(json.error); else setCards(json.cards ?? []); })
      .finally(() => setLoading(false));
  }

  useEffect(load, [session]);

  // Previews are the actual Instagram images, drawn one at a time.
  useEffect(() => {
    let cancelled = false;
    const made: string[] = [];
    (async () => {
      for (const card of cards) {
        if (cancelled) return;
        try {
          const url = URL.createObjectURL(await renderInstagramImage(card));
          made.push(url);
          if (!cancelled) setPreviews(prev => ({ ...prev, [card.id]: url }));
        } catch {
          if (!cancelled) setPreviews(prev => ({ ...prev, [card.id]: '' }));
        }
      }
    })();
    return () => { cancelled = true; made.forEach(u => URL.revokeObjectURL(u)); };
  }, [cards]);

  async function act(card: CustomerCard, action: 'dismiss' | 'undismiss' | 'mark_exported' | 'add_to_homepage') {
    if (!session) return null;
    const res = await fetch(`/api/admin/customer-cards/${card.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...session, action }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error || 'Something went wrong'); return null; }
    const { ok: _ok, ...fields } = json;
    void _ok;
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, ...fields } : c));
    return json;
  }

  async function addToHomepage(card: CustomerCard) {
    setBusyId(card.id); setError('');
    await act(card, 'add_to_homepage');
    setBusyId('');
  }

  async function exportSelected() {
    const list = cards.filter(c => selected.has(c.id));
    setError('');
    for (const [i, card] of list.entries()) {
      setExporting(`Preparing ${i + 1} of ${list.length}…`);
      try {
        const blob = await renderInstagramImage(card);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = slugToFile(card);
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
        await act(card, 'mark_exported');
        // A short gap stops the browser treating a burst of downloads as one.
        await new Promise(r => setTimeout(r, 400));
      } catch (err: unknown) {
        setError(`${card.recipient_name}: ${err instanceof Error ? err.message : 'export failed'}`);
      }
    }
    setExporting('');
    setSelected(new Set());
  }

  if (adminStatus !== 'admin') return <NotFound />;

  const visible = cards.filter(c => (tab === 'dismissed') === c.feature_dismissed);
  const newCount = cards.filter(c => !c.feature_dismissed).length;
  const notExported = visible.filter(c => !c.feature_exported_at);

  return (
    <div>
      <Nav onHome={() => { window.location.href = '/'; }} badge={null} />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 18px 80px', fontFamily: "'Nunito',sans-serif" }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2A2A2A', marginBottom: 4 }}>Customer cards</h1>
        <p style={{ color: '#7A7585', fontSize: '.85rem', marginBottom: 20, lineHeight: 1.5 }}>
          Sent cards whose sender said yes to being featured. Only the cover is used — never the messages.
          Each preview is exactly the Instagram image you&apos;ll download (1080 × 1350).
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
          <button
            onClick={exportSelected} disabled={selected.size === 0 || !!exporting}
            style={{ background: selected.size ? PURPLE : '#B0A8BC', border: 'none', borderRadius: 8, padding: '9px 16px', color: '#fff', fontWeight: 800, fontSize: '.82rem', cursor: selected.size && !exporting ? 'pointer' : 'default', fontFamily: "'Nunito',sans-serif" }}
          >
            {exporting || (selected.size ? `Download ${selected.size} for Instagram` : 'Tick cards to download for Instagram')}
          </button>
          <button
            onClick={() => setSelected(new Set(notExported.map(c => c.id)))} disabled={notExported.length === 0}
            style={{ ...smallButton, flex: 'none', padding: '8px 12px', fontSize: '.75rem' }}
          >
            Select all not yet exported ({notExported.length})
          </button>
          {selected.size > 0 && (
            <button onClick={() => setSelected(new Set())} style={{ ...smallButton, flex: 'none', padding: '8px 12px', fontSize: '.75rem' }}>Clear</button>
          )}
        </div>

        {error && <div style={{ color: '#E8724A', fontWeight: 700, fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, margin: '8px 0 16px', borderBottom: '2px solid #E8E2F0' }}>
          {(['new', 'dismissed'] as const).map(t => (
            <button
              key={t} onClick={() => { setTab(t); setSelected(new Set()); }}
              style={{
                background: 'none', border: 'none', borderBottom: `3px solid ${tab === t ? PURPLE : 'transparent'}`,
                marginBottom: -2, padding: '8px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '.85rem',
                color: tab === t ? '#2A2A2A' : '#7A7585', cursor: 'pointer',
              }}
            >
              {t === 'new' ? `Cards (${newCount})` : `Dismissed (${cards.length - newCount})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: '#B0A8BC', fontWeight: 700 }}>Loading…</div>
        ) : visible.length === 0 ? (
          <div style={{ color: '#B0A8BC', fontWeight: 700 }}>
            {tab === 'new' ? 'No opted-in cards yet — they appear here once people tick "Happy for us to feature this card".' : 'Nothing dismissed.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {visible.map(card => {
              const isSelected = selected.has(card.id);
              const preview = previews[card.id];
              return (
                <div key={card.id} style={{ background: '#fff', border: `2px solid ${isSelected ? PURPLE : '#E8E2F0'}`, borderRadius: 12, overflow: 'hidden' }}>
                  <label style={{ display: 'block', position: 'relative', aspectRatio: '4 / 5', background: '#F7F5FB', cursor: 'pointer' }}>
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt="" style={{ width: '100%', height: '100%', display: 'block' }} />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', color: '#B0A8BC', fontWeight: 700 }}>
                        {preview === '' ? "Couldn't draw this cover" : 'Drawing…'}
                      </div>
                    )}
                    <input
                      type="checkbox" checked={isSelected}
                      onChange={() => setSelected(prev => {
                        const next = new Set(prev);
                        if (next.has(card.id)) next.delete(card.id); else next.add(card.id);
                        return next;
                      })}
                      style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, accentColor: PURPLE, cursor: 'pointer' }}
                    />
                  </label>
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <div style={{ fontSize: '.78rem', fontWeight: 800, color: '#2A2A2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.recipient_name}</div>
                      <div style={{ fontSize: '.62rem', color: '#B0A8BC', fontWeight: 700, flexShrink: 0 }}>{card.deadline ? 'Group' : 'Solo'}</div>
                    </div>
                    <div style={{ fontSize: '.64rem', color: '#B0A8BC', fontWeight: 600, marginBottom: 6 }}>
                      {new Date(card.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8, minHeight: 16 }}>
                      {card.feature_showcase_id && <span style={badge(GREEN)}>On homepage</span>}
                      {card.feature_exported_at && <span style={badge(PURPLE)}>Exported</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      <button
                        onClick={() => addToHomepage(card)} disabled={!!card.feature_showcase_id || busyId === card.id}
                        style={{ ...smallButton, opacity: card.feature_showcase_id ? 0.5 : 1, cursor: card.feature_showcase_id ? 'default' : 'pointer' }}
                      >
                        {busyId === card.id ? 'Adding…' : 'Add to homepage'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <a href={`/view/${card.slug}`} target="_blank" rel="noreferrer" style={{ ...smallButton, textAlign: 'center', textDecoration: 'none' }}>Open card</a>
                      <button onClick={() => act(card, card.feature_dismissed ? 'undismiss' : 'dismiss')} style={smallButton}>
                        {card.feature_dismissed ? 'Bring back' : 'Dismiss'}
                      </button>
                    </div>
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
