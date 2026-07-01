#!/usr/bin/env node
/**
 * normalize-statuses.mjs — Clean non-canonical statuses in data/products.md.
 * Simplified from santifer/career-ops (MIT): product-ops uses the English
 * lifecycle in templates/states.yml (no Spanish alias map needed).
 *
 * Strips markdown bold (**) and trailing dates from the status field, maps to
 * the nearest canonical state (case-insensitive). Unknown statuses are flagged.
 *
 * Run: node normalize-statuses.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { rebuildRow } from './tracker-utils.mjs';
import { resolveColumns, parseTrackerRow } from './tracker-parse.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const TRACKER_FILE = process.env.PRODUCT_OPS_TRACKER || join(ROOT, 'data/products.md');
const STATES_FILE = join(ROOT, 'templates/states.yml');
const DRY_RUN = process.argv.includes('--dry-run');
const STATUS_COL = 6; // index in split('|') cells: 1=num … 6=status

mkdirSync(join(ROOT, 'data'), { recursive: true });

const states = yaml.load(readFileSync(STATES_FILE, 'utf-8')).states;
const canonical = Object.keys(states); // ['Ideated','Validated',...]
const lower = new Map(canonical.map((c) => [c.toLowerCase(), c]));

// Common non-canonical spellings → canonical.
const ALIASES = {
  idea: 'Ideated', new: 'Ideated', draft: 'Ideated',
  validated: 'Validated', validate: 'Validated', validating: 'Validated',
  brand: 'Branded', branding: 'Branded', named: 'Branded',
  plan: 'Planned', planning: 'Planned', priced: 'Planned',
  live: 'Launched', shipping: 'Launched', launched: 'Launched', released: 'Launched',
  scale: 'Scaling', growing: 'Scaling', growth: 'Scaling',
  pause: 'Paused', paused: 'Paused', hold: 'Paused', stopped: 'Paused',
  archive: 'Archived', archived: 'Archived', dead: 'Archived', killed: 'Archived', discarded: 'Archived', sunset: 'Archived',
  skip: 'SKIP', 'no-build': 'SKIP', nobuild: 'SKIP',
};

function normalizeStatus(raw) {
  let s = String(raw || '').replace(/\*\*/g, '').replace(/\s*\(.*?\)\s*/g, '').trim();
  s = s.replace(/\s+\d{4}.*$/, '').trim(); // strip trailing dates
  if (!s || s === '—' || s === '-') return { status: 'Archived' };
  if (lower.has(s.toLowerCase())) return { status: lower.get(s.toLowerCase()) };
  if (ALIASES[s.toLowerCase()]) return { status: ALIASES[s.toLowerCase()] };
  return { status: null, unknown: true, raw };
}

if (!existsSync(TRACKER_FILE)) { console.log('No products.md found. Nothing to normalize.'); process.exit(0); }

const lines = readFileSync(TRACKER_FILE, 'utf-8').split('\n');
const colmap = resolveColumns(lines);
let changes = 0;
const unknowns = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.startsWith('|')) continue;
  const r = parseTrackerRow(line, colmap);
  if (!r) continue;
  const result = normalizeStatus(r.status);
  if (result.unknown) { unknowns.push({ num: r.num, raw: result.raw, line: i + 1 }); continue; }
  if (result.status === r.status.replace(/\*\*/g, '').trim()) continue;
  const cells = line.split('|').map((s) => s.trim());
  cells[STATUS_COL] = result.status;
  lines[i] = rebuildRow(cells);
  changes++;
  console.log(`#${r.num}: "${r.status}" → "${result.status}"`);
}

if (unknowns.length) {
  console.log(`\n⚠️  ${unknowns.length} unknown statuses:`);
  for (const u of unknowns) console.log(`  #${u.num} (line ${u.line}): "${u.raw}"`);
}
console.log(`\n📊 ${changes} statuses normalized`);
if (!DRY_RUN && changes > 0) {
  copyFileSync(TRACKER_FILE, TRACKER_FILE + '.bak');
  writeFileSync(TRACKER_FILE, lines.join('\n'));
  console.log(`✅ Written (backup: ${TRACKER_FILE}.bak)`);
} else if (DRY_RUN) {
  console.log('(dry-run — no changes written)');
}
