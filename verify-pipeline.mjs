#!/usr/bin/env node
/**
 * verify-pipeline.mjs — Health check for the product-ops pipeline.
 * Adapted from santifer/career-ops (MIT), simplified.
 *
 * Checks:
 *  - every report in reports/*.md has header **URL:**, **Score:**, **Legitimacy:**
 *  - every products.md status is canonical (templates/states.yml)
 *  - no duplicate report numbers
 *  - GC stale report-number sentinels
 * Exit non-zero on errors.
 */

import { readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import yaml from 'js-yaml';
import { resolveColumns, parseTrackerRow } from './tracker-parse.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = join(ROOT, 'reports');
const TRACKER_FILE = join(ROOT, 'data/products.md');
const STATES_FILE = join(ROOT, 'templates/states.yml');
mkdirSync(REPORTS_DIR, { recursive: true });

// GC stale sentinels (best-effort, ignore failure).
try { execSync('node reserve-report-num.mjs --gc', { cwd: ROOT, stdio: 'ignore' }); } catch {}

const canonical = new Set(Object.keys(yaml.load(readFileSync(STATES_FILE, 'utf-8')).states));
const errors = [];
const warnings = [];

// 1. Reports
if (existsSync(REPORTS_DIR)) {
  const nums = new Set();
  for (const name of readdirSync(REPORTS_DIR)) {
    if (!name.endsWith('.md') || name.endsWith('-RESERVED.md')) continue;
    const m = name.match(/^(\d{3})-/);
    if (!m) continue;
    const n = m[1];
    if (nums.has(n)) errors.push(`duplicate report number ${n}`);
    nums.add(n);
    const head = readFileSync(join(REPORTS_DIR, name), 'utf-8').slice(0, 1200);
    if (!/\*\*URL:\*\*/.test(head)) warnings.push(`${name}: missing **URL:** header`);
    if (!/\*\*Score:\*\*/.test(head)) warnings.push(`${name}: missing **Score:** header`);
    if (!/\*\*Legitimacy:\*\*/.test(head)) warnings.push(`${name}: missing **Legitimacy:** header`);
  }
}

// 2. Tracker statuses
if (existsSync(TRACKER_FILE)) {
  const lines = readFileSync(TRACKER_FILE, 'utf-8').split('\n');
  const colmap = resolveColumns(lines);
  for (const line of lines) {
    const r = parseTrackerRow(line, colmap);
    if (!r) continue;
    if (!canonical.has(r.status)) warnings.push(`#${r.num}: non-canonical status "${r.status}"`);
  }
}

console.log(`verify-pipeline: ${errors.length} error(s), ${warnings.length} warning(s).`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
for (const e of errors) console.log(`  ✗ ${e}`);
process.exit(errors.length ? 1 : 0);
