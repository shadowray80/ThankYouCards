'use client';

import React from 'react';
import { CASUAL_PALETTES, CasualPalette } from '@/lib/palettes';

interface Campaign {
  slug: string;
  recipient_name: string;
  occasion: string | null;
  card_message: string | null;
  card_image_url: string | null;
  card_palette: string | null;
}

interface Contribution {
  contributor_name: string;
  message: string | null;
  photo_url?: string | null;
  photo_label?: string | null;
}

const DECORATIONS = ['🎂', '👑', '🏆', '🌟', '🎉', '💙', '🎊', '💪', '🎯', '🥇', '🎈', '⭐', '🙌', '🤜🤛', '🔥', '💫'];
const ROTATIONS   = [-4, 3, -2.5, 5, -3, 4.5, -5, 2, -3.5, 4, -2, 5.5];
const MAX_AVATARS = 7;

function PhotoCard({ c, index, palette }: { c: Contribution; index: number; palette: CasualPalette }) {
  const deg      = ROTATIONS[index % ROTATIONS.length];
  const labelLeft = index % 2 === 0;

  return (
    <div style={{
      breakInside: 'avoid',
      marginBottom: 18,
      display: 'inline-block',
      width: '100%',
      boxSizing: 'border-box',
      padding: '5px 3px',
    }}>
      {/* Outer white frame — rounded corners, polaroid bottom strip */}
      <div style={{
        transform: `rotate(${deg}deg)`,
        background: '#fff',
        borderRadius: 20,
        padding: '5px 5px 22px',
        boxShadow: '0 8px 32px rgba(0,0,0,.18)',
      }}>
        {/* Inner clip — rounds the image corners to match frame */}
        <div style={{ borderRadius: 15, overflow: 'hidden', position: 'relative' }}>
          <img src={c.photo_url!} alt="" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
          {c.photo_label && (
            <div style={{
              position: 'absolute',
              top: 10,
              ...(labelLeft ? { left: 10 } : { right: 10 }),
              background: palette.accent,
              color: '#fff',
              borderRadius: 20,
              padding: '5px 12px',
              fontSize: '.7rem',
              fontWeight: 800,
              transform: `rotate(${-deg * 0.4 + 2}deg)`,
              boxShadow: '0 2px 10px rgba(0,0,0,.3)',
              whiteSpace: 'nowrap',
            }}>
              {c.photo_label}
            </div>
          )}
        </div>
        {/* Name in the white polaroid strip */}
        <div style={{
          textAlign: 'center',
          paddingTop: 8,
          fontSize: '.73rem',
          fontWeight: 700,
          color: '#9A9090',
          fontFamily: "'Nunito', sans-serif",
          letterSpacing: '.02em',
        }}>
          — {c.contributor_name}
        </div>
      </div>
    </div>
  );
}

