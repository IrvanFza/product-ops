// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Google Trends — daily-trending RSS (no official free keyword-slope API).
// ponytail: returns daily trending topics for now; per-keyword interest-over-time
// slope needs the unofficial /trends/api/widget JSON (messy, changes often) —
// add when Block G needs real slopes. Wire via: sources.google_trends: { enabled, geo: US }

const TRENDS_RSS = (geo) => `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo || 'US'}`;

function parseRssItems(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const title = (block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1];
    const link = (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1];
    const pub = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1];
    if (title) items.push({ title: title.trim(), link: (link || '').trim(), pub: (pub || '').trim() });
  }
  return items;
}

/** @type {Provider} */
export default {
  id: 'google_trends',
  async fetch(entry, ctx) {
    let xml;
    try {
      xml = await ctx.fetchText(TRENDS_RSS(entry.geo));
    } catch {
      return [];
    }
    return parseRssItems(xml).map((i) => ({
      title: i.title,
      url: i.link || `https://trends.google.com/trends/explore?q=${encodeURIComponent(i.title)}`,
      company: '',
      signal: 'trending',
      postedAt: i.pub ? Date.parse(i.pub) || undefined : undefined,
    }));
  },
};
