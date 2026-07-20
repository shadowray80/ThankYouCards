'use client';

import { useEffect, useState } from 'react';
import { useOrganiserSession } from '@/lib/useOrganiserSession';

interface BrandKit {
  id: string;
  name: string;
  card_palette: string;
  card_logo_url: string | null;
}

export function BrandKitPanel({
  cardPalette,
  logoUrl,
  onApply,
  children,
}: {
  cardPalette: string;
  logoUrl: string | null;
  onApply: (palette: string, logoUrl: string | null) => void;
  children: React.ReactNode;
}) {
  const { session } = useOrganiserSession();
  const [kits, setKits] = useState<BrandKit[]>([]);
  const [loadingKits, setLoadingKits] = useState(false);

  const [selectedKitId, setSelectedKitId] = useState('');
  const [savingName, setSavingName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!session) { setKits([]); setSelectedKitId(''); return; }
    setLoadingKits(true);
    fetch(`/api/brand-kits?email=${encodeURIComponent(session.email)}&session_token=${encodeURIComponent(session.session_token)}`)
      .then(r => r.json())
      .then(json => setKits(json.brandKits ?? []))
      .finally(() => setLoadingKits(false));
  }, [session]);

  function selectKit(id: string) {
    setSelectedKitId(id);
    const kit = kits.find(k => k.id === id);
    if (kit) onApply(kit.card_palette, kit.card_logo_url);
  }

  async function saveCurrentKit() {
    if (!session || !savingName?.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/brand-kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, name: savingName.trim(), card_palette: cardPalette, card_logo_url: logoUrl }),
      });
      const json = await res.json();
      if (res.ok) {
        setKits(prev => [...prev, json.brandKit]);
        setSelectedKitId(json.brandKit.id);
        setSavingName(null);
      }
    } finally {
      setSaving(false);
    }
  }

  async function removeSelectedKit() {
    if (!session || !selectedKitId) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/brand-kits/${selectedKitId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
      if (res.ok) {
        setKits(prev => prev.filter(k => k.id !== selectedKitId));
        setSelectedKitId('');
      }
    } finally {
      setRemoving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '2px solid #E8E2F0', borderRadius: 10, padding: '9px 11px',
    fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '.82rem', color: '#2A2A2A',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ marginTop: 14, background: '#F7F5FB', border: '1.5px solid #E8E2F0', borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>
        💾 Brand kit
      </div>

      {children}

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1.5px solid #E8E2F0' }}>
        {!session ? (
          <div style={{ fontSize: '.78rem', color: '#7A7585', fontWeight: 600, lineHeight: 1.5 }}>
            Log in from the menu above to save &amp; load your colour and logo for next time.
          </div>
        ) : (
          <>
            {loadingKits ? (
              <div style={{ fontSize: '.76rem', color: '#B0A8BC', fontWeight: 600 }}>Loading your saved kits…</div>
            ) : kits.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <select
                  value={selectedKitId}
                  onChange={e => selectKit(e.target.value)}
                  style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}
                >
                  <option value="">Pick a saved kit…</option>
                  {kits.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
                {selectedKitId && (
                  <button
                    onClick={removeSelectedKit} disabled={removing}
                    title="Remove this saved kit"
                    style={{ background: 'none', border: '2px solid #E8E2F0', borderRadius: 10, padding: '0 12px', color: '#7A7585', fontWeight: 800, fontSize: '.78rem', cursor: removing ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {savingName === null ? (
              <button
                onClick={() => setSavingName('')}
                style={{ background: 'none', border: '2px dashed #D4C8EE', borderRadius: 10, padding: '8px 12px', width: '100%', color: '#7C5CBF', fontWeight: 800, fontSize: '.78rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}
              >
                + Save current colour &amp; logo as a kit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={savingName} onChange={e => setSavingName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  autoFocus
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={saveCurrentKit} disabled={saving || !savingName.trim()}
                  style={{ background: '#7C5CBF', border: 'none', borderRadius: 10, padding: '9px 14px', color: '#fff', fontWeight: 800, fontSize: '.78rem', cursor: saving ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif", whiteSpace: 'nowrap' }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => setSavingName(null)}
                  style={{ background: 'none', border: 'none', color: '#B0A8BC', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
