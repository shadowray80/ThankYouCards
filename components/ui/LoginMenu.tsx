'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrganiserSession } from '@/lib/useOrganiserSession';
import { useIsAdmin } from '@/lib/useIsAdmin';
import { PasswordInput } from '@/components/ui/PasswordInput';

const inputStyle: React.CSSProperties = {
  width: '100%', border: '2px solid #E8E2F0', borderRadius: 10, padding: '9px 11px', fontFamily: "'Nunito',sans-serif",
  fontWeight: 700, fontSize: '.82rem', color: '#2A2A2A', background: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: 8,
};

const primaryButtonStyle = (busy: boolean): React.CSSProperties => ({
  width: '100%', background: '#3A8FA0', border: 'none', borderRadius: 10, padding: '9px', color: '#fff',
  fontWeight: 800, fontSize: '.78rem', cursor: busy ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif",
});

const linkButtonStyle: React.CSSProperties = {
  display: 'block', width: '100%', marginTop: 10, background: 'none', border: 'none', padding: 0, color: '#3A8FA0',
  fontWeight: 700, fontSize: '.72rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", textAlign: 'center', lineHeight: 1.4,
};

export function LoginMenu() {
  const { session, setSession } = useOrganiserSession();
  const adminStatus = useIsAdmin();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState('');

  async function logIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Enter your email and password.'); return; }
    setRequesting(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setSession({ email: json.email, session_token: json.session_token });
      setPassword('');
      setOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setRequesting(false);
    }
  }

  async function requestLink(e: React.FormEvent) {
    e.preventDefault();
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
    setError(''); setLinkSent(false); setMode('login');
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
                {adminStatus === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    style={{ display: 'block', width: '100%', boxSizing: 'border-box', background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 10, padding: '9px', color: '#7A7585', fontWeight: 800, fontSize: '.78rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", textDecoration: 'none', textAlign: 'center', marginBottom: 8 }}
                  >
                    ⚙ Admin
                  </Link>
                )}
                <button
                  onClick={logOut}
                  style={{ width: '100%', background: 'none', border: '1.5px solid #E8E2F0', borderRadius: 10, padding: '9px', color: '#7A7585', fontWeight: 800, fontSize: '.78rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}
                >
                  Log out
                </button>
              </>
            ) : linkSent ? (
              <div style={{ fontSize: '.78rem', color: '#3A8FA0', fontWeight: 700, lineHeight: 1.5 }}>
                {`Check ${email} for a link to set your password.`}
              </div>
            ) : mode === 'login' ? (
              <form key="login" onSubmit={logIn}>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email" autoComplete="email" autoFocus
                  style={inputStyle}
                />
                <PasswordInput
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" autoComplete="current-password"
                  style={inputStyle}
                />
                <button type="submit" disabled={requesting} style={primaryButtonStyle(requesting)}>
                  {requesting ? 'Logging in…' : 'Log in'}
                </button>
                {error && <div style={{ fontSize: '.72rem', color: '#E8724A', fontWeight: 700, marginTop: 6, lineHeight: 1.4 }}>{error}</div>}
                <button type="button" onClick={() => { setMode('reset'); setError(''); }} style={linkButtonStyle}>
                  New here, or forgot your password? Set or reset password
                </button>
              </form>
            ) : (
              <form key="reset" onSubmit={requestLink}>
                <div style={{ fontSize: '.76rem', color: '#7A7585', fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>
                  We&apos;ll email you a link to choose a password. New here? This sets up your account — save &amp; load your brand style on corporate cards.
                </div>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" autoComplete="email" autoFocus
                  style={inputStyle}
                />
                <button type="submit" disabled={requesting} style={primaryButtonStyle(requesting)}>
                  {requesting ? 'Sending…' : 'Email me a link'}
                </button>
                {error && <div style={{ fontSize: '.72rem', color: '#E8724A', fontWeight: 700, marginTop: 6 }}>{error}</div>}
                <button type="button" onClick={() => { setMode('login'); setError(''); }} style={linkButtonStyle}>
                  ← Back to log in
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
