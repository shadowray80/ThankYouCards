'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useOrganiserSession } from '@/lib/useOrganiserSession';

const MIN_PASSWORD_LENGTH = 8;

const inputStyle: React.CSSProperties = {
  width: '100%', border: '2px solid #E8E2F0', borderRadius: 10, padding: '11px 13px',
  fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '16px', color: '#2A2A2A',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
};

// Opened from the emailed "Set your password" link: choose a password, then you're logged in.
function SetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { setSession } = useOrganiserSession();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(() => token ? '' : 'This link is missing its token — request a new one.');
  const [email, setEmail] = useState('');
  const [linkEmail, setLinkEmail] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`/api/auth/set-password?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(json => { if (json.email) setLinkEmail(json.email); else if (json.error) setError(json.error); })
      .catch(() => {});
  }, [token]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) { setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`); return; }
    if (password !== confirm) { setError('The two passwords don’t match.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setSession({ email: json.email, session_token: json.session_token });
      setEmail(json.email);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", gap: 12, padding: 24, textAlign: 'center' }}>
      {email ? (
        <>
          <div style={{ fontSize: '2.4rem' }}>✅</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2A2A2A' }}>Password saved — you&apos;re logged in as {email}</div>
          <div style={{ fontSize: '.85rem', color: '#7A7585', fontWeight: 600, maxWidth: 320 }}>
            Next time, just log in with your email and password.
          </div>
          <Link href="/" style={{ marginTop: 8, background: '#3A8FA0', color: '#fff', borderRadius: 12, padding: '12px 24px', fontWeight: 800, fontSize: '.9rem', textDecoration: 'none' }}>
            Go to thankyoucards.au →
          </Link>
        </>
      ) : !token ? (
        <>
          <div style={{ fontSize: '2.4rem' }}>💌</div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#E8724A' }}>{error}</div>
          <Link href="/" style={{ marginTop: 8, color: '#3A8FA0', fontWeight: 700, fontSize: '.85rem', textDecoration: 'none' }}>← Back to thankyoucards.au</Link>
        </>
      ) : (
        <form onSubmit={save} style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '2.4rem' }}>🔑</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2A2A2A' }}>Choose your password</div>
          {linkEmail && <div style={{ fontSize: '.85rem', color: '#7A7585', fontWeight: 600, marginBottom: 4 }}>for {linkEmail}</div>}
          {/* Lets the browser's password manager save the password against the right email. */}
          <input type="email" name="username" autoComplete="username" value={linkEmail} readOnly hidden />
          <input
            type="password" autoComplete="new-password" autoFocus
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder={`Password (at least ${MIN_PASSWORD_LENGTH} characters)`}
            style={inputStyle}
          />
          <input
            type="password" autoComplete="new-password"
            value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Type it again"
            style={inputStyle}
          />
          <button
            type="submit" disabled={saving}
            style={{ background: '#3A8FA0', border: 'none', borderRadius: 12, padding: '12px', color: '#fff', fontWeight: 800, fontSize: '.9rem', cursor: saving ? 'default' : 'pointer', fontFamily: "'Nunito',sans-serif" }}
          >
            {saving ? 'Saving…' : 'Save password & log in'}
          </button>
          {error && <div style={{ fontSize: '.8rem', color: '#E8724A', fontWeight: 700 }}>{error}</div>}
        </form>
      )}
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: '#7A7585' }}>Loading…</div>}>
      <SetPasswordContent />
    </Suspense>
  );
}
