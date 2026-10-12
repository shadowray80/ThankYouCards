'use client';

import { useState } from 'react';
import { toBlob } from 'html-to-image';

// Under a received card: "Print card" (the printable A5 card page) and "Save to Photos"
// (the whole card, as seen on screen, saved as one long picture).
//
// Saving is two taps on phones: the first builds the image, the second opens the share sheet
// ("Save Image" → Photos). Phones only allow the share sheet straight after a tap, and building
// a long image can take a few seconds, so it can't happen in one go.

const MAX_PIXELS = 16_000_000; // stay under phone browsers' canvas size limits

const buttonStyle: React.CSSProperties = {
  background: '#fff', border: '2px solid #E8E2F0', borderRadius: 12, padding: '11px 18px', fontFamily: "'Nunito',sans-serif",
  fontWeight: 800, fontSize: '.85rem', color: '#3A8FA0', cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
};

export function KeepsakeButtons({ slug, preview, getCardElement, fileName, style }: {
  style?: React.CSSProperties;
  slug: string;
  preview?: boolean;
  getCardElement: () => HTMLElement | null;
  fileName: string;
}) {
  const [state, setState] = useState<'idle' | 'preparing' | 'ready' | 'error'>('idle');
  const [file, setFile] = useState<File | null>(null);

  async function prepare() {
    const el = getCardElement();
    if (!el) return;
    setState('preparing');
    try {
      const { width, height } = el.getBoundingClientRect();
      const pixelRatio = Math.min(2, Math.sqrt(MAX_PIXELS / (width * height)));
      const blob = await toBlob(el, {
        pixelRatio,
        backgroundColor: '#ffffff',
        cacheBust: true,
        filter: node => !(node instanceof HTMLElement && node.classList.contains('tyc-print-hide')),
      });
      if (!blob) throw new Error('No image');
      const f = new File([blob], `${fileName}.png`, { type: 'image/png' });
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
    } catch {
      // Cancelled, or sharing refused — fall back to a normal download.
      download(file);
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
