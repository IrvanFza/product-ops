// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// G2 — public category/search page. G2 WAFs aggressively; this is best-effort
// HTTP. Returns [] on any fetch failure (the liveness/playwright layer handles
// JS-heavy/WAF'd pages). Wire via competitors.yml: sources.g2: { enabled, category }

const SEARCH_URL = (q) => `https://www.g2.com/search?query=${encodeURIComponent(q)}`;

/** @type {Provider} */
export default {
  id: 'g2',
  async fetch(entry, ctx) {
    const q = entry.query || entry.category;
    if (!q) throw new Error('g2: source.query (or category) is required');
    let html;
    try {
      html = await ctx.fetchText(SEARCH_URL(q));
    } catch {
      return []; // WAF/JS — defer to the Playwright/liveness layer
    }
    // G2 product links look like /products/<slug>/reviews or /products/<slug>
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
  },
};
