#!/usr/bin/env node
/**
 * check-liveness.mjs — CLI market-liveness check for product-ops.
 * HTTP by default; `--browser` renders JS-heavy/WAF'd pages via Playwright.
 *
 * Usage:
 *   node check-liveness.mjs <url>            # HTTP classify
 *   node check-liveness.mjs <url> --browser  # Playwright render (JS pages)
 *   node check-liveness.mjs --trends <kw>    # best-effort trend check
 */
import { makeHttpCtx } from './providers/_http.mjs';
import { classifyLiveness, trendDirection } from './liveness-core.mjs';

const ctx = makeHttpCtx();
const [, , a, b] = process.argv;
const USE_BROWSER = process.argv.includes('--browser');

async function httpClassify(url) {
  let status, bodyText, finalUrl = url, title = '';
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; product-ops/0.1)' } });
    status = res.status;
    finalUrl = res.url;
    bodyText = await res.text();
    const m = bodyText.match(/<title>([\s\S]*?)<\/title>/i);
    if (m) title = m[1].trim();
  } catch (e) {
    return { url, result: 'unclear', reason: `fetch failed: ${e.message}` };
  }
  return { url: finalUrl, status, title, ...classifyLiveness({ status, finalUrl, title, bodyText }) };
}

async function checkUrl(url) {
  let out;
  if (USE_BROWSER) {
    try {
      const { classifyLivenessBrowser } = await import('./liveness-browser.mjs');
      out = await classifyLivenessBrowser(url);
    } catch (e) {
      console.log(JSON.stringify({ url, result: 'unclear', reason: `browser unavailable: ${e.message.split('\n')[0]}` }));
      return;
    }
  } else {
    out = await httpClassify(url);
    // If HTTP is unclear and we have a browser, escalate automatically.
    if (out.result === 'unclear' && !process.env.NO_BROWSER_FALLBACK) {
      try {
        const { classifyLivenessBrowser } = await import('./liveness-browser.mjs');
        const b = await classifyLivenessBrowser(url);
        if (b.result !== 'unclear') out = { ...out, ...b, via: 'browser' };
      } catch { /* keep HTTP result */ }
    }
  }
  console.log(JSON.stringify(out));
}

async function checkTrends(kw) {
  let xml = '';
  try { xml = await ctx.fetchText('https://trends.google.com/trends/trendingsearches/daily/rss?geo=ID'); }
  catch (e) { console.log(JSON.stringify({ keyword: kw, direction: 'unknown', reason: `trends fetch failed: ${e.message}` })); return; }
  console.log(JSON.stringify({ keyword: kw, direction: trendDirection(kw, xml) }));
}

if (a === '--trends' && b) checkTrends(b);
else if (a && a.startsWith('http')) checkUrl(a);
else { console.error('Usage: node check-liveness.mjs <url> [--browser] | --trends <keyword>'); process.exit(1); }
