// providers/_browser.mjs — shared Playwright render helper for JS-heavy providers
// (g2, playstore) whose plain-HTTP fetch returns little. Throttled + SSRF-guarded.
import { chromium } from 'playwright';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const PRIVATE = [
  /^localhost$/, /^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./, /^0\.0\.0\.0$/, /^::1?$/, /^::ffff:/, /^fe80:/i,
];

export function isPrivateUrl(raw) {
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) return true;
    let h = u.hostname.replace(/[\[\]]/g, '').replace(/\.$/, '');
    if (h.startsWith('::ffff:')) h = h.slice(7);
    return PRIVATE.some((re) => re.test(h));
  } catch { return true; }
}

/** Render a page's full HTML via headless Chromium. Throws on private hosts. */
export async function renderHtml(url, { timeout = 15_000 } = {}) {
  if (isPrivateUrl(url)) throw new Error('refused non-public host');
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ userAgent: UA, locale: 'en-US' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    await page.waitForTimeout(1500);
    return await page.content();
  } finally {
    await browser.close();
  }
}
