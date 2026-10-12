/* eslint-disable @next/next/no-img-element */

// Optional team logo on a Classic card's cover: bottom right of the photo, sized by the same
// logo-size setting as Corporate (card_logo_scale). A soft shadow keeps it visible on any
// photo. Place inside a `position: relative` cover.
export function CoverLogo({ url, scale, inset = 20 }: { url: string; scale: number; inset?: number }) {
  return (
    <img
      src={url} alt=""
      style={{
        position: 'absolute', right: inset, bottom: inset, zIndex: 3, pointerEvents: 'none',
        maxHeight: 44 * scale, maxWidth: 110 * scale, objectFit: 'contain',
        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.45))',
      }}
    />
  );
}
