'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/ui/Nav';
import { EXAMPLE_SLUG } from '@/lib/exampleCard';
import { PrintCarousel } from '@/components/ui/PrintCarousel';

// "How it works" (More menu + home page): the two kinds of card in a few steps, a live read-only
// organiser page for a made-up card, honest answers, and a short About.

const SANS = "'Nunito',sans-serif";
const INK = '#2A2A2A';
const SOFT = '#7A7585';

const PATHS = [
  {
    title: 'Solo card', price: 'Free', colour: '#3A8FA0', bg: '#EAF4FB', border: '#D3E6F2', start: '/?v=solo', cta: 'Send a solo card',
    steps: [
      'Pick a design, or use your own photo.',
      'Write your message.',
      'Send the link, email it, or print it at home.',
    ],
    note: 'No account needed. Log in and every card you send is kept in My cards.',
  },
  {
    title: 'Group card', price: '$15', colour: '#E8724A', bg: '#FDF0E8', border: '#F0D0B8', start: '/?v=group', cta: 'Create a group card',
    steps: [
      'Set up the card: a design, a message and a date.',
      'Share the link. Everyone adds a message or a photo, with no account or app.',
      'Watch it fill up on your organiser page.',
      'Pay $15 when you’re ready, then send it, print it at home or save it.',
    ],
    note: 'We recommend an account, so all your cards are in one place (without one, we email you the link to your organiser page). Corporate cards need an account. Late messages are welcome, even after it’s sent.',
  },
];

const ANSWERS: [string, string][] = [
  ['Do the people signing need an account?', 'No. They open the link, write their message and they’re done.'],
  ['When does the recipient see the card?', 'Only when you send it to them. Until then it’s just you and the people signing.'],
  ['Can people add messages after it’s sent?', 'Yes. Late messages appear on the card straight away.'],
  ['Can I change the card later?', 'Yes. The cover, the words and the photo, any time.'],
  ['Who can see a card?', 'Only people with its link. We only ever show a card on our website if the sender says yes.'],
  ['What does the $15 cover?', 'One group card with as many messages and photos as you like, sending it, and printing it at home or saving it as a picture. Solo cards are free.'],
  ['Can I print the card?', 'Yes, at home. Any card prints as a folded A5 card on an A4 sheet, on your own printer.'],
  ['Do I need an account?', 'Not for a solo card. For a group card we recommend one: every card you’ve made is in one place. Without one, we email you the link to your organiser page. Corporate cards need an account, which also saves your colours and logo for next time.'],
];

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: SANS, fontWeight: 800, fontSize: '1.35rem', color: INK, margin: '0 0 14px' }}>{children}</h2>;
}

