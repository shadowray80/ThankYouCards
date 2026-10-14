'use client';

import { useEffect, useState } from 'react';
import { useOrganiserSession } from '@/lib/useOrganiserSession';

export interface MyCard {
  slug: string;
  organiser_token: string;
  recipient_name: string;
  card_occasion: string | null;
  status: string;
  deadline: string | null;
  created_at: string;
}

// The logged-in organiser's group cards, newest first. `cards` is null while loading
// (and stays null when logged out).
export function useMyCards(): MyCard[] | null {
  const { session, setSession } = useOrganiserSession();
  const [cards, setCards] = useState<MyCard[] | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    fetch(`/api/my-cards?email=${encodeURIComponent(session.email)}&session_token=${encodeURIComponent(session.session_token)}`)
      .then(async r => {
        // The server no longer accepts this login (expired or replaced): log this device out,
        // so the site shows "Log in" instead of pretending and listing no cards.
        if (r.status === 401) { if (!cancelled) setSession(null); return; }
        const json = await r.json();
        if (!cancelled) setCards(Array.isArray(json.cards) ? json.cards : []);
      })
      .catch(() => { if (!cancelled) setCards([]); });
    return () => { cancelled = true; };
  }, [session, setSession]);

  return session ? cards : null;
}

export function manageUrl(card: MyCard): string {
  return `/manage/${card.slug}?token=${card.organiser_token}`;
}
