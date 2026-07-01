/**
 * tracker-utils.mjs — shared helpers for rewriting data/products.md rows.
 * Copied from santifer/career-ops (generic, MIT). Kept here so dedup/normalize
 * share one row-rewrite path and can't drift.
 */

/**
 * Rebuild a markdown table row from `line.split('|')` cells.
 * Drops the leading empty (before the opening `|`) and a genuinely-empty
 * trailing cell, preserving real last cells regardless of trailing-pipe style.
 */
export function rebuildRow(parts) {
  const cells = parts.slice(1);
  if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
  return '| ' + cells.join(' | ') + ' |';
}
