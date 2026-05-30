const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');

const app = express();
app.use(cors());
app.use(express.json());

const parser = new Parser({
  customFields: {
    item: [['media:content', 'media'], ['enclosure', 'enclosure']],
  }
});

// Map of available hardcoded sources and their RSS endpoints
const NEWS_SOURCES = {
  // Romanian News Sources
  digi24: { name: 'DIGI24', url: 'https://www.digi24.ro/feed' },
  hotnews: { name: 'HotNews', url: 'https://www.hotnews.ro/rss' },
  mediafax: { name: 'Mediafax', url: 'https://www.mediafax.ro/rss' },
  realitatea: { name: 'Realitatea TV', url: 'https://www.realitatea.net/rss' },
  romania_informa: { name: 'România Informează', url: 'https://romaniainfo.ro/feed' },
  antena3: { name: 'Antena 3', url: 'https://www.antena3.ro/feed' },
  b1: { name: 'B1 TV', url: 'https://www.b1.ro/feed' },
  stirileprotv: { name: 'Stirile ProTV', url: 'https://stirileprotv.ro/feed' },
  stirile_tvr: { name: 'Stirile TVR', url: 'https://tvr.ro/feed' },
  gds: { name: 'Gazeta de Stiri', url: 'https://gazetastiri.ro/feed' },
  zf_ro: { name: 'Ziarul Financiar', url: 'https://www.zf.ro/rss' },
  business_ro: { name: 'Business24', url: 'https://www.business24.ro/feed' },
  cotidianul: { name: 'Cotidianul', url: 'https://www.cotidianul.ro/feed' },
  libertatea: { name: 'Libertatea', url: 'https://www.libertatea.ro/feed' },
  adevarul: { name: 'Adevărul', url: 'https://www.adevarul.ro/feed' },
  dcnews: { name: 'DCNEWS', url: 'https://www.dcnews.ro/feed' },
  evz: { name: 'Evenimentul Zilei', url: 'https://evz.ro/feed' },
  jurnalul: { name: 'Jurnalul', url: 'https://www.jurnalul.ro/feed' },
  cristi_tudor: { name: 'Cristi Tutor News', url: 'https://cristitudornews.ro/feed' },
  tabu: { name: 'TABU', url: 'https://tabu.ro/feed' },
  stiripesurse: { name: 'Stiri pe Surse', url: 'https://stiripesurse.ro/feed' },
  economia_ro: { name: 'Economia.net', url: 'https://economia.net/feed' },
  startupro: { name: 'StartUp.ro', url: 'https://startup.ro/feed' },
  sectiapolitie: { name: 'Presa Romana', url: 'https://presaromana.ro/feed' },
  buzzcoin: { name: 'BuzzCoin', url: 'https://buzzcoin.ro/feed' },
  newsroom_ro: { name: 'Newsroom', url: 'https://newsroom.ro/feed' },
  capital_ro: { name: 'Capital.ro', url: 'https://www.capital.ro/feed' },
  click_ro: { name: 'Click.ro', url: 'https://click.ro/feed' },
  prunu_ro: { name: 'PruniNews', url: 'https://prunews.ro/feed' },
  desprecriza: { name: 'DesprecRiza', url: 'https://desprecriza.ro/feed' },
  // International News
  bbc: { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  techcrunch: { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  theverge: { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' }
};

function extractImage(item) {
  if (item.media && item.media.$ && item.media.$.url) return item.media.$.url;
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  
  const match = (item.content || item.summary || '').match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600';
}

// Main Aggregation Endpoint
app.get('/api/news', async (req, res) => {
  try {
    const requestedSources = req.query.sources ? req.query.sources.split(',') : [];
    const page = parseInt(req.query.page) || 1;
    const limit = 10; 
    const customUrlsParam = req.query.customUrls ? req.query.customUrls.split(',') : [];

    let allArticles = [];
    let jobs = [];

    // 1. Queue hardcoded sources
    requestedSources.forEach((sourceKey) => {
      const source = NEWS_SOURCES[sourceKey];
      if (source) {
        jobs.push((async () => {
          try {
            const feed = await parser.parseURL(source.url);
            return feed.items.map(item => ({
              title: item.title,
              link: item.link,
              date: new Date(item.pubDate || item.isoDate || Date.now()),
              source: source.name,
              image: extractImage(item)
            }));
          } catch (err) {
            return [];
          }
        })());
      }
    });

    // 2. Queue custom inputs
    customUrlsParam.forEach((pair) => {
      const [name, url] = pair.split('|');
      if (name && url) {
        jobs.push((async () => {
          try {
            const feed = await parser.parseURL(decodeURIComponent(url));
            return feed.items.map(item => ({
              title: item.title,
              link: item.link,
              date: new Date(item.pubDate || item.isoDate || Date.now()),
              source: decodeURIComponent(name),
              image: extractImage(item)
            }));
          } catch (err) {
            return [];
          }
        })());
      }
    });

    const results = await Promise.all(jobs);
    results.forEach(articles => allArticles.push(...articles));

    allArticles.sort((a, b) => b.date - a.date);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    res.json({
      articles: allArticles.slice(startIndex, endIndex),
      hasMore: endIndex < allArticles.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to aggregate feeds' });
  }
});

// Super simplified title fetcher using standard global fetch (supported natively in Node 18+)
app.get('/api/fetch-title', async (req, res) => {
  try {
    let url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing URL' });
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const text = await response.text();
    const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    
    res.json({ title: match ? match[1].trim() : 'Custom Feed Source' });
  } catch (err) {
    res.json({ title: 'Custom Feed Source' });
  }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`News API running on port ${PORT}`));