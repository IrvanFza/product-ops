/**
 * tracker-links.mjs — report-link normalization for the tracker.
 * Copied from santifer/career-ops (generic, MIT).
 *
 * Markdown links resolve relative to the file that contains them, so a report
 * link in data/products.md must be relative to that tracker dir. Report files
 * canonically live in <repoRoot>/reports/, so we resolve the incoming link to
 * that absolute location and recompute with path.relative. Idempotent.
 */

import { join, relative, sep } from 'path';

export function normalizeReportLink(reportField, trackerDir, repoRoot) {
  return reportField.replace(/\]\(([^)]+)\)/g, (whole, linkPath) => {
    const m = linkPath.match(/^(?:\.\.\/)*(reports\/.+)$/);
    if (!m) return whole; // not a report path — leave untouched
    const reportAbs = join(repoRoot, m[1]);
    const rel = relative(trackerDir, reportAbs).split(sep).join('/');
    return `](${rel})`;
  });
}
