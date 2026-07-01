// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// GitHub provider — repo search by topic as a demand / validation signal.
// No auth required (low rate: 10 req/min unauthenticated). Stars + last-push
// recency serve as both a demand proxy and a market-liveness signal.
//
// Wire in via competitors.yml:
//   sources:
//     github:
//       enabled: true
//       topic: "ai-scheduling"   # GitHub topic to search
//       per_page: 20             # optional, default 20 (max 100)

import { fetchJson } from './_http.mjs';

function searchUrl(topic, perPage) {
  const q = encodeURIComponent(`topic:${topic} sort:stars-desc`);
  return `https://api.github.com/search/repositories?q=${q}&per_page=${perPage}`;
}

/** @type {Provider} */
export default {
  id: 'github',

  async fetch(entry, ctx) {
    const topic = entry.topic || entry.query;
    if (!topic) throw new Error('github: source.topic (or query) is required');
    const perPage = Math.min(entry.per_page || 20, 100);
    const data = await ctx.fetchJson(searchUrl(topic, perPage), {
      headers: { Accept: 'application/vnd.github+json' },
    });
    const items = Array.isArray(data.items) ? data.items : [];
    return items.map((r) => ({
      title: r.full_name,
      url: r.html_url,
      company: r.owner?.login || '',
      signal: `★${r.stargazers_count}`,
      // recency + stars feed market-liveness (Block G)
      postedAt: r.created_at ? Date.parse(r.created_at) : undefined,
      extra: { stars: r.stargazers_count, pushedAt: r.pushed_at, forks: r.forks_count, desc: r.description },
    }));
  },
};