function MessageCard({ c, index, palette, wide }: { c: Contribution; index: number; palette: CasualPalette; wide?: boolean }) {
  const type = index % 4;
  const deco = DECORATIONS[index % DECORATIONS.length];
  const bg   = palette.cardBgs[index % palette.cardBgs.length];
  const msg  = c.message || '';

  const base: React.CSSProperties = {
    breakInside: 'avoid',
    marginBottom: 12,
    borderRadius: 16,
    padding: '14px 13px',
    boxShadow: '0 2px 10px rgba(0,0,0,.07)',
    fontFamily: "'Nunito', sans-serif",
    display: wide ? 'block' : 'inline-block',
    width: '100%',
    boxSizing: 'border-box',
    ...(wide ? { columnSpan: 'all' } : {}),
  };

  // Wide card — spans both columns, large featured quote
  if (wide) {
    return (
      <div style={{ ...base, background: '#fff', padding: '20px 22px 22px', boxShadow: '0 4px 20px rgba(0,0,0,.09)' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '6rem', lineHeight: 0.65, color: palette.accent, opacity: 0.9, marginBottom: 10, marginLeft: -4, userSelect: 'none' }}>&ldquo;</div>
        <p style={{ fontSize: '1rem', color: '#1A1A1A', lineHeight: 1.7, fontWeight: 700, margin: '0 0 16px' }}>{msg}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: palette.avatarColors[index % palette.avatarColors.length],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '.75rem', color: '#fff',
          }}>
            {c.contributor_name.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: '.82rem', fontWeight: 800, color: '#2A2A2A' }}>{c.contributor_name}</div>
        </div>
      </div>
    );
  }

  if (type === 0) {
    return (
      <div style={{ ...base, background: '#fff' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '3.8rem', lineHeight: 0.7, color: palette.accent, opacity: 0.18, marginBottom: 4, marginLeft: -2 }}>&ldquo;</div>
        <p style={{ fontSize: '.88rem', color: '#2A2A2A', lineHeight: 1.65, fontWeight: 600, margin: '0 0 12px' }}>{msg}</p>
        <div style={{ fontSize: '.78rem', fontWeight: 800, color: palette.accent }}>– {c.contributor_name}</div>
      </div>
    );
  }

  if (type === 1) {
    return (
      <div style={{ ...base, background: bg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: palette.avatarColors[index % palette.avatarColors.length],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '.72rem', color: '#fff', flexShrink: 0,
          }}>
            {c.contributor_name.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>{deco}</span>
        </div>
        <p style={{ fontSize: '.88rem', color: '#2A2A2A', lineHeight: 1.65, fontWeight: 600, margin: '0 0 8px' }}>{msg}</p>
        <div style={{ fontSize: '.78rem', fontWeight: 800, color: '#7A7585' }}>– {c.contributor_name}</div>
      </div>
    );
  }

  if (type === 2) {
    return (
      <div style={{ ...base, background: '#fff' }}>
        <p style={{ fontSize: '.88rem', color: '#2A2A2A', lineHeight: 1.65, fontWeight: 600, fontStyle: 'italic', margin: '0 0 10px' }}>{msg}</p>
        <div style={{ fontSize: '.78rem', fontWeight: 800, color: palette.accent }}>– {c.contributor_name}</div>
      </div>
    );
  }

  // Type 3 — big icon, centred
  return (
    <div style={{ ...base, background: bg, textAlign: 'center' }}>
      <div style={{ fontSize: '2.8rem', lineHeight: 1, marginBottom: 8 }}>{deco}</div>
      <p style={{ fontSize: '.88rem', color: '#2A2A2A', lineHeight: 1.65, fontWeight: 600, margin: '0 0 8px' }}>{msg}</p>
      <div style={{ fontSize: '.78rem', fontWeight: 800, color: palette.accent }}>– {c.contributor_name}</div>
    </div>
  );
}

