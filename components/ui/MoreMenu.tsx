'use client';

import { useState } from 'react';
import { LineIcon } from '@/components/ui/LineIcon';

// Each item is a full-width row with a comfortable tap height, an icon, and a thin divider.
const itemStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', textAlign: 'left', background: 'none', border: 'none',
  padding: '15px 18px', fontWeight: 800, fontSize: '1rem', color: '#2A2A2A', textDecoration: 'none',
  cursor: 'pointer', fontFamily: "'Nunito',sans-serif", display: 'flex', alignItems: 'center', gap: 14,
};
const MENU_CSS = `
.tyc-more-item:hover, .tyc-more-item:active { background: #F3F1F7 !important; }
.tyc-more-item + .tyc-more-item { border-top: 1px solid #F0ECF5 !important; }
`;

// The site-wide "More" menu (in the top bar on every page): Organiser view, card code, contact.
export function MoreMenu() {
  const [open, setOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('');

  // "Got a card code?" — accepts an organiser link/token or a contributor link/slug.
  async function goToCard() {
    const raw = code.trim();

    // Organiser manage link — full URL or path
    const manageMatch = raw.match(/\/manage\/([^?#]+)(\?[^#]*)?/);
    if (manageMatch) {
      window.location.href = `/manage/${manageMatch[1]}${manageMatch[2] ?? ''}`;
      return;
    }

    // Bare organiser token — long alphanumeric, no slashes
    if (/^[a-z0-9]{15,}$/i.test(raw)) {
      const res = await fetch(`/api/manage?token=${raw}`);
      if (res.ok) {
        const json = await res.json();
        window.location.href = `/manage/${json.slug}?token=${raw}`;
        return;
      }
    }

    // Contributor card link — full URL or just slug
    let slug = raw.toLowerCase();
    const cardMatch = slug.match(/\/card\/([^/?#]+)/);
    if (cardMatch) slug = cardMatch[1];
    if (!slug) return;
    window.location.href = `/card/${slug}`;
  }

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
          cursor: 'pointer', fontFamily: "'Nunito',sans-serif", whiteSpace: 'nowrap',
        }}
      >
        ☰ More
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 299 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 280, maxWidth: 'calc(100vw - 32px)', zIndex: 300,
            background: '#fff', border: '1.5px solid #E8E2F0', borderRadius: 16,
            padding: showCode ? 16 : 0, overflow: 'hidden', boxShadow: '0 8px 32px rgba(60,50,100,.18)', boxSizing: 'border-box',
          }}>
            <style>{MENU_CSS}</style>
            {!showCode ? (
              <>
                <a href="/organiser" className="tyc-more-item" style={itemStyle}>
                  <LineIcon name="people" size={26} />Organiser view
                </a>
                <button onClick={() => setShowCode(true)} className="tyc-more-item" style={itemStyle}>
                  <LineIcon name="written" size={26} />Got a card code?
                </button>
                <a href="/contact" className="tyc-more-item" style={itemStyle}>
                  <LineIcon name="Mail" size={26} />Contact us
                </a>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowCode(false)}
                  style={{ background: 'none', border: 'none', color: '#7A7585', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer', marginBottom: 10, padding: '4px 0', fontFamily: "'Nunito',sans-serif" }}
                >
                  Back
                </button>
                <div style={{ fontSize: '.92rem', color: '#5A5566', fontWeight: 600, marginBottom: 10, lineHeight: 1.45 }}>
                  Someone shared a card with you? Enter the code to add your message.
                </div>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && goToCard()}
                  placeholder="e.g. timbo-mpera"
                  autoFocus
                  style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 10, padding: '11px 12px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '16px', color: '#2A2A2A', background: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                />
                <button
                  onClick={goToCard}
                  disabled={!code.trim()}
                  style={{ width: '100%', background: code.trim() ? '#3A8FA0' : '#E8E2F0', border: 'none', borderRadius: 10, padding: '12px', color: code.trim() ? '#fff' : '#B0A8BC', fontWeight: 800, fontSize: '.95rem', cursor: code.trim() ? 'pointer' : 'default', fontFamily: "'Nunito',sans-serif" }}
                >
                  Go
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
