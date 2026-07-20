'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'tyc_organiser_session';
const CHANGE_EVENT = 'tyc-session-changed';

export interface OrganiserSession {
  email: string;
  session_token: string;
}

function readSession(): OrganiserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function subscribe(callback: () => void) {
  // "storage" fires when another tab/window changes localStorage; our own custom
  // event covers changes made in this same tab (e.g. logging out here).
  window.addEventListener('storage', callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getServerSnapshot(): OrganiserSession | null {
  return null;
}

// Shared across any component that needs to know if the organiser is logged in.
export function useOrganiserSession() {
  const session = useSyncExternalStore(subscribe, readSession, getServerSnapshot);

  const setSession = useCallback((next: OrganiserSession | null) => {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { session, setSession };
}
