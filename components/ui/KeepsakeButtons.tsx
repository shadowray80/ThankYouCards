'use client';

import { useState } from 'react';
import { UiIcon } from '@/components/dashboard/DashboardParts';
import { TintedIcon } from '@/components/ui/TintedIcon';

// Under a card: "Print card" (the print page) and "Save to Photos" (the whole card as one long
// picture). The picture is made by the website's server — phones can't be trusted to draw it
// (iPhone Safari drops photos and fonts).
//
// Saving is two taps on phones: the first fetches the picture, the second opens the share
// sheet ("Save Image" → Photos). Phones only allow the share sheet straight after a tap, and
// making the picture takes a few seconds, so it can't happen in one go.
//
// `locked`: an unpaid group card — the buttons show but don't work until the card is sent
// (the server refuses those exports too). `openHref` (dashboard row layout) adds an
// "Open full preview" button in front.

const TEAL = '#3A8FA0';

const buttonStyle: React.CSSProperties = {
  background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, padding: '11px 18px', fontFamily: "'Nunito',sans-serif",
  fontWeight: 800, fontSize: '.85rem', color: TEAL, cursor: 'pointer', textDecoration: 'none',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
};

export function KeepsakeButtons({ slug, preview, style, locked = false, openHref }: {
  slug: string;
  preview?: boolean;
  style?: React.CSSProperties;
  locked?: boolean;
  openHref?: string;
}) {
  const [state, setState] = useState<'idle' | 'preparing' | 'ready' | 'error'>('idle');
  const [file, setFile] = useState<File | null>(null);
  const query = new URLSearchParams({ slug, ...(preview ? { preview: '1' } : {}) }).toString();
  const row = !!openHref;

  async function prepare() {
    setState('preparing');
    try {
      const res = await fetch(`/api/render/image?${query}`);
      if (!res.ok) throw new Error('Render failed');
      const f = new File([await res.blob()], `thankyoucards-${slug}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [f] })) {
        setFile(f);
        setState('ready');
      } else {
        download(f);
        setState('idle');
      }
    } catch {
      setState('error');
    }
  }

  function download(f: File) {
    const url = URL.createObjectURL(f);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  async function share() {
    if (!file) return;
    try {
      await navigator.share({ files: [file] });
    } catch (err) {
      // Cancelled by the person: do nothing. Sharing refused: fall back to a normal download.
      if (!(err instanceof DOMException && err.name === 'AbortError')) download(file);
    }
    setState('idle');
    setFile(null);
  }

  const rowButton: React.CSSProperties = row
    ? { ...buttonStyle, flexDirection: 'column', padding: '9px 4px', fontSize: '.74rem', borderRadius: 12, gap: 4, minWidth: 0, textAlign: 'center', lineHeight: 1.2 }
    : buttonStyle;
  const lockedStyle: React.CSSProperties = { ...rowButton, color: '#B0A8BC', cursor: 'default', background: '#FAF9FC' };
  const lockIcon = <UiIcon name="lock" size={row ? 18 : 15} />;

  const printButton = locked
    ? <span style={lockedStyle} title="Unlocks when you send the card">{lockIcon}Print card</span>
    : <a href={`/print/${slug}${preview ? '?preview=1' : ''}`} style={rowButton}>{row && <UiIcon name="print" size={18} />}Print card</a>;

  const saveButton = locked
    ? <span style={lockedStyle} title="Unlocks when you send the card">{lockIcon}Save to Photos</span>
    : state === 'ready'
      ? <button onClick={share} style={{ ...rowButton, background: TEAL, borderColor: TEAL, color: '#fff' }}>Tap to save to Photos</button>
      : (
        <button onClick={prepare} disabled={state === 'preparing'} style={{ ...rowButton, cursor: state === 'preparing' ? 'default' : 'pointer' }}>
          {row && state === 'idle' && <TintedIcon src="/Icons/image.png" size={19} color={TEAL} />}
          {state === 'preparing' ? 'Preparing…' : state === 'error' ? 'Couldn’t save — try again' : 'Save to Photos'}
        </button>
      );

  return (
    <div className="tyc-print-hide" style={row ? style : { maxWidth: 480, margin: '0 auto', padding: '0 14px 32px', ...style }}>
      <div style={row
        ? { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }
        : { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {row && <a href={openHref} target="_blank" rel="noopener noreferrer" style={rowButton}><UiIcon name="open" size={18} />Open full preview</a>}
        {printButton}
        {saveButton}
      </div>
      {locked && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, fontSize: '.74rem', fontWeight: 700, color: '#9A93A8', fontFamily: "'Nunito',sans-serif" }}>
          <UiIcon name="lock" size={13} />Unlocks when you send the card
        </div>
      )}
    </div>
  );
}
