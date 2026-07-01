#!/usr/bin/env node
/**
 * generate-screenshot.mjs — Playwright full-page PNG of a competitor URL.
 * auto-pipeline.md Step 0: `node generate-screenshot.mjs <url> <slug> [--full]`
 * → reports/assets/{slug}-landing.png. Realistic UA + SSRF guard.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const [, , url, slug] = process.argv;
const FULL = process.argv.includes('--full');

if (!url || !slug) {
  console.error('Usage: node generate-screenshot.mjs <url> <slug> [--full]');
  process.exit(1);
}

// SSRF guard: http(s) only, reject loopback/private/link-local.
try {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol)) throw 0;
  const h = u.hostname.replace(/[\[\]]/g, '').replace(/\.$/, '');
  if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.0\.0\.0|::1?|::ffff:|fe80:)/i.test(h)) throw 0;
} catch {
  console.error('Refusing non-http(s)/private host.');
  process.exit(1);
}

const outDir = join(ROOT, 'reports', 'assets');
mkdirSync(outDir, { recursive: true });
const out = join(outDir, `${slug}-landing.png`);

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: out, fullPage: FULL });
    console.log(`✓ ${out}`);
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
