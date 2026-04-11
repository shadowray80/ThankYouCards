'use client';

import React, { useState } from 'react';
import { Nav } from '@/components/ui/Nav';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { BackBtn } from '@/components/ui/BackBtn';
import { Btn } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { ThemeGrid } from '@/components/cards/ThemeGrid';
import { ImageSwiper } from '@/components/cards/ImageSwiper';
import { ShareLink } from '@/components/dashboard/ShareLink';
import { THEMES } from '@/lib/themes';

interface GroupFlowProps {
  onBack: () => void;
  onToDash: () => void;
  onToast: (msg: string) => void;
}

const GIFT_TYPES = [
  { id: 'visa', label: '💳 Visa gift card', desc: 'Spendable anywhere, any country' },
  { id: 'amazon', label: '📦 Amazon voucher', desc: 'Online shopping, great for gift ideas' },
  { id: 'custom', label: '🎁 We\'re organising our own gift', desc: 'Add a description below' },
  { id: 'none', label: '💌 No gift — card only', desc: 'Just the messages' },
];

export function GroupFlow({ onBack, onToDash, onToast }: GroupFlowProps) {
  const [step, setStep] = useState(1);
  const [themeIdx, setThemeIdx] = useState<number | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [recip, setRecip] = useState('');
  const [occasion, setOccasion] = useState('');
  const [deadline, setDeadline] = useState('');
  const [giftType, setGiftType] = useState<string>('visa');
  const [giftDesc, setGiftDesc] = useState('');

  const canNext2 = recip.trim() && occasion.trim() && deadline;
  const slug = recip.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const giftLabel = GIFT_TYPES.find(g => g.id === giftType)?.label || '';

  const wrap = (inner: React.ReactNode) => (
    <div>
      <Nav onHome={onBack} badge="group" />
      <ProgressDots total={3} current={step} variant="coral" />
      <div style={{ padding: '22px 18px 60px', maxWidth: 480, margin: '0 auto' }}>
        {inner}
      </div>
    </div>
  );

  if (step === 1) return wrap(
    <>
      <BackBtn onClick={onBack} />
      <Pill variant="coral">👥 Group card — free for the organiser</Pill>
      <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#2A2A2A', marginBottom: 5 }}>Choose a theme</h2>
      <p style={{ color: '#7A7585', fontSize: '.88rem', marginBottom: 22, lineHeight: 1.6, fontWeight: 600 }}>Sets the look and feel of the group card.</p>
      <ThemeGrid selected={themeIdx} onSelect={i => { setThemeIdx(i); setImgIdx(0); }} />
      <ImageSwiper themeIdx={themeIdx} selected={imgIdx} onSelect={setImgIdx} />
      <Btn variant="coral" full disabled={themeIdx === null} onClick={() => setStep(2)}>Next: Card Details →</Btn>
    </>
  );

  if (step === 2) return wrap(
    <>
      <BackBtn onClick={() => setStep(1)} />
      {themeIdx !== null && <Pill variant="coral">{THEMES[themeIdx].emoji} {THEMES[themeIdx].name}</Pill>}
      <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#2A2A2A', marginBottom: 5 }}>Card details</h2>
      <p style={{ color: '#7A7585', fontSize: '.88rem', marginBottom: 22, lineHeight: 1.6, fontWeight: 600 }}>Who's it for and when's the deadline?</p>
      <Field label="Recipient name"><Input value={recip} onChange={setRecip} placeholder="e.g. Coach Dave" /></Field>
      <Field label="Occasion / from group"><Input value={occasion} onChange={setOccasion} placeholder="e.g. From the Under 12s — End of Season" /></Field>
      <Field label="Deadline"><Input type="date" value={deadline} onChange={setDeadline} /></Field>

      {/* Gift type */}
      <div style={{ fontSize: '.75rem', fontWeight: 800, color: '#7A7585', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10, marginTop: 6 }}>Gift type</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
        {GIFT_TYPES.map(g => (
          <div
            key={g.id}
            onClick={() => setGiftType(g.id)}
            style={{
              border: giftType === g.id ? '2px solid #E8724A' : '2px solid #E8E2F0',
              background: giftType === g.id ? '#FDF0E8' : '#fff',
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all .2s',
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: giftType === g.id ? '5px solid #E8724A' : '2px solid #C0B8CC', flexShrink: 0, transition: 'all .2s' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#2A2A2A' }}>{g.label}</div>
              <div style={{ fontSize: '.76rem', color: '#7A7585', marginTop: 1 }}>{g.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {giftType === 'custom' && (
        <div style={{ marginTop: 8 }}>
          <Field label="Describe the gift">
            <Input value={giftDesc} onChange={setGiftDesc} placeholder="e.g. Team hoodie with name on the back" />
          </Field>
        </div>
      )}

      {giftType !== 'none' && (
        <div style={{ background: '#FDF0E8', borderRadius: 12, padding: '13px 15px', fontSize: '.83rem', color: '#E8724A', fontWeight: 700, marginTop: 8, marginBottom: 4 }}>
          💡 We suggest $10 per person. People can give more — no one is shamed for giving less. No minimum, no target.
        </div>
      )}

      <Btn variant="coral" full disabled={!canNext2} onClick={() => setStep(3)}>Create & Get Link →</Btn>
    </>
  );

  if (step === 3) return wrap(
    <>
      <div style={{ textAlign: 'center', fontSize: '3.2rem', margin: '16px 0 10px' }}>🎉</div>
      <div style={{ textAlign: 'center', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#2A2A2A', marginBottom: 6 }}>Your group card is live!</div>
      <div style={{ textAlign: 'center', color: '#7A7585', fontSize: '.9rem', lineHeight: 1.6, marginBottom: 24, fontWeight: 600 }}>Share this link. Everyone adds their message and chips in — we send the reminders so you don't have to.</div>

      <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2A2A2A', margin: '20px 0 10px' }}>Your shareable link</div>
      <ShareLink link={`thankyoucards.au/card/${slug || 'coach-dave'}`} onCopy={() => onToast('Link copied! 🎉')} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <Btn variant="ghost" sm onClick={() => onToast('Opening WhatsApp… 💬')} style={{ flex: 1 }}>💬 WhatsApp</Btn>
        <Btn variant="ghost" sm onClick={() => onToast('Opening email… ✉️')} style={{ flex: 1 }}>✉️ Email</Btn>
      </div>

      <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2A2A2A', margin: '20px 0 10px' }}>Card summary</div>
      <div style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
        {([
          ['Recipient', recip],
          ['Theme', themeIdx !== null ? `${THEMES[themeIdx].emoji} ${THEMES[themeIdx].name}` : '—'],
          ['Deadline', deadline ? new Date(deadline).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'],
          ['Gift', giftType === 'none' ? 'Card only' : giftLabel],
          ['Suggested contribution', giftType === 'none' ? '—' : '$10 per person'],
        ] as [string, string][]).map(([l, v], i, arr) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #E8E2F0' : 'none', fontSize: '.87rem' }}>
            <span style={{ color: '#7A7585', fontWeight: 600 }}>{l}</span>
            <span style={{ fontWeight: 800 }}>{v}</span>
          </div>
        ))}
      </div>

      <Btn variant="outline" sm full onClick={() => onToast('Opening contributor preview… 👀')} style={{ marginBottom: 8 }}>
        👀 Preview contributor view
      </Btn>
      <Btn variant="coral" full onClick={onToDash}>Go to Dashboard →</Btn>
      <Btn variant="outline" full onClick={onBack} style={{ marginTop: 10 }}>Back to home</Btn>
    </>
  );

  return null;
}
