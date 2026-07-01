/**
 * tracker-parse.mjs — header-aware column mapping for data/products.md.
 * Adapted from santifer/career-ops' tracker-parse.mjs (product/source columns).
 *
 * Canonical 9-col layout: # | Date | Product | Source | Score | Status | PDF | Report | Notes
 * Indexing matches line.split('|'): index 0 is the empty cell before the leading pipe.
 */

/** Legacy fixed 9-column layout (num … notes at indices 1 … 9). */
export const LEGACY_COLMAP = {
  num: 1, date: 2, product: 3, source: 4, score: 5, status: 6, pdf: 7, report: 8, notes: 9,
};

/** Header text (lowercased) → canonical field name. */
export const HEADER_ALIASES = {
  '#': 'num', num: 'num', date: 'date',
  product: 'product', name: 'product', idea: 'product',
  source: 'source', url: 'source', link: 'source',
  score: 'score', status: 'status', stage: 'status',
  pdf: 'pdf', report: 'report', notes: 'notes',
};

/**
 * Scan for a header row → field-name → column-index map. Returns null (caller
 * falls back to LEGACY_COLMAP) unless the essential columns are all present.
 */
export function detectColumns(lines) {
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map((s) => s.trim().toLowerCase());
    if (!cells.includes('product') || !cells.includes('source')) continue;
    const map = {};
    cells.forEach((c, i) => { if (HEADER_ALIASES[c] != null) map[HEADER_ALIASES[c]] = i; });
    if (['num', 'product', 'source', 'score', 'status'].every((k) => map[k] != null)) return map;
  }
  return null;
}

export function resolveColumns(lines) {
  return detectColumns(lines) || LEGACY_COLMAP;
}

/**
 * Parse one markdown table row into a tracker object. Header/separator rows and
 * malformed rows return null. The raw line is preserved for locate/replace.
 */
export function parseTrackerRow(line, colmap = LEGACY_COLMAP) {
  if (typeof line !== 'string' || !line.startsWith('|')) return null;
  const parts = line.split('|').map((s) => s.trim());
  if (parts.length < 9) return null;
  const num = parseInt(parts[colmap.num], 10);
  if (isNaN(num)) return null;
  const at = (k) => (colmap[k] != null ? parts[colmap[k]] ?? '' : '');
  return {
    num,
    date: at('date'),
    product: at('product'),
    source: at('source'),
    score: at('score'),
    status: at('status'),
    pdf: at('pdf'),
    report: at('report'),
    notes: at('notes'),
    raw: line,
  };
}
