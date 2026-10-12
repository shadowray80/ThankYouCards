'use client';

import { TintedIcon } from '@/components/ui/TintedIcon';

// The two buttons either side of "Browse designs" under a card cover (solo and Classic group
// builders): [Image only] … [camera]. Shared so both builders look and behave exactly the same.

export function ImageOnlyButton({ imageOnly, onToggle }: { imageOnly: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        height: 36, borderRadius: 18, padding: '0 14px', cursor: 'pointer',
        background: '#DDD6E6', color: '#5A5566', boxShadow: '0 2px 8px rgba(0,0,0,.15)',
        display: 'grid', alignItems: 'center', justifyItems: 'center',
        fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 'clamp(.74rem, 3.2vw, .85rem)', whiteSpace: 'nowrap',
      }}
      title={imageOnly ? 'Show the name and message on the card' : 'Hide all text on the card'}
    >
      {/* Both labels share one grid cell so the pill is always as wide as the longer
          one — toggling never resizes it or shifts the neighbouring buttons. */}
      <span style={{ gridArea: '1 / 1', visibility: imageOnly ? 'hidden' : 'visible' }}>Image only</span>
      <span style={{ gridArea: '1 / 1', visibility: imageOnly ? 'visible' : 'hidden' }}>Show text</span>
    </div>
  );
}

// Tap to upload your own photo; once one is in, tap again (✕) to go back to the library card.
export function PhotoButton({ hasPhoto, uploading, onAdd, onRemove }: {
  hasPhoto: boolean;
  uploading: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      onClick={() => uploading ? undefined : hasPhoto ? onRemove() : onAdd()}
      style={{
        width: 36, height: 36, borderRadius: '50%', cursor: uploading ? 'default' : 'pointer',
        background: hasPhoto ? '#E8724A' : '#DDD6E6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: uploading ? '.7rem' : '1rem', boxShadow: '0 2px 8px rgba(0,0,0,.15)',
        transition: 'background .2s', color: hasPhoto ? '#fff' : '#5A5566', fontWeight: 800,
      }}
      title={uploading ? 'Uploading…' : hasPhoto ? 'Remove your photo' : 'Use your own photo'}
    >
      {uploading ? '…' : hasPhoto ? '✕' : <TintedIcon src="/Icons/Camera2.png" size={22} color="#5A5566" />}
    </div>
  );
}
