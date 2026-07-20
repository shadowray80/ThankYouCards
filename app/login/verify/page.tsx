'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'checking' | 'done' | 'error'>(() => token ? 'checking' : 'error');
  const [error, setError] = useState(() => token ? '' : 'Missing login token.');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.error) { setStatus('error'); setError(json.error); return; }
        localStorage.setItem('tyc_organiser_session', JSON.stringify({ email: json.email, session_token: json.session_token }));
        setEmail(json.email);
        setStatus('done');
      })
      .catch(() => { setStatus('error'); setError('Something went wrong — please try again.'); });
  }, [token]);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", gap: 12, padding: 24, textAlign: 'center' }}>
      {status === 'checking' && (
        <>
          <div style={{ fontSize: '2.4rem' }}>⏳</div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#2A2A2A' }}>Logging you in…</div>
        </>
      )}
      {status === 'done' && (
        <>
          <div style={{ fontSize: '2.4rem' }}>✅</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2A2A2A' }}>You&apos;re logged in as {email}</div>
          <div style={{ fontSize: '.85rem', color: '#7A7585', fontWeight: 600, maxWidth: 320 }}>
            Head back to create a corporate card — your saved colours and logo will be waiting for you.
          </div>
          <Link href="/" style={{ marginTop: 8, background: '#3A8FA0', color: '#fff', borderRadius: 12, padding: '12px 24px', fontWeight: 800, fontSize: '.9rem', textDecoration: 'none' }}>
            Go to thankyoucards.au →
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ fontSize: '2.4rem' }}>💌</div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#E8724A' }}>{error}</div>
          <Link href="/" style={{ marginTop: 8, color: '#3A8FA0', fontWeight: 700, fontSize: '.85rem', textDecoration: 'none' }}>← Back to thankyoucards.au</Link>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: '#7A7585' }}>Loading…</div>}>
      <VerifyContent />
    </Suspense>
  );
}
