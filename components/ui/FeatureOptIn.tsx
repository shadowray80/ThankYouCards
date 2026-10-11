'use client';

// "Happy for us to feature this card?" opt-in. Unticked by default — only cards whose
// sender ticks this reach the admin customer-card showcase, and only their cover is used.
export function FeatureOptIn({ checked, onChange, compact = false }: {
  checked: boolean;
  onChange: (next: boolean) => void;
  compact?: boolean;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", textAlign: 'left' }}>
      <input
        type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: '#3A8FA0', cursor: 'pointer' }}
      />
      <span style={{ fontSize: compact ? '.72rem' : '.78rem', color: '#7A7585', fontWeight: 600, lineHeight: 1.4 }}>
        Happy for us to feature this card&apos;s cover on our website and Instagram? Messages are never shared.
      </span>
    </label>
  );
}
