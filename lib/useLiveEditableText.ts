'use client';

import { useRef } from 'react';

// Keeps a contentEditable div's text in sync with React state, without
// breaking mobile predictive text.
//
// Tapping a predictive-text suggestion isn't one DOM mutation — the browser
// deletes the partial word, then inserts the full word plus a trailing
// space, as two back-to-back mutations. Reading textContent and calling
// setState synchronously inside onInput can run in between those two steps
// and race with the second one, which is what produces a mangled word or a
// missing/stray space. Deferring the state read to the next animation frame
// lets the browser finish its own DOM work first — the visible text in the
// box is never delayed (the browser renders that natively, immediately);
// only the React state used by other previews lags by a single frame.
// Composition (IME) input is skipped entirely until it ends, for the same
// reason.
export function useLiveEditableText(value: string, onChange: (next: string) => void, opts?: { capitalizeWords?: boolean }) {
  const composingRef = useRef(false);
  const capitalizeWords = opts?.capitalizeWords ?? false;

  function transform(raw: string) {
    return capitalizeWords ? raw.replace(/(?:^|\s)\S/g, c => c.toUpperCase()) : raw;
  }

  function ref(el: HTMLDivElement | null) {
    // Restore text only into a freshly mounted, empty node — e.g. leaving and
    // re-entering Preview mode unmounts this whole overlay, so it comes back
    // as a fresh node needing its text restored. A ref callback only fires on
    // actual mount/unmount (verified empirically — it does not re-fire on
    // every keystroke/re-render), unlike a useEffect keyed on state, which
    // fires mid-keystroke and stomps native text insertion the same way the
    // synchronous onInput read does.
    if (el && !el.textContent && value) el.textContent = value;
  }

  function sync(el: HTMLDivElement) {
    if (composingRef.current) return;
    requestAnimationFrame(() => onChange(transform(el.textContent ?? '')));
  }

  function onInput(e: React.FormEvent<HTMLDivElement>) {
    sync(e.currentTarget);
  }

  function onCompositionStart() {
    composingRef.current = true;
  }

  function onCompositionEnd(e: React.CompositionEvent<HTMLDivElement>) {
    composingRef.current = false;
    sync(e.currentTarget);
  }

  return { ref, onInput, onCompositionStart, onCompositionEnd };
}
