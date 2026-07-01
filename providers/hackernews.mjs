// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Hacker News — Algolia search API (no auth). For product-ops we mine "Show HN"
// stories (founders showing what they built) as product-idea + demand signals.
// Adapted from career-ops' "Ask HN: Who is hiring?" parser (MIT).
// Wire via: sources.hackernews: { enabled, query }   (query optional; defaults to "Show HN")

const SEARCH_URL = (q, perPage) =>
  `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=${encodeURIComponent(q)}&hitsPerPage=${perPage}`;

/** @type {Provider} */
export default {
  id: 'hackernews',
  async fetch(entry, ctx) {
    const query = entry.query || 'Show HN';
    const perPage = Math.min(entry.per_page || 30, 50);
    const data = await ctx.fetchJson(SEARCH_URL(query, perPage));
    const hits = Array.isArray(data.hits) ? data.hits : [];
    const out = [];
    for (const h of hits) {
      if (!h || !h.title) continue;
      const url = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`;
      out.push({
        title: h.title,
        url,
        company: h.author || '',
        signal: `↑${h.points ?? 0} 💬${h.num_comments ?? 0}`,
        postedAt: h.created_at ? Date.parse(h.created_at) || undefined : undefined,
      });
    }
    return out;
  },
};
