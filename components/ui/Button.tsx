'use client';

import React from 'react';

interface BtnProps {
  children: React.ReactNode;
  variant?: 'teal' | 'coral' | 'ghost' | 'outline' | 'gold';
  full?: boolean;
  sm?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Btn({ children, variant = 'teal', full = false, sm = false, disabled = false, onClick, style: extraStyle = {} }: BtnProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 7, border: 'none', borderRadius: 14, fontFamily: "'Nunito',sans-serif",
    fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all .2s', textDecoration: 'none', lineHeight: 1,
    width: full ? '100%' : 'auto',
    padding: sm ? '9px 16px' : '14px 22px',
    fontSize: sm ? '.82rem' : '.95rem',
    marginTop: full ? 14 : 0,
    opacity: disabled ? 0.5 : 1,
    ...extraStyle,
  };
  const variants: Record<string, React.CSSProperties> = {
    teal:    { background: '#3A8FA0', color: '#fff' },
    coral:   { background: '#E8724A', color: '#fff' },
    ghost:   { background: 'transparent', color: '#3A8FA0', border: '2px solid #3A8FA0' },
    outline: { background: 'transparent', color: '#7A7585', border: '2px solid #E8E2F0' },
    gold:    { background: 'linear-gradient(135deg,#C9933A,#E8B865)', color: '#fff' },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
