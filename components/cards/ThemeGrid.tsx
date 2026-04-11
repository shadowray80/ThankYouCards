'use client';

import { THEMES } from '@/lib/themes';

interface ThemeGridProps {
  selected: number | null;
  onSelect: (index: number) => void;
}

export function ThemeGrid({ selected, onSelect }: ThemeGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
      {THEMES.map((t, i) => (
        <div key={t.id} onClick={() => onSelect(i)} style={{
          borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
          border: selected === i ? '3px solid #3A8FA0' : '3px solid transparent',
          boxShadow: selected === i ? '0 0 0 2px rgba(58,143,160,.4)' : 'none',
          position: 'relative', aspectRatio: '4/3', background: t.color,
          transition: 'all .25s',
        }}>
          <img src={t.imgs[0]} alt={t.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,.75))', padding: '24px 10px 10px' }}>
            <div style={{ color: '#fff', fontSize: '.73rem', fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>{t.name}</div>
          </div>
          <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '1.2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.5))' }}>{t.emoji}</div>
          {selected === i && (
            <div style={{ position: 'absolute', top: 8, left: 8, background: '#3A8FA0', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 800 }}>✓</div>
          )}
        </div>
      ))}
    </div>
  );
}
