'use client';

import { useState } from 'react';
import { Btn } from '@/components/ui/Button';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { THEMES } from '@/lib/themes';

interface HomeViewProps {
  onSolo: () => void;
  onGroup: () => void;
  onNav: (view: string) => void;
}

export function HomeView({ onSolo, onGroup, onNav }: HomeViewProps) {
  const [code, setCode] = useState('');
  const heroMsgs = [
    { name: "Sarah (Liam's Mum)", msg: "Thanks for believing in Liam this season! He's loved every game. 🏆", timestamp: '5 mins ago' },
    { name: "Michael (Jack's Dad)", msg: "We couldn't have done it without you! ⭐", timestamp: '2 hours ago' },
  ];

  async function goToCard() {
    const raw = code.trim();

    // Organiser manage link — full URL or path
    const manageMatch = raw.match(/\/manage\/([^?#]+)(\?[^#]*)?/);
    if (manageMatch) {
      window.location.href = `/manage/${manageMatch[1]}${manageMatch[2] ?? ''}`;
      return;
    }

    // Bare organiser token — long alphanumeric, no slashes
    if (/^[a-z0-9]{15,}$/i.test(raw)) {
      const res = await fetch(`/api/manage?token=${raw}`);
      if (res.ok) {
        const json = await res.json();
        window.location.href = `/manage/${json.slug}?token=${raw}`;
        return;
      }
    }

    // Contributor card link — full URL or just slug
    let slug = raw.toLowerCase();
    const cardMatch = slug.match(/\/card\/([^/?#]+)/);
    if (cardMatch) slug = cardMatch[1];
    if (!slug) return;
    onNav(`contrib:${slug}`);
  }

  return (
    <div>
      {/* Nav */}
      <div style={{ background: '#fff', position: 'sticky', top: 0, zIndex: 200, borderBottom: '1px solid #E8E2F0' }}>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#3A8FA0' }}>
            thank<span style={{ color: '#E8724A' }}>you</span>cards<span style={{ color: '#7A7585', fontWeight: 600, fontSize: '.9rem' }}>.au</span>
          </div>
          <Btn variant="teal" sm onClick={onSolo}>Create a card</Btn>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(175deg,#EAF4FB 0%,#FDF0E8 55%,#F0ECFB 100%)', padding: '36px 20px 0', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ maxWidth: 440, margin: '0 auto' }}>

          {/* Tagline */}
          <h1 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '2.2rem', color: '#2A2A2A', lineHeight: 1.15, marginBottom: 10 }}>
            Say thank you to the{' '}
            <span style={{ fontFamily: 'var(--font-dancing), cursive', fontSize: '2.6rem', color: '#3A8FA0', fontWeight: 400 }}>legends</span>
            {' '}in your life
          </h1>
          <p style={{ color: '#7A7585', fontSize: '.94rem', lineHeight: 1.65, marginBottom: 28, fontWeight: 600, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
            Beautiful, personalised thank you cards - sent instantly, anywhere in the world.
          </p>

          {/* Hero card mockup */}
          <div style={{ transform: 'scale(0.88)', transformOrigin: 'top center', marginBottom: -24, pointerEvents: 'none' }}>
            <CardScrollView
              theme={THEMES.find(t => t.id === 'coach')!}
              customImgUrl="/hero-coach.jpg"
              recipientName="Coach Dave"
              fromText="From the Under 12s"
              message="Thank you for an incredible season!"
              messages={heroMsgs}
              giftAmount={50}
              landscapeCover
            />
          </div>
        </div>
      </div>

      {/* ── CTAs ── */}
      <div style={{ background: '#FFFDF8', padding: '44px 20px 0', maxWidth: 440, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {[
            { icon: '📨', title: 'Solo card', desc: 'From you, to someone special. Quick and personal.', onClick: onSolo, color: '#3A8FA0', bg: '#EAF4FB', border: '#3A8FA0' },
            { icon: '👥', title: 'Group card', desc: 'Everyone adds a message and chips in. We handle the chasing.', onClick: onGroup, color: '#E8724A', bg: '#FDF0E8', border: '#E8724A' },
          ].map((c, i) => (
            <div
              key={i}
              onClick={c.onClick}
              style={{ borderRadius: 18, padding: '22px 16px', border: '2.5px solid #E8E2F0', cursor: 'pointer', textAlign: 'center', background: '#fff', transition: 'all .25s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = c.border; (e.currentTarget as HTMLDivElement).style.background = c.bg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E8E2F0'; (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
            >
              <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 5, color: c.color }}>{c.title}</div>
              <div style={{ fontSize: '.78rem', color: '#7A7585', lineHeight: 1.4, fontWeight: 600 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Got a code? */}
        <div style={{ background: '#fff', border: '2.5px solid #E8E2F0', borderRadius: 18, padding: '18px 16px', marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: '.95rem', color: '#2A2A2A', marginBottom: 4 }}>📬 Got a card code?</div>
          <div style={{ fontSize: '.8rem', color: '#7A7585', fontWeight: 600, marginBottom: 12 }}>Someone shared a card with you - enter the code to add your message.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && goToCard()}
              placeholder="e.g. timbo-mpera"
              style={{ flex: 1, border: '2px solid #E8E2F0', borderRadius: 10, padding: '11px 13px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '.95rem', color: '#2A2A2A', background: '#FFFDF8', outline: 'none', minWidth: 0 }}
              onFocus={e => (e.target.style.borderColor = '#3A8FA0')}
              onBlur={e => (e.target.style.borderColor = '#E8E2F0')}
            />
            <button
              onClick={goToCard}
              disabled={!code.trim()}
              style={{ background: code.trim() ? '#3A8FA0' : '#E8E2F0', color: code.trim() ? '#fff' : '#B0A8BC', border: 'none', borderRadius: 10, padding: '11px 16px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '.9rem', cursor: code.trim() ? 'pointer' : 'default', transition: 'all .2s', whiteSpace: 'nowrap' }}
            >
              Go →
            </button>
          </div>
        </div>

        <div style={{ background: '#FDF0E8', borderRadius: 14, padding: '12px 16px', fontSize: '.84rem', color: '#E8724A', fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>
          💡 Group card is <strong>free for the organiser</strong> - covered by contributions
        </div>

        {/* ── Testimonials ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.3rem', color: '#2A2A2A', marginBottom: 6 }}>It feels good to say thank you.</div>
          <div style={{ textAlign: 'center', fontSize: '.85rem', color: '#B0A8BC', fontWeight: 600, marginBottom: 24 }}>What people are saying</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { quote: "I organised our whole footy club's end-of-season card from my phone in about 5 minutes. Everyone added their own message and the gift collection handled itself. I didn't have to chase a single person.", name: 'Sarah M.', role: 'Group card organiser', color: '#EAF4FB', nameColor: '#3A8FA0' },
              { quote: "When I opened it and saw messages from every single parent and kid in the team, I actually teared up. It meant so much more than a generic card from the newsagent.", name: 'Coach Dave', role: 'Group card recipient', color: '#F0ECFB', nameColor: '#7C5CBF' },
              { quote: "My nan lives in the UK and I never know what to send her. I made her a card in 3 minutes and she called me crying happy tears. Worth every cent.", name: 'Liam T.', role: 'Solo card sender', color: '#FDF0E8', nameColor: '#E8724A' },
            ].map((t, i) => (
              <div key={i} style={{ background: t.color, borderRadius: 16, padding: '20px 18px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '5.5rem', lineHeight: 1, color: t.nameColor, opacity: 0.18, position: 'absolute', top: -8, left: 12, fontWeight: 900, userSelect: 'none' }}>&ldquo;</div>
                <div style={{ fontSize: '.88rem', color: '#2A2A2A', lineHeight: 1.65, fontWeight: 600, fontStyle: 'italic', marginBottom: 14 }}>{t.quote}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.nameColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.85rem', color: '#fff', flexShrink: 0 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '.85rem', color: '#2A2A2A' }}>{t.name}</div>
                    <div style={{ fontSize: '.72rem', color: '#B0A8BC', fontWeight: 600 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div style={{ padding: '32px 18px 0', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.55rem', color: '#2A2A2A', marginBottom: 6 }}>
            You&apos;re all set in 2 minutes!
          </div>
          <div style={{ fontSize: '.88rem', color: '#7A7585', fontWeight: 600 }}>Curated and convenient, without a trip to the shops.</div>
        </div>

        {[
          { bg: '#F0ECFB', icon: '🖼️', title: 'Curated images for every occasion', desc: 'Coaches, birthdays, thank yous, weddings, new babies, retirement, mum, dad and more. Or upload your own team photo!' },
          { bg: '#E8F5EF', icon: '✍️', title: 'Handwrite it if you want', desc: 'Write on paper, take a photo - it appears on the card exactly as you wrote it. Personal, not generic.' },
          { bg: '#FDF0E8', icon: '📨', title: 'Arrives instantly, anywhere', desc: 'UK relatives, interstate coaches, overseas family - no postage, no delays, no address headaches.' },
          { bg: '#FBE8EE', icon: '💳', title: 'Add a gift card', desc: 'Include a gift card with any amount - spendable anywhere, by anyone, in any country.' },
        ].map((b, i) => (
          <div key={i} style={{ background: b.bg, borderRadius: 16, padding: '17px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 11 }}>
            <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>{b.icon}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '.97rem', marginBottom: 3 }}>{b.title}</div>
              <div style={{ fontSize: '.83rem', color: '#7A7585', lineHeight: 1.5, fontWeight: 600 }}>{b.desc}</div>
            </div>
          </div>
        ))}

        {/* Group callout */}
        <div style={{ background: 'linear-gradient(135deg,#E87240,#F09070)', borderRadius: 18, padding: '22px 20px', marginBottom: 28, color: '#fff' }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 6 }}>👥 Running a group gift?</div>
          <div style={{ fontSize: '.86rem', lineHeight: 1.55, opacity: .9, fontWeight: 600, marginBottom: 14 }}>
            Share one link. Everyone adds their own message and chips into the gift. We send the reminders so you don't have to chase a single person. The card pays for itself - <strong>free for the organiser.</strong>
          </div>
          <Btn onClick={onGroup} style={{ background: '#fff', color: '#E8724A' }}>Set up a group card →</Btn>
        </div>

        {/* Pricing */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 5 }}>Simple pricing.</div>
          <div style={{ fontSize: '.86rem', color: '#7A7585', fontWeight: 600, marginBottom: 14 }}>Less than a card from the newsagent. Way better.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#EAF4FB', borderRadius: 14, padding: 18, border: '2px solid rgba(58,143,160,.2)' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#3A8FA0' }}>Free</div>
              <div style={{ fontSize: '.78rem', color: '#7A7585', marginTop: 3, fontWeight: 700 }}>Solo card</div>
            </div>
            <div style={{ background: '#FDF0E8', borderRadius: 14, padding: 18, border: '2px solid rgba(232,114,74,.2)' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#E8724A' }}>Free*</div>
              <div style={{ fontSize: '.78rem', color: '#7A7585', marginTop: 3, fontWeight: 700 }}>Group card</div>
            </div>
          </div>
          <div style={{ fontSize: '.74rem', color: '#7A7585', marginTop: 8, fontWeight: 600 }}>*Group card covered by contributions. Small gift processing fee applies.</div>
        </div>

        {/* Final CTAs */}
        <div style={{ paddingBottom: 50 }}>
          <Btn variant="teal" full onClick={onSolo}>💌 Send a card now →</Btn>
          <Btn variant="coral" full onClick={onGroup}>👥 Create a group card →</Btn>
        </div>

      </div>
    </div>
  );
}
