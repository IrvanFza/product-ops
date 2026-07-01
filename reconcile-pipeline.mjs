#!/usr/bin/env node
/**
 * reconcile-pipeline.mjs — Sync data/pipeline.md (the `- [ ]`/`- [x]` inbox)
 * with data/products.md: entries that became products get checked off.
 * Simplified from santifer/career-ops (MIT).
 *
 * Run: node reconcile-pipeline.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { resolveColumns, parseTrackerRow } from './tracker-parse.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PIPELINE_FILE = join(ROOT, 'data/pipeline.md');
const TRACKER_FILE = join(ROOT, 'data/products.md');
const DRY_RUN = process.argv.includes('--dry-run');
mkdirSync(join(ROOT, 'data'), { recursive: true });

if (!existsSync(PIPELINE_FILE)) { console.log('No pipeline.md to reconcile.'); process.exit(0); }

// URLs/sources already tracked
const tracked = new Set();
if (existsSync(TRACKER_FILE)) {
  const lines = readFileSync(TRACKER_FILE, 'utf-8').split('\n');
  const colmap = resolveColumns(lines);
  for (const line of lines) {
    const r = parseTrackerRow(line, colmap);
    if (r && r.source) tracked.add(r.source.trim());
  }
}

const pipeline = readFileSync(PIPELINE_FILE, 'utf-8').split('\n');
let changes = 0;
for (let i = 0; i < pipeline.length; i++) {
  const line = pipeline[i];
  // Match: - [ ] Title | url — signal   (unchecked)
  const m = line.match(/^- \[ \] (.+?) \| (.+?)(?:\s+—|$)/);
  if (!m) continue;
  const url = m[2].trim();
  if (tracked.has(url)) {
    pipeline[i] = line.replace('- [ ] ', '- [x] ');
    changes++;
    console.log(`✓ ${m[1].trim()} → tracked`);
  }
}

console.log(`\n📊 ${changes} entr${changes === 1 ? 'y' : 'ies'} checked off`);
if (!DRY_RUN && changes > 0) {
  writeFileSync(PIPELINE_FILE, pipeline.join('\n'));
  console.log(`✅ Written to ${PIPELINE_FILE}`);
} else if (DRY_RUN) {
  console.log('(dry-run — no changes written)');
}
