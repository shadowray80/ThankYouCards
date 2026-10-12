import puppeteer, { type Browser } from 'puppeteer-core';

// A real Chrome running on the server, used to turn cards into print files (PDF) and pictures
// (PNG) — so every phone gets the same, correct result instead of each browser drawing the card
// itself (iPhone Safari drops photos and boosts text sizes when it tries).
//
// On Vercel: @sparticuz/chromium (a Chrome build for serverless hosting). Locally: the installed
// Chrome, or CHROME_PATH if set.

const LOCAL_CHROME = process.env.CHROME_PATH
  ?? (process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome');

// TEMPORARY diagnostic: how the emoji font load went, reported in an X-Emoji-Font header.
export let emojiFontStatus = 'not-attempted';

const EMOJI_FONT_URL = 'https://raw.githubusercontent.com/googlefonts/noto-emoji/e20cbc2bbec1926686be9f9bee7d1d2cfa1fea0e/2D/fonts/NotoColorEmoji.ttf';

export async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const chromium = (await import('@sparticuz/chromium')).default;
    // The serverless Chrome has no emoji font — messages are full of them. Google's Noto
    // Color Emoji (free licence). If it can't be fetched, cards still render, minus emoji.
    try {
      const path = await chromium.font(EMOJI_FONT_URL);
      emojiFontStatus = `ok:${path}`;
    } catch (err) {
      emojiFontStatus = `failed:${err instanceof Error ? err.message : String(err)}`.slice(0, 300);
      console.error('Emoji font load failed:', err);
    }
    const executablePath = await chromium.executablePath();
    try {
      const { readdirSync } = await import('fs');
      emojiFontStatus += ` | /tmp/fonts: ${readdirSync('/tmp/fonts').join(',')} | FONTCONFIG_PATH=${process.env.FONTCONFIG_PATH ?? '-'}`;
    } catch (err) {
      emojiFontStatus += ` | /tmp/fonts unreadable: ${err instanceof Error ? err.message : String(err)}`;
    }
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: null,
      executablePath,
      headless: true,
    });
  }
  return puppeteer.launch({ executablePath: LOCAL_CHROME, headless: true });
}

// The site's own address for this request, so the server-side browser opens the same deployment.
export function siteOrigin(requestUrl: string): string {
  return new URL(requestUrl).origin;
}
