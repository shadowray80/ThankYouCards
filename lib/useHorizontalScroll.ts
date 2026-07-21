'use client';

import { useEffect, useRef } from 'react';

// Drives a horizontally-scrolling strip from the mouse wheel and click-and-drag
// on desktop, without touching touch/swipe (native touch scrolling is left alone).
//
// React's onWheel handler is passive by default, so calling preventDefault()
// there is a silent no-op — the page scrolls vertically underneath the strip
// even though scrollLeft also changes. A native (non-passive) listener is the
// only way to actually stop that.
export function useHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // trackpad already scrolling horizontally — let it through
      e.preventDefault();
      el!.scrollLeft += e.deltaY;
    }
    el.addEventListener('wheel', onWheel, { passive: false });

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;

    function onMouseDown(e: MouseEvent) {
      dragging = true;
      moved = false;
      startX = e.pageX;
      startScroll = el!.scrollLeft;
    }
    function onMouseMove(e: MouseEvent) {
      if (!dragging) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 4) {
        moved = true;
        el!.style.userSelect = 'none';
      }
      if (moved) el!.scrollLeft = startScroll - dx;
    }
    function endDrag() {
      dragging = false;
      el!.style.userSelect = '';
    }
    function onClickCapture(e: MouseEvent) {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    }

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', endDrag);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', endDrag);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  return ref;
}
