'use client';

interface ToastProps {
  msg: string;
  show: boolean;
}

export function Toast({ msg, show }: ToastProps) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: `translateX(-50%) translateY(${show ? 0 : 80}px)`,
      background: '#2A2A2A', color: '#fff', padding: '12px 22px',
      borderRadius: 12, fontSize: '.86rem', fontWeight: 700, zIndex: 999,
      transition: 'transform .3s ease', pointerEvents: 'none', whiteSpace: 'nowrap',
    }}>{msg}</div>
  );
}
