#!/usr/bin/env node
/**
 * tracker.mjs — index/report over data/products.md. modes/tracker.md: `node tracker.mjs sync`.
 * // ponytail: markdown-parse only; add a SQLite index if query volume grows.
 */
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { resolveColumns, parseTrackerRow } from './tracker-parse.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const TRACKER = join(ROOT, 'data/products.md');
const JSON_OUT = process.argv.includes('--json');
mkdirSync(join(ROOT, 'data'), { recursive: true });

if (!existsSync(TRACKER)) {
  console.log(JSON_OUT ? '{"total":0}' : 'No products.md. Run an evaluation first.');
  process.exit(0);
}

const lines = readFileSync(TRACKER, 'utf-8').split('\n');
const colmap = resolveColumns(lines);
const rows = lines.map((l) => parseTrackerRow(l, colmap)).filter(Boolean);

const byStatus = {}, bySource = {};
const now = Date.now();
const stale = [];
let dups = 0;
const seen = new Set();
for (const r of rows) {
  byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  bySource[r.source] = (bySource[r.source] || 0) + 1;
  const key = `${r.product}|${r.source}`.toLowerCase();
  if (seen.has(key)) dups++; else seen.add(key);
  if (r.date) { const d = Date.parse(r.date); if (d && now - d > 60 * 864e5) stale.push(r); }
}
const scoreNum = (s) => parseFloat(String(s || '').replace(/[^0-9.]/g, '')) || 0;
const top = [...rows].sort((a, b) => scoreNum(b.score) - scoreNum(a.score)).slice(0, 5)
  .map((r) => ({ num: r.num, product: r.product, score: r.score, status: r.status }));

const out = { total: rows.length, byStatus, bySource, top, staleCount: stale.length, duplicates: dups };
if (JSON_OUT) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`Products: ${rows.length}`);
  for (const [s, n] of Object.entries(byStatus)) console.log(`  ${s}: ${n}`);
  console.log(`Top: ${top.map((t) => `#${t.num} ${t.product} ${t.score}`).join(', ') || '(none)'}`);
  console.log(`Stale (>60d): ${stale.length}  |  Dups: ${dups}`);
}
