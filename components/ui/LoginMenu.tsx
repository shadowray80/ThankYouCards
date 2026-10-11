'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrganiserSession } from '@/lib/useOrganiserSession';
import { useIsAdmin } from '@/lib/useIsAdmin';
import { LoginForm } from '@/components/ui/LoginForm';

export function LoginMenu() {
  const { session, setSession } = useOrganiserSession();
  const adminStatus = useIsAdmin();
  const [open, setOpen] = useState(false);

  function logOut() {
    setSession(null);
    setOpen(false);
  }

  function toggle() {
    setOpen(v => !v);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={toggle}
        style={{
          background: session ? '#F0ECFB' : 'none', border: session ? 'none' : '1.5px solid #E8E2F0',
          borderRadius: 20, padding: '6px 12px', color: session ? '#7C5CBF' : '#7A7585',
          fontWeight: 800, fontSize: '.78rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif",
          whiteSpace: 'nowrap', maxWidth: 104, overflow: 'hidden', textOverflow: 'ellipsis',
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
            ) : (
              <LoginForm onLoggedIn={() => setOpen(false)} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
