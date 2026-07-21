'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrganiserSession } from '@/lib/useOrganiserSession';

export function LoginMenu() {
  const { session, setSession } = useOrganiserSession();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState('');

  async function requestLink() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address'); return; }
    setRequesting(true); setError('');
    try {
      const res = await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setLinkSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setRequesting(false);
    }
  }

  function logOut() {
    setSession(null);
    setOpen(false);
  }

  function toggle() {
    setOpen(v => !v);
    setError(''); setLinkSent(false);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={toggle}
        style={{
          background: session ? '#F0ECFB' : 'none', border: session ? 'none' : '1.5px solid #E8E2F0',
          borderRadius: 20, padding: '6px 12px', color: session ? '#7C5CBF' : '#7A7585',
          fontWeight: 800, fontSize: '.78rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif",
        }}
      >
        {session ? `👤 ${session.email.split('@')[0]}` : 'Log in'}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 299 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 260, zIndex: 300,
            background: '#fff', border: '1.5px solid #E8E2F0', borderRadius: 14,
            padding: 14, boxShadow: '0 8px 32px rgba(60,50,100,.18)',
          }}>
            {session ? (
              <>
                <div style={{ fontSize: '.78rem', color: '#7A7585', fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>
                  Signed in as <strong style={{ color: '#2A2A2A' }}>{session.email}</strong>
                </div>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  style={{ display: 'block', width: '100%', boxSizing: 'border-box', background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 10, padding: '9px', color: '#7A7585', fontWeight: 800, fontSize: '.78rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", textDecoration: 'none', textAlign: 'center', marginBottom: 8 }}
                >
                  ⚙ Admin
                </Link>
                <button
                  onClick={logOut}
                  style={{ width: '100%', background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 10, padding: '9px', color: '#7A7585', fontWeight: 800, fontSize: '.78rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}
                >
                  Log out
                </button>
              </>
            ) : linkSent ? (
              <div style={{ fontSize: '.78rem', color: '#3A8FA0', fontWeight: 700, lineHeight: 1.5 }}>
                {`Check ${email} for a login link.`}
              </div>
            ) : (
              <>
                <div style={{ fontSize: '.76rem', color: '#7A7585', fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>
                  Save &amp; load your brand style on corporate cards. First time here? This sets up your account too — no separate sign-up.
                </div>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoFocus
                  style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 10, padding: '9px 11px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '.82rem', color: '#2A2A2A', background: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                />
                <button
                  onClick={requestLink} disabled={requesting}
                  style={{ width: '100%', background: '#3A8FA0', border: 'none', borderRadius: 10, padding: '9px', color: '#fff', fontWeight: 800, fontSize: '.78rem', cursor: requesting ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}
                >
                  {requesting ? 'Sending…' : 'Email me a login link'}
                </button>
                {error && <div style={{ fontSize: '.72rem', color: '#E8724A', fontWeight: 700, marginTop: 6 }}>{error}</div>}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
