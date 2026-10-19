'use client';

import { useState } from 'react';
import { SIGN_OFFS, DEFAULT_SIGN_OFF, SIGN_OFF_MAX } from '@/lib/signOff';

// The solo card's sign-off line ("Love from", "Lots of love"…): tap it and suggestion chips appear
// underneath, or just type anything. Left empty, the card says "From". (Our own chips rather than a
// <datalist>, which desktop Chrome only shows on double-click and phones show inconsistently.)
export function SignOffInput({ value, onChange, style, align = 'center' }: {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  align?: 'center' | 'left';
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder={`${DEFAULT_SIGN_OFF} ▾`}
        maxLength={SIGN_OFF_MAX}
        aria-label="Sign-off, like Love from"
        aria-expanded={open}
        style={{
          width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', background: 'transparent', textAlign: align,
          fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: '16px', color: '#7A7585', caretColor: '#3A8FA0',
          ...style,
        }}
      />
      {open && (
        // Inline chips, not a floating list: the builder's message panel clips anything that pops out.
        <div role="listbox" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: align === 'center' ? 'center' : 'flex-start', marginTop: 6 }}>
          {SIGN_OFFS.map(o => (
            <button
              key={o} type="button" role="option" aria-selected={value === o}
              // mousedown, not click: picking must happen before the field loses focus and closes the chips.
              onMouseDown={e => { e.preventDefault(); onChange(o); setOpen(false); (document.activeElement as HTMLElement | null)?.blur(); }}
              style={{
                background: value === o ? '#3A8FA0' : '#fff', color: value === o ? '#fff' : '#3A8FA0',
                border: `1.5px solid ${value === o ? '#3A8FA0' : '#E8E2F0'}`, borderRadius: 20, padding: '6px 12px', cursor: 'pointer',
                fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: '.85rem',
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
