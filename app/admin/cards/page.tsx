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
  superseded_at: string | null;
}

interface FolderPlan {
  toUpload: string[];
  toSupersede: string[];
  unchanged: number;
  badNames: string[];
  blockedSuperseded: string[];
}

const GREEN = '#3FAE6A';
const ORANGE = '#E8724A';
const IMAGE_FILE = /\.(png|jpe?g|webp)$/i;

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

function buttonStyle(color: string, busy = false): React.CSSProperties {
  return {
    background: color, border: 'none', borderRadius: 8, padding: '9px 16px', color: '#fff', fontWeight: 800,
    fontSize: '.82rem', cursor: busy ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif", opacity: busy ? 0.7 : 1,
  };
}

const outlineButton: React.CSSProperties = {
  background: '#fff', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '6px 10px', color: '#7A7585',
  fontWeight: 800, fontSize: '.7rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif",
};

const noticeStyle: React.CSSProperties = {
  background: '#FFF8E8', border: '1.5px solid #F0D8A8', borderRadius: 10, padding: '10px 14px',
  marginBottom: 12, fontSize: '.78rem', color: '#9A7A4A', lineHeight: 1.5,
};

export default function AdminCardsPage() {
  const { session } = useOrganiserSession();
  const adminStatus = useIsAdmin();

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'library' | 'superseded'>('library');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // Storage sync
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Folder sync
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [folderFiles, setFolderFiles] = useState<Map<string, File>>(new Map());
  const [planning, setPlanning] = useState(false);
  const [plan, setPlan] = useState<FolderPlan | null>(null);
  const [supersedeChecked, setSupersedeChecked] = useState<Set<string>>(new Set());
  const [applyProgress, setApplyProgress] = useState('');
  const [folderResult, setFolderResult] = useState<{ uploaded: number; superseded: number; failed: { name: string; error: string }[] } | null>(null);

  // Superseded tab
  const [cardMessages, setCardMessages] = useState<Record<string, string>>({});
  const [bulkDeleting, setBulkDeleting] = useState('');

  // React doesn't type the folder-picker attribute, so set it directly.
  useEffect(() => {
    folderInputRef.current?.setAttribute('webkitdirectory', '');
  }, [adminStatus]);

  function reload() {
    if (!session) return;
    setLoading(true);
    fetch(`/api/admin/cards?email=${encodeURIComponent(session.email)}&session_token=${encodeURIComponent(session.session_token)}`)
      .then(r => r.json())
      .then(json => { if (json.error) setError(json.error); else setCards(json.cards ?? []); })
      .finally(() => setLoading(false));
  }

  useEffect(reload, [session]);

  async function runStorageSync(): Promise<string> {
    const res = await fetch('/api/admin/cards/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Sync failed');
    const parts = [`${json.inserted ?? 0} new`];
    if (json.removed) parts.push(`${json.removed} removed (file no longer in Storage)`);
    if (json.skipped?.length) parts.push(`${json.skipped.length} skipped (bad name): ${json.skipped.join(', ')}`);
    return `Refreshed ${json.synced} cards from Storage — ${parts.join(', ')}.`;
  }

  async function storageSync() {
    if (!session) return;
    setSyncing(true); setError(''); setSyncMessage('');
    try {
      setSyncMessage(await runStorageSync());
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSyncing(false);
    }
  }

  // Step 1: read the chosen folder's file names and ask the server what would change.
  async function planFolderSync(files: FileList | null) {
    if (!session || !files || files.length === 0) return;
    const byName = new Map<string, File>();
    for (const f of files) {
      if (f.name.startsWith('.') || !IMAGE_FILE.test(f.name)) continue;
      if (!byName.has(f.name)) byName.set(f.name, f);
    }
    if (folderInputRef.current) folderInputRef.current.value = '';
    if (byName.size === 0) { setError('No card images (.png/.jpg/.webp) found in that folder.'); return; }

    setPlanning(true); setError(''); setPlan(null); setFolderResult(null); setSyncMessage('');
    try {
      const res = await fetch('/api/admin/cards/folder-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, action: 'plan', file_names: [...byName.keys()] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not read the folder');
      setFolderFiles(byName);
      setPlan(json);
      setSupersedeChecked(new Set(json.toSupersede));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPlanning(false);
    }
  }

  // Step 2 (after the preview is confirmed): upload new files, add them to the library,
  // then move the ticked missing cards to Superseded.
  async function applyFolderSync() {
    if (!session || !plan) return;
    setError('');
    const failed: { name: string; error: string }[] = [];
    let uploaded = 0;

    for (const [i, name] of plan.toUpload.entries()) {
      setApplyProgress(`Uploading ${i + 1} of ${plan.toUpload.length}…`);
      const file = folderFiles.get(name);
      if (!file) continue;
      try {
        const res = await fetch('/api/admin/cards/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...session, file_name: name }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Upload failed');
        const { error: uploadError } = await supabaseBrowser.storage
          .from('cards')
          .uploadToSignedUrl(json.path, json.token, file, { contentType: file.type || undefined });
        if (uploadError) throw new Error(uploadError.message);
        uploaded++;
      } catch (err: unknown) {
        failed.push({ name, error: err instanceof Error ? err.message : 'Upload failed' });
      }
    }

    try {
      setApplyProgress('Adding new cards to the library…');
      await runStorageSync();

      let superseded = 0;
      if (supersedeChecked.size > 0) {
        setApplyProgress('Moving cards to Superseded…');
        const res = await fetch('/api/admin/cards/folder-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...session, action: 'apply', supersede: [...supersedeChecked] }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Could not move cards to Superseded');
        superseded = json.superseded ?? 0;
      }

      setFolderResult({ uploaded, superseded, failed });
      setPlan(null);
      setFolderFiles(new Map());
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setApplyProgress('');
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

  async function restore(card: Card) {
    if (!session) return;
    const res = await fetch(`/api/admin/cards/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...session, superseded: false }),
    });
    if (res.ok) setCards(prev => prev.map(c => c.id === card.id ? { ...c, superseded_at: null } : c));
    else setCardMessages(prev => ({ ...prev, [card.id]: 'Could not restore' }));
  }

  async function deleteForever(card: Card): Promise<boolean> {
    if (!session) return false;
    const res = await fetch(`/api/admin/cards/${card.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    if (res.ok) {
      setCards(prev => prev.filter(c => c.id !== card.id));
      return true;
    }
    const json = await res.json().catch(() => ({}));
    setCardMessages(prev => ({ ...prev, [card.id]: json.error || 'Could not delete' }));
    return false;
  }

  async function deleteOne(card: Card) {
    if (!confirm(`Delete ${card.file_name} forever? This can't be undone.`)) return;
    await deleteForever(card);
  }

  async function deleteAllSuperseded(list: Card[]) {
    if (!confirm(`Delete all ${list.length} superseded cards forever? Any still used by cards people have made will be kept. This can't be undone.`)) return;
    let deleted = 0;
    for (const [i, card] of list.entries()) {
      setBulkDeleting(`Deleting ${i + 1} of ${list.length}…`);
      if (await deleteForever(card)) deleted++;
    }
    setBulkDeleting('');
    const kept = list.length - deleted;
    setSyncMessage(`Deleted ${deleted} card${deleted === 1 ? '' : 's'}${kept ? ` — kept ${kept} still in use (marked below)` : ''}.`);
  }

  if (adminStatus !== 'admin') return <NotFound />;

  const libraryCards = cards.filter(c => !c.superseded_at);
  const supersededCards = cards.filter(c => c.superseded_at);
  const visibleCards = libraryCards.filter(c =>
    (showInactive || c.is_active) && (!categoryFilter || c.category === categoryFilter)
  );
  const categoriesInUse = [...new Set(libraryCards.map(c => c.category))];
  const cardByName = new Map(cards.map(c => [c.file_name, c]));
  const busy = planning || !!applyProgress || syncing || !!bulkDeleting;

  return (
    <div>
      <Nav onHome={() => { window.location.href = '/'; }} badge={null} />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 18px 80px', fontFamily: "'Nunito',sans-serif" }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2A2A2A', marginBottom: 4 }}>Card library</h1>
        <p style={{ color: '#7A7585', fontSize: '.85rem', marginBottom: 20, lineHeight: 1.5 }}>
          <strong>Sync from my folder</strong> makes the library match your card folder: new images are uploaded, and cards
          no longer in the folder move to Superseded (hidden from the picker; they only come back if you Restore them).
          You&apos;ll see a preview before anything changes.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, padding: '12px 14px', marginBottom: 12, flexWrap: 'wrap' }}>
          <input
            ref={folderInputRef} type="file" multiple
            onChange={e => planFolderSync(e.target.files)}
            style={{ display: 'none' }}
          />
          <button onClick={() => folderInputRef.current?.click()} disabled={busy} style={buttonStyle('#7C5CBF', busy)}>
            {planning ? 'Reading folder…' : '📁 Sync from my folder'}
          </button>
          <button onClick={storageSync} disabled={busy} style={{ ...outlineButton, padding: '9px 14px', fontSize: '.78rem' }}>
            {syncing ? 'Refreshing…' : '🔄 Refresh from Storage'}
          </button>
          {applyProgress && <span style={{ fontSize: '.8rem', color: '#7A7585', fontWeight: 700 }}>{applyProgress}</span>}
        </div>

        {error && <div style={{ color: ORANGE, fontWeight: 700, fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
        {syncMessage && <div style={{ fontSize: '.8rem', color: '#7A7585', fontWeight: 600, marginBottom: 12 }}>{syncMessage}</div>}

        {folderResult && (
          <div style={{ background: '#EEF8F1', border: '1.5px solid #BFE3CB', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: '.82rem', color: '#2F7A4C', fontWeight: 700 }}>
            ✓ Folder sync done — {folderResult.uploaded} uploaded, {folderResult.superseded} moved to Superseded.
            {folderResult.failed.length > 0 && (
              <div style={{ color: '#9A7A4A', fontWeight: 600, marginTop: 6 }}>
                Not uploaded ({folderResult.failed.length}):
                {folderResult.failed.map(f => <div key={f.name}>{f.name} — {f.error}</div>)}
              </div>
            )}
          </div>
        )}

        {plan && (
          <div style={{ background: '#fff', border: '2px solid #7C5CBF', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#2A2A2A', marginBottom: 10 }}>Preview — nothing has changed yet</div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: '.85rem', fontWeight: 700, color: '#2A2A2A', marginBottom: 12 }}>
              <span>⬆ {plan.toUpload.length} new to upload</span>
              <span>🗂 {supersedeChecked.size} of {plan.toSupersede.length} to Superseded</span>
              <span style={{ color: '#7A7585' }}>{plan.unchanged} unchanged</span>
            </div>

            {plan.toUpload.length > 0 && (
              <details style={{ marginBottom: 10, fontSize: '.78rem', color: '#7A7585' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Show the {plan.toUpload.length} new files</summary>
                <div style={{ marginTop: 6, columns: '2 260px' }}>{plan.toUpload.map(n => <div key={n}>{n}</div>)}</div>
              </details>
            )}

            {plan.toSupersede.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: '.78rem', color: '#7A7585', fontWeight: 700 }}>
                  Not in your folder — untick any you want to keep in the library:
                  <button style={outlineButton} onClick={() => setSupersedeChecked(new Set(plan.toSupersede))}>Tick all</button>
                  <button style={outlineButton} onClick={() => setSupersedeChecked(new Set())}>Untick all</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
                  {plan.toSupersede.map(name => {
                    const card = cardByName.get(name);
                    const checked = supersedeChecked.has(name);
                    return (
                      <label key={name} title={name} style={{ cursor: 'pointer', border: `2px solid ${checked ? '#7C5CBF' : '#E8E2F0'}`, borderRadius: 8, overflow: 'hidden', opacity: checked ? 1 : 0.5, background: '#fff' }}>
                        {card && <img src={card.image_url} alt="" style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', display: 'block' }} />}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 5px', fontSize: '.6rem', color: '#7A7585', fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          <input
                            type="checkbox" checked={checked}
                            onChange={() => setSupersedeChecked(prev => {
                              const next = new Set(prev);
                              if (next.has(name)) next.delete(name); else next.add(name);
                              return next;
                            })}
                          />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {plan.blockedSuperseded.length > 0 && (
              <div style={noticeStyle}>
                <strong>{plan.blockedSuperseded.length} in your folder are already superseded</strong> — they won&apos;t come back
                unless you Restore them in the Superseded tab: {plan.blockedSuperseded.join(', ')}
              </div>
            )}
            {plan.badNames.length > 0 && (
              <div style={noticeStyle}>
                <strong>{plan.badNames.length} won&apos;t be uploaded</strong> — the name doesn&apos;t match category_subcategory_style_01:{' '}
                {plan.badNames.join(', ')}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={applyFolderSync} disabled={busy || (plan.toUpload.length === 0 && supersedeChecked.size === 0)}
                style={buttonStyle(GREEN, busy)}
              >
                {applyProgress || 'Confirm sync'}
              </button>
              <button onClick={() => { setPlan(null); setFolderFiles(new Map()); }} disabled={!!applyProgress} style={{ ...outlineButton, padding: '9px 14px', fontSize: '.78rem' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, margin: '8px 0 16px', borderBottom: '2px solid #E8E2F0' }}>
          {(['library', 'superseded'] as const).map(t => (
            <button
              key={t} onClick={() => setTab(t)}
              style={{
                background: 'none', border: 'none', borderBottom: `3px solid ${tab === t ? '#7C5CBF' : 'transparent'}`,
                marginBottom: -2, padding: '8px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '.85rem',
                color: tab === t ? '#2A2A2A' : '#7A7585', cursor: 'pointer',
              }}
            >
              {t === 'library' ? `Library (${libraryCards.length})` : `Superseded (${supersededCards.length})`}
            </button>
          ))}
        </div>

        {tab === 'library' ? (
          <>
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
                {libraryCards.length === 0 ? 'No cards yet — hit Sync from my folder to add some.' : 'No cards match this filter.'}
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
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <p style={{ color: '#7A7585', fontSize: '.8rem', margin: 0, flex: 1, minWidth: 240, lineHeight: 1.5 }}>
                Hidden from the picker. Restore puts a card back in the library; Delete forever removes the image — unless
                cards people have already made still use it, in which case it&apos;s kept so they don&apos;t break.
              </p>
              {supersededCards.length > 0 && (
                <button onClick={() => deleteAllSuperseded(supersededCards)} disabled={busy} style={buttonStyle(ORANGE, busy)}>
                  {bulkDeleting || `Delete all ${supersededCards.length} forever`}
                </button>
              )}
            </div>
            {supersededCards.length === 0 ? (
              <div style={{ color: '#B0A8BC', fontWeight: 700 }}>Nothing superseded.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
                {supersededCards.map(card => (
                  <div key={card.id} style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, overflow: 'hidden' }}>
                    <img src={card.image_url} alt="" style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: '.62rem', color: '#7A7585', fontWeight: 700, wordBreak: 'break-all', marginBottom: 8 }}>{card.file_name}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => restore(card)} disabled={busy} style={{ ...outlineButton, flex: 1 }}>Restore</button>
                        <button onClick={() => deleteOne(card)} disabled={busy} style={{ ...outlineButton, flex: 1, color: ORANGE }}>Delete</button>
                      </div>
                      {cardMessages[card.id] && (
                        <div style={{ fontSize: '.62rem', color: '#9A7A4A', fontWeight: 700, marginTop: 6, lineHeight: 1.4 }}>{cardMessages[card.id]}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
