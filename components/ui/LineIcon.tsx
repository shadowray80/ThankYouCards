// One of the hand-drawn icons from /public/Icons, shown as-is (keeps its own colours).
// For a recoloured version (e.g. white on a coloured button) use TintedIcon instead.
export function LineIcon({ name, size }: { name: string; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/Icons/${encodeURIComponent(name)}.png`} alt="" aria-hidden
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, display: 'block' }}
    />
  );
}
