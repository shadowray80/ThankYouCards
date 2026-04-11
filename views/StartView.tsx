'use client';

import { Nav } from '@/components/ui/Nav';
import { BackBtn } from '@/components/ui/BackBtn';

interface StartViewProps {
  onSolo: () => void;
  onGroup: () => void;
  onBack: () => void;
}

export function StartView({ onSolo, onGroup, onBack }: StartViewProps) {
  return (
    <div>
      <Nav onHome={onBack} />
      <div style={{ padding: '22px 18px 60px', maxWidth: 480, margin: '0 auto' }}>
        <BackBtn onClick={onBack} />
        <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#2A2A2A', marginBottom: 5 }}>What kind of card?</h2>
        <p style={{ color: '#7A7585', fontSize: '.88rem', marginBottom: 22, lineHeight: 1.6, fontWeight: 600 }}>Just saying thanks, or organising a group?</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
          {[
            { icon: '📨', title: 'Solo card', desc: 'From you, to someone special. Quick and personal.', onClick: onSolo, color: '#3A8FA0', bg: '#EAF4FB', border: '#3A8FA0' },
            { icon: '👥', title: 'Group card', desc: "Everyone adds a message and chips in. We handle the chasing.", onClick: onGroup, color: '#E8724A', bg: '#FDF0E8', border: '#E8724A' },
          ].map((c, i) => (
            <div
              key={i}
              onClick={c.onClick}
              style={{ borderRadius: 18, padding: '22px 16px', border: '2.5px solid #E8E2F0', cursor: 'pointer', textAlign: 'center', background: '#fff', transition: 'all .25s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = c.border; (e.currentTarget as HTMLDivElement).style.background = c.bg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E8E2F0'; (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
            >
              <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 5, color: c.color }}>{c.title}</div>
              <div style={{ fontSize: '.78rem', color: '#7A7585', lineHeight: 1.4, fontWeight: 600 }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#FDF0E8', borderRadius: 14, padding: '14px 16px', fontSize: '.84rem', color: '#E8724A', fontWeight: 700, textAlign: 'center' }}>
          💡 Group card is <strong>free for the organiser</strong> — covered by contributions
        </div>
      </div>
    </div>
  );
}
