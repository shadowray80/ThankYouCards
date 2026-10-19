'use client';

import { useRef, useState } from 'react';

// "Print it at home" pictures: a solo card and a group card. A swipe carousel with dots (no
// auto-advance, so it never moves while someone's looking). `sideBySide`: on wide screens show
// both pictures next to each other instead, nothing hidden behind a swipe.

const SLIDES = [
  { src: '/print-at-home.webp', caption: 'A card from you', alt: 'A printed birthday card standing on a table, open to show the message inside' },
  { src: '/print-at-home-group.webp', caption: 'A card from everyone', alt: 'A printed group card for a junior footy coach, open to show the team’s messages and photos inside' },
];

const CSS = `
  .tyc-pc-track { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; gap: 12px; }
  .tyc-pc-track::-webkit-scrollbar { display: none; }
  .tyc-pc-slide { flex: 0 0 100%; scroll-snap-align: center; }
  .tyc-pc-arrow { display: none; }
  @media (hover: hover) { .tyc-pc-arrow { display: flex; } }
  @media (min-width: 760px) {
    .tyc-pc-wide .tyc-pc-track { display: grid; grid-template-columns: 1fr 1fr; overflow: visible; }
    .tyc-pc-wide .tyc-pc-dots, .tyc-pc-wide .tyc-pc-arrow { display: none; }
  }
`;

export function PrintCarousel({ sideBySide = false }: { sideBySide?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const go = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = (i + SLIDES.length) % SLIDES.length;
    track.scrollTo({ left: next * (track.clientWidth + 12), behavior: 'smooth' });
  };

  const arrow = (dir: -1 | 1): React.CSSProperties => ({
    position: 'absolute', top: '42%', [dir < 0 ? 'left' : 'right']: 10, transform: 'translateY(-50%)',
    width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.9)', color: '#2A2A2A',
    boxShadow: '0 2px 10px rgba(0,0,0,.15)', cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', fontWeight: 800, fontFamily: "'Nunito',sans-serif",
  });

  return (
    <div className={sideBySide ? 'tyc-pc-wide' : undefined} style={{ position: 'relative' }}>
      <style>{CSS}</style>
      <div
        ref={trackRef}
        className="tyc-pc-track"
        onScroll={e => {
          const t = e.currentTarget;
          setIndex(Math.round(t.scrollLeft / (t.clientWidth + 12)));
        }}
      >
        {SLIDES.map(s => (
          <figure key={s.src} className="tyc-pc-slide" style={{ margin: 0 }}>
            <img src={s.src} alt={s.alt} width={1536} height={1024} loading="lazy"
              style={{ width: '100%', height: 'auto', borderRadius: 16, display: 'block', boxShadow: '0 8px 30px rgba(60,50,100,.14)' }} />
            <figcaption style={{ textAlign: 'center', fontSize: '.85rem', fontWeight: 800, color: '#7A7585', marginTop: 10, fontFamily: "'Nunito',sans-serif" }}>
              {s.caption}
            </figcaption>
          </figure>
        ))}
      </div>
      <button type="button" className="tyc-pc-arrow" aria-label="Previous picture" onClick={() => go(index - 1)} style={arrow(-1)}>‹</button>
      <button type="button" className="tyc-pc-arrow" aria-label="Next picture" onClick={() => go(index + 1)} style={arrow(1)}>›</button>
      <div className="tyc-pc-dots" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
        {SLIDES.map((s, i) => (
          <button key={s.src} type="button" aria-label={`Show picture ${i + 1}`} aria-current={i === index}
            onClick={() => go(i)}
            style={{ width: i === index ? 20 : 8, height: 8, borderRadius: 4, border: 'none', padding: 0, cursor: 'pointer', background: i === index ? '#3A8FA0' : '#D3E6F2', transition: 'width .2s, background .2s' }} />
        ))}
      </div>
    </div>
  );
}
