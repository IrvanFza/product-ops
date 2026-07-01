// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// G2 — public category/search page. G2 WAFs aggressively + is JS-heavy; HTTP is
// best-effort, with a Playwright fallback (providers/_browser.mjs) when HTTP
// returns nothing. Wire via: sources.g2: { enabled, category }

const SEARCH_URL = (q) => `https://www.g2.com/search?query=${encodeURIComponent(q)}`;

function parseProducts(html) {
  const seen = new Set();
  const out = [];
  const re = /href="\/products\/([a-z0-9-]+)(?:\/reviews)?"/gi;
  let m;
  while ((m = re.exec(html))) {
    const slug = m[1];
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push({
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      url: `https://www.g2.com/products/${slug}`,
      company: '',
      signal: 'G2',
    });
  }
  return out;
}

/** @type {Provider} */
export default {
  id: 'g2',
  async fetch(entry, ctx) {
    const q = entry.query || entry.category;
    if (!q) throw new Error('g2: source.query (or category) is required');
    const url = SEARCH_URL(q);

    // 1. Try plain HTTP first (zero-token).
    let html = '';
    try { html = await ctx.fetchText(url); } catch { /* WAF/JS — fall through to browser */ }
    let out = parseProducts(html);
    if (out.length) return out;

    // 2. Playwright fallback for JS-heavy/WAF'd pages.
    try {
      const { renderHtml } = await import('./_browser.mjs');
      html = await renderHtml(url);
      out = parseProducts(html);
    } catch { /* browser unavailable / blocked — return [] */ }
    return out;
  },
};
