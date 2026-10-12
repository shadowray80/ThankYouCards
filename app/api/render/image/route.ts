import { NextRequest } from 'next/server';
import { withRenderedPage, cleanSlug } from '@/lib/renderPage';
import { siteOrigin } from '@/lib/renderBrowser';

export const maxDuration = 60;

const MAX_IMAGE_HEIGHT = 16_000; // px — keeps very long cards within image size limits

// "Save to Photos": the whole card as one long picture, made on the server (phone-width view,
// sharp 2× pixels) so photos and fonts always come out right, whatever the phone.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const slug = cleanSlug(q.get('slug'));
  if (!slug) return Response.json({ error: 'Missing card' }, { status: 400 });
  const preview = q.get('preview') === '1';

  const pageUrl = `${siteOrigin(request.url)}/view/${slug}${preview ? '?preview=1' : ''}`;

  try {
    const png = await withRenderedPage(pageUrl, { width: 430, height: 900, deviceScaleFactor: 2 }, '[data-card-capture]',
      async page => {
        // Leave out buttons and links ("Send a card!", Print card, Save to Photos…).
        await page.addStyleTag({ content: '.tyc-print-hide { display: none !important; }' });
        const card = (await page.$('[data-card-capture]'))!;
        const box = await card.boundingBox();
        if (box && box.height * 2 > MAX_IMAGE_HEIGHT) {
          await page.setViewport({ width: 430, height: 900, deviceScaleFactor: Math.max(1, MAX_IMAGE_HEIGHT / box.height) });
        }
        return card.screenshot({ type: 'png' });
      });
    return new Response(Buffer.from(png), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="thankyoucards-${slug}.png"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Render image error:', err);
    return Response.json({ error: 'Could not prepare the picture' }, { status: 500 });
  }
}
