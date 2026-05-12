'use client';

import { useState } from 'react';
import { Theme, CardMessage, THEMES } from '@/lib/themes';

interface CardScrollViewProps {
  theme?: Theme;
  imgIdx?: number;
  recipientName?: string;
  fromText?: string;
  message?: string;        // short front-of-card message (frosted strip)
  soloMessage?: string;    // longer typed message shown below cover (solo card only)
  soloPhotoData?: string;  // handwritten photo shown below cover (solo card only)
  messages: CardMessage[];  // group/team messages
  giftAmount?: number;
  onAddMessage?: () => void;
  customImgUrl?: string;
  landscapeCover?: boolean; // show full landscape image, height follows image ratio
}

const AVATAR_COLORS = ['#3A8FA0', '#E8724A', '#7C5CBF', '#5A9070', '#C9933A', '#D94E7A', '#4A7CBF', '#8F5A3A'];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.abs(hash)];
}

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function MessageBubble({ m, index }: { m: CardMessage; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = m.msg.length > 120;

  return (
    <div style={{ padding: '16px 18px', borderBottom: '1px solid #F0EDF5', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      {/* Avatar */}
      <div style={{
        flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
        background: avatarColor(m.name),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '.75rem', fontWeight: 800, letterSpacing: '.02em',
      }}>
        {initials(m.name)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '.67rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: '#3A8FA0', marginBottom: 4 }}>
          {m.name}
        </div>

        {m.photoData ? (
          <img src={m.photoData} alt="Handwritten" style={{ width: '100%', maxHeight: 130, objectFit: 'contain', borderRadius: 8, border: '1px solid #E8E2F0' }} />
        ) : m.hw ? (
          <div style={{ fontSize: '.82rem', color: '#7A7585', fontStyle: 'italic' }}>[Handwritten message — shown when printed]</div>
        ) : (
          <>
            <div style={{
              fontFamily: "'Lora',serif", fontSize: '.97rem', lineHeight: 1.6, color: '#2A2A2A',
              display: !expanded && isLong ? '-webkit-box' : 'block',
              WebkitLineClamp: !expanded && isLong ? 2 : undefined,
              WebkitBoxOrient: !expanded && isLong ? 'vertical' : undefined,
              overflow: !expanded && isLong ? 'hidden' : 'visible',
            }}>
              {m.msg}
            </div>
            {isLong && (
              <button onClick={() => setExpanded(e => !e)} style={{
                background: 'none', border: 'none', padding: '4px 0 0', color: '#3A8FA0',
                fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif",
              }}>
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </>
        )}

        {m.timestamp && (
          <div style={{ fontSize: '.68rem', color: '#B0A8BC', marginTop: 5, textAlign: 'right' }}>{m.timestamp}</div>
        )}
      </div>
    </div>
  );
}

export function CardScrollView({ theme, imgIdx, recipientName, fromText, message, soloMessage, soloPhotoData, messages, giftAmount, onAddMessage, customImgUrl, landscapeCover }: CardScrollViewProps) {
  const t = theme || THEMES[0];
  const imgUrl = customImgUrl || t.imgs[imgIdx ?? 0];
  const name = recipientName || null;
  const from = fromText || 'From the Under 12s';
  const msg = message ?? '';

  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 56px rgba(60,50,100,.18)', marginBottom: 22 }}>

      {/* ── Card Cover ── */}
      <div style={{ position: 'relative', ...(landscapeCover ? {} : { aspectRatio: '3/4' }), overflow: 'hidden', background: t.color }}>
        <img
          key={imgUrl}
          src={imgUrl} alt=""
          style={{ width: '100%', ...(landscapeCover ? { height: 'auto', display: 'block' } : { height: '100%', objectFit: 'cover', display: 'block' }) }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />

        {/* Thin inset border */}
        <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, pointerEvents: 'none', zIndex: 2 }} />

        {/* "To" label + recipient name — top centre */}
        <div style={{ position: 'absolute', top: 22, left: 0, right: 0, textAlign: 'center', zIndex: 3, padding: '0 16px' }}>
          <div style={{ fontSize: '.58rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 2 }}>To</div>
          <div style={{
            fontFamily: 'var(--font-dancing), cursive',
            fontSize: 'clamp(2.4rem, 9vw, 3.2rem)',
            lineHeight: 1.1,
            letterSpacing: '.01em',
            color: name ? '#fff' : 'rgba(255,255,255,0.28)',
            textShadow: name ? '0 2px 20px rgba(0,0,0,0.55)' : 'none',
          }}>
            {name || 'The Absolute Legend'}
          </div>
        </div>

        {/* Frosted gradient strip — bottom of image, only when cover text set */}
        {msg ? (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3,
            background: 'linear-gradient(to top, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 55%, rgba(255,255,255,0.0) 100%)',
            padding: '48px 22px 22px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Lora',serif", fontStyle: 'italic',
              fontSize: 'clamp(1.45rem, 5.5vw, 1.9rem)', color: '#2A2A2A', lineHeight: 1.3,
            }}>
              {msg}
            </div>
          </div>
        ) : null}

        {/* Visa gift card badge — bottom right, only when giftAmount is set */}
        {giftAmount != null && giftAmount > 0 && (
          <div style={{
            position: 'absolute', bottom: 18, right: 16, zIndex: 4,
            background: 'linear-gradient(135deg,#1a237e,#1565c0)',
            borderRadius: 9, padding: '7px 11px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: '.5rem', color: 'rgba(255,255,255,.55)', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>VISA</div>
            <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 800, lineHeight: 1 }}>${giftAmount}</div>
          </div>
        )}
      </div>

      {/* ── Solo message panel OR team messages ── */}
      {(soloMessage !== undefined || soloPhotoData !== undefined) ? (
        /* Solo card: show the personal message as a clean panel */
        soloPhotoData ? (
          <div style={{ background: '#fff' }}>
            <img src={soloPhotoData} alt="Handwritten message" style={{ width: '100%', height: 'auto', display: 'block' }} />
            {from && <div style={{ padding: '12px 22px 18px', fontSize: '.78rem', color: '#7A7585', fontWeight: 600 }}>- {from}</div>}
          </div>
        ) : soloMessage ? (
          <div style={{ background: '#fff', padding: '22px 22px 24px' }}>
            <div style={{ fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: '1.08rem', lineHeight: 1.75, color: '#2A2A2A', whiteSpace: 'pre-wrap' }}>
              {soloMessage}
            </div>
            {from && (
              <div style={{ marginTop: 14, fontSize: '.78rem', color: '#7A7585', fontWeight: 600 }}>- {from}</div>
            )}
          </div>
        ) : (
          /* Placeholder when no message yet */
          <div style={{ background: '#FAFAF8', padding: '22px 22px 24px', borderTop: '1px solid #F0EDF5' }}>
            <div style={{ fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: '1rem', color: '#C8C0D0', lineHeight: 1.7 }}>
              Your message will appear here…
            </div>
          </div>
        )
      ) : (
        /* Group card: team messages */
        <>
          <div style={{ background: '#3A8FA0', color: 'rgba(255,255,255,.9)', textAlign: 'center', padding: '10px 16px', fontSize: '.75rem', letterSpacing: '.07em', fontWeight: 700 }}>
            Messages from the Team ↓
          </div>
          <div style={{ background: '#fff' }}>
            {messages.map((m, i) => (
              <MessageBubble key={i} m={m} index={i} />
            ))}
            {onAddMessage && (
              <div
                onClick={onAddMessage}
                style={{
                  padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', borderTop: '1px solid #F0EDF5',
                  background: '#FAFAFA', transition: 'background .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#EAF4FB')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FAFAFA')}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', border: '2px dashed #3A8FA0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#3A8FA0', fontSize: '1.2rem', fontWeight: 700, flexShrink: 0,
                }}>+</div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: '#3A8FA0', fontSize: '.92rem' }}>
                  Add your message
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ background: '#3A8FA0', padding: '16px 22px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, color: 'rgba(255,255,255,.9)', fontSize: '.95rem', marginBottom: 2 }}>
          thankyou<span style={{ color: '#F09070' }}>cards</span>.au
        </div>
        <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '.68rem', letterSpacing: '.06em' }}>A card thoughtfully chosen just for you.</div>
      </div>
    </div>
  );
}
