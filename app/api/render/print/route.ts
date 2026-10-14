import { NextRequest } from 'next/server';
import { withRenderedPage, cleanSlug, exportAllowed } from '@/lib/renderPage';
import { siteOrigin } from '@/lib/renderBrowser';
import { SHEET_W } from '@/lib/printLayout';

export const maxDuration = 60;

// The printable card, made on the server so every phone gets the same file.
//   ?format=pdf (default) — A4 landscape print file, in the chosen double/single-sided order
//   ?format=png           — a picture of the sheets, for the preview on the print page
// The print page itself decides what to show (e.g. the watermark on unpaid cards).
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const slug = cleanSlug(q.get('slug'));
  if (!slug) return Response.json({ error: 'Missing card' }, { status: 400 });
  if (!(await exportAllowed(slug))) {
    return Response.json({ error: 'This unlocks when the card is sent' }, { status: 403 });
  }

  const mode = q.get('mode') === 'single' ? 'single' : 'double';
  const flip = q.get('flip') === '1' ? '1' : '0';
  const preview = q.get('preview') === '1';
  const asPng = q.get('format') === 'png';

  const pageUrl = `${siteOrigin(request.url)}/print/${slug}?render=1&mode=${mode}&flip=${flip}${preview ? '&preview=1' : ''}`;

  try {
    if (asPng) {
      const png = await withRenderedPage(pageUrl, { width: Math.ceil(SHEET_W) + 48, height: 900, deviceScaleFactor: 1 }, '[data-print-ready]',
        async page => (await page.$('.tyc-render'))!.screenshot({ type: 'png' }));
      return new Response(Buffer.from(png), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' } });
    }
    const pdf = await withRenderedPage(pageUrl, { width: Math.ceil(SHEET_W), height: 900, deviceScaleFactor: 1 }, '[data-print-ready]',
      async page => {
        await page.emulateMediaType('print');
        return page.pdf({ preferCSSPageSize: true, printBackground: true });
      });
    return new Response(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="thankyoucards-${slug}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Render print error:', err);
    return Response.json({ error: 'Could not prepare the print file' }, { status: 500 });
  }
}
