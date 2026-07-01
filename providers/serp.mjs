// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Google SERP — best-effort HTML scrape of result links as a demand /
// competitor-discovery proxy. Google rate-limits and may serve consent/JS pages;
// wrapped to return [] on failure. Wire via: sources.serp: { enabled, query }

const SEARCH_URL = (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}&num=20`;

/** @type {Provider} */
export default {
  id: 'serp',
  async fetch(entry, ctx) {
    const query = entry.query;
    if (!query) throw new Error('serp: source.query is required');
    let html;
    try {
      html = await ctx.fetchText(SEARCH_URL(query), { headers: { 'accept-language': 'en-US,en;q=0.9' } });
    } catch {
      return [];
    }
    const out = [];
    const seen = new Set();
    // Result links: <a href="/url?q=<real url>&...">
    const re = /\/url\?q=([^&"']+)/g;
    let m;
    while ((m = re.exec(html))) {
      let url = decodeURIComponent(m[1]);
      if (url.startsWith('http') && !seen.has(url)) {
        seen.add(url);
        out.push({ title: url.replace(/^https?:\/\//, '').split('/')[0], url, company: '', signal: 'serp' });
      }
    }
    return out;
  },
};
