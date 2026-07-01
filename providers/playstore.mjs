// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Google Play Store — no official search API/JSON. Scrapes the public search
// HTML for /store/apps/details?id=<pkg> links. Play pages are JS-heavy and may
// not serve full HTML to a plain UA → best-effort, returns [] on failure.
// Wire via: sources.playstore: { enabled, query }

const SEARCH_URL = (q) => `https://play.google.com/store/search?q=${encodeURIComponent(q)}&c=apps`;

/** @type {Provider} */
export default {
  id: 'playstore',
  async fetch(entry, ctx) {
    const query = entry.query;
    if (!query) throw new Error('playstore: source.query is required');
    let html;
    try {
      html = await ctx.fetchText(SEARCH_URL(query));
    } catch {
      return [];
    }
    const out = [];
    const seen = new Set();
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
    // ponytail: Play often needs Playwright to render results; if empty, defer to
    // the liveness/browser layer or the appstore provider (which has a real JSON API).
    return out;
  },
};
