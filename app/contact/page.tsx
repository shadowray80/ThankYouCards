'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = name.trim() && email.trim() && message.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again');
    } finally {
      setSending(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '13px 14px',
    fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#2A2A2A',
    background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585',
    letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 24px 80px', fontFamily: "'Nunito', sans-serif" }}>
      <a href="/" style={{ fontWeight: 800, fontSize: '1.3rem', color: '#3A8FA0', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
        thank<span style={{ color: '#E8724A' }}>you</span>cards<span style={{ color: '#7A7585', fontWeight: 600, fontSize: '1rem' }}>.au</span>
      </a>

      <h1 style={{ fontWeight: 800, fontSize: '1.8rem', color: '#2A2A2A', marginBottom: 6, lineHeight: 1.2 }}>Get in touch</h1>
      <p style={{ fontSize: '.95rem', color: '#7A7585', lineHeight: 1.6, fontWeight: 600, marginBottom: 28 }}>
        Question, problem, or just want to say hi? Drop us a message and we&apos;ll get back to you.
      </p>

      {sent ? (
        <div style={{ background: '#EAF4FB', border: '2px solid rgba(58,143,160,.2)', borderRadius: 14, padding: '20px 22px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>💌</div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#2A2A2A', marginBottom: 4 }}>Message sent!</div>
          <div style={{ fontSize: '.88rem', color: '#7A7585', fontWeight: 600 }}>We&apos;ll get back to you soon.</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Your name</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#3A8FA0')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Your email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#3A8FA0')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Message</label>
            <textarea
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder="What's up?"
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => (e.target.style.borderColor = '#3A8FA0')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
          </div>

          {error && <div style={{ color: '#E8724A', fontWeight: 700, fontSize: '.85rem', marginBottom: 14 }}>{error}</div>}

          <button
            type="submit" disabled={!canSubmit || sending}
            style={{
              width: '100%', background: !canSubmit || sending ? '#B0A8BC' : '#3A8FA0',
              border: 'none', borderRadius: 12, padding: '13px', color: '#fff', fontWeight: 800,
              fontSize: '.95rem', fontFamily: "'Nunito',sans-serif", cursor: !canSubmit || sending ? 'default' : 'pointer',
              transition: 'background .2s',
            }}
          >
            {sending ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}

      <p style={{ fontSize: '.82rem', color: '#B0A8BC', fontWeight: 600, marginTop: 24, textAlign: 'center' }}>
        Or email us directly at <a href="mailto:hello@thankyoucards.au" style={{ color: '#3A8FA0' }}>hello@thankyoucards.au</a>
      </p>
    </div>
  );
}
