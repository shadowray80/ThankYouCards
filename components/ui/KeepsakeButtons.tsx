'use client';

import { useState } from 'react';

// Under a card: "Print card" (the print page) and "Save to Photos" (the whole card as one long
// picture). The picture is made by the website's server — phones can't be trusted to draw it
// (iPhone Safari drops photos and fonts).
//
// Saving is two taps on phones: the first fetches the picture, the second opens the share
// sheet ("Save Image" → Photos). Phones only allow the share sheet straight after a tap, and
// making the picture takes a few seconds, so it can't happen in one go.

const buttonStyle: React.CSSProperties = {
  background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, padding: '11px 18px', fontFamily: "'Nunito',sans-serif",
  fontWeight: 800, fontSize: '.85rem', color: '#3A8FA0', cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
};

export function KeepsakeButtons({ slug, preview, style }: {
  slug: string;
  preview?: boolean;
  style?: React.CSSProperties;
}) {
  const [state, setState] = useState<'idle' | 'preparing' | 'ready' | 'error'>('idle');
  const [file, setFile] = useState<File | null>(null);
  const query = new URLSearchParams({ slug, ...(preview ? { preview: '1' } : {}) }).toString();

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

  return (
    <div className="tyc-print-hide" style={{ maxWidth: 480, margin: '0 auto', padding: '0 14px 32px', display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', ...style }}>
      <a href={`/print/${slug}${preview ? '?preview=1' : ''}`} style={buttonStyle}>Print card</a>
      {state === 'ready' ? (
        <button onClick={share} style={{ ...buttonStyle, background: '#3A8FA0', borderColor: '#3A8FA0', color: '#fff' }}>Tap to save to Photos</button>
      ) : (
        <button onClick={prepare} disabled={state === 'preparing'} style={{ ...buttonStyle, cursor: state === 'preparing' ? 'default' : 'pointer' }}>
          {state === 'preparing' ? 'Preparing…' : state === 'error' ? 'Couldn’t save — try again' : 'Save to Photos'}
        </button>
      )}
    </div>
  );
}
