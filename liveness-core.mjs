/**
 * liveness-core.mjs — MARKET liveness classification for product-ops.
 * Reframed from santifer/career-ops' job-posting liveness (MIT).
 *
 * Classify whether a competitor/market page is alive and the opportunity real.
 * // ponytail: HTTP-only heuristics for v0.1. Add Playwright render + the SSRF
 * // guards from career-ops/liveness-browser.mjs when JS-heavy/WAF'd competitor
 * // pages need real rendering.
 */

/**
 * @param {{ status?: number, finalUrl?: string, title?: string, bodyText?: string }} input
 * @returns {{ result: 'active'|'closed'|'unclear', reason: string }}
 */
export function classifyLiveness({ status, finalUrl, title, bodyText = '' }) {
  const text = (bodyText || '').toLowerCase();
  const t = (title || '').trim();

  if (status && (status === 404 || status === 410)) {
    return { result: 'closed', reason: `HTTP ${status}` };
  }
  if (status && status >= 500) {
    return { result: 'unclear', reason: `HTTP ${status} (server error)` };
  }

  const CLOSED_SIGNALS = [
    'not found', '404', 'page not found', 'no longer available',
    'has been shut down', 'has shut down', 'shut down', 'sunset', 'sunsetted',
    'discontinued', 'out of business', 'closed down', 'acquired by',
  ];
  if (CLOSED_SIGNALS.some((s) => text.includes(s))) {
    return { result: 'closed', reason: 'page text signals closure/sunset' };
  }

  // Active: a real title + some body content (product copy / pricing / about).
  if (t.length > 3 && text.length > 200) {
    return { result: 'active', reason: 'title + substantive body content' };
  }

  return { result: 'unclear', reason: 'insufficient content to classify' };
}

// Trend slope helper (best-effort, used by check-liveness --trends).
// Returns 'rising' | 'flat' | 'falling' | 'unknown' from a Google Trends RSS
// daily-trending presence + a naive keyword-hit heuristic. Real interest-over-
// time slope needs the unofficial /trends/api/widget JSON (deferred).
export function trendDirection(keyword, trendsRssXml = '') {
  if (!keyword || !trendsRssXml) return 'unknown';
  const hit = trendsRssXml.toLowerCase().includes(keyword.toLowerCase());
  return hit ? 'rising' : 'unknown';
}
