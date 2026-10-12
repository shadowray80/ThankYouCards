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

// Largest first — the layout uses the biggest text size that fits in the fewest inside sheets.
export const FONT_SIZES = [28, 26, 24, 22, 20, 18, 17, 16, 15, 14, 13, 12];

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
    for (let c = 0; c < cols * 2; c++) {
      const onLeftPanel = c < cols;
      if (first && onLeftPanel && headerAlone) { columns.push([]); continue; }
      let capacity = CONTENT_H;
      if (first && onLeftPanel) capacity -= headerHeight;
      if (!onLeftPanel) capacity -= footerHeight;
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

// Evens out the last inside sheet so leftover messages spread across all its columns
// instead of bunching on the left. Only used when the card runs to more than one sheet.
function balanceLastSpread(spreads: InsideSpread[], heights: number[], footerHeight: number, cols: number) {
  if (spreads.length < 2) return;
  const last = spreads[spreads.length - 1];
  const items = last.columns.flat();
  const total = items.reduce((sum, i) => sum + heights[i], 0);
  const target = total / last.columns.length;
  const columns: number[][] = last.columns.map(() => []);
  let c = 0, used = 0;
  for (const i of items) {
    const capacity = CONTENT_H - (c >= cols ? footerHeight : 0);
    const isLastColumn = c === columns.length - 1;
    if (!isLastColumn && columns[c].length > 0 && (used + heights[i] / 2 > target || used + heights[i] > capacity)) {
      c++; used = 0;
    }
    columns[c].push(i);
    used += heights[i];
  }
  // Only take the balanced version if every column still fits.
  const fits = columns.every((col, ci) =>
    col.reduce((sum, i) => sum + heights[i], 0) <= CONTENT_H - (ci >= cols ? footerHeight : 0));
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
      balanceLastSpread(spreads, heightsBySize[size], footerHeight, cols);
      return { fontSize: size, spreads };
    }
  }
  const spreads = packMessages(heightsBySize[smallest], cols, headerHeight, footerHeight, headerAlone);
  balanceLastSpread(spreads, heightsBySize[smallest], footerHeight, cols);
  return { fontSize: smallest, spreads };
}
