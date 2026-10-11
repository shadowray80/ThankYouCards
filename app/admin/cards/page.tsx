'use client';

import { useEffect, useRef, useState } from 'react';
import { useOrganiserSession } from '@/lib/useOrganiserSession';
import { useIsAdmin } from '@/lib/useIsAdmin';
import { NotFound } from '@/components/ui/NotFound';
import { Nav } from '@/components/ui/Nav';
import { CATEGORIES, TAGS } from '@/lib/cardTaxonomy';
import { supabaseBrowser } from '@/lib/supabase-browser';

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
  const [syncResult, setSyncResult] = useState<{ synced: number; inserted: number; backfilled: number; removed: number; skipped: string[] } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [uploadResult, setUploadResult] = useState<{ uploaded: number; failed: { name: string; error: string }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      setSyncResult({ synced: json.synced, inserted: json.inserted ?? 0, backfilled: json.backfilled ?? 0, removed: json.removed ?? 0, skipped: json.skipped ?? [] });
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSyncing(false);
    }
  }

  // Uploads go straight from the browser into the `cards` bucket via a signed URL from
  // the server (which checks admin + the filename), then a sync adds them to the library.
  async function uploadFiles(files: FileList | null) {
    if (!session || !files || files.length === 0) return;
    const list = [...files];
    setError(''); setUploadResult(null); setSyncResult(null);
    setUploadProgress({ done: 0, total: list.length });
    let uploaded = 0;
    const failed: { name: string; error: string }[] = [];

    for (const [i, file] of list.entries()) {
      try {
        const res = await fetch('/api/admin/cards/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...session, file_name: file.name }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Upload failed');
        const { error: uploadError } = await supabaseBrowser.storage
          .from('cards')
          .uploadToSignedUrl(json.path, json.token, file, { contentType: file.type || undefined });
        if (uploadError) throw new Error(uploadError.message);
        uploaded++;
      } catch (err: unknown) {
        failed.push({ name: file.name, error: err instanceof Error ? err.message : 'Upload failed' });
      }
      setUploadProgress({ done: i + 1, total: list.length });
    }

    setUploadProgress(null);
    setUploadResult({ uploaded, failed });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (uploaded > 0) await sync();
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
          The <code>cards</code> Storage bucket is the master copy. Upload adds images to it (then syncs); Sync
          brings the library in line with the bucket, reading category/subcategory/style from each filename. To take
          a card out of the picker, untick Active — don&apos;t delete its file, as cards people have already made use it.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, padding: '12px 14px', marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            ref={fileInputRef} type="file" multiple accept="image/png,image/jpeg,image/webp"
            onChange={e => uploadFiles(e.target.files)}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()} disabled={!!uploadProgress || syncing}
            style={{ background: '#7C5CBF', border: 'none', borderRadius: 8, padding: '9px 16px', color: '#fff', fontWeight: 800, fontSize: '.82rem', cursor: uploadProgress || syncing ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}
          >
            {uploadProgress ? `Uploading ${uploadProgress.done} of ${uploadProgress.total}…` : '⬆ Upload cards'}
          </button>
          <button
            onClick={sync} disabled={syncing || !!uploadProgress}
            style={{ background: '#3A8FA0', border: 'none', borderRadius: 8, padding: '9px 16px', color: '#fff', fontWeight: 800, fontSize: '.82rem', cursor: syncing ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}
          >
            {syncing ? 'Syncing…' : '🔄 Sync from Storage'}
          </button>
          {syncResult && (
            <span style={{ fontSize: '.8rem', color: '#7A7585', fontWeight: 600 }}>
              {uploadResult && `Uploaded ${uploadResult.uploaded}. `}
              Synced {syncResult.synced} ({syncResult.inserted} new, {syncResult.backfilled} auto-tagged{syncResult.removed > 0 && `, ${syncResult.removed} removed — file no longer in Storage`}){syncResult.skipped.length > 0 && `, skipped ${syncResult.skipped.length} (didn't match the naming convention)`}
            </span>
          )}
        </div>

        {uploadResult && uploadResult.failed.length > 0 && (
          <div style={{ background: '#FFF8E8', border: '1.5px solid #F0D8A8', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: '.78rem', color: '#9A7A4A' }}>
            <strong>Not uploaded ({uploadResult.failed.length}):</strong>
            {uploadResult.failed.map(f => <div key={f.name}>{f.name} — {f.error}</div>)}
          </div>
        )}

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
            {cards.length === 0 ? 'No cards yet — hit Upload cards to add some.' : 'No cards match this filter.'}
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
