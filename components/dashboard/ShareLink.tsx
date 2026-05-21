'use client';

interface ShareLinkProps {
  link: string;
  onCopy: () => void;
}

export function ShareLink({ link, onCopy }: ShareLinkProps) {
  function handleCopy() {
    const full = link.startsWith('http') ? link : `https://${link}`;
    navigator.clipboard.writeText(full);
    onCopy();
  }
  return (
    <div style={{ background: '#EAF4FB', border: '2px solid rgba(58,143,160,.2)', borderRadius: 13, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ fontSize: '.82rem', color: '#3A8FA0', fontWeight: 700, flex: 1, wordBreak: 'break-all' }}>{link}</div>
      <button onClick={handleCopy} style={{ background: '#3A8FA0', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 13px', fontSize: '.78rem', fontFamily: "'Nunito',sans-serif", fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>Copy</button>
    </div>
  );
}
