'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/ui/Nav';
import { LoginForm } from '@/components/ui/LoginForm';
import { useOrganiserSession } from '@/lib/useOrganiserSession';
import { useMyCards, manageUrl } from '@/lib/useMyCards';

// "Organiser view" from the More menu. Logged out → log-in prompt. Logged in → straight to the
// organiser page of their most recent group card (where a dropdown switches between all of them).
export default function OrganiserPage() {
  const router = useRouter();
  const { session } = useOrganiserSession();
  const cards = useMyCards();

  useEffect(() => {
    if (cards && cards.length > 0) router.replace(manageUrl(cards[0]));
  }, [cards, router]);

  const panel: React.CSSProperties = {
    maxWidth: 360, margin: '48px auto', padding: '24px 22px', background: '#fff', border: '2px solid #E8E2F0',
    borderRadius: 16, fontFamily: "'Nunito',sans-serif",
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFDF8' }}>
      <Nav onHome={() => router.push('/')} badge={null} />
      <div style={{ padding: '0 18px' }}>
        {!session ? (
          <div style={panel}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2A2A2A', marginBottom: 4 }}>Organiser view</div>
            <div style={{ fontSize: '.82rem', color: '#7A7585', fontWeight: 600, lineHeight: 1.5, marginBottom: 16 }}>
              Log in to see and manage your group cards.
            </div>
            <LoginForm />
          </div>
        ) : cards === null || cards.length > 0 ? (
          <div style={{ ...panel, textAlign: 'center', color: '#B0A8BC', fontWeight: 700 }}>Opening your cards…</div>
        ) : (
          <div style={panel}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2A2A2A', marginBottom: 4 }}>No group cards yet</div>
            <div style={{ fontSize: '.82rem', color: '#7A7585', fontWeight: 600, lineHeight: 1.5, marginBottom: 16 }}>
              Group cards made with <strong style={{ color: '#2A2A2A' }}>{session.email}</strong> will appear here.
            </div>
            <button
              onClick={() => router.push('/?v=group')}
              style={{ width: '100%', background: '#E8724A', border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}
            >
              Create a group card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
