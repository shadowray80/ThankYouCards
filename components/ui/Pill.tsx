import React from 'react';

interface PillProps {
  children: React.ReactNode;
  variant?: 'teal' | 'coral';
}

export function Pill({ children, variant = 'teal' }: PillProps) {
  const styles: Record<string, React.CSSProperties> = {
    teal:  { background: '#EAF4FB', color: '#3A8FA0', border: '1.5px solid rgba(58,143,160,.25)' },
    coral: { background: '#FDF0E8', color: '#E8724A', border: '1.5px solid rgba(232,114,74,.25)' },
  };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 20, padding: '5px 13px', fontSize: '.76rem', fontWeight: 800, marginBottom: 16, ...styles[variant] }}>
      {children}
    </div>
  );
}
