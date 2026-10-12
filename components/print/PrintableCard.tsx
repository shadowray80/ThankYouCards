'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import { CASUAL_PALETTES, CORPORATE_PALETTES, buildCustomPalette } from '@/lib/palettes';
import { PreviewWatermark } from '@/components/ui/PreviewWatermark';
import {
  SHEET_W, SHEET_H, PANEL_W, MARGIN, CONTENT_W, CONTENT_H, COLUMN_GAP, TILE_GAP, FONT_SIZES,
  columnsPerPanel, columnWidth, headerAloneOnLeft, chooseLayout, type InsideSpread,
} from '@/lib/printLayout';

// The printable A5 card: an outside sheet (back + front cover) and inside sheet(s) of
// messages, drawn at real A4-landscape size. Messages are measured, then packed into columns
// at the biggest text size that fits — none is ever split across a page.

export interface PrintCampaign {
  recipient_name: string;
  occasion: string | null;
  card_message: string | null;
  card_note: string | null;
  card_image_url: string | null;
  card_style: string | null;
  card_palette: string | null;
  card_accent: string | null;
  card_logo_url: string | null;
  card_logo_scale: number | null;
  card_text_on_image: boolean | null;
}

export interface PrintContribution {
  contributor_name: string;
  message: string | null;
  photo_url?: string | null;
  photo_label?: string | null;
}

export type PrintMode = 'double' | 'single';

const SCRIPT = 'var(--font-dancing), cursive';
const SERIF = 'var(--font-lora), Georgia, serif';
const SANS = "'Nunito', sans-serif";
const TEXT_SHADOW = '0 1px 3px rgba(0,0,0,.8), 0 3px 12px rgba(0,0,0,.6), 0 5px 30px rgba(0,0,0,.45)';
const PHOTO_MAX_H = CONTENT_H * 0.55;

interface Look {
  isCorporate: boolean;
  headerFrom: string;
  headerTo: string;
  accent: string;
  tileBgs: string[];
}

function lookFor(c: PrintCampaign): Look {
  if (c.card_style === 'corporate') {
    const p = c.card_palette?.startsWith('#')
      ? buildCustomPalette(c.card_palette)
      : CORPORATE_PALETTES.find(x => x.id === c.card_palette) ?? CORPORATE_PALETTES[0];
    return { isCorporate: true, headerFrom: p.headerFrom, headerTo: p.headerTo, accent: c.card_accent ?? p.accent, tileBgs: ['#ffffff', p.cardLight, p.accentLight] };
  }
  const p = CASUAL_PALETTES.find(x => x.id === c.card_palette) ?? CASUAL_PALETTES[0];
  return { isCorporate: false, headerFrom: p.headerFrom, headerTo: p.headerTo, accent: p.accent, tileBgs: p.cardBgs };
}

function capitalise(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function fromLine(c: PrintCampaign, contributions: PrintContribution[]): string {
  if (c.occasion?.trim()) return `From ${c.occasion.replace(/^From\s+/i, '').trim()}`;
  if (contributions.length === 1) return `From ${contributions[0].contributor_name}`;
  return '';
}

function loadRatio(url: string): Promise<number | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth / img.naturalHeight);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// ── Pieces ─────────────────────────────────────────────────────────────────────

function Sheet({ children, rotate = false, watermark = false }: { children?: React.ReactNode; rotate?: boolean; watermark?: boolean }) {
  return (
    <div className="tyc-sheet" style={{
      width: SHEET_W, height: SHEET_H, background: '#fff', display: 'flex', position: 'relative', overflow: 'hidden',
      transform: rotate ? 'rotate(180deg)' : undefined, boxShadow: '0 4px 24px rgba(0,0,0,.15)', marginBottom: 32,
    }}>
      {children}
      {watermark && <PreviewWatermark />}
    </div>
  );
}

function Panel({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ width: PANEL_W, height: SHEET_H, padding: MARGIN, boxSizing: 'border-box', ...style }}>{children}</div>;
}

