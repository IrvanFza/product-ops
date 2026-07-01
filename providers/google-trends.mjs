// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Google Trends — daily-trending RSS (geo configurable) + best-effort per-keyword.
// ponytail: no official free keyword-slope API. Per-keyword uses the daily-trending
// RSS as a presence proxy (keyword in trending today → 'rising', else 'unknown').
// Real interest-over-time needs the unofficial /trends/api/widget JSON (deferred).
// Wire via: sources.google_trends: { enabled, geo: "ID", keywords: ["lebaran"] }

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
    const geo = entry.geo || 'US';
    let xml;
    try { xml = await ctx.fetchText(TRENDS_RSS(geo)); }
    catch { return []; }

    const items = parseRssItems(xml);
    const lowerXml = xml.toLowerCase();

    // Per-keyword mode: return one entry per keyword with a direction signal.
    const keywords = Array.isArray(entry.keywords) ? entry.keywords.filter(Boolean) : [];
    if (keywords.length) {
      return keywords.map((kw) => {
        const hit = items.some((i) => i.title.toLowerCase().includes(kw.toLowerCase())) ||
                    lowerXml.includes(kw.toLowerCase());
        return {
          title: kw,
          url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(kw)}&geo=${geo}`,
          company: '',
          signal: hit ? 'rising' : 'unknown',
          postedAt: items[0]?.pub ? Date.parse(items[0].pub) || undefined : undefined,
        };
      });
    }

    // Default: daily-trending topics.
    return items.map((i) => ({
      title: i.title,
      url: i.link || `https://trends.google.com/trends/explore?q=${encodeURIComponent(i.title)}&geo=${geo}`,
      company: '',
      signal: 'trending',
      postedAt: i.pub ? Date.parse(i.pub) || undefined : undefined,
    }));
  },
};
