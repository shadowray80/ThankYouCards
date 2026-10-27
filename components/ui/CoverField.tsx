'use client';

import { useLayoutEffect, useRef } from 'react';

// Text typed straight onto a card cover (name, cover message, From). A real <textarea>, not a
// contentEditable div: phone keyboards' predictive text and autocorrect only behave properly in
// real text boxes (in the old editable divs, tapping a suggestion could mangle the word).
//
// - Uncontrolled (React never writes into it while you type); every change is reported up.
// - Grows to fit, so long text wraps onto more lines like the finished card.
// - The box reaches past its text on every side, so text shadows and outlines aren't clipped.
// - One line of text: Enter just closes the keyboard.
// - `capitalizeWords`: the keyboard starts each word with a capital, and the saved text is
//   capitalised too. On a computer the field also shows capitals as you type; on phones it
//   doesn't style the text (CSS capitalising inside a text box upsets phone keyboards).
const BLEED_X = 18;
const BLEED_Y = 12;

export function CoverField({ value, onChange, style, capitalizeWords = false, ariaLabel }: {
  value: string;
  onChange: (next: string) => void;
  style: React.CSSProperties;
  capitalizeWords?: boolean;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const fit = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  // Refit when the font or size changes (e.g. a different font in the Aa picker) or the value is
  // changed from outside; also once the web fonts have loaded.
  const styleKey = JSON.stringify(style);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && el.value !== value && document.activeElement !== el) el.value = value;
    fit();
    document.fonts?.ready.then(fit);
  }, [styleKey, value]);

  const clean = (raw: string) => {
    const oneLine = raw.replace(/[\r\n]+/g, ' ');
    return capitalizeWords ? oneLine.replace(/(?:^|\s)\S/g, c => c.toUpperCase()) : oneLine;
  };

  const { textTransform, ...rest } = style;
  return (
    <textarea
      ref={ref}
      rows={1}
      defaultValue={value}
      aria-label={ariaLabel}
      autoCapitalize={capitalizeWords ? 'words' : 'sentences'}
      autoComplete="off"
      className={capitalizeWords && !textTransform ? 'tyc-cover-field tyc-cover-field-cap' : 'tyc-cover-field'}
      onChange={e => { fit(); onChange(clean(e.target.value)); }}
      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
      style={{
        display: 'block', boxSizing: 'border-box', resize: 'none', overflow: 'hidden',
        border: 'none', outline: 'none', background: 'transparent', borderRadius: 0, appearance: 'none',
        font: 'inherit', textAlign: 'inherit', cursor: 'text',
        width: `calc(100% + ${BLEED_X * 2}px)`, margin: `-${BLEED_Y}px -${BLEED_X}px`, padding: `${BLEED_Y}px ${BLEED_X}px`,
        caretColor: rest.color as string | undefined,
        ...rest,
        ...(textTransform ? { textTransform } : {}),
      }}
    />
  );
}
