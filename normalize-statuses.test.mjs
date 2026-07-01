// normalize-statuses.test.mjs — status canonicalization against templates/states.yml.
// "brand"→Branded, "PAUSED"→Paused, "**Live**"→Launched (bold stripped), unknown flagged.
// Spawns normalize-statuses.mjs with PRODUCT_OPS_TRACKER pointed at a temp file.
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { resolveColumns, parseTrackerRow } from './tracker-parse.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const NORMALIZE = join(ROOT, 'normalize-statuses.mjs');

const tmp = mkdtempSync(join(tmpdir(), 'po-norm-'));
const tracker = join(tmp, 'products.md');
writeFileSync(tracker, [
  '# Products Tracker', '',
  '| # | Date | Product | Source | Score | Status | PDF | Report | Notes |',
  '|---|------|---------|--------|-------|--------|-----|--------|-------|',
  '| 1 | 2026-07-01 | Acme | https://acme.com | 4.5/5 | brand | ❌ | [1](reports/1.md) | x |',
  '| 2 | 2026-07-01 | Bo | https://bo.com | 3/5 | PAUSED | ❌ | [2](reports/2.md) | y |',
  '| 3 | 2026-07-01 | Cy | https://cy.com | 5/5 | **Live** | ❌ | [3](reports/3.md) | z |',
  '| 4 | 2026-07-01 | Dy | https://dy.com | 2/5 | Flibbertigibbet | ❌ | [4](reports/4.md) | w |',
  '',
].join('\n'));

const res = spawnSync(process.execPath, [NORMALIZE], {
  cwd: ROOT,
  stdio: 'pipe',
  encoding: 'utf-8',
  env: { ...process.env, PRODUCT_OPS_TRACKER: tracker },
});
assert.equal(res.status, 0, `normalize-statuses exited ${res.status}: ${res.stderr}`);

const lines = readFileSync(tracker, 'utf-8').split('\n');
const cm = resolveColumns(lines);
const byNum = new Map();
for (const l of lines) { const r = parseTrackerRow(l, cm); if (r) byNum.set(r.num, r); }

assert.equal(byNum.get(1).status, 'Branded'); // brand → Branded
assert.equal(byNum.get(2).status, 'Paused'); // PAUSED → Paused
assert.equal(byNum.get(3).status, 'Launched'); // **Live** → Launched (bold stripped)
assert.equal(byNum.get(4).status, 'Flibbertigibbet'); // unknown left in place
assert.match(res.stdout, /unknown/i); // unknown flagged on stdout

console.log('✓ normalize-statuses.test.mjs');
