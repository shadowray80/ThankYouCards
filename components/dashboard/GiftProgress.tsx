interface GiftProgressProps {
  raised: number;
  target: number;
}

export function GiftProgress({ raised, target }: GiftProgressProps) {
  const pct = Math.min(100, Math.round((raised / target) * 100));
  return (
    <div style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 14, padding: 18, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 800, fontSize: '.9rem' }}>🎁 Gift fund</div>
        <div style={{ fontSize: '.82rem', color: '#7A7585', fontWeight: 700 }}>${raised} of ${target}</div>
      </div>
      <div style={{ background: '#E8E2F0', borderRadius: 8, height: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#E8724A,#F09070)', borderRadius: 8, transition: 'width .5s ease' }} />
      </div>
      <div style={{ fontSize: '.74rem', color: '#7A7585', marginTop: 6, fontWeight: 600 }}>8 people have contributed so far</div>
    </div>
  );
}
