'use client';

import { CASUAL_PALETTES, CORPORATE_PALETTES, buildCustomPalette } from '@/lib/palettes';

// Draws a featured (solo, opted-in) customer card as an Instagram carousel post, 1080 × 1350:
//   slide 1 — the cover: photo filling the frame, name + front message in the card's
//             handwriting font with the same soft white-text shadow, small thankyoucards.au mark
//   slide 2 — the sender's message (or their handwritten-message photo), signed with their name

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

export interface InstagramMessage {
  sender_name: string | null;
  sender_message: string | null;
  sender_photo_url: string | null;
}

export function hasMessageSlide(m: InstagramMessage): boolean {
  return !!(m.sender_message?.trim() || m.sender_photo_url);
}

export async function renderInstagramMessage(card: InstagramCard & InstagramMessage): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = IG_WIDTH;
  canvas.height = IG_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  const serif = fontFamily('--font-lora', 'serif');
  const sans = fontFamily('--font-nunito', 'sans-serif');
  await Promise.all([
    document.fonts.load(`italic 48px ${serif}`),
    document.fonts.load(`800 30px ${sans}`),
  ]).catch(() => {});

  const [accent] = paletteColours(card);
  ctx.fillStyle = '#FFFDF8';
  ctx.fillRect(0, 0, IG_WIDTH, IG_HEIGHT);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, IG_WIDTH, 14);

  const pad = 110;
  const maxWidth = IG_WIDTH - pad * 2;
  const signature = card.sender_name?.trim() ? `— ${card.sender_name.trim()}` : '';
  let signatureY: number;

  const photo = card.sender_photo_url ? await loadImage(card.sender_photo_url).catch(() => null) : null;
  if (photo) {
    // Handwritten message photographed: show it whole, like a note on the table.
    const boxW = IG_WIDTH - 160;
    const boxH = IG_HEIGHT - 400;
    const scale = Math.min(boxW / photo.naturalWidth, boxH / photo.naturalHeight);
    const w = photo.naturalWidth * scale;
    const h = photo.naturalHeight * scale;
    const x = (IG_WIDTH - w) / 2;
    const y = 120 + (boxH - h) / 2;
    ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 14, y - 14, w + 28, h + 28);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.drawImage(photo, x, y, w, h);
    signatureY = y + h + 110;
  } else {
    // Typed message: big open quote, then the text, shrinking until it fits.
    ctx.font = `italic 280px ${serif}`;
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.18;
    ctx.textAlign = 'left';
    ctx.fillText('“', pad - 30, 330);
    ctx.globalAlpha = 1;

    const text = (card.sender_message ?? '').trim();
    let size = 56;
    let lines: string[] = [];
    for (; size >= 30; size -= 2) {
      ctx.font = `italic ${size}px ${serif}`;
      lines = text.split(/\n+/).flatMap(p => wrapLines(ctx, p, maxWidth, 99));
      if (lines.length * size * 1.45 <= IG_HEIGHT - 560) break;
    }
    if (size < 30) {
      // Still too long at the smallest size — use that size and cut it off below.
      size = 30;
      ctx.font = `italic ${size}px ${serif}`;
      lines = text.split(/\n+/).flatMap(p => wrapLines(ctx, p, maxWidth, 99));
    }
    const maxLines = Math.floor((IG_HEIGHT - 560) / (size * 1.45));
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…';
    }
    const lineHeight = size * 1.45;
    const blockH = lines.length * lineHeight;
    let y = Math.max(300, (IG_HEIGHT - blockH) / 2);
    ctx.fillStyle = '#2A2A2A';
    for (const line of lines) {
      ctx.fillText(line, pad, y);
      y += lineHeight;
    }
    signatureY = y + 50;
  }

  if (signature) {
    ctx.font = `800 40px ${sans}`;
    ctx.fillStyle = accent;
    ctx.textAlign = photo ? 'center' : 'left';
    ctx.fillText(signature, photo ? IG_WIDTH / 2 : pad, Math.min(signatureY, IG_HEIGHT - 140));
  }

  ctx.font = `800 30px ${sans}`;
  ctx.textAlign = 'right';
  ctx.fillStyle = accent;
  ctx.fillText('thankyoucards.au', IG_WIDTH - 56, IG_HEIGHT - 52);

  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/jpeg', 0.92);
  });
}
