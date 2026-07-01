// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Product Hunt — public RSS feed (no auth). Parses <item> entries; filters by
// entry.query (case-insensitive substring on title) when provided.
// Wire via competitors.yml: sources.producthunt: { enabled, query }

const FEED_URL = 'https://www.producthunt.com/feed';

function parseRssItems(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const title = (block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1];
    const link = (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1];
    const pub = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1];
    if (title && link) items.push({ title: title.trim(), link: link.trim(), pub: (pub || '').trim() });
  }
  return items;
}

/** @type {Provider} */
export default {
  id: 'producthunt',
  async fetch(entry, ctx) {
    const query = (entry.query || '').toLowerCase();
    const xml = await ctx.fetchText(FEED_URL);
    return parseRssItems(xml)
      .filter((i) => !query || i.title.toLowerCase().includes(query))
      .map((i) => ({
        title: i.title,
        url: i.link,
        company: '',
        signal: 'PH',
        postedAt: i.pub ? Date.parse(i.pub) || undefined : undefined,
      }));
  },
};
