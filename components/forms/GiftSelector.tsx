'use client';

interface GiftSelectorProps {
  selected: string | null;
  onSelect: (amount: string) => void;
  custom: string;
  onCustom: (value: string) => void;
}

export function GiftSelector({ selected, onSelect, custom, onCustom }: GiftSelectorProps) {
  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {['5', '10', '20', '50'].map(amt => (
          <button key={amt} onClick={() => onSelect(amt)} style={{
            padding: '10px 18px', border: selected === amt ? '2px solid #E8724A' : '2px solid #E8E2F0',
            borderRadius: 10, background: selected === amt ? '#FDF0E8' : '#fff',
            color: selected === amt ? '#E8724A' : '#2A2A2A',
            fontFamily: "'Nunito',sans-serif", fontSize: '.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
          }}>
            ${amt}{amt === '10' ? ' ⭐' : ''}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: '#2A2A2A', marginBottom: 6 }}>Or your own amount</label>
        <input
          type="number"
          value={custom}
          onChange={e => onCustom(e.target.value)}
          placeholder="$"
          min={1}
          style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '11px 14px', fontFamily: "'Nunito',sans-serif", fontSize: '.94rem', color: '#2A2A2A', background: '#fff', outline: 'none' }}
        />
      </div>
    </>
  );
}
