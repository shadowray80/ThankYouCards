'use client';

import { COVER_FONTS, COVER_COLOURS, strokeColourFor, type CoverTextStyle } from '@/lib/coverText';

// "Aa" in the cover toolbar (next to the camera): opens the cover text picker below.
export function CoverTextButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      title="Font and colour"
      style={{
        width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
        background: open ? '#3A8FA0' : '#DDD6E6', color: open ? '#fff' : '#5A5566',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.15)',
        fontFamily: 'Georgia, var(--font-gelasio), serif', fontWeight: 700, fontSize: '1rem', transition: 'background .2s',
      }}
    >
      Aa
    </div>
  );
}

// Fonts (each shown in itself), colours, and the outline switch. Changes show on the cover at once.
export function CoverTextPicker({ value, onChange }: { value: CoverTextStyle; onChange: (next: CoverTextStyle) => void }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #E8E2F0', borderRadius: 14, padding: '12px', margin: '8px 0', fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
        {COVER_FONTS.map(f => {
          const active = value.font === f.id;
          return (
            <button
              key={f.id} type="button" aria-pressed={active}
              // Meme without an outline isn't a meme: picking it switches the outline on.
              onClick={() => onChange({ ...value, font: f.id, stroke: f.id === 'meme' ? true : value.stroke })}
              style={{
                height: 40, borderRadius: 10, cursor: 'pointer',
                border: `2px solid ${active ? '#3A8FA0' : '#E8E2F0'}`, background: active ? '#EAF4FB' : '#FFFDF8',
                fontFamily: f.family, fontWeight: f.weight, fontSize: `${(f.id === 'script' ? 1.25 : 1.1) * (f.upper ? 0.85 : 1)}rem`,
                textTransform: f.upper ? 'uppercase' : undefined, letterSpacing: f.letterSpacing, color: '#2A2A2A', lineHeight: 1,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 7, flex: 1, flexWrap: 'wrap' }}>
          {COVER_COLOURS.map(c => {
            const active = value.color === c.id;
            return (
              <button
                key={c.id} type="button" aria-label={c.label} aria-pressed={active} title={c.label}
                onClick={() => onChange({ ...value, color: c.id })}
                style={{
                  width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', background: c.id, padding: 0,
                  border: c.id === '#FFFFFF' ? '1.5px solid #D1C8DC' : 'none',
                  boxShadow: active ? '0 0 0 2px #fff, 0 0 0 4px #3A8FA0' : undefined,
                }}
              />
            );
          })}
        </div>
        <button
          type="button" aria-pressed={value.stroke}
          onClick={() => onChange({ ...value, stroke: !value.stroke })}
          title="An outline makes the text stand out on busy photos"
          style={{
            height: 34, padding: '0 12px', borderRadius: 17, cursor: 'pointer', flexShrink: 0,
            border: `2px solid ${value.stroke ? '#3A8FA0' : '#E8E2F0'}`, background: value.stroke ? '#EAF4FB' : '#fff',
            display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '.78rem', color: '#2A2A2A',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-nunito), sans-serif', fontWeight: 900, fontSize: '1rem', color: value.color,
            WebkitTextStroke: `.09em ${strokeColourFor(value.color)}`, paintOrder: 'stroke fill',
          }}>A</span>
          Outline
        </button>
      </div>
    </div>
  );
}
