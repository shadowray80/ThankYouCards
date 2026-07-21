'use client';

import React from 'react';
import { CORPORATE_PALETTES, CorporatePalette, buildCustomPalette } from '@/lib/palettes';

interface Campaign {
  slug: string;
  recipient_name: string;
  occasion: string | null;
  card_message: string | null;
  card_image_url: string | null;
  card_palette: string | null;
  card_logo_url?: string | null;
}

interface Contribution {
  contributor_name: string;
  message: string | null;
  photo_url?: string | null;
  photo_label?: string | null;
}

const MAX_AVATARS = 7;

function PhotoCard({ c, index, palette }: { c: Contribution; index: number; palette: CorporatePalette }) {
  const labelLeft = index % 2 === 0;
  return (
    <div style={{ breakInside: 'avoid', marginBottom: 14, display: 'inline-block', width: '100%', boxSizing: 'border-box', padding: '4px 2px' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '5px 5px 18px', boxShadow: '0 4px 16px rgba(0,0,0,.1)', position: 'relative' }}>
        <div style={{ borderRadius: 8, overflow: 'hidden' }}>
          <img src={c.photo_url!} alt="" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
        </div>
        {c.photo_label && (
          <div style={{
            position: 'absolute', top: -8,
            ...(labelLeft ? { left: -6 } : { right: -6 }),
            background: palette.headerFrom, color: '#fff', borderRadius: 20,
            padding: '4px 10px', fontSize: '.65rem', fontWeight: 800,
            boxShadow: '0 2px 8px rgba(0,0,0,.2)', whiteSpace: 'nowrap', zIndex: 5,
          }}>
            {c.photo_label}
          </div>
        )}
        <div style={{ textAlign: 'center', paddingTop: 6, fontSize: '.68rem', fontWeight: 700, color: '#9A9090', fontFamily: "'Nunito', sans-serif", letterSpacing: '.02em' }}>
          — {c.contributor_name}
        </div>
      </div>
    </div>
  );
}

