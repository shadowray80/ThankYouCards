'use client';

import { LoginMenu } from './LoginMenu';
import { MoreMenu } from './MoreMenu';

interface NavProps {
  onHome: () => void;
  onNav?: (view: string) => void;
  badge?: string | null;
}

export function Nav({ onHome, badge }: NavProps) {
  return (
    <div style={{ background: '#fff', position: 'sticky', top: 0, zIndex: 200, borderBottom: '1px solid #E8E2F0', boxShadow: '0 2px 12px rgba(60,50,100,.06)' }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div onClick={onHome} style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#3A8FA0', cursor: 'pointer', letterSpacing: '-.01em', whiteSpace: 'nowrap' }}>
          thank<span style={{ color: '#E8724A' }}>you</span>cards<span style={{ color: '#7A7585', fontWeight: 600, fontSize: '.9rem' }}>.au</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {badge && (
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: badge === 'group' ? '#E8724A' : '#7A7585' }}>
              {badge === 'group' ? 'Group card' : 'Solo card'}
            </div>
          )}
          <LoginMenu />
          <MoreMenu />
        </div>
      </div>
    </div>
  );
}