function BackPanel() {
  return (
    <Panel style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: MARGIN + 18 }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 17, color: '#3A8FA0' }}>
        thank<span style={{ color: '#E8724A' }}>you</span>cards<span style={{ color: '#7A7585', fontWeight: 600, fontSize: 13 }}>.au</span>
      </div>
    </Panel>
  );
}

function CoverText({ c, from, look, onPhoto }: { c: PrintCampaign; from: string; look: Look; onPhoto: boolean }) {
  const shadow = onPhoto ? TEXT_SHADOW : undefined;
  const nameFont = look.isCorporate ? 'Georgia, serif' : SCRIPT;
  const tagFont = look.isCorporate ? 'Georgia, serif' : SCRIPT;
  return (
    <>
      <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, letterSpacing: '.22em', opacity: .8, textShadow: shadow }}>TO</div>
      <div style={{ fontFamily: nameFont, fontSize: look.isCorporate ? 56 : 72, lineHeight: 1.05, textShadow: shadow, overflowWrap: 'anywhere' }}>
        {capitalise(c.recipient_name)}
      </div>
      {c.card_message && (
        <div style={{ fontFamily: tagFont, fontStyle: look.isCorporate ? 'italic' : undefined, fontSize: look.isCorporate ? 20 : 32, marginTop: 6, lineHeight: 1.25, textShadow: shadow, color: look.isCorporate ? look.accent : undefined }}>
          {c.card_message}
        </div>
      )}
      {from && <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, marginTop: 10, opacity: .85, textShadow: shadow }}>{from}</div>}
    </>
  );
}

function FrontPanel({ c, from, look, ratio }: { c: PrintCampaign; from: string; look: Look; ratio: number | null }) {
  const img = c.card_image_url;
  const showText = c.card_text_on_image !== false;
  const isLandscape = !!img && ratio !== null && ratio > 1.1;
  const logo = look.isCorporate && c.card_logo_url ? (
    <img src={c.card_logo_url} alt="" style={{ maxHeight: 40 * (c.card_logo_scale ?? 1), maxWidth: 140 * (c.card_logo_scale ?? 1), objectFit: 'contain', marginTop: 16, alignSelf: 'center' }} />
  ) : null;

  // Landscape photo (e.g. a team shot): shown whole at the top — nobody cropped — with the
  // names underneath, all inside a thin rounded frame.
  if (isLandscape) {
    const textOnColour = look.isCorporate;
    return (
      <Panel>
        <div style={{ height: '100%', border: `2px solid ${look.headerFrom}`, borderRadius: 18, padding: 16, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <img src={img!} alt="" style={{ width: '100%', aspectRatio: String(ratio), objectFit: 'cover', borderRadius: 10, display: 'block' }} />
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', borderRadius: 10, padding: '0 14px',
            background: textOnColour ? `linear-gradient(135deg, ${look.headerFrom}, ${look.headerTo})` : undefined,
            color: textOnColour ? '#fff' : look.headerFrom,
          }}>
            <CoverText c={c} from={from} look={look} onPhoto={false} />
            {logo}
          </div>
        </div>
      </Panel>
    );
  }

  // Portrait (or no) photo: fills the front, text over the bottom like the online card.
  return (
    <Panel>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 14, overflow: 'hidden', background: `linear-gradient(135deg, ${look.headerFrom}, ${look.headerTo})` }}>
        {img && <img src={img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        {img && showText && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,.35) 100%)' }} />}
        {(showText || !img) && (
          <div style={{ position: 'absolute', left: 30, right: 30, bottom: 32, color: '#fff', display: 'flex', flexDirection: 'column' }}>
            <CoverText c={c} from={from} look={look} onPhoto={!!img} />
            {logo}
          </div>
        )}
      </div>
    </Panel>
  );
}

