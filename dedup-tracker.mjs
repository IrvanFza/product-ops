#!/usr/bin/env node
/**
 * dedup-tracker.mjs — Detect & merge duplicate product+source rows in
 * data/products.md. Keeps the highest-scored row; appends the other's notes.
 * Simplified from santifer/career-ops (MIT).
 *
 * Run: node dedup-tracker.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { rebuildRow } from './tracker-utils.mjs';
import { resolveColumns, parseTrackerRow } from './tracker-parse.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const TRACKER_FILE = process.env.PRODUCT_OPS_TRACKER || join(ROOT, 'data/products.md');
const DRY_RUN = process.argv.includes('--dry-run');
const slug = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');

const scoreNum = (s) => parseFloat(String(s || '').replace(/[^0-9.]/g, '')) || 0;

mkdirSync(join(ROOT, 'data'), { recursive: true });
if (!existsSync(TRACKER_FILE)) { console.log('No products.md found. Nothing to dedup.'); process.exit(0); }

const lines = readFileSync(TRACKER_FILE, 'utf-8').split('\n');
const colmap = resolveColumns(lines);

// group line indices by key
const groups = new Map();
lines.forEach((line, i) => {
  const r = parseTrackerRow(line, colmap);
  if (!r) return;
  const key = `${slug(r.product)}::${slug(r.source)}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({ idx: i, row: r });
});

let removed = 0;
for (const [, arr] of groups) {
  if (arr.length < 2) continue;
  // pick winner = highest score (ties → first)
  const winner = [...arr].sort((a, b) => scoreNum(b.row.score) - scoreNum(a.row.score))[0];
  const losers = arr.filter((x) => x !== winner);
  // append loser notes to winner
  const cells = winner.row.raw.split('|').map((s) => s.trim());
  for (const l of losers) {
    const extra = l.row.notes?.trim();
    if (extra && !cells[9]?.includes(extra)) {
      cells[9] = (cells[9] ? cells[9] + '. ' : '') + `[dup] ${extra}`;
    }
    // mark loser line for removal
    lines[l.idx] = null;
    removed++;
    console.log(`#${l.row.num} dup of #${winner.row.num} (${l.row.product}) → merged`);
  }
  lines[winner.idx] = rebuildRow(cells);
}

const out = lines.filter((l) => l !== null).join('\n');
console.log(`\n📊 ${removed} duplicate row(s) ${DRY_RUN ? 'would be' : 'merged'}`);
if (!DRY_RUN && removed > 0) {
  copyFileSync(TRACKER_FILE, TRACKER_FILE + '.bak');
  writeFileSync(TRACKER_FILE, out);
  console.log(`✅ Written (backup: ${TRACKER_FILE}.bak)`);
} else if (DRY_RUN) {
  console.log('(dry-run — no changes written)');
}
