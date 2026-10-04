/**
 * AarambhX Global AI Wire / RSS Ingestion Engine (scripts/fetch-rss-news.js)
 * Fetches RSS XML from top tech news sources, parses items, and generates assets/data/live-news.json
 * Zero external dependencies: pure Node.js https + XML regex parsing.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_PATH = path.resolve(__dirname, '..', 'assets', 'data', 'live-news.json');

const FEEDS = [
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'AI & Startups'
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'Tech & Gadgets'
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'Systems & Computing'
  }
];

function fetchUrl(urlStr) {
  return new Promise((resolve, reject) => {
    https.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AarambhX-News-Bot/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${urlStr}`));
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseRssXml(xml, sourceName, category) {
  const items = [];
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];

  for (const rawItem of itemMatches) {
    if (items.length >= 3) break; // max 3 per source

    const titleMatch = rawItem.match(/<title(?:[^>]*)>([\s\S]*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim() : '';
    title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

    const linkMatch = rawItem.match(/<link(?:[^>]*)href="([^"]+)"/i) || rawItem.match(/<link(?:[^>]*)>([\s\S]*?)<\/link>/i);
    const link = linkMatch ? (linkMatch[1] || '').trim() : '#';

    const pubDateMatch = rawItem.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || rawItem.match(/<published>([\s\S]*?)<\/published>/i);
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();

    if (title && link && link !== '#') {
      items.push({
        id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title,
        link,
        source: sourceName,
        category,
        pubDate,
        timeAgo: 'Just now'
      });
    }
  }

  return items;
}

async function run() {
  console.log('Fetching live RSS tech feeds...');
  const allItems = [];

  for (const feed of FEEDS) {
    try {
      console.log(`- Fetching ${feed.name}...`);
      const xml = await fetchUrl(feed.url);
      const parsed = parseRssXml(xml, feed.name, feed.category);
      allItems.push(...parsed);
      console.log(`  ✔ Extracted ${parsed.length} stories from ${feed.name}`);
    } catch (err) {
      console.warn(`  ⚠ Could not fetch ${feed.name}: ${err.message}`);
    }
  }

  if (allItems.length > 0) {
    const payload = {
      updatedAt: new Date().toISOString(),
      source: 'AarambhX Global AI Radar Wire',
      items: allItems.slice(0, 8)
    };

    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(DATA_PATH, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`\n✔ Saved ${payload.items.length} live tech stories to assets/data/live-news.json\n`);
  } else {
    console.log('No new feeds retrieved; preserved existing live-news.json fallback.');
  }
}

if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run };
