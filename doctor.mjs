#!/usr/bin/env node
/**
 * doctor.mjs — Cold-start / onboarding + health check for product-ops.
 * Adapted from santifer/career-ops (MIT). Outputs JSON the agent reads on the
 * first message of each session to decide whether onboarding is needed.
 *
 *   node doctor.mjs --json
 *   → { "onboardingNeeded": bool, "missing": [...], "warnings": [...], "browser": {...} }
 *
 * missing lists whichever of idea.md, config/product.yml, competitors.yml,
 * .agents/product-marketing.md are absent. browser reports Chromium availability.
 * modes/_profile.md is auto-resolved (copied from template) by the agent, so its
 * absence is a warning, not a blocker.
 */

import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const AS_JSON = process.argv.includes('--json');

mkdirSync(join(ROOT, 'data'), { recursive: true });
mkdirSync(join(ROOT, 'reports'), { recursive: true });

const REQUIRED = [
  { path: 'idea.md', label: 'idea.md' },
  { path: 'config/product.yml', label: 'config/product.yml' },
  { path: 'competitors.yml', label: 'competitors.yml' },
  { path: '.agents/product-marketing.md', label: '.agents/product-marketing.md' },
];

const missing = REQUIRED.filter((f) => !existsSync(join(ROOT, f.path))).map((f) => f.label);
const warnings = [];

// modes/_profile.md is auto-resolved by the agent (copied from template).
if (!existsSync(join(ROOT, 'modes/_profile.md'))) {
  warnings.push('modes/_profile.md absent — copy from modes/_profile.template.md');
}
if (!existsSync(join(ROOT, 'data/products.md'))) {
  warnings.push('data/products.md absent — create the empty tracker table');
}

// Browser health: can Playwright launch Chromium?
let browser = { installed: false, launchable: false, error: null };
try {
  const { chromium } = await import('playwright');
  browser.installed = true;
  try {
    const b = await chromium.launch({ headless: true });
    await b.close();
    browser.launchable = true;
  } catch (e) {
    browser.error = e.message.split('\n')[0];
  }
} catch (e) {
  browser.error = 'playwright module not installed (run npm install)';
}

const onboardingNeeded = missing.length > 0;

if (AS_JSON) {
  console.log(JSON.stringify({ onboardingNeeded, missing, warnings, browser }));
} else {
  console.log('product-ops doctor');
  console.log(`  onboarding needed: ${onboardingNeeded}`);
  if (missing.length) console.log(`  missing: ${missing.join(', ')}`);
  if (warnings.length) for (const w of warnings) console.log(`  ⚠ ${w}`);
  console.log(`  browser: installed=${browser.installed} launchable=${browser.launchable}${browser.error ? ` (${browser.error})` : ''}`);
  if (!browser.launchable) console.log('    → fix: npx playwright install chromium');
}

process.exit(onboardingNeeded ? 0 : 0); // doctor never hard-fails; the agent decides
