'use client';

const STEP_LABELS = ['Choose Theme', 'Your Message', 'Preview', 'Download', 'Card Details', 'Share'];

interface ProgressDotsProps {
  total: number;
  current: number;
  variant?: 'teal' | 'coral';
}

export function ProgressDots({ total, current, variant = 'teal' }: ProgressDotsProps) {
  return (
    <div style={{ background: variant === 'teal' ? '#3A8FA0' : '#E8724A', padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i + 1 === current ? 10 : 7,
          height: i + 1 === current ? 10 : 7,
          borderRadius: '50%',
          background: i + 1 === current ? '#fff' : i + 1 < current ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.2)',
          transition: 'all .3s',
        }} />
      ))}
      <span style={{ color: 'rgba(255,255,255,.55)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginLeft: 8 }}>
        {STEP_LABELS[current - 1]}
      </span>
    </div>
  );
}
