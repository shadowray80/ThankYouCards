'use client';

import { THEMES } from '@/lib/themes';

interface ImageSwiperProps {
  themeIdx: number | null;
  selected: number;
  onSelect: (index: number) => void;
}

export function ImageSwiper({ themeIdx, selected, onSelect }: ImageSwiperProps) {
  if (themeIdx === null) return null;
  const theme = THEMES[themeIdx];
  return (
    <div style={{ marginTop: 14, background: '#EAF4FB', borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: '.76rem', fontWeight: 800, color: '#3A8FA0', marginBottom: 8, letterSpacing: '.04em', textTransform: 'uppercase' }}>Pick an image</div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {theme.imgs.map((url, j) => (
          <div key={j} onClick={() => onSelect(j)} style={{
            flexShrink: 0, width: 88, height: 66, borderRadius: 9, overflow: 'hidden',
            cursor: 'pointer', border: selected === j ? '3px solid #3A8FA0' : '3px solid transparent',
            transition: 'all .2s', position: 'relative',
          }}>
            <img src={url} alt={`option ${j + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {selected === j && (
              <div style={{ position: 'absolute', bottom: 3, right: 3, background: '#3A8FA0', color: '#fff', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', fontWeight: 800 }}>✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
