'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

const NAV = [
  { label: '🏠 Home',        href: '/' },
  { label: '📨 Solo Card',   href: '/?v=solo' },
  { label: '👥 Group Card',  href: '/?v=group' },
  { label: '✍️ Contrib',     href: '/?v=contrib' },
  { label: '📊 Dashboard',   href: '/?v=dash' },
  { label: '🎴 Card View',   href: '/?v=card' },
];

export function AdminToolbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.paddingTop = user ? '40px' : '';
  }, [user]);

  if (!user) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999999,
      background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,.08)',
      display: 'flex', alignItems: 'center', gap: 2,
      padding: '0 12px', height: 40,
      fontFamily: "'Nunito',sans-serif",
    }}>
      <div style={{ fontSize: '.58rem', fontWeight: 800, color: 'rgba(255,255,255,.25)', letterSpacing: '.12em', textTransform: 'uppercase', marginRight: 10, whiteSpace: 'nowrap' }}>
        Admin
      </div>

      <div style={{ display: 'flex', gap: 2, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {NAV.map(item => (
          <a
            key={item.href}
            href={item.href}
            style={{
              padding: '5px 10px', borderRadius: 6,
              fontSize: '.72rem', fontWeight: 700,
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

      <div style={{ flex: 1 }} />

      <span style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.25)', marginRight: 10, whiteSpace: 'nowrap' }}>
        {user.email}
      </span>

      <button
        onClick={() => supabase.auth.signOut()}
        style={{
          padding: '4px 12px', borderRadius: 6,
          fontSize: '.72rem', fontWeight: 700,
          color: 'rgba(255,120,120,.8)', background: 'none',
          border: '1px solid rgba(255,120,120,.2)',
          cursor: 'pointer', fontFamily: "'Nunito',sans-serif",
          whiteSpace: 'nowrap', transition: 'border-color .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,120,120,.5)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,120,120,.2)')}
      >
        Sign out
      </button>
    </div>
  );
}
