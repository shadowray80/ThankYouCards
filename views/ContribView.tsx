'use client';

import React, { useState } from 'react';
import { Btn } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { MessageTabs } from '@/components/forms/MessageTabs';
import { GiftSelector } from '@/components/forms/GiftSelector';
import { GiftProgress } from '@/components/dashboard/GiftProgress';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { THEMES, DEMO_MSGS } from '@/lib/themes';

interface ContribViewProps {
  onBack: () => void;
  onToCard: () => void;
  onToast: (msg: string) => void;
}

export function ContribView({ onBack, onToCard, onToast }: ContribViewProps) {
  const [phase, setPhase] = useState<'card' | 'message' | 'gift' | 'done'>('card');
  const [msgMode, setMsgMode] = useState<'typed' | 'handwritten'>('typed');
  const [msg, setMsg] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [giftSel, setGiftSel] = useState<string | null>('10');
  const [giftCustom, setGiftCustom] = useState('');
  const [doneGift, setDoneGift] = useState('');

  const hasMsg = msgMode === 'typed' ? msg.trim().length > 0 : photoData !== null;

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setPhotoData(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const submit = (gift: string | null) => {
    setDoneGift(gift || 'No contribution');
    setPhase('done');
  };

  // ── Card view (with add-message CTA embedded) ──
  if (phase === 'card') {
    return (
      <div>
        {/* Teal header */}
        <div style={{ background: 'linear-gradient(135deg,#3A8FA0,#5AAFBF)', padding: '24px 20px 20px' }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1rem', color: 'rgba(255,255,255,.75)', marginBottom: 8 }}>
            thank<span style={{ color: '#fff' }}>you</span>cards<span style={{ color: 'rgba(255,255,255,.4)' }}>.au</span>
          </div>

          {/* Gift info banner */}
          <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: '12px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>🎁</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '.9rem' }}>We're getting Coach Dave a Visa gift card</div>
              <div style={{ color: 'rgba(255,255,255,.7)', fontSize: '.76rem', marginTop: 2 }}>Chip in any amount — every bit helps</div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'rgba(255,255,255,.7)', marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>Gift fund — $47 raised so far</div>
          <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '59%', background: '#fff', borderRadius: 8, transition: 'width .5s ease' }} />
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.15)', borderRadius: 20, padding: '4px 10px', fontSize: '.74rem', color: 'rgba(255,255,255,.9)', fontWeight: 700 }}>🏉 AFL Coach</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.15)', borderRadius: 20, padding: '4px 10px', fontSize: '.74rem', color: 'rgba(255,255,255,.9)', fontWeight: 700 }}>⏰ Closes Fri 14 Nov</div>
          </div>
        </div>

        {/* Card with messages + add-message CTA */}
        <div style={{ padding: '18px 18px 50px', maxWidth: 480, margin: '0 auto' }}>
          <CardScrollView
            theme={THEMES[0]}
            imgIdx={0}
            recipientName="Coach Dave"
            fromText="From the Under 12s"
            message="Thank you for an incredible season!"
            messages={DEMO_MSGS.slice(0, 3)}
            giftAmount={47}
            onAddMessage={() => setPhase('message')}
          />
        </div>
      </div>
    );
  }

  // ── Message step ──
  if (phase === 'message') {
    return (
      <div>
        <div style={{ background: 'linear-gradient(135deg,#3A8FA0,#5AAFBF)', padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setPhase('card')} style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#fff', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer' }}>← Back</button>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Add your message</div>
        </div>

        <div style={{ padding: '22px 18px 60px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ background: '#EAF4FB', borderRadius: 12, padding: '13px 15px', marginBottom: 18, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.2rem' }}>⏰</div>
            <div style={{ fontSize: '.84rem', color: '#3A8FA0', fontWeight: 700 }}>Deadline: <span>Friday 14 Nov</span> — don't leave it too late!</div>
          </div>
          <p style={{ color: '#7A7585', fontSize: '.88rem', marginBottom: 22, lineHeight: 1.6, fontWeight: 600 }}>Short and from the heart. Type it or photograph your handwriting.</p>
          <MessageTabs mode={msgMode} onSwitch={setMsgMode} msg={msg} onMsgChange={setMsg} photoData={photoData} onPhoto={handlePhoto} onRetake={() => setPhotoData(null)} />
          <div style={{ marginTop: 18 }}>
            <Field label="Your name"><Input value={name} onChange={setName} placeholder="e.g. Sarah (Liam's mum)" /></Field>
          </div>
          <Btn variant="teal" full disabled={!name.trim() || !hasMsg} onClick={() => setPhase('gift')}>Continue →</Btn>
        </div>
      </div>
    );
  }

  // ── Gift step ──
  if (phase === 'gift') {
    return (
      <div>
        <div style={{ background: 'linear-gradient(135deg,#3A8FA0,#5AAFBF)', padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setPhase('message')} style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#fff', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer' }}>← Back</button>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1rem', color: '#fff' }}>Chip in to the gift?</div>
        </div>

        <div style={{ padding: '22px 18px 60px', maxWidth: 480, margin: '0 auto' }}>
          <p style={{ color: '#7A7585', fontSize: '.88rem', marginBottom: 22, lineHeight: 1.6, fontWeight: 600 }}>Completely optional — but every bit helps. No one is judged for any amount.</p>
          <GiftProgress raised={47} target={80} />
          <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2A2A2A', margin: '20px 0 10px' }}>Suggested: $10 — choose your amount</div>
          <GiftSelector
            selected={giftSel}
            onSelect={a => { setGiftSel(a); setGiftCustom(''); }}
            custom={giftCustom}
            onCustom={v => { setGiftCustom(v); setGiftSel(null); }}
          />
          <Btn variant="coral" full onClick={() => submit(`$${giftSel || giftCustom}`)}>Add my message + contribute →</Btn>
          <Btn variant="outline" full onClick={() => submit(null)} style={{ marginTop: 10 }}>Just add my message (no gift)</Btn>
        </div>
      </div>
    );
  }

  // ── Done ──
  return (
    <div style={{ padding: '22px 18px 60px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', fontSize: '3.2rem', margin: '16px 0 10px' }}>✨</div>
      <div style={{ textAlign: 'center', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#2A2A2A', marginBottom: 6 }}>You're on the card!</div>
      <div style={{ textAlign: 'center', color: '#7A7585', fontSize: '.9rem', lineHeight: 1.6, marginBottom: 22, fontWeight: 600 }}>Your message has been added. We'll let you know when the card is ready.</div>
      <div style={{ background: '#fff', border: '2px solid #E8E2F0', borderRadius: 14, padding: '14px 18px', marginBottom: 18 }}>
        {([
          ['Your name', name],
          ['Message', msgMode === 'handwritten' ? '✍️ Handwritten photo' : '✏️ Typed message'],
          ['Contribution', doneGift],
        ] as [string, string][]).map(([l, v], i, arr) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #E8E2F0' : 'none', fontSize: '.87rem' }}>
            <span style={{ color: '#7A7585', fontWeight: 600 }}>{l}</span>
            <span style={{ fontWeight: 800 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ background: '#F0ECFB', borderRadius: 13, padding: '14px 16px', fontSize: '.84rem', color: '#7C5CBF', fontWeight: 700, marginBottom: 20 }}>
        👋 Know someone who hasn't added their message yet? Forward them the link!
      </div>
      <Btn variant="teal" full onClick={() => setPhase('card')}>Preview the card →</Btn>
      <Btn variant="outline" full onClick={onBack} style={{ marginTop: 10 }}>Back to home</Btn>
    </div>
  );
}
