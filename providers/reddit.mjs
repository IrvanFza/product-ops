// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Reddit — public JSON search. No auth. Supports a single query across all of
// Reddit, or per-subreddit. Wire via competitors.yml:
//   sources.reddit: { enabled, query, subreddits: [SaaS, ...] }

function searchUrl(query, subreddit) {
  const q = encodeURIComponent(query);
  return subreddit
    ? `https://www.reddit.com/r/${subreddit}/search.json?q=${q}&sort=new&limit=25&restrict_sr=1`
    : `https://www.reddit.com/search.json?q=${q}&sort=new&limit=25`;
}

/** @type {Provider} */
export default {
  id: 'reddit',
  async fetch(entry, ctx) {
    const query = entry.query;
    if (!query) throw new Error('reddit: source.query is required');
    const subs = Array.isArray(entry.subreddits) && entry.subreddits.length
      ? entry.subreddits
      : [null];
    const out = [];
    for (const sub of subs) {
      let data;
      try {
        data = await ctx.fetchJson(searchUrl(query, sub));
      } catch {
        continue;
      }
      const children = data?.data?.children || [];
      for (const c of children) {
        const d = c?.data;
        if (!d || !d.title) continue;
        out.push({
          title: d.title,
          url: `https://www.reddit.com${d.permalink}`,
          company: sub ? `r/${sub}` : (d.subreddit ? `r/${d.subreddit}` : ''),
          signal: `↑${d.score ?? 0} 💬${d.num_comments ?? 0}`,
          postedAt: d.created_utc ? Math.floor(d.created_utc * 1000) : undefined,
        });
      }
    }
    return out;
  },
};
