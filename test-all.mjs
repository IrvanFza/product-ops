#!/usr/bin/env node
// test-all.mjs — run every *.test.mjs at the repo root. No framework.
// Each test is self-running: `node <file>.test.mjs` exits 0 on pass, 1 on fail.
// This runner spawns them in turn and exits non-zero if any failed.
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(ROOT)
  .filter((f) => f.endsWith('.test.mjs'))
  .sort();

if (files.length === 0) console.log('No *.test.mjs files found.');

let passed = 0;
let failed = 0;
for (const f of files) {
  // stdio: 'inherit' surfaces assertion failures inline; tests stay silent on pass.
  const r = spawnSync(process.execPath, [join(ROOT, f)], { stdio: 'inherit' });
  if (r.status === 0) {
    passed++;
  } else {
    failed++;
    console.error(`✗ ${f} (exit ${r.status == null ? 'null' : r.status})`);
  }
}

console.log(`\n✓ ${passed} passed / ✗ ${failed} failed`);
process.exit(failed ? 1 : 0);
