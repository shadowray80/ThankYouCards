'use client';

import { useState } from 'react';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Incorrect email or password.');
      setLoading(false);
    } else {
      window.location.href = '/';
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F7F5FB', fontFamily: "'Nunito',sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 20px' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#2A2A2A' }}>
            thank<span style={{ color: '#F09070' }}>you</span>cards.au
          </div>
          <div style={{ fontSize: '.82rem', color: '#7A7585', marginTop: 6, fontWeight: 600 }}>Admin access</div>
        </div>

        <form onSubmit={handleLogin} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 8px 32px rgba(60,50,100,.1)' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                border: '2px solid #E8E2F0', borderRadius: 10, padding: '10px 14px',
                fontSize: '.95rem', fontFamily: "'Nunito',sans-serif",
                outline: 'none', transition: 'border-color .15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#3A8FA0')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', boxSizing: 'border-box',
                border: '2px solid #E8E2F0', borderRadius: 10, padding: '10px 14px',
                fontSize: '.95rem', fontFamily: "'Nunito',sans-serif",
                outline: 'none', transition: 'border-color .15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#3A8FA0')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', border: '1.5px solid #FECACA', borderRadius: 8, padding: '9px 14px', fontSize: '.82rem', color: '#991B1B', fontWeight: 700, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#B0A8BC' : '#3A8FA0',
              border: 'none', borderRadius: 10, padding: '12px',
              color: '#fff', fontWeight: 800, fontSize: '.95rem',
              fontFamily: "'Nunito',sans-serif", cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background .2s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
