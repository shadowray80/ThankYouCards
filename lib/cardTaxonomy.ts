// Shared category/tag vocabulary for the new card library — used by both the picker
// (`components/cards/CardPicker.tsx`) and the admin card manager, so the two can't drift
// apart the way the standalone dev-prototype pages briefly did from `GroupFlow.tsx`.
//
// Categories mirror what `Define Cards` in the n8n GenPrompts workflow actually produces
// (see PROJECT.md / memory for the taxonomy history). Tags are the cross-cutting
// recipient/theme labels — never derived from a filename, always set by hand in the
// manager.

export const CATEGORIES = [
  { id: 'thank_you', label: 'Thank You' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'sympathy', label: 'Sympathy' },
  { id: 'get_well', label: 'Get Well' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'leaving', label: 'Leaving' },
  { id: 'congratulations', label: 'Congratulations' },
  { id: 'sports', label: 'Sports' },
  { id: 'retirement', label: 'Retirement' },
];

export const TAGS = [
  { id: 'mum', label: 'Mum' },
  { id: 'dad', label: 'Dad' },
  { id: 'grandma', label: 'Grandma' },
  { id: 'grandpa', label: 'Grandpa' },
  { id: 'partner', label: 'Partner' },
  { id: 'kids', label: 'Kids' },
  { id: 'extended_family', label: 'Extended Family' },
  { id: 'mates', label: 'Mates' },
  { id: 'neighbour', label: 'Neighbour' },
  { id: 'colleague', label: 'Colleague' },
  { id: 'boss', label: 'Boss' },
  { id: 'nature', label: 'Nature' },
  { id: 'cars', label: 'Cars' },
  { id: 'beach', label: 'Beach' },
  { id: 'australia', label: 'Australia' },
];

// Longest-id-first so a multi-word category (e.g. `get_well`, `thank_you`) is matched
// before any shorter category could accidentally look like a prefix of it.
const CATEGORY_IDS = [...CATEGORIES.map(c => c.id)].sort((a, b) => b.length - a.length);

export interface ParsedCardFileName {
  category: string;
  subcategory: string | null;
  style: string;
  index: number;
}

/**
 * Parses `{category}_{subcategory}_{style}_{index}.ext` (subcategory omitted when a
 * category has none, e.g. `thank_you_watercolour_01.png`). Category/subcategory ids can
 * themselves contain underscores (`get_well`, `rugby_union`), so this can't just split on
 * `_` naively — it matches the category as a known prefix first, then reads the *last*
 * remaining token as the index and the one before it as the style, treating everything
 * else in between as the subcategory (however many underscore-joined words that is).
 * Returns null for anything that doesn't fit the pattern, e.g. files uploaded manually
 * without following the convention — those are left for a human to sort out rather than
 * guessed at.
 */
export function parseCardFileName(fileName: string): ParsedCardFileName | null {
  const stem = fileName.replace(/\.[^.]+$/, '');
  const category = CATEGORY_IDS.find(id => stem === id || stem.startsWith(`${id}_`));
  if (!category) return null;

  const rest = stem.slice(category.length + 1);
  const parts = rest.split('_').filter(Boolean);
  if (parts.length < 2) return null;

  const indexStr = parts[parts.length - 1];
  if (!/^\d+$/.test(indexStr)) return null;

  const style = parts[parts.length - 2];
  const subcategory = parts.slice(0, parts.length - 2).join('_') || null;

  return { category, subcategory, style, index: parseInt(indexStr, 10) };
}

// Deterministic subcategory → tags mapping, matching the taxonomy `Define Cards` in the
// n8n GenPrompts workflow actually generates against (e.g. every thank_you/mum card was
// generated specifically to be a "for Mum" card, every sports/afl card is Australian).
// This isn't recoverable from the filename alone (tags are deliberately left out of the
// naming convention), so sync applies it once, on first insert only — re-syncing must
// never use this to overwrite tags that have since been hand-edited in the manager.
const AUTO_TAGS: Record<string, string[]> = {
  'thank_you:mum': ['mum'],
  'thank_you:dad': ['dad'],
  'thank_you:mates': ['mates', 'australia'],
  'thank_you:nature': ['nature'],
  'thank_you:cars': ['cars'],
  'thank_you:beach': ['beach', 'australia'],
  'sports:afl': ['australia'],
  'sports:kids_afl': ['australia'],
  'sports:cricket': ['australia'],
  'sports:nrl': ['australia'],
  'sports:rugby_union': ['australia'],
  'sports:swimming': ['australia'],
  'sports:surfing': ['australia'],
  'sports:netball': ['australia'],
};

export function autoTagsFor(category: string, subcategory: string | null): string[] {
  if (!subcategory) return [];
  return AUTO_TAGS[`${category}:${subcategory}`] ?? [];
}
