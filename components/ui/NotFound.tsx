// Deliberately mimics Next.js's own default 404 page exactly, so a non-admin
// hitting an admin route sees something indistinguishable from a genuinely
// nonexistent URL — no hint that an admin system exists at all.
export function NotFound() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', height: 49 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: '0 20px 0 0', padding: '0 23px 0 0', borderRight: '1px solid rgba(0,0,0,.3)', lineHeight: '49px' }}>404</h1>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 400, lineHeight: '49px', margin: 0 }}>This page could not be found.</h2>
        </div>
      </div>
    </div>
  );
}
