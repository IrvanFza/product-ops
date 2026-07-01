#!/usr/bin/env node
/**
 * merge-tracker.mjs — Merge batch/tracker-additions/*.tsv into data/products.md.
 *
 * Simplified from santifer/career-ops (MIT). career-ops' version adds elaborate
 * cross-process file locking (owner.json, stale recovery, release tokens) for
 * high-contention batch runs; v0.1 uses an atomic tmp+rename write instead.
 * // ponytail: no cross-process lock; add a mkdir-based lock if batch workers collide.
 *
 * TSV addition format (9 cols, STATUS BEFORE SCORE — the swap):
 *   num\tdate\tproduct\tsource\tstatus\tscore/5\tpdf\t[num](reports/num-slug-date.md)\tnote
 * products.md row format (9 cols, SCORE BEFORE STATUS):
 *   | # | Date | Product | Source | Score | Status | PDF | Report | Notes |
 *
 * Dedup: product normalized + source normalized exact match. On duplicate, the
 * addition updates status/score/pdf/report/notes when its score >= existing.
 * Report links are normalized relative to the tracker dir (see tracker-links.mjs).
 *
 * Run: node merge-tracker.mjs [--dry-run] [--migrate]
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, copyFileSync, renameSync } from 'fs';
import { join, dirname, basename, resolve } from 'path';
import { fileURLToPath } from 'url';
import { rebuildRow } from './tracker-utils.mjs';
import { resolveColumns, parseTrackerRow } from './tracker-parse.mjs';
import { normalizeReportLink } from './tracker-links.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const TRACKER_FILE = process.env.PRODUCT_OPS_TRACKER || join(ROOT, 'data/products.md');
const TRACKER_DIR = dirname(TRACKER_FILE);
const ADDITIONS_DIR = process.env.PRODUCT_OPS_ADDITIONS || join(ROOT, 'batch/tracker-additions');
const DRY_RUN = process.argv.includes('--dry-run');
const MIGRATE = process.argv.includes('--migrate');

// reports/ sits at repo root; tracker is at data/products.md → parent is root.
const REPORTS_ROOT = basename(TRACKER_DIR) === 'data' ? dirname(TRACKER_DIR) : TRACKER_DIR;
const normLink = (field) => normalizeReportLink(field, TRACKER_DIR, REPORTS_ROOT);

mkdirSync(join(ROOT, 'data'), { recursive: true });
mkdirSync(ADDITIONS_DIR, { recursive: true });

const slug = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');

function ensureTracker() {
  if (existsSync(TRACKER_FILE)) return readFileSync(TRACKER_FILE, 'utf-8').split('\n');
  const header = [
    '# Products Tracker',
    '',
    '| # | Date | Product | Source | Score | Status | PDF | Report | Notes |',
    '|---|------|---------|--------|-------|--------|-----|--------|-------|',
    '',
  ];
  return header;
}

function parseTsv(line) {
  const [num, date, product, source, status, score, pdf, report, ...noteParts] = line.split('\t');
  const n = parseInt(num, 10);
  if (isNaN(n)) return null;
  return {
    num: n, date, product, source,
    status: (status || '').replace(/\*\*/g, '').trim(),
    score: (score || '').replace(/\*\*/g, '').trim(),
    pdf: pdf || '', report: report || '',
    notes: (noteParts.join('\t') || '').trim(),
  };
}

async function main() {
  let lines = ensureTracker();
  const colmap = resolveColumns(lines);
  const rows = new Map(); // key → {lineIdx, row}
  lines.forEach((line, i) => {
    const r = parseTrackerRow(line, colmap);
    if (r) rows.set(`${slug(r.product)}::${slug(r.source)}`, { idx: i, row: r });
  });

  const additionFiles = existsSync(ADDITIONS_DIR)
    ? readdirSync(ADDITIONS_DIR).filter((f) => f.endsWith('.tsv')).sort()
    : [];

  if (additionFiles.length === 0 && !MIGRATE) {
    console.log('No TSV additions to merge. (Run an evaluation first, or use --migrate to fix links.)');
  }

  let added = 0, updated = 0;
  for (const file of additionFiles) {
    const raw = readFileSync(join(ADDITIONS_DIR, file), 'utf-8');
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      const add = parseTsv(line);
      if (!add) continue;
      const key = `${slug(add.product)}::${slug(add.source)}`;
      const report = normLink(add.report || `[${add.num}](reports/${add.num}.md)`);
      const existing = rows.get(key);
      if (existing) {
        // Update in place if addition score >= existing.
        const cells = existing.row.raw.split('|').map((s) => s.trim());
        // cells indices: 1=num 2=date 3=product 4=source 5=score 6=status 7=pdf 8=report 9=notes
        cells[2] = add.date || cells[2];
        cells[5] = add.score || cells[5];
        cells[6] = add.status || cells[6];
        if (add.pdf) cells[7] = add.pdf;
        if (report) cells[8] = report;
        if (add.notes) cells[9] = add.notes;
        lines[existing.idx] = rebuildRow(cells);
        updated++;
      } else {
        // Append a new row.
        const newRow = rebuildRow([
          '', String(add.num), add.date, add.product, add.source,
          add.score, add.status, add.pdf || '❌', report, add.notes, '',
        ]);
        lines.push(newRow);
        rows.set(key, { idx: lines.length - 1, row: { ...add } });
        added++;
      }
    }
  }

  if (MIGRATE) {
    // Re-normalize report links across all rows (idempotent fix-up).
    lines.forEach((line, i) => {
      if (!line.startsWith('|')) return;
      const r = parseTrackerRow(line, colmap);
      if (!r) return;
      const cells = line.split('|').map((s) => s.trim());
      cells[8] = normLink(cells[8]);
      lines[i] = rebuildRow(cells);
    });
  }

  // Trim trailing blank lines, ensure one trailing newline.
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  lines.push('');
  const out = lines.join('\n');

  console.log(`merge-tracker: +${added} added, ${updated} updated.`);
  if (DRY_RUN) { console.log('(dry-run — no changes written)'); return; }

  if (!existsSync(TRACKER_FILE)) writeFileSync(TRACKER_FILE, '', 'utf-8');
  copyFileSync(TRACKER_FILE, TRACKER_FILE + '.bak');
  const tmp = TRACKER_FILE + '.tmp';
  writeFileSync(tmp, out, 'utf-8');
  renameSync(tmp, TRACKER_FILE);
  console.log(`✓ written to ${TRACKER_FILE} (backup: ${TRACKER_FILE}.bak)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