function MessageCard({ c, index, wide, palette }: { c: Contribution; index: number; wide?: boolean; palette: CorporatePalette }) {
  const type = index % 4;
  const msg  = c.message || '';

  const base: React.CSSProperties = {
    breakInside: 'avoid',
    marginBottom: 10,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,.06)',
    fontFamily: "'Nunito', sans-serif",
    display: wide ? 'block' : 'inline-block',
    width: '100%',
    boxSizing: 'border-box',
    ...(wide ? { columnSpan: 'all' } : {}),
  };

  // Wide — featured quote spanning both columns
  if (wide) {
    return (
      <div style={{ ...base, background: '#fff', padding: '20px 20px 18px', boxShadow: '0 4px 18px rgba(0,0,0,.08)' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '5rem', lineHeight: 0.6, color: palette.accent, opacity: 0.7, marginBottom: 12, marginLeft: -3 }}>&ldquo;</div>
        <p style={{ fontSize: '.95rem', color: '#1A1A2E', lineHeight: 1.75, fontWeight: 600, margin: '0 0 14px', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{msg}</p>
        <div style={{ borderTop: `1.5px solid ${palette.accent}`, paddingTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: palette.headerFrom, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.7rem', color: '#fff', flexShrink: 0 }}>
            {c.contributor_name.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: '.8rem', fontWeight: 800, color: '#1A1A2E' }}>{c.contributor_name}</div>
        </div>
      </div>
    );
  }

  // Type 0 — accent left-border quote
  if (type === 0) {
    return (
      <div style={{ ...base, background: '#fff', borderLeft: `3px solid ${palette.accent}`, borderRadius: '0 12px 12px 0', padding: '13px 12px 13px 14px' }}>
        <p style={{ fontSize: '.84rem', color: '#1A1A2E', lineHeight: 1.65, fontWeight: 600, margin: '0 0 8px', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{msg}</p>
        <div style={{ fontSize: '.72rem', fontWeight: 800, color: palette.accent }}>— {c.contributor_name}</div>
      </div>
    );
  }

  // Type 1 — handwritten (Dancing Script)
  if (type === 1) {
    return (
      <div style={{ ...base, background: palette.accentLight, padding: '14px 13px' }}>
        <p style={{ fontFamily: 'var(--font-dancing), cursive', fontSize: '1.15rem', color: palette.headerFrom, lineHeight: 1.6, margin: '0 0 8px', fontWeight: 400 }}>{msg}</p>
        <div style={{ fontSize: '.7rem', fontWeight: 800, color: palette.accent, fontFamily: "'Nunito', sans-serif" }}>— {c.contributor_name}</div>
      </div>
    );
  }

  // Type 2 — clean light card
  if (type === 2) {
    return (
      <div style={{ ...base, background: palette.cardLight, padding: '13px 12px' }}>
        <p style={{ fontSize: '.84rem', color: '#1A1A2E', lineHeight: 1.65, fontWeight: 600, margin: '0 0 8px' }}>{msg}</p>
        <div style={{ fontSize: '.72rem', fontWeight: 800, color: palette.headerFrom }}>— {c.contributor_name}</div>
      </div>
    );
  }

  // Type 3 — subtle accent quotemark, white bg
  return (
    <div style={{ ...base, background: '#fff', padding: '13px 12px' }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '2.8rem', lineHeight: 0.7, color: palette.accent, opacity: 0.22, marginBottom: 6, marginLeft: -2 }}>&ldquo;</div>
      <p style={{ fontSize: '.84rem', color: '#1A1A2E', lineHeight: 1.65, fontWeight: 600, margin: '0 0 8px' }}>{msg}</p>
      <div style={{ fontSize: '.72rem', fontWeight: 800, color: palette.accent }}>— {c.contributor_name}</div>
    </div>
  );
}

export function CorporateView({
  campaign,
  contributions,
  preview,
  noHeader,
  logoScale = 1,
}: {
  campaign: Campaign;
  contributions: Contribution[];
  preview?: boolean;
  noHeader?: boolean;
  logoScale?: number;
}) {
  const palette        = CORPORATE_PALETTES.find(p => p.id === (campaign.card_palette ?? 'navy'))
    ?? (campaign.card_palette?.startsWith('#') ? buildCustomPalette(campaign.card_palette) : CORPORATE_PALETTES[0]);
  const recipientName  = campaign.recipient_name.charAt(0).toUpperCase() + campaign.recipient_name.slice(1);
  const hasImage       = !!campaign.card_image_url;
  const visibleAvatars = contributions.slice(0, MAX_AVATARS);
  const overflowCount  = Math.max(0, contributions.length - MAX_AVATARS);

  const hasEnoughForWide = contributions.length > 3;
  let textIdx  = 0;
  let photoIdx = 0;
  const tiles = contributions.flatMap((c, i) => {
    const result: React.ReactNode[] = [];
    if (c.photo_url) result.push(<PhotoCard key={`${i}-photo`} c={c} index={photoIdx++} palette={palette} />);
    if (c.message) {
      const idx  = textIdx++;
      const wide = hasEnoughForWide && (idx === 0 || idx % 5 === 4);
      result.push(<MessageCard key={`${i}-msg`} c={c} index={idx} wide={wide} palette={palette} />);
    }
    return result;
  });

  return (
    <div style={{ background: '#F9F9FB', minHeight: (preview || noHeader) ? 'auto' : '100dvh', borderRadius: (preview || noHeader) ? 16 : 0, overflow: (preview || noHeader) ? 'hidden' : 'visible', fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Cover ── */}
      {!noHeader && (
        <div style={{ position: 'relative', background: `linear-gradient(135deg, ${palette.headerFrom}, ${palette.headerTo})`, minHeight: 280, display: 'flex', overflow: 'hidden' }}>
          {/* Text side */}
          <div style={{ flex: 1, padding: '40px 24px 32px', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
            <div style={{ fontSize: '.55rem', fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: 10 }}>TO</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 9vw, 3.4rem)', color: '#fff', lineHeight: 1.05, marginBottom: 12 }}>
              {recipientName}
            </div>
            {campaign.card_message && (
              <div style={{ color: palette.accent, fontSize: 'clamp(.85rem, 3.5vw, 1.15rem)', fontWeight: 700, lineHeight: 1.4, marginBottom: 8, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                {campaign.card_message}
              </div>
            )}
            {campaign.occasion && (
              <div style={{ fontSize: '.76rem', color: 'rgba(255,255,255,.5)', fontWeight: 700 }}>
                {campaign.occasion.replace(/^From\s+/i, '')}
              </div>
            )}
            {campaign.card_logo_url ? (
              <img src={campaign.card_logo_url} alt="" style={{ maxHeight: 40 * logoScale, maxWidth: 120 * logoScale, objectFit: 'contain', objectPosition: 'left center', marginTop: 14, opacity: 0.9 }} />
            ) : preview && (
              <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', height: 40, minWidth: 64, border: '1.5px dashed rgba(255,255,255,.3)', borderRadius: 6, padding: '0 14px' }}>
                <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.4)', fontWeight: 800, fontFamily: "'Nunito', sans-serif", whiteSpace: 'nowrap' }}>Your logo</span>
              </div>
            )}
          </div>
          {/* Photo side */}
          {hasImage && (
            <div style={{ width: '45%', flexShrink: 0, position: 'relative' }}>
              <img src={campaign.card_image_url!} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${palette.headerFrom} 0%, ${palette.headerFrom}E8 20%, ${palette.headerFrom}A0 45%, ${palette.headerFrom}40 65%, transparent 85%)` }} />
            </div>
          )}
        </div>
      )}

      {/* ── Contributor bar ── */}
      {contributions.length > 0 && (
        <div style={{ background: '#fff', borderBottom: '1px solid #EAEAEA', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '.85rem' }}>👥</span>
          <span style={{ fontWeight: 700, fontSize: '.78rem', color: '#1A1A2E' }}>
            <strong style={{ color: palette.headerFrom }}>{contributions.length}</strong>{' '}
            {contributions.length === 1 ? 'colleague' : 'colleagues'} contributed
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex' }}>
            {visibleAvatars.map((c, i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: palette.headerFrom, border: '2px solid #fff', marginLeft: i > 0 ? -6 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.6rem', color: '#fff', position: 'relative', zIndex: visibleAvatars.length - i }}>
                {c.contributor_name.charAt(0).toUpperCase()}
              </div>
            ))}
            {overflowCount > 0 && (
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#E8E2F0', border: '2px solid #fff', marginLeft: -6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.58rem', color: '#7A7585', position: 'relative', zIndex: 0 }}>+{overflowCount}</div>
            )}
          </div>
        </div>
      )}

      {/* ── Masonry grid ── */}
      {tiles.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', color: '#9A9AB0', fontWeight: 700 }}>
          No messages yet — check back soon!
        </div>
      ) : (
        <div style={{ padding: '14px 12px 4px', columns: 2, columnGap: '10px' }}>
          {tiles}
        </div>
      )}

      {/* ── Footer ── */}
      {!preview && !noHeader && (
        <div style={{ margin: '8px 12px 24px', borderRadius: 16, background: `linear-gradient(135deg, ${palette.headerFrom}, ${palette.headerTo})`, padding: '28px 20px', textAlign: 'center' }}>
          {campaign.card_message && (
            <div style={{ fontFamily: 'var(--font-dancing), cursive', fontSize: 'clamp(1.6rem, 7vw, 2.4rem)', color: '#fff', lineHeight: 1.35, marginBottom: 4 }}>
              {campaign.card_message}
            </div>
          )}
          {campaign.occasion && (
            <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.45)', fontWeight: 600, marginBottom: 18 }}>— {campaign.occasion.replace(/^From\s+/i, '')}</div>
          )}
          <a href="/" style={{ display: 'inline-block', background: palette.accent, color: '#fff', borderRadius: 10, padding: '11px 24px', fontWeight: 800, fontSize: '.9rem', textDecoration: 'none', fontFamily: "'Nunito', sans-serif", marginTop: campaign.occasion ? 0 : 16 }}>
            Create your own card →
          </a>
          <div style={{ marginTop: 14, display: 'flex', gap: 16, justifyContent: 'center' }}>
            <a href="/terms" style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)', fontWeight: 600, textDecoration: 'none' }}>Terms</a>
            <a href="/privacy" style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)', fontWeight: 600, textDecoration: 'none' }}>Privacy</a>
          </div>
        </div>
      )}

    </div>
  );
}