function InsideHeader({ c, look }: { c: PrintCampaign; look: Look }) {
  return (
    <div style={{ textAlign: 'center', paddingBottom: 18 }}>
      <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '.2em', color: '#999' }}>TO {c.recipient_name.toUpperCase()}</div>
      {c.card_message && <div style={{ fontFamily: look.isCorporate ? 'Georgia, serif' : SCRIPT, fontStyle: look.isCorporate ? 'italic' : undefined, fontSize: look.isCorporate ? 26 : 38, color: look.isCorporate ? look.headerFrom : look.accent, lineHeight: 1.15, marginTop: 2 }}>{c.card_message}</div>}
      {c.card_note && <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 14, color: '#555', marginTop: 6, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{c.card_note}</div>}
    </div>
  );
}

function MessageTile({ m, index, fontSize, width, ratio, look }: {
  m: PrintContribution; index: number; fontSize: number; width: number; ratio: number | null; look: Look;
}) {
  const hasPhoto = !!m.photo_url;
  // Photos keep their shape (a handwritten note must never be cropped), within a max height.
  let photoW = width - 14, photoH = ratio ? photoW / ratio : photoW * 0.75;
  if (photoH > PHOTO_MAX_H) { photoH = PHOTO_MAX_H; photoW = ratio ? photoH * ratio : photoW; }
  return (
    <div style={{
      width, boxSizing: 'border-box', marginBottom: TILE_GAP, borderRadius: 10,
      background: hasPhoto ? '#fff' : look.tileBgs[(index + 1) % look.tileBgs.length],
      border: '1px solid rgba(0,0,0,.07)', padding: hasPhoto ? 7 : '14px 16px',
      boxShadow: hasPhoto ? '0 2px 8px rgba(0,0,0,.12)' : undefined,
    }}>
      {hasPhoto && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src={m.photo_url!} alt="" style={{ width: photoW, height: photoH, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
        </div>
      )}
      {hasPhoto && m.photo_label && <div style={{ fontFamily: SCRIPT, fontSize: Math.round(fontSize * 1.1), color: '#333', textAlign: 'center', marginTop: 4 }}>{m.photo_label}</div>}
      {m.message && (
        <div style={{ fontFamily: SERIF, fontSize, lineHeight: 1.5, color: '#2A2A2A', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: hasPhoto ? '8px 9px 2px' : undefined }}>{m.message}</div>
      )}
      <div style={{ fontFamily: SANS, fontSize: Math.max(11, Math.round(fontSize * 0.75)), fontWeight: 800, color: look.isCorporate ? look.headerFrom : look.accent, marginTop: 6, textAlign: hasPhoto && !m.message ? 'center' : undefined, padding: hasPhoto && m.message ? '0 9px 4px' : undefined }}>
        – {m.contributor_name}
      </div>
    </div>
  );
}

// ── The whole card ─────────────────────────────────────────────────────────────

export function PrintableCard({ campaign, contributions, mode, flip, onReady, watermark = false }: {
  watermark?: boolean;
  campaign: PrintCampaign;
  contributions: PrintContribution[];
  mode: PrintMode;
  flip: boolean;
  onReady?: (info: { insideSheets: number }) => void;
}) {
  const look = lookFor(campaign);
  const from = fromLine(campaign, contributions);
  const messages = contributions.filter(m => m.message?.trim() || m.photo_url);
  const cols = columnsPerPanel(messages.length);
  const colW = columnWidth(cols);
  const headerAlone = headerAloneOnLeft(messages.length);
  const footer = messages.length > 1
    ? `${messages.length} messages${campaign.occasion ? ` · ${from.charAt(0).toLowerCase()}${from.slice(1)}` : ''}`
    : '';

  const [ratios, setRatios] = useState<Record<string, number | null> | null>(null);
  const [layout, setLayout] = useState<{ fontSize: number; spreads: InsideSpread[] } | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // 1. Learn every image's shape (cover + message photos) so tiles can be measured exactly.
  useEffect(() => {
    const urls = [campaign.card_image_url, ...messages.map(m => m.photo_url)].filter((u): u is string => !!u);
    let cancelled = false;
    Promise.all(urls.map(async u => [u, await loadRatio(u)] as const)).then(entries => {
      if (!cancelled) setRatios(Object.fromEntries(entries));
    });
    return () => { cancelled = true; };
  }, [campaign.card_image_url, contributions]); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Once the hidden measuring copy is rendered (fonts loaded), measure and pack.
  useEffect(() => {
    if (!ratios || !measureRef.current) return;
    let cancelled = false;
    document.fonts.ready.then(() => requestAnimationFrame(() => {
      const root = measureRef.current;
      if (cancelled || !root) return;
      const heightsBySize: Record<number, number[]> = {};
      for (const size of FONT_SIZES) {
        heightsBySize[size] = Array.from(root.querySelectorAll<HTMLElement>(`[data-size="${size}"] > [data-tile]`))
          .map(el => el.offsetHeight + TILE_GAP);
      }
      const headerH = (root.querySelector<HTMLElement>('[data-header]')?.offsetHeight ?? 0);
      const footerH = footer ? 28 : 0;
      setLayout(chooseLayout(heightsBySize, cols, headerH, footerH, headerAlone));
    }));
    return () => { cancelled = true; };
  }, [ratios]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (layout) onReady?.({ insideSheets: layout.spreads.length });
  }, [layout]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ratios || !layout) {
    return (
      <>
        <div style={{ fontFamily: SANS, fontWeight: 700, color: '#7A7585', padding: 24 }}>Laying out your card…</div>
        {ratios && (
          <div ref={measureRef} aria-hidden style={{ position: 'absolute', left: -20000, top: 0, visibility: 'hidden' }}>
            <div data-header style={{ width: CONTENT_W }}><InsideHeader c={campaign} look={look} /></div>
            {FONT_SIZES.map(size => (
              <div key={size} data-size={size} style={{ width: colW }}>
                {messages.map((m, i) => (
                  <div key={i} data-tile>
                    <MessageTile m={m} index={i} fontSize={size} width={colW} ratio={m.photo_url ? ratios[m.photo_url] ?? null : null} look={look} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  const renderColumns = (spread: InsideSpread, panel: 0 | 1) => {
    const columns = spread.columns.slice(panel * cols, panel * cols + cols);
    const few = messages.length <= 2;
    return (
      <div style={{ display: 'flex', gap: COLUMN_GAP, flex: 1, alignItems: few ? 'center' : 'flex-start', minHeight: 0 }}>
        {columns.map((col, ci) => (
          <div key={ci} style={{ width: colW }}>
            {col.map(i => (
              <MessageTile key={i} m={messages[i]} index={i} fontSize={layout.fontSize} width={colW} ratio={messages[i].photo_url ? ratios[messages[i].photo_url!] ?? null : null} look={look} />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const insideSheets = layout.spreads.map((spread, si) => {
    const isLast = si === layout.spreads.length - 1;
    return (
      <Sheet key={`in-${si}`} rotate={mode === 'double' && flip && si === 0} watermark={watermark}>
        <Panel style={{ display: 'flex', flexDirection: 'column' }}>
          {spread.hasHeader && headerAlone ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><InsideHeader c={campaign} look={look} /></div>
          ) : (
            <>
              {spread.hasHeader && <InsideHeader c={campaign} look={look} />}
              {renderColumns(spread, 0)}
            </>
          )}
        </Panel>
        <Panel style={{ display: 'flex', flexDirection: 'column' }}>
          {renderColumns(spread, 1)}
          {isLast && footer && <div style={{ height: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#999' }}>{footer}</div>}
        </Panel>
      </Sheet>
    );
  });

  // Double-sided: each extra inside sheet gets a blank back, so it's its own folded insert.
  const pages: React.ReactNode[] = [
    <Sheet key="out" watermark={watermark}><BackPanel /><FrontPanel c={campaign} from={from} look={look} ratio={campaign.card_image_url ? ratios[campaign.card_image_url] ?? null : null} /></Sheet>,
    insideSheets[0],
  ];
  insideSheets.slice(1).forEach((sheet, i) => {
    pages.push(sheet);
    if (mode === 'double') pages.push(<Sheet key={`blank-${i}`} watermark={watermark} />);
  });
  return <>{pages}</>;
}
