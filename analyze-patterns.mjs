#!/usr/bin/env node
/**
 * analyze-patterns.mjs — modes/patterns.md. Score distributions by archetype /
 * status / source, mined from reports/*.md headers + data/products.md.
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { resolveColumns, parseTrackerRow } from './tracker-parse.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const JSON_OUT = process.argv.includes('--json');
const REPORTS = join(ROOT, 'reports');

const byArch = {};
const byStatus = {};
let n = 0;
if (existsSync(REPORTS)) {
  for (const f of readdirSync(REPORTS)) {
    if (!f.endsWith('.md') || f.endsWith('-RESERVED.md')) continue;
    const t = readFileSync(join(REPORTS, f), 'utf-8');
    const arch = (t.match(/\*\*Archetype:\*\*\s*(.+)/) || [])[1]?.trim();
    const sc = (t.match(/\*\*Score:\*\*\s*([\d.]+)/) || [])[1];
    if (arch && sc) {
      byArch[arch] = byArch[arch] || [];
      byArch[arch].push(parseFloat(sc));
      n++;
    }
  }
}

const TRACKER = join(ROOT, 'data/products.md');
if (existsSync(TRACKER)) {
  const lines = readFileSync(TRACKER, 'utf-8').split('\n');
  const cm = resolveColumns(lines);
  for (const l of lines) {
    const r = parseTrackerRow(l, cm);
    if (r) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  }
}

const archSummary = Object.fromEntries(
  Object.entries(byArch).map(([k, v]) => [k, { n: v.length, avg: (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) }])
);
const out = { reports: n, byArchetype: archSummary, byStatus };

if (JSON_OUT) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`Reports: ${n}`);
  for (const [a, s] of Object.entries(archSummary)) console.log(`  ${a}: n=${s.n} avg=${s.avg}`);
  for (const [s, c] of Object.entries(byStatus)) console.log(`  status ${s}: ${c}`);
}
