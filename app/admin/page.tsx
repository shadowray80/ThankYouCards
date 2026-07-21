'use client';

import { useOrganiserSession } from '@/lib/useOrganiserSession';
import { Nav } from '@/components/ui/Nav';
import Link from 'next/link';

const ADMIN_PAGES = [
  { href: '/admin/showcase', icon: '🖼', title: 'Homepage example cards', desc: 'Create, edit and toggle which example cards show in the homepage carousel.' },
];

export default function AdminIndexPage() {
  const { session } = useOrganiserSession();

  return (
    <div>
      <Nav onHome={() => { window.location.href = '/'; }} badge={null} />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 18px 80px', fontFamily: "'Nunito',sans-serif" }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2A2A2A', marginBottom: 20 }}>Admin</h1>

        {!session ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#7A7585', fontWeight: 700, background: '#fff', border: '2px solid #E8E2F0', borderRadius: 14 }}>
            Log in as admin from the menu above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ADMIN_PAGES.map(p => (
              <Link
                key={p.href}
                href={p.href}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: '#fff', border: '2px solid #E8E2F0', borderRadius: 14, padding: '16px 18px', textDecoration: 'none' }}
              >
                <div style={{ fontSize: '1.6rem' }}>{p.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.95rem', color: '#2A2A2A', marginBottom: 3 }}>{p.title}</div>
                  <div style={{ fontSize: '.8rem', color: '#7A7585', fontWeight: 600, lineHeight: 1.4 }}>{p.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