// The real organiser page for the example card, inside a phone outline. The page itself can't be
// clicked (it's an example); the phone screen scrolls.
function ExamplePhone() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(2200);

  const measure = () => {
    const doc = frameRef.current?.contentDocument;
    if (doc?.body) setHeight(Math.max(900, doc.documentElement.scrollHeight));
  };

  return (
    <div style={{ width: 340, maxWidth: '100%', margin: '0 auto', borderRadius: 40, border: '10px solid #2A2A2A', background: '#2A2A2A', boxShadow: '0 20px 60px rgba(60,50,100,.22)', overflow: 'hidden' }}>
      <div style={{ height: 600, overflowY: 'auto', borderRadius: 30, background: '#FFFDF8' }}>
        <iframe
          ref={frameRef}
          src={`/manage/${EXAMPLE_SLUG}`}
          title="Example organiser page"
          scrolling="no"
          tabIndex={-1}
          onLoad={() => { measure(); setTimeout(measure, 1200); setTimeout(measure, 3000); }}
          style={{ display: 'block', width: '100%', height, border: 'none', pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}

export function HowItWorks() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFDF8', fontFamily: SANS, color: INK }}>
      <style>{`
        .hiw-paths { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .hiw-organiser { display: grid; grid-template-columns: 1fr; gap: 28px; align-items: center; }
        @media (min-width: 760px) {
          .hiw-paths { grid-template-columns: 1fr 1fr; }
          .hiw-organiser { grid-template-columns: 1fr 340px; }
        }
      `}</style>
      <Nav onHome={() => router.push('/')} badge={null} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 64px' }}>
        <h1 style={{ fontWeight: 800, fontSize: '2rem', margin: '0 0 6px' }}>How it works</h1>
        <p style={{ fontSize: '1rem', color: SOFT, fontWeight: 600, lineHeight: 1.6, margin: '0 0 26px', maxWidth: 560 }}>
          A card from just you, or one everyone signs. Here’s what happens.
        </p>

        {/* The two kinds of card */}
        <div className="hiw-paths">
          {PATHS.map(p => (
            <section key={p.title} style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 18, padding: '20px 20px 18px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: p.colour, margin: 0 }}>{p.title}</h2>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: INK }}>{p.price}</span>
              </div>
              <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {p.steps.map((s, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: p.colour, color: '#fff', fontWeight: 800, fontSize: '.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: '.95rem', fontWeight: 600, lineHeight: 1.5, paddingTop: 2 }}>{s}</span>
                  </li>
                ))}
              </ol>
              <p style={{ fontSize: '.85rem', color: SOFT, fontWeight: 600, lineHeight: 1.5, margin: '0 0 16px', flex: 1 }}>{p.note}</p>
              <a href={p.start} style={{ display: 'block', textAlign: 'center', background: p.colour, color: '#fff', borderRadius: 12, padding: '12px', fontWeight: 800, fontSize: '.95rem', textDecoration: 'none' }}>{p.cta}</a>
            </section>
          ))}
        </div>

        {/* The organiser page, for real */}
        <section style={{ marginTop: 52 }} className="hiw-organiser">
          <div>
            <Heading>Your organiser page</Heading>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: INK, fontWeight: 600, margin: '0 0 12px' }}>
              Running a group card happens on one page. It shows the card messages as they are added, who’s signed, the link to share, a reminder to nudge people, and sending it when you’re ready.
            </p>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: INK, fontWeight: 600, margin: '0 0 12px' }}>
              Nothing goes to the recipient until you say so, and you can edit everything along the way.
            </p>
            <p style={{ fontSize: '.88rem', lineHeight: 1.6, color: SOFT, fontWeight: 600, margin: 0 }}>
              This is the real page, for a made-up card. Scroll the phone to look around.
            </p>
          </div>
          <ExamplePhone />
        </section>

        {/* Print at home */}
        <section style={{ marginTop: 52 }}>
          <Heading>Print it at home</Heading>
          <p style={{ fontSize: '1rem', lineHeight: 1.7, color: INK, fontWeight: 600, margin: '0 0 20px', maxWidth: 640 }}>
            Every card, solo or group, also prints as a proper folded A5 card on your own printer: the cover on the front, the messages inside. Stand it on the mantelpiece, or pop it in the post.
          </p>
          <PrintCarousel sideBySide />
        </section>

        {/* Honest answers */}
        <section style={{ marginTop: 52 }}>
          <Heading>Good to know</Heading>
          <div style={{ background: '#fff', border: '1px solid #E8E2F0', borderRadius: 18, overflow: 'hidden' }}>
            {ANSWERS.map(([q, a], i) => (
              <div key={q} style={{ padding: '16px 20px', borderTop: i === 0 ? 'none' : '1px solid #F0ECF5' }}>
                <div style={{ fontWeight: 800, fontSize: '.98rem', marginBottom: 4 }}>{q}</div>
                <div style={{ fontSize: '.92rem', color: SOFT, fontWeight: 600, lineHeight: 1.6 }}>{a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section style={{ marginTop: 52, maxWidth: 640 }}>
          <Heading>A little thanks goes a long way.</Heading>
          {[
            'Everyone likes to feel appreciated. Whether it’s a teacher who’s gone the extra mile, a mate who’s helped you move house, or someone at work who deserves a pat on the back, a simple thank you can make their day.',
            'That’s why we made ThankYouCards.au.',
            'We wanted an easy way to make someone feel special, without having to organise a card, chase everyone for messages, or remember where you put the bloody envelope.',
            'Make a card, add a personal message, invite a few people to join in if you like, and send it off.',
          ].map(t => (
            <p key={t} style={{ fontSize: '1rem', lineHeight: 1.75, fontWeight: 600, margin: '0 0 14px' }}>{t}</p>
          ))}
          <p style={{ fontSize: '1rem', lineHeight: 1.75, fontWeight: 800, margin: '0 0 14px' }}>No fuss. Just a really nice way to say thanks.</p>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, fontWeight: 600, margin: '0 0 14px' }}>
            We’re an Australian business, and we reckon showing a bit of appreciation is something worth making more of.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, fontWeight: 600, margin: '0 0 6px' }}>
            We even asked Dirty Harry if he’d like a card! And you know what he said…
          </p>
          <p style={{ fontFamily: 'Georgia, var(--font-gelasio), serif', fontStyle: 'italic', fontSize: '1.35rem', color: '#3A8FA0', margin: '0 0 22px' }}>
            “Go ahead. Make my day.”
          </p>
          <p style={{ fontSize: '.85rem', color: SOFT, fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            ABN 54 939 189 975 · <a href="/contact" style={{ color: '#3A8FA0', fontWeight: 800, textDecoration: 'none' }}>Get in touch</a>
          </p>
        </section>
      </div>
    </div>
  );
}
