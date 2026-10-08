// Wording for the "Email the card" feature, shared by the form (to pre-fill and preview)
// and the server (which always builds the subject itself, so the subject line can't be
// used to send arbitrary text). Pure functions only — safe to import on the client.

export interface CardEmailContext {
  recipientName: string;
  // Solo: the sender's own name. Group: the card's "From" text (e.g. "the Under 12s").
  fromName: string;
  isSolo: boolean;
  // Group cards only — what the card is for (see lib/occasions.ts).
  cardOccasion?: string | null;
  messageCount?: number;
}

function cap(s: string): string {
  const t = s.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

export function cardEmailSubject({ recipientName, fromName, isSolo, cardOccasion }: CardEmailContext): string {
  const r = cap(recipientName) || 'You';
  const f = fromName.trim();
  if (isSolo) return f ? `🎉 ${r}, you've got a card from ${f}!` : `🎉 ${r}, you've got a card!`;
  const from = f || 'everyone';
  switch (cardOccasion) {
    case 'Birthday':        return `🎂 Happy birthday, ${r}! A card from ${from}`;
    case 'Farewell':        return `${r}, a farewell card from ${from}`;
    case 'Retirement':      return `Congratulations on your retirement, ${r}!`;
    case 'Sympathy':        return `Thinking of you, ${r}`;
    case 'Get Well Soon':   return `Get well soon, ${r} 💐`;
    case 'Congratulations': return `🎉 Congratulations, ${r}!`;
    case 'Wedding':         return `💍 Congratulations, ${r}!`;
    case 'New Baby':        return `👶 Congratulations, ${r}!`;
    case 'Welcome':         return `👋 Welcome, ${r}! A card from ${from}`;
    case 'Thank You':
    case 'Appreciation':
    case 'Coach':
    case 'Teacher':         return `💌 ${r}, a thank-you card from ${from}`;
    default:                return `🎉 ${r}, you've got a card from ${from}!`;
  }
}

// Default personal message — the sender can edit it before sending. The sender's name is
// added as a sign-off by the email template, so it isn't repeated here.
export function cardEmailDefaultMessage({ recipientName, fromName, isSolo, cardOccasion, messageCount }: CardEmailContext): string {
  const r = cap(recipientName) || 'there';
  if (isSolo) return `Hi ${r},\n\nI've made a card just for you. Tap the card to open it!`;

  const from = fromName.trim() || 'Everyone';
  const kind: Record<string, string> = {
    Birthday: 'a birthday card', Farewell: 'a farewell card', Retirement: 'a card to celebrate your retirement',
    Sympathy: 'a card', 'Get Well Soon': 'a get well card', Congratulations: 'a card to say congratulations',
    Wedding: 'a wedding card', 'New Baby': 'a card to welcome your new arrival', Welcome: 'a welcome card',
    'Thank You': 'a card to say thank you', Appreciation: 'a card to say thank you',
    Coach: 'a card to say thank you', Teacher: 'a card to say thank you',
  };
  const what = kind[cardOccasion ?? ''] ?? 'a card';
  const n = messageCount ?? 0;
  const people = n > 1 ? `, with messages from ${n} people` : '';
  const close = cardOccasion === 'Sympathy' ? 'We\'re all thinking of you.' : 'Tap the card to open it!';
  return `Hi ${r},\n\n${cap(from)} put together ${what} for you${people}. ${close}`;
}

export const CARD_EMAIL_MAX_MESSAGE = 800;
