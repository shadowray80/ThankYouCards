'use client';

import { useState } from 'react';
import { cardEmailSubject, cardEmailDefaultMessage, CARD_EMAIL_MAX_MESSAGE } from '@/lib/cardEmail';

interface EmailCardFormProps {
  slug: string;
  token: string;
  isSolo: boolean;
  recipientName: string;
  // Solo: the sender's name from the card. Group: the card's "From" text.
  fromName: string;
  cardOccasion?: string | null;
  messageCount?: number;
  imageUrl?: string | null;
  defaultSenderEmail?: string | null;
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1.5px solid #D4C8EE', borderRadius: 10,
  padding: '10px 12px', fontSize: '16px', fontFamily: "'Nunito',sans-serif", fontWeight: 600,
  color: '#2A2A2A', background: '#fff', outline: 'none',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.05em',
  textTransform: 'uppercase', color: '#7A7585', margin: '12px 0 5px',
};

// "Email the card": the site sends a properly designed email (works in every mail app,
// on phones too) rather than relying on the sender pasting formatted content.
export function EmailCardForm({ slug, token, isSolo, recipientName, fromName, cardOccasion, messageCount, imageUrl, defaultSenderEmail }: EmailCardFormProps) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState('');
  const [senderName, setSenderName] = useState(fromName);
  const [senderEmail, setSenderEmail] = useState(defaultSenderEmail ?? '');
  const [message, setMessage] = useState(() => cardEmailDefaultMessage({ recipientName, fromName, isSolo, cardOccasion, messageCount }));
  const [sendCopy, setSendCopy] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);

  const subject = cardEmailSubject({ recipientName, fromName: isSolo ? senderName : fromName, isSolo, cardOccasion });
  const canSend = to.trim() && senderName.trim() && message.trim() && !sending;

  async function send() {
    setSending(true);
    setError('');
    try {
      const res = await fetch(`/api/manage/${slug}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, to: to.trim(), senderName: senderName.trim(), senderEmail: senderEmail.trim(), message: message.trim(), sendCopy: sendCopy && !!senderEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong — please try again');
      setSentTo(to.trim());
      setTo('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again');
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        style={{ width: '100%', background: '#3A8FA0', border: 'none', borderRadius: 10, padding: '12px 16px', color: '#fff', fontWeight: 800, fontSize: '.92rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
        ✉️ Email the card
      </button>
    );
  }

  if (sentTo) {
    return (
      <div style={{ background: '#EAF6EF', border: '1.5px solid #BFE3CC', borderRadius: 12, padding: '16px', textAlign: 'center', fontFamily: "'Nunito',sans-serif" }}>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#2C7A4B', marginBottom: 4 }}>✓ Card emailed to {sentTo}</div>
        <div style={{ fontSize: '.8rem', color: '#5A7A66', fontWeight: 600, marginBottom: 12 }}>
          It can take a minute to arrive. If it doesn&apos;t show up, ask them to check their spam folder.
        </div>
        <button onClick={() => setSentTo(null)}
          style={{ background: 'none', border: 'none', color: '#3A8FA0', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
          Email it to someone else →
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1.5px solid #D4C8EE', borderRadius: 14, padding: '6px 14px 16px', fontFamily: "'Nunito',sans-serif" }}>
      <label style={labelStyle}>{recipientName ? `${recipientName}'s email` : 'Their email'}</label>
      <input type="email" inputMode="email" autoComplete="off" value={to} onChange={e => setTo(e.target.value)} placeholder="name@example.com" style={inputStyle} />

      <label style={labelStyle}>Your name</label>
      <input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="e.g. Tim" maxLength={60} style={inputStyle} />

      <label style={labelStyle}>Your email <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 600 }}>(so they can reply)</span></label>
      <input type="email" inputMode="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
      {senderEmail.trim() && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: '.82rem', fontWeight: 700, color: '#5A5566', cursor: 'pointer' }}>
          <input type="checkbox" checked={sendCopy} onChange={e => setSendCopy(e.target.checked)} style={{ width: 18, height: 18 }} />
          Send me a copy
        </label>
      )}

      <label style={labelStyle}>Message</label>
      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} maxLength={CARD_EMAIL_MAX_MESSAGE}
        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />

      {/* Mini preview of what lands in their inbox */}
      <div style={{ ...labelStyle, marginTop: 14 }}>Preview</div>
      <div style={{ background: '#F4F1EC', borderRadius: 12, padding: 10 }}>
        <div style={{ fontSize: '.74rem', color: '#7A7585', fontWeight: 700, marginBottom: 8, padding: '0 4px' }}>
          <strong style={{ color: '#2A2A2A' }}>{senderName.trim() || 'You'} via thankyoucards.au</strong><br />{subject}
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: 12, textAlign: 'center' }}>
          {imageUrl && <img src={imageUrl} alt="" style={{ width: '100%', maxWidth: 260, height: 'auto', borderRadius: 8, display: 'block', margin: '0 auto 10px' }} />}
          <div style={{ fontSize: '.8rem', color: '#3D3A44', lineHeight: 1.5, textAlign: 'left', whiteSpace: 'pre-wrap', marginBottom: 6 }}>{message.trim()}</div>
          <div style={{ fontSize: '.78rem', color: '#7A7585', textAlign: 'left', marginBottom: 10 }}>— {senderName.trim() || 'You'}</div>
          <span style={{ display: 'inline-block', background: '#3A8FA0', color: '#fff', borderRadius: 8, padding: '7px 16px', fontWeight: 800, fontSize: '.8rem' }}>Open your card →</span>
        </div>
      </div>

      {error && <div style={{ marginTop: 10, fontSize: '.82rem', fontWeight: 700, color: '#C0392B' }}>{error}</div>}

      <button onClick={send} disabled={!canSend}
        style={{ width: '100%', marginTop: 14, background: canSend ? '#3A8FA0' : '#A9CBD3', border: 'none', borderRadius: 10, padding: '12px 16px', color: '#fff', fontWeight: 800, fontSize: '.95rem', cursor: canSend ? 'pointer' : 'default', fontFamily: "'Nunito',sans-serif" }}>
        {sending ? 'Sending…' : 'Send email'}
      </button>
      <button onClick={() => setOpen(false)}
        style={{ width: '100%', marginTop: 6, background: 'none', border: 'none', padding: 8, color: '#7A7585', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
        Cancel
      </button>
    </div>
  );
}
