// Layout maths for the printable A5 card (two A5 panels side by side on an A4 landscape sheet).
// Everything is in CSS px at 96dpi, so 1mm = 96 / 25.4 px and print output matches exactly.

export const MM = 96 / 25.4;
export const SHEET_W = 297 * MM;          // A4 landscape
export const SHEET_H = 210 * MM;
export const PANEL_W = SHEET_W / 2;       // one A5 side of the card
export const MARGIN = 10 * MM;            // home printers can't print right to the edge
export const CONTENT_W = PANEL_W - MARGIN * 2;
export const CONTENT_H = SHEET_H - MARGIN * 2;
export const COLUMN_GAP = 14;
export const TILE_GAP = 12;

// Text prints at the same size as the card on screen (1rem = 16px) — never scaled up or down.
// A card with lots of messages just continues onto extra inside sheets. (The layout code below
// still handles a list of sizes, largest first, if scaling is ever wanted again.)
export const FONT_SIZES = [16];

export function columnsPerPanel(messageCount: number): number {
  return messageCount <= 4 ? 1 : 2;
}

// With only a message or two (e.g. a solo card) the "To…" header gets the left side to
// itself and the messages sit on the right, like a real card.
export function headerAloneOnLeft(messageCount: number): boolean {
  return messageCount <= 2;
}

export function columnWidth(cols: number): number {
  return cols === 1 ? CONTENT_W : (CONTENT_W - COLUMN_GAP) / 2;
}

export interface InsideSpread {
  // Message indexes for each column, left panel columns then right panel columns.
  columns: number[][];
  // The first spread starts with the "To…" header on the left panel.
  hasHeader: boolean;
}

// Packs messages, in order, into columns: left panel (under the header), right panel, then
// further spreads if needed. A message is never split — if it doesn't fit, it moves on.
// `heights` are measured tile heights (including the gap below each).
export function packMessages(
  heights: number[],
  cols: number,
  headerHeight: number,
  footerHeight: number,
  headerAlone = false,
): InsideSpread[] {
  const spreads: InsideSpread[] = [];
  let i = 0;
  while (i < heights.length || spreads.length === 0) {
    const first = spreads.length === 0;
    const columns: number[][] = [];
    const caps = columnCapacities(first, cols, headerHeight, footerHeight, headerAlone);
    for (let c = 0; c < cols * 2; c++) {
      if (caps[c] === 0) { columns.push([]); continue; }
      const capacity = caps[c];
      const column: number[] = [];
      let used = 0;
      while (i < heights.length && (used + heights[i] <= capacity || column.length === 0)) {
        // An over-tall tile still goes in an empty column rather than looping forever.
        used += heights[i];
        column.push(i++);
      }
      columns.push(column);
    }
    spreads.push({ columns, hasHeader: first });
    if (spreads.length > 40) break; // safety net
  }
  return spreads;
}

// How tall each column of a spread can be: the header takes room on the first spread's left
// panel (or all of it, for a card with only a message or two); the footer on the right panel.
function columnCapacities(first: boolean, cols: number, headerHeight: number, footerHeight: number, headerAlone: boolean): number[] {
  return Array.from({ length: cols * 2 }, (_, c) => {
    const onLeftPanel = c < cols;
    if (first && onLeftPanel && headerAlone) return 0;
    let capacity = CONTENT_H;
    if (first && onLeftPanel) capacity -= headerHeight;
    if (!onLeftPanel) capacity -= footerHeight;
    return capacity;
  });
}

// Evens out the last inside sheet so its messages spread across all its columns (both pages)
// instead of bunching on the left, each column filled to the same share of its room.
function balanceLastSpread(spreads: InsideSpread[], heights: number[], headerHeight: number, footerHeight: number, cols: number, headerAlone: boolean) {
  const last = spreads[spreads.length - 1];
  const caps = columnCapacities(spreads.length === 1, cols, headerHeight, footerHeight, headerAlone);
  const usable = caps.map((cap, c) => cap > 0 ? c : -1).filter(c => c >= 0);
  const items = last.columns.flat();
  if (items.length === 0 || usable.length === 0) return;
  const share = items.reduce((sum, i) => sum + heights[i], 0) / usable.reduce((sum, c) => sum + caps[c], 0);
  const columns: number[][] = last.columns.map(() => []);
  let u = 0, used = 0;
  for (const i of items) {
    const c = usable[u];
    const isLastColumn = u === usable.length - 1;
    if (!isLastColumn && columns[c].length > 0 && (used + heights[i] / 2 > share * caps[c] || used + heights[i] > caps[c])) {
      u++; used = 0;
    }
    columns[usable[u]].push(i);
    used += heights[i];
  }
  // Only take the balanced version if every column still fits.
  const fits = columns.every((col, ci) => col.reduce((sum, i) => sum + heights[i], 0) <= caps[ci]);
  if (fits) last.columns = columns;
}

// Works out the fewest inside sheets the messages need (at the smallest text size), then
// uses the biggest text size that still fits in that many sheets.
export function chooseLayout(
  heightsBySize: Record<number, number[]>,
  cols: number,
  headerHeight: number,
  footerHeight: number,
  headerAlone = false,
): { fontSize: number; spreads: InsideSpread[] } {
  const smallest = FONT_SIZES[FONT_SIZES.length - 1];
  const sheetsNeeded = packMessages(heightsBySize[smallest], cols, headerHeight, footerHeight, headerAlone).length;
  for (const size of FONT_SIZES) {
    const spreads = packMessages(heightsBySize[size], cols, headerHeight, footerHeight, headerAlone);
    if (spreads.length <= sheetsNeeded) {
      balanceLastSpread(spreads, heightsBySize[size], headerHeight, footerHeight, cols, headerAlone);
      return { fontSize: size, spreads };
    }
  }
  const spreads = packMessages(heightsBySize[smallest], cols, headerHeight, footerHeight, headerAlone);
  balanceLastSpread(spreads, heightsBySize[smallest], headerHeight, footerHeight, cols, headerAlone);
  return { fontSize: smallest, spreads };
}
