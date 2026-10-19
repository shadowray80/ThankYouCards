// The solo card's sign-off before the sender's name: "Love from Tim", "Lots of love, Tim"…
// Saved as campaigns.card_sign_off; empty means the plain default, "From".

export const SIGN_OFFS = ['From', 'Love from', 'Lots of love', 'With love', 'Cheers', 'Thanks heaps', 'Best wishes'];

export const DEFAULT_SIGN_OFF = 'From';
export const SIGN_OFF_MAX = 40;

export function signOffFor(c: { card_sign_off?: string | null }): string {
  return c.card_sign_off?.trim() || DEFAULT_SIGN_OFF;
}

// What to store: trimmed and capped, or null for the default.
export function cleanSignOff(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim().slice(0, SIGN_OFF_MAX);
  return v && v !== DEFAULT_SIGN_OFF ? v : null;
}
