'use client';

import { CardMessage } from '@/lib/themes';

const PASTEL_BG = ['#EAF4FB', '#FDF0E8', '#E8F5EF', '#F0ECFB', '#FBE8EE'];

interface ContribListProps {
  contribs: CardMessage[];
  pending: string[];
  onRemind: (name: string) => void;
}

export function ContribList({ contribs, pending, onRemind }: ContribListProps) {
  return (
    <div>
      {contribs.map((c, i) => {
        const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const bg = PASTEL_BG[i % PASTEL_BG.length];
        return (
          <div key={i} style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 13, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11, marginBottom: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{c.name}</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                {(c.msg || c.hw) && <span style={{ fontSize: '.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: 8, background: '#E8F5EF', color: '#5A9070' }}>✓ Message</span>}
                {(c.gift ?? 0) > 0 && <span style={{ fontSize: '.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: 8, background: '#FDF0E8', color: '#E8724A' }}>🎁 ${c.gift}</span>}
              </div>
            </div>
          </div>
        );
      })}

      {pending.length > 0 && (
        <>
          <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2A2A2A', margin: '20px 0 10px' }}>Haven't responded ({pending.length})</div>
          {pending.map((name, i) => (
            <div key={i} style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 13, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11, marginBottom: 8, opacity: .6 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#F0ECFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{name}</div>
                <div style={{ fontSize: '.74rem', color: '#7A7585', fontWeight: 600, marginTop: 2 }}>No message yet</div>
              </div>
              <button onClick={() => onRemind(name)} style={{ background: 'none', border: '2px solid #E8E2F0', borderRadius: 8, padding: '5px 10px', fontSize: '.72rem', color: '#7A7585', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", fontWeight: 700 }}>Remind</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
