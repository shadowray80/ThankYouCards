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
  scale = 1,
): InsideSpread[] {
  const spreads: InsideSpread[] = [];
  let i = 0;
  while (i < heights.length || spreads.length === 0) {
    const first = spreads.length === 0;
    const columns: number[][] = [];
    const caps = columnCapacities(first, cols, headerHeight, footerHeight, headerAlone);
    for (let c = 0; c < cols * 2; c++) {
      if (caps[c] === 0) { columns.push([]); continue; }
      const capacity = caps[c] * scale;
      const column: number[] = [];
      let used = 0;
      // A tile is never taller than a full page (its photo shrinks, see PrintableCard) but can be
      // taller than a column under the header: it waits for the next column. The bottom gap doesn't count.
      const roomy = caps[c] >= CONTENT_H - footerHeight;
      while (i < heights.length && (used + heights[i] <= capacity || used + heights[i] - TILE_GAP <= caps[c] || (column.length === 0 && roomy))) {
        // An over-tall tile still goes in an empty full-height column rather than looping forever.
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

// Works out the fewest inside spreads the messages need (at the smallest text size), then
// uses the biggest text size that still fits in that many.
// `booklet` (double-sided): the sheets nest like a little book, so the inside always has an odd
// number of spreads (1 sheet = 1 spread, 2 sheets = 3, 3 sheets = 5). The messages are spread
// evenly over every inside page (using one more spread when they'd need an even number), so no
// page is left empty and none is crammed.
export function chooseLayout(
  heightsBySize: Record<number, number[]>,
  cols: number,
  headerHeight: number,
  footerHeight: number,
  headerAlone = false,
  booklet = false,
): { fontSize: number; spreads: InsideSpread[] } {
  const smallest = FONT_SIZES[FONT_SIZES.length - 1];
  const sheetsNeeded = packMessages(heightsBySize[smallest], cols, headerHeight, footerHeight, headerAlone).length;
  const size = FONT_SIZES.find(sz => packMessages(heightsBySize[sz], cols, headerHeight, footerHeight, headerAlone).length <= sheetsNeeded) ?? smallest;
  const heights = heightsBySize[size];
  const spreads = packMessages(heights, cols, headerHeight, footerHeight, headerAlone);
  if (booklet && spreads.length > 1) {
    const even = spreadEvenly(heights, spreads.length % 2 === 0 ? spreads.length + 1 : spreads.length, cols, headerHeight, footerHeight, headerAlone);
    if (even) return { fontSize: size, spreads: even };
  }
  balanceLastSpread(spreads, heights, headerHeight, footerHeight, cols, headerAlone);
  return { fontSize: size, spreads };
}

// Splits one page's messages (in order) into its columns, as evenly as possible. Null if they
// don't fit. Returns the columns and how full the fullest one is (1 = full).
function splitPage(items: number[], heights: number[], caps: number[]): { columns: number[][]; fill: number } | null {
  const sum = (list: number[]) => list.reduce((t, i) => t + heights[i], 0);
  if (items.length === 0) return { columns: caps.map(() => []), fill: 0 };
  const fillOf = (list: number[], cap: number) => list.length === 0 ? 0 : cap <= 0 ? Infinity : Math.max(0, sum(list) - TILE_GAP) / cap;
  if (caps.length === 1) {
    const fill = fillOf(items, caps[0]);
    return fill <= 1 ? { columns: [items], fill } : null;
  }
  let best: { columns: number[][]; fill: number } | null = null;
  for (let k = 0; k <= items.length; k++) {
    const a = items.slice(0, k), b = items.slice(k);
    const fill = Math.max(fillOf(a, caps[0]), fillOf(b, caps[1]));
    // Ties go to the later split, so a lone message sits in the left column.
    if (fill <= 1 && (!best || fill <= best.fill)) best = { columns: [a, b], fill };
  }
  return best;
}

// Spreads the messages, in order, over exactly `spreadCount` spreads as evenly as it can: the
// fewest crammed pages (each page scores its fullness squared, an empty one scores worst). Null if
// they can't fit.
function spreadEvenly(heights: number[], spreadCount: number, cols: number, headerHeight: number, footerHeight: number, headerAlone: boolean): InsideSpread[] | null {
  const pageCaps = (pg: number) => columnCapacities(pg < 2, cols, headerHeight, footerHeight, headerAlone)
    .slice((pg % 2) * cols, (pg % 2) * cols + cols);
  const pages = spreadCount * 2, n = heights.length;
  // worst[p][i]: the best score for the first i messages on the first p pages.
  const worst: number[][] = Array.from({ length: pages + 1 }, () => Array(n + 1).fill(Infinity));
  const from: number[][] = Array.from({ length: pages + 1 }, () => Array(n + 1).fill(-1));
  worst[0][0] = 0;
  for (let p = 1; p <= pages; p++) {
    const caps = pageCaps(p - 1);
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= i; j++) {
        if (worst[p - 1][j] === Infinity) continue;
        const split = splitPage(Array.from({ length: i - j }, (_, x) => j + x), heights, caps);
        if (!split) continue;
        // An empty page counts as worse than a full one, so every page gets something.
        const score = worst[p - 1][j] + (i === j && caps.some(c => c > 0) && n >= pages ? 2 : split.fill ** 2);
        if (score < worst[p][i]) { worst[p][i] = score; from[p][i] = j; }
      }
    }
  }
  if (worst[pages][n] === Infinity) return null;
  const pageColumns: number[][][] = [];
  for (let p = pages, i = n; p > 0; p--) {
    const j = from[p][i];
    pageColumns[p - 1] = splitPage(Array.from({ length: i - j }, (_, x) => j + x), heights, pageCaps(p - 1))!.columns;
    i = j;
  }
  return Array.from({ length: spreadCount }, (_, si) => ({
    columns: [...pageColumns[si * 2], ...pageColumns[si * 2 + 1]],
    hasHeader: si === 0,
  }));
}
