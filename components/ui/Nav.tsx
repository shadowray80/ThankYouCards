'use client';

import { useState } from 'react';

interface NavProps {
  onHome: () => void;
  onNav?: (view: string) => void;
  badge?: string | null;
}

const DEV_VIEWS = [
  { label: '🏠 Home',        view: 'home' },
  { label: '📨 Solo Card',   view: 'solo' },
  { label: '👥 Group Card',  view: 'group' },
  { label: '✍️ Contributor', view: 'contrib' },
  { label: '📊 Dashboard',   view: 'dash' },
  { label: '🎴 Card View',   view: 'card' },
];

export function Nav({ onHome, onNav, badge }: NavProps) {
  const [devOpen, setDevOpen] = useState(false);

  return (
    <div style={{ background: '#fff', position: 'sticky', top: 0, zIndex: 200, borderBottom: '1px solid #E8E2F0', boxShadow: '0 2px 12px rgba(60,50,100,.06)' }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={onHome} style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#3A8FA0', cursor: 'pointer', letterSpacing: '-.01em' }}>
          thank<span style={{ color: '#E8724A' }}>you</span>cards<span style={{ color: '#7A7585', fontWeight: 600, fontSize: '.9rem' }}>.au</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {badge && (
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: badge === 'group' ? '#E8724A' : '#7A7585' }}>
              {badge === 'group' ? 'Group card' : 'Solo card'}
            </div>
          )}
          {onNav && (
            <button
              onClick={() => setDevOpen(o => !o)}
              style={{ background: 'none', border: '1.5px dashed #B0A8BC', borderRadius: 8, padding: '5px 10px', fontSize: '.72rem', color: '#B0A8BC', fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}
            >
              {devOpen ? '✕' : '🛠'}
            </button>
          )}
        </div>
      </div>

      {devOpen && onNav && (
        <div style={{ background: '#F7F5FB', borderTop: '1px dashed #D1C8DC', padding: '12px 20px 14px' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#B0A8BC', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>Dev — jump to view</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {DEV_VIEWS.map(item => (
              <button
                key={item.view}
                onClick={() => { onNav(item.view); setDevOpen(false); }}
                style={{
                  background: '#fff', border: '1.5px solid #E8E2F0', borderRadius: 8,
                  padding: '7px 12px', cursor: 'pointer',
                  fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '.8rem', color: '#2A2A2A',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
