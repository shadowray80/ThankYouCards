'use client';

interface BackBtnProps {
  onClick: () => void;
}

export function BackBtn({ onClick }: BackBtnProps) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: '#7A7585', fontFamily: "'Nunito',sans-serif", fontSize: '.86rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 18, padding: '8px 0', transition: 'color .2s' }}>
      ← Back
    </button>
  );
}
