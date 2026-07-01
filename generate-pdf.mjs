#!/usr/bin/env node
/**
 * generate-pdf.mjs — HTML → PDF via Playwright (Chromium).
 * Adapted from santifer/career-ops (MIT), simplified (no ATS-text normalization;
 * product-ops outputs brand guides / business plans / marketing plans).
 *
 * Usage:
 *   node generate-pdf.mjs <input.html> <output.pdf> [--format=letter|a4] [--report=NNN]
 *
 * --report links the generated PDF to its report number in data/pdf-index.tsv
 * so the dashboard / tracker can locate it. Without --report a manifest row is
 * still written, just unkeyed.
 */

import { chromium } from 'playwright';
import { resolve, dirname, relative, isAbsolute, join } from 'path';
import { readFile, mkdirSync, appendFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PDF_INDEX = join(ROOT, 'data/pdf-index.tsv');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node generate-pdf.mjs <input.html> <output.pdf> [--format=letter|a4] [--report=NNN]');
  process.exit(1);
}
const [inPath, outPath] = args;
const formatArg = args.find((a) => a.startsWith('--format='));
const reportArg = args.find((a) => a.startsWith('--report='));
const format = formatArg ? formatArg.split('=')[1] : 'a4';
const report = reportArg ? reportArg.split('=')[1] : '';

const inAbs = isAbsolute(inPath) ? inPath : resolve(process.cwd(), inPath);
const outAbs = isAbsolute(outPath) ? outPath : resolve(process.cwd(), outPath);
mkdirSync(dirname(outAbs), { recursive: true });
mkdirSync(dirname(PDF_INDEX), { recursive: true });

function fileUrl(p) { return 'file://' + (isAbsolute(p) ? p : resolve(process.cwd(), p)); }

(async () => {
  const html = await readFile(inAbs, 'utf-8');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(fileUrl(inAbs), { waitUntil: 'load' });
    // Give web fonts / images a beat.
    await page.waitForTimeout(300);
    await page.pdf({
      path: outAbs,
      format,
      printBackground: true,
      margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' },
    });

    // Record linkage in data/pdf-index.tsv: report\tpdf_path\tgenerated_at
    const rel = relative(ROOT, outAbs) || outAbs;
    const row = [report || '-', rel, new Date().toISOString()].join('\t') + '\n';
    appendFileSync(PDF_INDEX, row);
    console.log(`✓ ${outAbs}${report ? ` (report ${report})` : ''}`);
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
