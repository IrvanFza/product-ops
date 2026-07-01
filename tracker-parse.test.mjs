// tracker-parse.test.mjs — parseTrackerRow + resolveColumns on the 9-col schema.
// Canonical products.md layout: # | Date | Product | Source | Score | Status | PDF | Report | Notes
import { strict as assert } from 'node:assert';
import { parseTrackerRow, resolveColumns } from './tracker-parse.mjs';

const lines = [
  '# Products Tracker',
  '',
  '| # | Date | Product | Source | Score | Status | PDF | Report | Notes |',
  '|---|------|---------|--------|-------|--------|-----|--------|-------|',
  '| 1 | 2026-07-01 | Acme | https://acme.com | 4.5/5 | Live | ❌ | [1](reports/1.md) | neat idea |',
  '| 2 | 2026-07-02 | Bo | https://bo.com | 3.0/5 | Paused | ✅ | [2](reports/2.md) | maybe later |',
  '',
];

// Header-aware detection: standard header → canonical indices.
const colmap = resolveColumns(lines);
assert.equal(colmap.product, 3);
assert.equal(colmap.source, 4);
assert.equal(colmap.score, 5);
assert.equal(colmap.status, 6);

// Header / separator / non-table / malformed rows return null.
assert.equal(parseTrackerRow(lines[0], colmap), null); // '# heading'
assert.equal(parseTrackerRow(lines[2], colmap), null); // header row
assert.equal(parseTrackerRow(lines[3], colmap), null); // separator
assert.equal(parseTrackerRow('not a row', colmap), null);
assert.equal(parseTrackerRow('| a | b |', colmap), null); // too few columns

// A real data row parses with raw preserved.
const row1 = parseTrackerRow(lines[4], colmap);
assert.equal(row1.num, 1);
assert.equal(row1.product, 'Acme');
assert.equal(row1.source, 'https://acme.com');
assert.equal(row1.score, '4.5/5');
assert.equal(row1.status, 'Live');
assert.equal(row1.report, '[1](reports/1.md)');
assert.equal(row1.notes, 'neat idea');
assert.equal(row1.raw, lines[4]);

// Header-aware: a SWAPPED header (status before score) is detected, and a row
// written in that order is read correctly despite differing from the legacy layout.
const swapped = [
  '| # | Date | Product | Source | Status | Score | PDF | Report | Notes |',
  '|---|------|---------|--------|--------|-------|-----|--------|-------|',
  '| 3 | 2026-07-03 | Cy | https://cy.com | Live | 5/5 | ❌ | [3](reports/3.md) | swap |',
];
const sc = resolveColumns(swapped);
assert.equal(sc.status, 5); // detected, not hard-coded
assert.equal(sc.score, 6);
const row3 = parseTrackerRow(swapped[2], sc);
assert.equal(row3.status, 'Live');
assert.equal(row3.score, '5/5');
assert.equal(row3.product, 'Cy');

console.log('✓ tracker-parse.test.mjs');
