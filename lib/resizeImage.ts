const MAX_DIMENSION = 2000;
const QUALITY = 0.8;
const DECODE_TIMEOUT_MS = 10000;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

// iOS Safari has long-standing WebKit bugs where createImageBitmap() on a HEIC
// photo (the iPhone camera's default format) hangs or leaks rather than
// resolving or rejecting — so a plain try/catch around it doesn't help, since
// there's nothing to catch. Racing it against a timeout guarantees we give up
// and fall back to the original file instead of leaving the caller waiting
// forever. HEIC's compression is efficient enough that the original file is
// often already under the server's size cap anyway.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timed out')), ms);
    promise.then(
      v => { clearTimeout(timer); resolve(v); },
      e => { clearTimeout(timer); reject(e); },
    );
  });
}

// Downscales + re-encodes an uploaded photo as WebP (falling back to JPEG if the
// browser silently ignores the requested type) so an 8-25MB phone photo doesn't
// blow the server's upload size limit. Non-image files and formats the browser
// can't decode (e.g. SVG) are passed through untouched.
export async function resizeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await withTimeout(createImageBitmap(file), DECODE_TIMEOUT_MS);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob = await canvasToBlob(canvas, 'image/webp', QUALITY);
  if (!blob || blob.type !== 'image/webp') {
    blob = await canvasToBlob(canvas, 'image/jpeg', QUALITY);
  }
  if (!blob) return file;

  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const name = file.name.replace(/\.[^.]+$/, '') + `.${ext}`;
  return new File([blob], name, { type: blob.type });
}
