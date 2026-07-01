/**
 * liveness-browser.mjs — Playwright Chromium render for JS-heavy/WAF'd competitor
 * pages. Realistic UA + locale to clear Cloudflare; SSRF-guarded; delegates the
 * active/closed call to liveness-core.classifyLiveness.
 * Adapted from santifer/career-ops' liveness-browser.mjs (MIT).
 */
import { chromium } from 'playwright';
import { classifyLiveness } from './liveness-core.mjs';

const NAV_TIMEOUT = 15_000;
const HYDRATION_WAIT = 2_000;
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
  } catch {
    return true;
  }
}

/**
 * @param {string} url
 * @returns {Promise<{url?:string,status?:number,title?:string,result:string,reason:string}>}
 */
export async function classifyLivenessBrowser(url) {
  if (isPrivateUrl(url)) return { result: 'unclear', reason: 'refused non-public host' };
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ userAgent: UA, locale: 'en-US' });
    const page = await ctx.newPage();
    let status, finalUrl = url, title = '', bodyText = '';
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      status = resp?.status();
      finalUrl = page.url();
      await page.waitForTimeout(HYDRATION_WAIT);
      title = await page.title();
      bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 8000) || '');
    } catch (e) {
      return { result: 'unclear', reason: `browser nav failed: ${e.message.split('\n')[0]}` };
    }
    return { url: finalUrl, status, title, ...classifyLiveness({ status, finalUrl, title, bodyText }) };
  } finally {
    await browser.close();
  }
}
