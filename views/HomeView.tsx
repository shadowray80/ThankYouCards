'use client';

import { Btn } from '@/components/ui/Button';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { THEMES, DEMO_MSGS } from '@/lib/themes';

interface HomeViewProps {
  onSolo: () => void;
  onGroup: () => void;
  onContribDemo: () => void;
  onDashDemo: () => void;
}

export function HomeView({ onSolo, onGroup, onContribDemo, onDashDemo }: HomeViewProps) {
  const heroMsgs = DEMO_MSGS.slice(0, 2);

  return (
    <div>
      {/* Nav */}
      <div style={{ background: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 200, borderBottom: '1px solid #E8E2F0' }}>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#3A8FA0' }}>
          thank<span style={{ color: '#E8724A' }}>you</span>cards<span style={{ color: '#7A7585', fontWeight: 600, fontSize: '.9rem' }}>.au</span>
        </div>
        <Btn variant="teal" sm onClick={onSolo}>Create a card</Btn>
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

          {/* Subtext */}
          <p style={{ color: '#7A7585', fontSize: '.94rem', lineHeight: 1.65, marginBottom: 24, fontWeight: 600, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
            Beautiful, personalised thank you cards — sent instantly, anywhere in the world.
          </p>

          {/* CTAs — large card tiles */}
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
          <div style={{ background: '#FDF0E8', borderRadius: 14, padding: '12px 16px', fontSize: '.84rem', color: '#E8724A', fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>
            💡 Group card is <strong>free for the organiser</strong> — covered by contributions
          </div>

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

      {/* Benefits */}
      <div style={{ padding: '52px 18px 0', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.55rem', color: '#2A2A2A', marginBottom: 6 }}>
            Everything sorted.<br /><span style={{ color: '#3A8FA0' }}>In under 2 minutes.</span>
          </div>
          <div style={{ fontSize: '.88rem', color: '#7A7585', fontWeight: 600 }}>No shops. No stamps. No chasing people.</div>
        </div>

        {[
          { bg: '#EAF4FB', icon: '⚡', title: 'Done in 2 minutes, seriously', desc: 'Pick a theme, write your message, send the link. No faff, no newsagent queue, no last-minute panic.' },
          { bg: '#F0ECFB', icon: '🖼️', title: 'Cards that actually look the part', desc: 'Curated images for every occasion — AFL, cricket, school, swim and more. Or upload your own team photo.' },
          { bg: '#E8F5EF', icon: '✍️', title: 'Handwrite it if you want', desc: 'Write on paper, take a photo — it appears on the card exactly as you wrote it. Personal, not generic.' },
          { bg: '#FDF0E8', icon: '📨', title: 'Arrives instantly, anywhere', desc: 'UK relatives, interstate coaches, overseas family — no postage, no delays, no address headaches.' },
          { bg: '#FBE8EE', icon: '💳', title: 'Add a Visa gift card', desc: 'Include a Visa gift card with any amount — spendable anywhere, by anyone, in any country.' },
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
            Share one link. Everyone adds their own message and chips into the gift. We send the reminders so you don't have to chase a single person. The card pays for itself — <strong>free for the organiser.</strong>
          </div>
          <Btn onClick={onGroup} style={{ background: '#fff', color: '#E8724A' }}>Set up a group card →</Btn>
        </div>

        {/* Pricing */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 5 }}>Simple pricing.</div>
          <div style={{ fontSize: '.86rem', color: '#7A7585', fontWeight: 600, marginBottom: 14 }}>Less than a card from the newsagent. Way better.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#EAF4FB', borderRadius: 14, padding: 18, border: '2px solid rgba(58,143,160,.2)' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#3A8FA0' }}>$4.99</div>
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
          <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'center' }}>
            <Btn variant="outline" sm onClick={onContribDemo}>Contributor view</Btn>
            <Btn variant="outline" sm onClick={onDashDemo}>Dashboard demo</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
