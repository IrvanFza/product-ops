#!/usr/bin/env node
/**
 * check-liveness.mjs — CLI market-liveness check for product-ops.
 * Adapted from santifer/career-ops (MIT), reframed (competitor-alive / trend-hot).
 *
 * Usage:
 *   node check-liveness.mjs <url>            # classify a competitor page
 *   node check-liveness.mjs --trends <kw>    # best-effort trend check
 *
 * // ponytail: HTTP-only. For JS-heavy/WAF'd pages, the interactive session
 * // uses Playwright (browser_navigate + browser_snapshot) instead.
 */

import { readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { makeHttpCtx } from './providers/_http.mjs';
import { classifyLiveness, trendDirection } from './liveness-core.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const ctx = makeHttpCtx();
const [, , a, b] = process.argv;

async function checkUrl(url) {
  let status, bodyText, finalUrl = url, title = '';
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; product-ops/0.1)' } });
    status = res.status;
    finalUrl = res.url;
    bodyText = await res.text();
    const m = bodyText.match(/<title>([\s\S]*?)<\/title>/i);
    if (m) title = m[1].trim();
  } catch (e) {
    console.log(JSON.stringify({ url, result: 'unclear', reason: `fetch failed: ${e.message}` }));
    return;
  }
  const out = classifyLiveness({ status, finalUrl, title, bodyText });
  console.log(JSON.stringify({ url: finalUrl, status, title, ...out }));
}

async function checkTrends(kw) {
  let xml = '';
  try {
    xml = await ctx.fetchText('https://trends.google.com/trends/trendingsearches/daily/rss?geo=US');
  } catch (e) {
    console.log(JSON.stringify({ keyword: kw, direction: 'unknown', reason: `trends fetch failed: ${e.message}` }));
    return;
  }
  console.log(JSON.stringify({ keyword: kw, direction: trendDirection(kw, xml) }));
}

if (a === '--trends' && b) checkTrends(b);
else if (a && a.startsWith('http')) checkUrl(a);
else { console.error('Usage: node check-liveness.mjs <url> | --trends <keyword>'); process.exit(1); }
