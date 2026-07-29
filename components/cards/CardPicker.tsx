'use client';

import { useEffect, useState } from 'react';
import { CATEGORIES, TAGS, SPORTS_SUBCATEGORIES } from '@/lib/cardTaxonomy';

const GREEN = '#3FAE6A';
const ORANGE = '#E8724A';

// Kept small enough that this first group reliably fits on one line at mobile widths —
// the More/Less toggle rides along as the last pill in this same fixed row, so it never
// moves when the rest of the list expands/contracts below it.
const CATEGORIES_COLLAPSED_COUNT = 3;
const TAGS_COLLAPSED_COUNT = 3;

interface CardData { id: string; category: string; subcategory: string | null; tags: string[]; url: string }

interface CardPickerProps {
  selectedUrl: string;
  onSelect: (url: string) => void;
}

export function CardPicker({ selectedUrl, onSelect }: CardPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedSports, setSelectedSports] = useState<Set<string>>(new Set());
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Real card library, synced from Supabase Storage via the admin manager at /admin/cards.
  useEffect(() => {
    fetch('/api/cards')
      .then(r => r.json())
      .then(json => setCards((json.cards ?? []).map((c: { id: string; category: string; subcategory: string | null; tags: string[] | null; image_url: string }) => ({
        id: c.id, category: c.category, subcategory: c.subcategory, tags: c.tags ?? [], url: c.image_url,
      }))))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    setter(next);
  };

  const showSportFilters = selectedCategories.has('sports');

  const filteredCards = cards.filter(c => {
    const catOk = selectedCategories.size === 0 || selectedCategories.has(c.category);
    const tagOk = selectedTags.size === 0 || c.tags.some(t => selectedTags.has(t));
    const sportOk = !showSportFilters || selectedSports.size === 0 || selectedSports.has(c.subcategory ?? '');
    return catOk && tagOk && sportOk;
  });

  // Deliberately no fixed/sticky positioning at all: this sits in plain document flow,
  // exactly where the parent places it (immediately after the card image). That means it's
  // always anchored precisely to the image's bottom edge with zero measurement, and normal
  // page scrolling IS scrolling the accordion — there's nothing to keep in sync, because
  // it's just one continuous page.
  return (
    <div
      style={{
        background: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: expanded ? '0 -8px 32px rgba(60,50,100,.16)' : '0 -4px 16px rgba(60,50,100,.08)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header (always visible, tap anywhere to toggle) ── */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{
          cursor: 'pointer', padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: expanded ? '1px solid #F0EDF5' : 'none',
        }}
      >
        <div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1rem', color: '#2A2A2A' }}>Choose a card</div>
          <div style={{ fontSize: '.76rem', color: '#B0A8BC', marginTop: 1 }}>
            {expanded ? 'Drag down to focus on your card' : 'Drag up to browse other designs'}
          </div>
        </div>
        <div
          onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
          style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
            background: expanded ? ORANGE : GREEN,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,.15)',
          }}
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: 'transform .25s ease', transform: expanded ? 'none' : 'rotate(180deg)' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {expanded && (
        <>
          {/* ── Category filters (green) — fixed first row + toggle, expandable second row ── */}
          <div style={{ padding: '12px 18px 10px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button onClick={() => setShowAllCategories(v => !v)} style={pillStyle(false, GREEN)}>
                {showAllCategories ? '⋯ Less' : '⋯ More'}
              </button>
              {CATEGORIES.slice(0, CATEGORIES_COLLAPSED_COUNT).map(c => (
                <button key={c.id} onClick={() => toggle(selectedCategories, setSelectedCategories, c.id)} style={pillStyle(selectedCategories.has(c.id), GREEN)}>
                  {c.label}
                </button>
              ))}
            </div>
            {showAllCategories && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {CATEGORIES.slice(CATEGORIES_COLLAPSED_COUNT).map(c => (
                  <button key={c.id} onClick={() => toggle(selectedCategories, setSelectedCategories, c.id)} style={pillStyle(selectedCategories.has(c.id), GREEN)}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Sport filters (green) — only shown once Sports is selected as a category,
               since these subcategory ids only mean anything within Sports. ── */}
          {showSportFilters && (
            <div style={{ padding: '0 18px 10px' }}>
              <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#B0A8BC', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Which sport?</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SPORTS_SUBCATEGORIES.map(s => (
                  <button key={s.id} onClick={() => toggle(selectedSports, setSelectedSports, s.id)} style={pillStyle(selectedSports.has(s.id), GREEN)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Divider ── */}
          <div style={{ height: 1, background: '#F0EDF5', margin: '0 18px' }} />

          {/* ── Tag filters (orange) — same fixed-row + toggle pattern ── */}
          <div style={{ padding: '10px 18px 12px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button onClick={() => setShowAllTags(v => !v)} style={pillStyle(false, ORANGE)}>
                {showAllTags ? '⋯ Less' : '⋯ More'}
              </button>
              {TAGS.slice(0, TAGS_COLLAPSED_COUNT).map(t => (
                <button key={t.id} onClick={() => toggle(selectedTags, setSelectedTags, t.id)} style={pillStyle(selectedTags.has(t.id), ORANGE)}>
                  {t.label}
                </button>
              ))}
            </div>
            {showAllTags && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {TAGS.slice(TAGS_COLLAPSED_COUNT).map(t => (
                  <button key={t.id} onClick={() => toggle(selectedTags, setSelectedTags, t.id)} style={pillStyle(selectedTags.has(t.id), ORANGE)}>
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Card grid (5 across) — its own bounded, independently-scrollable area, so
               browsing cards doesn't require scrolling the page (and the main card preview
               above stays put and visible the whole time). ── */}
          <div style={{ maxHeight: 730, overflowY: 'auto', padding: '4px 18px 24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#B0A8BC', fontSize: '.85rem', padding: '32px 0' }}>
                Loading cards…
              </div>
            ) : filteredCards.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#B0A8BC', fontSize: '.85rem', padding: '32px 0' }}>
                No cards match those filters yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                {filteredCards.map(c => {
                  const isSelected = selectedUrl === c.url;
                  return (
                    <div
                      key={c.id}
                      onClick={() => onSelect(c.url)}
                      style={{
                        position: 'relative', aspectRatio: '3 / 4', borderRadius: 8, overflow: 'hidden',
                        cursor: 'pointer', border: isSelected ? `2px solid ${ORANGE}` : '2px solid transparent',
                      }}
                    >
                      <img src={c.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {isSelected && (
                        <div style={{
                          position: 'absolute', top: 3, right: 3, background: ORANGE, color: '#fff',
                          width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '.55rem', fontWeight: 800,
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function pillStyle(active: boolean, activeColor: string): React.CSSProperties {
  return {
    padding: '7px 14px', borderRadius: 20, fontSize: '.8rem', fontWeight: 700,
    fontFamily: "'Nunito',sans-serif", cursor: 'pointer', transition: 'all .15s',
    background: active ? activeColor : '#fff',
    color: active ? '#fff' : '#7A7585',
    border: active ? `1.5px solid ${activeColor}` : '1.5px solid #E8E2F0',
  };
}
