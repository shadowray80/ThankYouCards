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

const EMOJI_FONT_URL = 'https://raw.githubusercontent.com/googlefonts/noto-emoji/e20cbc2bbec1926686be9f9bee7d1d2cfa1fea0e/2D/fonts/NotoColorEmoji.ttf';

async function ensureEmojiFont() {
  const { existsSync, mkdirSync, writeFileSync } = await import('fs');
  const target = '/tmp/fonts/NotoColorEmoji.ttf';
  if (existsSync(target)) return;
  const res = await fetch(EMOJI_FONT_URL);
  if (!res.ok) throw new Error(`Emoji font download: HTTP ${res.status}`);
  mkdirSync('/tmp/fonts', { recursive: true });
  writeFileSync(target, Buffer.from(await res.arrayBuffer()));
}

export async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const chromium = (await import('@sparticuz/chromium')).default;
    // Unpack Chrome first — that sets up /tmp/fonts (its own fonts + font settings).
    const executablePath = await chromium.executablePath();
    // The serverless Chrome has no emoji font — messages are full of them. Add Google's Noto
    // Color Emoji (free licence) to /tmp/fonts, a folder its font settings scan. (The package's
    // own font() helper saves to $HOME/.fonts, which those settings only cover on AWS, not
    // Vercel.) If it can't be fetched, cards still render, minus emoji.
    await ensureEmojiFont().catch(err => console.error('Emoji font load failed:', err));
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
