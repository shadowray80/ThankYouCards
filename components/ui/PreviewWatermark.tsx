// Faint, angled, repeating "thankyoucards.au · preview" across an unpaid group card — on the
// organiser's preview, ?preview=1 links, the print page and Save to Photos. Disappears once the
// card is paid for and sent. Dark letters with a white edge, so it shows on light and dark
// areas alike. Place inside a `position: relative` container.

const TILE = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='170'>
  <text x='150' y='95' text-anchor='middle' transform='rotate(-30 150 85)'
    font-family='Nunito, Arial, sans-serif' font-size='20' font-weight='800' fill='#2A2A2A'
    stroke='#ffffff' stroke-width='3' paint-order='stroke'>thankyoucards.au · preview</text>
</svg>`;

export function PreviewWatermark() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(TILE)}")`,
        backgroundRepeat: 'repeat', opacity: 0.16,
      }}
    />
  );
}