export function CasualView({ campaign, contributions, preview }: { campaign: Campaign; contributions: Contribution[]; preview?: boolean }) {
  const palette        = CASUAL_PALETTES.find(p => p.id === (campaign.card_palette ?? 'sky')) ?? CASUAL_PALETTES[0];
  const recipientName  = campaign.recipient_name.charAt(0).toUpperCase() + campaign.recipient_name.slice(1);
  const visibleAvatars = contributions.slice(0, MAX_AVATARS);
  const overflowCount  = Math.max(0, contributions.length - MAX_AVATARS);
  const hasImage       = !!campaign.card_image_url;

  const hasEnoughForWide = contributions.length > 3;
  let textIdx  = 0;
  let photoIdx = 0;
  const tiles = contributions.flatMap((c, i) => {
    const result: React.ReactNode[] = [];
    if (c.photo_url) result.push(<PhotoCard key={`${i}-photo`} c={c} index={photoIdx++} palette={palette} />);
    if (c.message) {
      const idx  = textIdx++;
      const wide = hasEnoughForWide && (idx === 0 || idx % 5 === 4);
      result.push(<MessageCard key={`${i}-msg`} c={c} index={idx} palette={palette} wide={wide} />);
    }
    return result;
  });

  return (
    <div style={{ background: palette.bg, minHeight: preview ? 'auto' : '100dvh', borderRadius: preview ? 16 : 0, overflow: preview ? 'hidden' : 'visible', fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Cover ── */}
      <div style={{
        position: 'relative', overflow: 'hidden', minHeight: 300,
        background: `linear-gradient(135deg, ${palette.headerFrom}, ${palette.headerTo})`,
      }}>
        {hasImage && (
          <img src={campaign.card_image_url!} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{
          position: 'relative', zIndex: 2, minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '48px 24px 28px',
          background: hasImage ? 'linear-gradient(to bottom, rgba(0,0,0,.05) 0%, rgba(0,0,0,.62) 100%)' : 'none',
        }}>
          <div style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', marginBottom: 4 }}>TO</div>
          <div style={{ fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(3rem, 13vw, 4.5rem)', color: '#fff', lineHeight: 1, textShadow: '0 2px 20px rgba(0,0,0,.35)', marginBottom: 8 }}>
            {recipientName}
          </div>
          {campaign.card_message && (
            <div style={{ fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(1.4rem, 6vw, 2rem)', color: 'rgba(255,255,255,.92)', lineHeight: 1.3, textShadow: '0 1px 12px rgba(0,0,0,.35)', marginBottom: 6 }}>
              {campaign.card_message}
            </div>
          )}
          {campaign.occasion && (
            <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.72)', fontWeight: 700 }}>From {campaign.occasion}</div>
          )}
        </div>
      </div>

      {/* ── Contributor bar ── */}
      {contributions.length > 0 && (
        <div style={{ background: '#fff', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1rem' }}>👥</span>
          <span style={{ fontWeight: 700, fontSize: '.82rem', color: '#2A2A2A' }}>
            <strong style={{ color: palette.accent }}>{contributions.length}</strong>{' '}
            {contributions.length === 1 ? 'person' : 'people'} contributed
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex' }}>
            {visibleAvatars.map((c, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: '50%',
                background: palette.avatarColors[i % palette.avatarColors.length],
                border: '2px solid #fff', marginLeft: i > 0 ? -7 : 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '.65rem', color: '#fff',
                position: 'relative', zIndex: visibleAvatars.length - i,
              }}>
                {c.contributor_name.charAt(0).toUpperCase()}
              </div>
            ))}
            {overflowCount > 0 && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#E8E2F0', border: '2px solid #fff', marginLeft: -7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '.6rem', color: '#7A7585',
                position: 'relative', zIndex: 0,
              }}>+{overflowCount}</div>
            )}
          </div>
        </div>
      )}

      {/* ── Masonry grid ── */}
      {tiles.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', color: '#7A7585', fontWeight: 700 }}>
          No messages yet — check back soon!
        </div>
      ) : (
        <div style={{ padding: '16px 14px 4px', columns: 2, columnGap: '12px' }}>
          {tiles}
        </div>
      )}

      {/* ── Footer ── */}
      {!preview && (
        <div style={{ margin: '8px 14px 24px', borderRadius: 20, background: `linear-gradient(135deg, ${palette.headerFrom}, ${palette.headerTo})`, padding: '28px 20px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(1.6rem, 7vw, 2.4rem)', color: '#fff', lineHeight: 1.35, marginBottom: 4 }}>
            {campaign.card_message || 'Thanks for everything!'}
          </div>
          {campaign.occasion && (
            <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.65)', fontWeight: 600, marginBottom: 18 }}>— {campaign.occasion}</div>
          )}
          <a href="/" style={{ display: 'inline-block', background: '#fff', color: palette.accent, borderRadius: 12, padding: '11px 24px', fontWeight: 800, fontSize: '.9rem', textDecoration: 'none', fontFamily: "'Nunito', sans-serif", marginTop: campaign.occasion ? 0 : 16 }}>
            Create your own card →
          </a>
          <div style={{ marginTop: 10, fontSize: '.72rem', color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>
            It&apos;s easy, meaningful and unforgettable.
          </div>
        </div>
      )}

    </div>
  );
}
