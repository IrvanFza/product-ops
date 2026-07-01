// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Apple App Store — public iTunes Search API (JSON, no auth). Returns apps as a
// demand signal (rating counts = demand proxy). Wire via: sources.appstore: { enabled, query }

const SEARCH_URL = (q, limit) => `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=software&limit=${limit}`;

/** @type {Provider} */
export default {
  id: 'appstore',
  async fetch(entry, ctx) {
    const query = entry.query;
    if (!query) throw new Error('appstore: source.query is required');
    const limit = Math.min(entry.limit || 25, 50);
    const data = await ctx.fetchJson(SEARCH_URL(query, limit));
    const results = Array.isArray(data.results) ? data.results : [];
    return results
      .filter((r) => r.trackName && r.trackViewUrl)
      .map((r) => ({
        title: r.trackName,
        url: r.trackViewUrl,
        company: r.artistName || r.sellerName || '',
        signal: `★${r.userRatingCount ?? 0}`,
        postedAt: r.currentVersionReleaseDate ? Date.parse(r.currentVersionReleaseDate) || undefined : undefined,
      }));
  },
};
