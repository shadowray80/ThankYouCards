// Draws one of the /public/Icons line icons in any colour, using the PNG as a mask
// (the icons are black on transparent, with see-through middles).
export function TintedIcon({ src, size, color }: { src: string; size: number; color: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block', width: size, height: size, flexShrink: 0, backgroundColor: color,
        WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`,
        WebkitMaskSize: 'contain', maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center',
      }}
    />
  );
}
