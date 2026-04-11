'use client';

import React from 'react';
import { Btn } from '@/components/ui/Button';

interface MessageTabsProps {
  mode: 'typed' | 'handwritten';
  onSwitch: (mode: 'typed' | 'handwritten') => void;
  msg: string;
  onMsgChange: (msg: string) => void;
  photoData: string | null;
  onPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRetake: () => void;
}

export function MessageTabs({ mode, onSwitch, msg, onMsgChange, photoData, onPhoto, onRetake }: MessageTabsProps) {
  return (
    <>
      <div style={{ display: 'flex', background: '#E8E2F0', borderRadius: 12, padding: 4, marginBottom: 16, gap: 4 }}>
        {(['typed', 'handwritten'] as const).map((m, i) => (
          <button key={m} onClick={() => onSwitch(m)} style={{
            flex: 1, padding: 10, border: 'none', borderRadius: 9,
            background: mode === m ? '#fff' : 'transparent',
            color: mode === m ? '#3A8FA0' : '#7A7585',
            fontFamily: "'Nunito',sans-serif", fontSize: '.84rem', fontWeight: 700,
            cursor: 'pointer', transition: 'all .2s',
            boxShadow: mode === m ? '0 4px 20px rgba(60,50,100,.08)' : 'none',
          }}>
            {i === 0 ? '✏️ Type it' : '✍️ Handwritten'}
          </button>
        ))}
      </div>

      {mode === 'typed' && (
        <>
          <textarea
            value={msg} onChange={e => onMsgChange(e.target.value)}
            placeholder="Dear Coach, thank you so much for everything this season…"
            maxLength={400}
            style={{ width: '100%', minHeight: 150, border: '2px solid #E8E2F0', borderRadius: 12, padding: 14, fontFamily: "'Lora',serif", fontSize: '1rem', color: '#2A2A2A', background: '#FFFDF8', resize: 'vertical', lineHeight: 1.7, outline: 'none' }}
          />
          <div style={{ textAlign: 'right', fontSize: '.73rem', color: '#7A7585', marginTop: 4 }}>{msg.length}/400</div>
        </>
      )}

      {mode === 'handwritten' && (
        <>
          <p style={{ fontSize: '.84rem', color: '#7A7585', marginBottom: 10, lineHeight: 1.5, fontWeight: 600 }}>
            Write on paper, take a photo — appears on the card exactly as written.
          </p>
          {!photoData ? (
            <label style={{ display: 'block', border: '2px dashed #E8E2F0', borderRadius: 14, background: '#EAF4FB', padding: '30px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s' }}>
              <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={onPhoto} />
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
              <div style={{ color: '#3A8FA0', fontWeight: 800, fontSize: '.9rem' }}>Tap to photograph your message</div>
              <div style={{ color: '#7A7585', fontSize: '.76rem', marginTop: 3 }}>Handwritten on paper</div>
            </label>
          ) : (
            <>
              <img src={photoData} alt="Handwritten message" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 12, border: '2px solid #E8E2F0', marginBottom: 8 }} />
              <Btn variant="ghost" sm onClick={onRetake}>Retake photo</Btn>
            </>
          )}
        </>
      )}
    </>
  );
}
