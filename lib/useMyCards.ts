'use client';

import { useEffect, useState } from 'react';
import { useOrganiserSession } from '@/lib/useOrganiserSession';

export interface MyCard {
  slug: string;
  organiser_token: string;
  recipient_name: string;
  card_occasion: string | null;
  status: string;
  created_at: string;
}

// The logged-in organiser's group cards, newest first. `cards` is null while loading
// (and stays null when logged out).
export function useMyCards(): MyCard[] | null {
  const { session } = useOrganiserSession();
  const [cards, setCards] = useState<MyCard[] | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    fetch(`/api/my-cards?email=${encodeURIComponent(session.email)}&session_token=${encodeURIComponent(session.session_token)}`)
      .then(r => r.json())
      .then(json => { if (!cancelled) setCards(Array.isArray(json.cards) ? json.cards : []); })
      .catch(() => { if (!cancelled) setCards([]); });
    return () => { cancelled = true; };
  }, [session]);

  return session ? cards : null;
}

export function manageUrl(card: MyCard): string {
  return `/manage/${card.slug}?token=${card.organiser_token}`;
}
