'use client';

import { useEffect, useState } from 'react';
import { useOrganiserSession } from '@/lib/useOrganiserSession';

// Client-side admin check, used to decide what to render (admin pages,
// nav links). Real enforcement always happens server-side via requireAdmin()
// on every actual read/write route — this never grants access on its own.
export function useIsAdmin(): 'checking' | 'admin' | 'denied' {
  const { session } = useOrganiserSession();
  const [fetchedStatus, setFetchedStatus] = useState<'checking' | 'admin' | 'denied'>('checking');

  useEffect(() => {
    if (!session) return; // no session — handled below without needing an effect
    let cancelled = false;
    fetch(`/api/admin/check?email=${encodeURIComponent(session.email)}&session_token=${encodeURIComponent(session.session_token)}`)
      .then(r => { if (!cancelled) setFetchedStatus(r.ok ? 'admin' : 'denied'); })
      .catch(() => { if (!cancelled) setFetchedStatus('denied'); });
    return () => { cancelled = true; };
  }, [session]);

  if (!session) return 'denied';
  return fetchedStatus;
}
