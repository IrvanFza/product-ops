#!/usr/bin/env node

/**
 * reserve-report-num.mjs — Atomically reserve the next report number.
 *
 * Copied from santifer/career-ops (generic, MIT). Fixes the race where two CLI
 * windows / batch workers each compute `max(existing)+1` and collide.
 *
 * Uses fs.writeFileSync(path, '', { flag: 'wx' }) == open(O_CREAT|O_EXCL) to
 * atomically claim a zero-byte sentinel `reports/NNN-RESERVED.md`. The loser
 * increments and retries. No lock daemon needed.
 *
 * Usage:
 *   node reserve-report-num.mjs            # stdout: 035
 *   node reserve-report-num.mjs --release 035   # delete sentinel after writing the real report
 *   node reserve-report-num.mjs --gc       # remove stale sentinels (>4h old)
 */

import { readdirSync, writeFileSync, unlinkSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = join(__dirname, 'reports');
const MAX_SENTINEL_AGE_MS = 4 * 60 * 60 * 1000;
const MAX_RETRIES = 50;

const pad = (n) => String(n).padStart(3, '0');

function maxSlot() {
  if (!existsSync(REPORTS_DIR)) return 0;
  let max = 0;
  for (const name of readdirSync(REPORTS_DIR)) {
    const m = name.match(/^(\d{3})-/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max;
}

function claimSlot(n) {
  if (existsSync(REPORTS_DIR)) {
    const prefix = `${pad(n)}-`;
    if (readdirSync(REPORTS_DIR).some((name) => name.startsWith(prefix))) return false;
  }
  const sentinel = join(REPORTS_DIR, `${pad(n)}-RESERVED.md`);
  try {
    writeFileSync(sentinel, '', { flag: 'wx' });
    return true;
  } catch (err) {
    if (err.code === 'EEXIST') return false;
    throw err;
  }
}

function releaseSlot(n) {
  const sentinel = join(REPORTS_DIR, `${pad(n)}-RESERVED.md`);
  if (existsSync(sentinel)) unlinkSync(sentinel);
}

function gc() {
  if (!existsSync(REPORTS_DIR)) return;
  const now = Date.now();
  let removed = 0;
  for (const name of readdirSync(REPORTS_DIR)) {
    if (!name.endsWith('-RESERVED.md')) continue;
    const full = join(REPORTS_DIR, name);
    try {
      if (now - statSync(full).mtimeMs > MAX_SENTINEL_AGE_MS) {
        unlinkSync(full);
        removed++;
      }
    } catch {}
  }
  if (removed > 0) process.stderr.write(`reserve-report-num: removed ${removed} stale sentinel(s)\n`);
}

const [, , cmd, arg] = process.argv;

if (cmd === '--release') {
  if (!arg || !/^\d{1,3}$/.test(arg)) { process.stderr.write('Usage: node reserve-report-num.mjs --release <NNN>\n'); process.exit(1); }
  releaseSlot(parseInt(arg, 10));
  process.exit(0);
}
if (cmd === '--gc') { gc(); process.exit(0); }

mkdirSync(REPORTS_DIR, { recursive: true });
let candidate = maxSlot() + 1;
let tries = 0;
while (tries < MAX_RETRIES) {
  if (claimSlot(candidate)) { process.stdout.write(pad(candidate) + '\n'); process.exit(0); }
  candidate++;
  tries++;
}
process.stderr.write(`reserve-report-num: could not claim a slot after ${MAX_RETRIES} retries\n`);
process.exit(1);
