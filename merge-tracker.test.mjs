// merge-tracker.test.mjs — TSV→products.md merge.
// Verifies the status-before-score → score-before-status column swap on new
// rows, dedup-by-product+source updating in place, and report-link normalization.
// Uses temp dirs + PRODUCT_OPS_TRACKER / PRODUCT_OPS_ADDITIONS env vars.
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { resolveColumns, parseTrackerRow } from './tracker-parse.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const MERGE = join(ROOT, 'merge-tracker.mjs');

function runMerge(trackerFile, additionsDir) {
  return spawnSync(process.execPath, [MERGE], {
    cwd: ROOT,
    stdio: 'pipe',
    encoding: 'utf-8',
    env: { ...process.env, PRODUCT_OPS_TRACKER: trackerFile, PRODUCT_OPS_ADDITIONS: additionsDir },
  });
}

function readRows(file) {
  const lines = readFileSync(file, 'utf-8').split('\n');
  const cm = resolveColumns(lines);
  const rows = [];
  for (const l of lines) { const r = parseTrackerRow(l, cm); if (r) rows.push(r); }
  return rows;
}

// --- Scenario A: fresh tracker + one TSV addition (status-before-score) -------
// products.md row must come out score-before-status; report link normalized.
const tmpA = mkdtempSync(join(tmpdir(), 'po-merge-a-'));
const trackerA = join(tmpA, 'data', 'products.md'); // 'data' basename → reports resolve at tmpA root
const additionsA = join(tmpA, 'additions');
mkdirSync(join(tmpA, 'data'), { recursive: true });
mkdirSync(additionsA, { recursive: true });
// TSV order: num  date  product  source  STATUS  SCORE  pdf  report  notes
writeFileSync(join(additionsA, 'add1.tsv'),
  '1\t2026-07-01\tAcme\thttps://acme.com\tLive\t4.5/5\t❌\t[1](reports/1.md)\tneat idea\n');

let res = runMerge(trackerA, additionsA);
assert.equal(res.status, 0, `merge-tracker exited ${res.status}: ${res.stderr}`);
const rowsA = readRows(trackerA);
assert.equal(rowsA.length, 1, 'exactly one row added');
const a = rowsA[0];
assert.equal(a.product, 'Acme');
assert.equal(a.score, '4.5/5'); // score-before-status in output
assert.equal(a.status, 'Live');
// score cell physically precedes status cell (the column swap was applied).
assert.ok(a.raw.indexOf('4.5/5') < a.raw.indexOf('Live'), 'score before status in row');
// link normalized relative to data/ → ../reports/1.md
assert.match(a.report, /\.\.\/reports\/1\.md/);

// --- Scenario B: dedup by product+source updates the existing row in place -----
const tmpB = mkdtempSync(join(tmpdir(), 'po-merge-b-'));
const trackerB = join(tmpB, 'data', 'products.md');
const additionsB = join(tmpB, 'additions');
mkdirSync(join(tmpB, 'data'), { recursive: true });
mkdirSync(additionsB, { recursive: true });
writeFileSync(trackerB, [
  '# Products Tracker', '',
  '| # | Date | Product | Source | Score | Status | PDF | Report | Notes |',
  '|---|------|---------|--------|-------|--------|-----|--------|-------|',
  '| 1 | 2026-07-01 | Acme | https://acme.com | 3.0/5 | Idea | ❌ | [1](reports/1.md) | old |',
  '',
].join('\n'));
// Same product+source, new score/status → update in place, not duplicate.
writeFileSync(join(additionsB, 'upd1.tsv'),
  '1\t2026-07-01\tAcme\thttps://acme.com\tLive\t4.5/5\t❌\t[1](reports/1.md)\tupdated\n');

res = runMerge(trackerB, additionsB);
assert.equal(res.status, 0, `merge-tracker exited ${res.status}: ${res.stderr}`);
const rowsB = readRows(trackerB);
assert.equal(rowsB.length, 1, 'dedup updates in place, no duplicate');
const b = rowsB[0];
assert.equal(b.score, '4.5/5'); // updated from 3.0/5
assert.equal(b.status, 'Live'); // updated from Idea
assert.equal(b.notes, 'updated');
assert.match(b.report, /\.\.\/reports\/1\.md/);

console.log('✓ merge-tracker.test.mjs');
