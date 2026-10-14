'use client';

// Building blocks for the organiser dashboard (app/manage/[slug]).

const SANS = "'Nunito',sans-serif";

// Simple line icons used where Tim's hand-drawn set doesn't have one yet (placeholders —
// swap for his icons as they arrive). Inherit the text colour.
export type UiIconName = 'print' | 'open' | 'share' | 'refresh' | 'bell' | 'lock' | 'chevron-down' | 'chevrons-down' | 'more' | 'plus';

const PATHS: Record<UiIconName, React.ReactNode> = {
  print: <><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M7 14h10v7H7z" /></>,
  open: <><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  share: <><path d="M12 3v12" /><path d="M7 8l5-5 5 5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.9-3.5L4 9" /><path d="M4 4v5h5" /><path d="M4 13a8 8 0 0 0 14.9 3.5L20 15" /><path d="M20 20v-5h-5" /></>,
  bell: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  'chevrons-down': <><path d="M7 7l5 5 5-5" /><path d="M7 13l5 5 5-5" /></>,
  more: <><circle cx="12" cy="5" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="12" cy="19" r="1.2" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
};

export function UiIcon({ name, size = 18, style }: { name: UiIconName; size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ display: 'block', flexShrink: 0, ...style }}>
      {PATHS[name]}
    </svg>
  );
}

// A collapsible dashboard section: icon, title, one-line description and a chevron; tap the
// header to open or close it. Every section is the same soft white — colour is kept for the
// header and the main buttons.
export function Accordion({ icon, title, subtitle, open, onToggle, children }: {
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ background: '#EAF4FB', borderRadius: 16, marginBottom: 10, border: '1px solid #D3E6F2', boxShadow: '0 1px 3px rgba(60,50,100,.05)' }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none',
          padding: '14px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: SANS,
        }}
      >
        <span style={{ width: 30, display: 'flex', justifyContent: 'center', flexShrink: 0, color: '#5A5566' }}>{icon}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontWeight: 800, fontSize: '.95rem', color: '#2A2A2A' }}>{title}</span>
          {subtitle && <span style={{ display: 'block', fontSize: '.76rem', color: '#7A7585', fontWeight: 600, marginTop: 1, lineHeight: 1.4 }}>{subtitle}</span>}
        </span>
        <UiIcon name="chevron-down" size={20} style={{ color: '#5A5566', transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} />
      </button>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  );
}

// "2d ago", "3h ago", "just now".
export function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
