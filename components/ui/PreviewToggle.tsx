'use client';

export function PreviewToggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute', top: 14, left: 14, zIndex: 5,
        display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        borderRadius: 20, padding: '6px 10px 6px 8px',
      }}
      title={active ? 'Back to editing' : 'Preview how your recipient will see this'}
    >
      <div style={{
        width: 28, height: 16, borderRadius: 10, position: 'relative', flexShrink: 0,
        background: active ? '#4CAF82' : 'rgba(255,255,255,.35)', transition: 'background .2s',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: active ? 14 : 2, width: 12, height: 12,
          borderRadius: '50%', background: '#fff', transition: 'left .2s',
        }} />
      </div>
      <span style={{ fontSize: '.66rem', fontWeight: 800, color: '#fff', fontFamily: "'Nunito',sans-serif" }}>
        👀 Preview
      </span>
    </div>
  );
}
