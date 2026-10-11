'use client';

import { CASUAL_PALETTES, CORPORATE_PALETTES, buildCustomPalette } from '@/lib/palettes';

// Draws a customer card's cover as an Instagram portrait post (1080 × 1350): the cover photo
// filling the frame, the name + front message in the card's handwriting font with the same
// soft white-text shadow, and a small thankyoucards.au mark. Cover only — never messages.

export const IG_WIDTH = 1080;
export const IG_HEIGHT = 1350;

export interface InstagramCard {
  recipient_name: string;
  card_message: string | null;
  card_image_url: string | null;
  card_style: string | null;
  card_palette: string | null;
  card_text_on_image: boolean | null;
}

function paletteColours(card: InstagramCard): [string, string] {
  const id = card.card_palette ?? '';
  if (id.startsWith('#')) {
    const p = buildCustomPalette(id);
    return [p.headerFrom, p.headerTo];
  }
  const p = (card.card_style === 'corporate' ? CORPORATE_PALETTES : CASUAL_PALETTES).find(x => x.id === id)
    ?? CASUAL_PALETTES[0];
  return [p.headerFrom, p.headerTo];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Supabase Storage sends CORS headers, so the canvas stays exportable
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Couldn't load ${src}`));
    img.src = src;
  });
}

// next/font gives the fonts generated family names; read them from the CSS variables.
function fontFamily(variable: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value ? `${value}, ${fallback}` : fallback;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) { line = next; continue; }
    lines.push(line);
    line = word;
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && words.join(' ') !== lines.join(' ')) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…';
  }
  return lines;
}

// Same three-layer soft shadow as the on-card text, scaled up for a 1080px canvas.
function shadowedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  const layers: [number, number, string][] = [[3, 8, 'rgba(0,0,0,.5)'], [2, 24, 'rgba(0,0,0,.45)'], [4, 60, 'rgba(0,0,0,.4)']];
  for (const [offsetY, blur, color] of layers) {
    ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.shadowOffsetY = offsetY;
    ctx.fillText(text, x, y);
  }
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillText(text, x, y);
}

function fitFontSize(ctx: CanvasRenderingContext2D, text: string, family: string, start: number, min: number, maxWidth: number): number {
  let size = start;
  ctx.font = `${size}px ${family}`;
  while (size > min && ctx.measureText(text).width > maxWidth) {
    size -= 4;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

export async function renderInstagramImage(card: InstagramCard): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = IG_WIDTH;
  canvas.height = IG_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  const script = fontFamily('--font-dancing', 'cursive');
  const sans = fontFamily('--font-nunito', 'sans-serif');
  await Promise.all([
    document.fonts.load(`150px ${script}`),
    document.fonts.load(`800 30px ${sans}`),
  ]).catch(() => {});

  // Background: the card's colours, then the cover photo cropped to fill the frame.
  const [from, to] = paletteColours(card);
  const bg = ctx.createLinearGradient(0, 0, IG_WIDTH, IG_HEIGHT);
  bg.addColorStop(0, from);
  bg.addColorStop(1, to);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, IG_WIDTH, IG_HEIGHT);

  // If the photo can't be loaded, the card's colours alone still make a clean post.
  const img = card.card_image_url ? await loadImage(card.card_image_url).catch(() => null) : null;
  if (img) {
    const scale = Math.max(IG_WIDTH / img.naturalWidth, IG_HEIGHT / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (IG_WIDTH - w) / 2, (IG_HEIGHT - h) / 2, w, h);
  }

  const showText = card.card_text_on_image !== false && !!card.recipient_name.trim();
  const pad = 84;
  const maxWidth = IG_WIDTH - pad * 2;

  if (showText) {
    // Gentle darkening at the bottom so the white text reads on any photo.
    const shade = ctx.createLinearGradient(0, IG_HEIGHT * 0.45, 0, IG_HEIGHT);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,.45)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, IG_HEIGHT * 0.45, IG_WIDTH, IG_HEIGHT * 0.55);

    const name = card.recipient_name.trim().charAt(0).toUpperCase() + card.recipient_name.trim().slice(1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Lay out from the bottom up: message lines, then the name, then "TO".
    let y = IG_HEIGHT - 150;
    if (card.card_message?.trim()) {
      ctx.font = `64px ${script}`;
      const lines = wrapLines(ctx, card.card_message.trim(), maxWidth, 3);
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      for (let i = lines.length - 1; i >= 0; i--) {
        shadowedText(ctx, lines[i], pad, y);
        y -= 80;
      }
      y -= 20;
    }

    const nameSize = fitFontSize(ctx, name, script, 170, 90, maxWidth);
    ctx.fillStyle = '#fff';
    shadowedText(ctx, name, pad, y);
    y -= nameSize * 0.95;

    ctx.font = `800 30px ${sans}`;
    ctx.letterSpacing = '7px';
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    shadowedText(ctx, 'TO', pad, y);
    ctx.letterSpacing = '0px';
  }

  // Brand mark, bottom right.
  ctx.font = `800 30px ${sans}`;
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  shadowedText(ctx, 'thankyoucards.au', IG_WIDTH - 56, IG_HEIGHT - 52);

  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/jpeg', 0.92);
  });
}
