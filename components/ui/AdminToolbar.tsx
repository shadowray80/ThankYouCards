'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useOrganiserSession } from '@/lib/useOrganiserSession';
import { useIsAdmin } from '@/lib/useIsAdmin';

export function AdminToolbar() {
  const { session, setSession } = useOrganiserSession();
  const status = useIsAdmin();
  const [demoCard, setDemoCard] = useState<{ slug: string; token: string } | null>(null);

  useEffect(() => {
    if (status !== 'admin' || !session) return;
    fetch(`/api/admin/demo-card?email=${encodeURIComponent(session.email)}&session_token=${encodeURIComponent(session.session_token)}`)
      .then(r => r.json())
      .then(json => { if (json.slug) setDemoCard({ slug: json.slug, token: json.token }); })
      .catch(() => {});
  }, [status, session]);

  useEffect(() => {
    document.body.style.paddingTop = status === 'admin' ? '68px' : '';
  }, [status]);

  if (status !== 'admin') return null;

  const NAV = [
    { label: '🏠 Home',       href: '/' },
    { label: '📨 Solo Card',  href: '/?v=solo' },
    { label: '👥 Group Card', href: '/?v=group' },
    ...(demoCard ? [
      { label: '✍️ Contributor', href: `/card/${demoCard.slug}` },
      { label: '📊 Manage',      href: `/manage/${demoCard.slug}?token=${demoCard.token}` },
      { label: '🎴 Recipient',   href: `/view/${demoCard.slug}?preview=1` },
    ] : []),
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999999,
      background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,.08)',
      fontFamily: "'Nunito',sans-serif",
    }}>
      {/* Row 1: label + email + sign out */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '5px 12px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <Link href="/admin" style={{ fontSize: '.58rem', fontWeight: 800, color: 'rgba(255,255,255,.4)', letterSpacing: '.12em', textTransform: 'uppercase', textDecoration: 'none' }}>
          Admin
        </Link>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '.63rem', color: 'rgba(255,255,255,.25)', marginRight: 10 }}>
          {session?.email}
        </span>
        <button
          onClick={() => setSession(null)}
          style={{
            padding: '3px 10px', borderRadius: 6,
            fontSize: '.68rem', fontWeight: 700,
            color: 'rgba(255,120,120,.8)', background: 'none',
            border: '1px solid rgba(255,120,120,.2)',
            cursor: 'pointer', fontFamily: "'Nunito',sans-serif",
            transition: 'border-color .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,120,120,.5)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,120,120,.2)')}
        >
          Sign out
        </button>
      </div>

      {/* Row 2: nav buttons */}
      <div style={{ display: 'flex', gap: 2, padding: '4px 8px' }}>
        {NAV.map(item => (
          <a
            key={item.href}
            href={item.href}
            style={{
              flex: 1, textAlign: 'center',
              padding: '4px 6px', borderRadius: 6,
              fontSize: '.70rem', fontWeight: 700,
              color: 'rgba(255,255,255,.7)', textDecoration: 'none',
              whiteSpace: 'nowrap', transition: 'background .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}
