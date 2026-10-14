import type { Page } from 'puppeteer-core';
import { launchBrowser } from '@/lib/renderBrowser';
import { supabaseAdmin } from '@/lib/supabase';

// Opens a page of this site in the server-side Chrome, waits until it's fully drawn (the given
// marker present, every image loaded, web fonts ready), then hands it over for capturing.
export async function withRenderedPage<T>(
  url: string,
  viewport: { width: number; height: number; deviceScaleFactor: number },
  readySelector: string,
  capture: (page: Page) => Promise<T>,
): Promise<T> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 40_000 });
    await page.waitForSelector(readySelector, { timeout: 40_000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map(img =>
        img.complete ? null : new Promise(resolve => { img.onload = img.onerror = resolve; })));
    });
    return await capture(page);
  } finally {
    await browser.close();
  }
}

// Print files and pictures unlock once a group card is paid for and sent (solo cards are free and
// sent straight away). Viewing a preview is never locked — only exporting.
export async function exportAllowed(slug: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from('campaigns').select('status, deadline').eq('slug', slug).maybeSingle();
  if (!data) return false;
  return data.status === 'sent' || !data.deadline;
}

// Card links are slugs like "coach-pete-ab12c" — only allow that shape into URLs we open.
export function cleanSlug(slug: string | null): string | null {
  return slug && /^[a-z0-9-]{1,120}$/i.test(slug) ? slug : null;
}
