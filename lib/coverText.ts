import type React from 'react';

// The cover text look (name + cover message on the photo): font, colour and outline. Chosen with
// the "Aa" button in the builders and under Edit card; saved on the campaign as card_font,
// card_text_color and card_text_stroke. Left alone it's today's look: white script, soft shadow.
// Classic and Casual covers only — Corporate keeps its own serif.

export interface CoverFont {
  id: string;
  label: string;
  family: string;     // CSS font-family (next/font variables from app/layout.tsx)
  cssVar: string;     // the variable name, for the Instagram canvas
  weight: number;
  upper?: boolean;    // meme style: capitals
  scale: number;      // fonts differ in apparent size; this evens them out against the script
  letterSpacing?: string;
}

export const COVER_FONTS: CoverFont[] = [
  { id: 'script',  label: 'Script',  family: 'var(--font-dancing), cursive',             cssVar: '--font-dancing',  weight: 400, scale: 1 },
  { id: 'friendly', label: 'Friendly', family: 'var(--font-pacifico), cursive',          cssVar: '--font-pacifico', weight: 400, scale: 0.8 },
  { id: 'meme',    label: 'Meme',    family: 'var(--font-anton), Impact, sans-serif',    cssVar: '--font-anton',    weight: 400, scale: 0.78, upper: true, letterSpacing: '.01em' },
  { id: 'marker',  label: 'Marker',  family: 'var(--font-marker), cursive',              cssVar: '--font-marker',   weight: 400, scale: 0.78 },
  { id: 'comic',   label: 'Comic',   family: 'var(--font-bangers), cursive',             cssVar: '--font-bangers',  weight: 400, scale: 0.86, letterSpacing: '.03em' },
  { id: 'retro',   label: 'Retro',   family: 'var(--font-caprasimo), Georgia, serif',    cssVar: '--font-caprasimo', weight: 400, scale: 0.78 },
  { id: 'elegant', label: 'Elegant', family: 'var(--font-playfair), Georgia, serif',     cssVar: '--font-playfair', weight: 700, scale: 0.8 },
  { id: 'bold',    label: 'Bold',    family: 'var(--font-nunito), sans-serif',           cssVar: '--font-nunito',   weight: 900, scale: 0.76 },
];

export const COVER_COLOURS: { id: string; label: string }[] = [
  { id: '#FFFFFF', label: 'White' },
  { id: '#1A1A1A', label: 'Black' },
  { id: '#FFD93D', label: 'Yellow' },
  { id: '#E8724A', label: 'Coral' },
  { id: '#3A8FA0', label: 'Teal' },
  { id: '#FF7EB6', label: 'Pink' },
];

export interface CoverTextStyle {
  font: string;
  color: string;
  stroke: boolean;
}

export const DEFAULT_COVER_TEXT: CoverTextStyle = { font: 'script', color: '#FFFFFF', stroke: false };

// Reads the saved look off a campaign, falling back to the default for anything missing or unknown.
export function coverTextFrom(c: { card_font?: string | null; card_text_color?: string | null; card_text_stroke?: boolean | null }): CoverTextStyle {
  return {
    font: COVER_FONTS.some(f => f.id === c.card_font) ? c.card_font! : DEFAULT_COVER_TEXT.font,
    color: COVER_COLOURS.some(x => x.id === c.card_text_color) ? c.card_text_color! : DEFAULT_COVER_TEXT.color,
    stroke: c.card_text_stroke === true,
  };
}

export function isDefaultCoverText(s: CoverTextStyle): boolean {
  return s.font === DEFAULT_COVER_TEXT.font && s.color === DEFAULT_COVER_TEXT.color && s.stroke === DEFAULT_COVER_TEXT.stroke;
}

// The campaign columns. Untouched covers send nothing, so they save exactly as before.
export function coverTextFields(s: CoverTextStyle) {
  return isDefaultCoverText(s) ? {} : { card_font: s.font, card_text_color: s.color, card_text_stroke: s.stroke };
}

export function fontFor(id: string): CoverFont {
  return COVER_FONTS.find(f => f.id === id) ?? COVER_FONTS[0];
}

export function isDarkColour(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

// The outline colour: black around light text, white around dark text.
export function strokeColourFor(color: string): string {
  return isDarkColour(color) ? '#FFFFFF' : '#000000';
}

const DARK_SHADOW = '0 1px 3px rgba(0,0,0,.8), 0 3px 12px rgba(0,0,0,.65), 0 5px 30px rgba(0,0,0,.5)';
const LIGHT_GLOW = '0 0 3px rgba(255,255,255,.9), 0 0 12px rgba(255,255,255,.75), 0 0 28px rgba(255,255,255,.55)';
const STROKE_SHADOW = '0 2px 6px rgba(0,0,0,.35)';

// The style for one line of cover text. `size` is the line's normal (script) size, as any CSS
// length or a number of px; it's scaled per font so every font sits at a similar visual size.
export function coverTextCss(s: CoverTextStyle, size: string | number): React.CSSProperties {
  const f = fontFor(s.font);
  const fontSize = typeof size === 'number' ? size * f.scale : f.scale === 1 ? size : `calc(${size} * ${f.scale})`;
  const dark = isDarkColour(s.color);
  const css: React.CSSProperties = {
    fontFamily: f.family,
    fontWeight: f.weight,
    fontSize,
    color: s.color,
    textShadow: s.stroke ? STROKE_SHADOW : dark ? LIGHT_GLOW : DARK_SHADOW,
  };
  // Only set when the font needs them, so a caller's own letter-spacing / capitalising stays.
  if (f.upper) css.textTransform = 'uppercase';
  if (f.letterSpacing) css.letterSpacing = f.letterSpacing;
  // paint-order puts the outline behind the letters, so it doesn't eat into them.
  if (s.stroke) Object.assign(css, { WebkitTextStroke: `.09em ${strokeColourFor(s.color)}`, paintOrder: 'stroke fill' });
  return css;
}
