// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Google Play Store — no official search API/JSON. Scrapes /store/apps/details?id=
// links from the public search HTML. Play pages are JS-heavy → HTTP best-effort
// with a Playwright fallback (providers/_browser.mjs). Wire via: sources.playstore: { enabled, query }

const SEARCH_URL = (q) => `https://play.google.com/store/search?q=${encodeURIComponent(q)}&c=apps`;

function parseApps(html) {
  const seen = new Set();
  const out = [];
  const re = /\/store\/apps\/details\?id=([a-zA-Z0-9_.]+)/g;
  let m;
  while ((m = re.exec(html))) {
    const pkg = m[1];
    if (seen.has(pkg)) continue;
    seen.add(pkg);
    out.push({
      title: pkg.split('.').pop(),
      url: `https://play.google.com/store/apps/details?id=${pkg}`,
      company: '',
      signal: 'play',
    });
  }
  return out;
}

/** @type {Provider} */
export default {
  id: 'playstore',
  async fetch(entry, ctx) {
    const query = entry.query;
    if (!query) throw new Error('playstore: source.query is required');
    const url = SEARCH_URL(query);

    let html = '';
    try { html = await ctx.fetchText(url); } catch { /* JS-heavy — fall through */ }
    let out = parseApps(html);
    if (out.length) return out;

    try {
      const { renderHtml } = await import('./_browser.mjs');
      html = await renderHtml(url);
      out = parseApps(html);
    } catch { /* browser unavailable — return [] */ }
    return out;
  },
};
