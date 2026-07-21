'use client';

import { useState } from 'react';

interface MoreMenuProps {
  code: string;
  onCodeChange: (v: string) => void;
  onSubmit: () => void;
}

export function MoreMenu({ code, onCodeChange, onSubmit }: MoreMenuProps) {
  const [open, setOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);

  function toggle() {
    setOpen(v => !v);
    setShowCode(false);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={toggle}
        style={{
          background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 20,
          padding: '6px 12px', color: '#7A7585', fontWeight: 800, fontSize: '.78rem',
          cursor: 'pointer', fontFamily: "'Nunito',sans-serif",
        }}
      >
        ☰ More
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 299 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 260, zIndex: 300,
            background: '#fff', border: '1.5px solid #E8E2F0', borderRadius: 14,
            padding: 14, boxShadow: '0 8px 32px rgba(60,50,100,.18)',
          }}>
            {!showCode ? (
              <button
                onClick={() => setShowCode(true)}
                style={{
                  width: '100%', textAlign: 'left', background: 'none', border: 'none',
                  padding: '8px 4px', fontWeight: 800, fontSize: '.85rem', color: '#2A2A2A',
                  cursor: 'pointer', fontFamily: "'Nunito',sans-serif", display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                📬 Got a card code?
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowCode(false)}
                  style={{ background: 'none', border: 'none', color: '#7A7585', fontWeight: 700, fontSize: '.72rem', cursor: 'pointer', marginBottom: 8, padding: 0, fontFamily: "'Nunito',sans-serif" }}
                >
                  ← Back
                </button>
                <div style={{ fontSize: '.78rem', color: '#7A7585', fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>
                  Someone shared a card with you — enter the code to add your message.
                </div>
                <input
                  value={code}
                  onChange={e => onCodeChange(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onSubmit()}
                  placeholder="e.g. timbo-mpera"
                  autoFocus
                  style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 10, padding: '9px 11px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '.85rem', color: '#2A2A2A', background: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                />
                <button
                  onClick={onSubmit}
                  disabled={!code.trim()}
                  style={{ width: '100%', background: code.trim() ? '#3A8FA0' : '#E8E2F0', border: 'none', borderRadius: 10, padding: '9px', color: code.trim() ? '#fff' : '#B0A8BC', fontWeight: 800, fontSize: '.78rem', cursor: code.trim() ? 'pointer' : 'default', fontFamily: "'Nunito',sans-serif" }}
                >
                  Go →
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
