const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');

const app = express();
app.use(cors());
app.use(express.json());

// Browser simulation headers to slip past Cloudflare protections
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

const parser = new Parser({
  requestOptions: { headers: DEFAULT_HEADERS },
  customFields: {
    item: [['media:content', 'media'], ['enclosure', 'enclosure']],
  }
});

// Massive Romanian Directories Mapping
const NEWS_SOURCES = {
  // General & Politics
  digi24: { name: 'DIGI24', url: 'https://www.digi24.ro/feed' },
  hotnews: { name: 'HotNews', url: 'https://www.hotnews.ro/rss' },
  mediafax: { name: 'Mediafax', url: 'https://www.mediafax.ro/rss' },
  realitatea: { name: 'Realitatea', url: 'https://www.realitatea.net/rss' },
  antena3: { name: 'Antena 3', url: 'https://www.antena3.ro/feed' },
  b1: { name: 'B1 TV', url: 'https://www.b1.ro/feed' },
  stirileprotv: { name: 'Știrile ProTV', url: 'https://stirileprotv.ro/feed' },
  stirile_tvr: { name: 'Știrile TVR', url: 'https://tvr.ro/feed' },
  libertatea: { name: 'Libertatea', url: 'https://www.libertatea.ro/feed' },
  adevarul: { name: 'Adevărul', url: 'https://www.adevarul.ro/feed' },
  dcnews: { name: 'DC News', url: 'https://www.dcnews.ro/feed' },
  evz: { name: 'Evenimentul Zilei', url: 'https://evz.ro/feed' },
  jurnalul: { name: 'Jurnalul Național', url: 'https://www.jurnalul.ro/feed' },
  stiripesurse: { name: 'Stiri pe Surse', url: 'https://stiripesurse.ro/feed' },
  cotidianul: { name: 'Cotidianul', url: 'https://www.cotidianul.ro/feed' },
  gandul: { name: 'Gândul', url: 'https://www.gandul.ro/feed' },
  romaniatv: { name: 'Romania TV', url: 'https://www.romaniatv.net/rss' },
  observator: { name: 'Observator News', url: 'https://observatornews.ro/baza/templates/rss/index.xml' },
  agerpres: { name: 'Agerpres', url: 'https://www.agerpres.ro/rss' },
  pressone: { name: 'PressOne', url: 'https://pressone.ro/feed' },
  g4media: { name: 'G4Media', url: 'https://www.g4media.ro/feed' },
  spotmedia: { name: 'SpotMedia', url: 'https://spotmedia.ro/feed' },
  recorder: { name: 'Recorder', url: 'https://recorder.ro/feed' },

  // Sports Timelines
  digisport: { name: 'DigiSport', url: 'https://www.digisport.ro/rss' },
  digisport_ro: { name: 'DigiSport (Intern)', url: 'https://www.digisport.ro/rss/fotbal-intern' },
  digisport_ext: { name: 'DigiSport (Extern)', url: 'https://www.digisport.ro/rss/fotbal-extern' },
  gsp: { name: 'Gazeta Sporturilor (GSP)', url: 'https://www.gsp.ro/rss.xml' },
  prosport: { name: 'ProSport', url: 'https://www.prosport.ro/feed' },
  fanatik_sport: { name: 'Fanatik Sport', url: 'https://www.fanatik.ro/sport/feed' },
  eurosport: { name: 'EuroSport RO', url: 'https://ro.eurosport.io/rss.xml' },

  // Business & Tech
  zf_ro: { name: 'Ziarul Financiar', url: 'https://www.zf.ro/rss' },
  economica: { name: 'Economica.net', url: 'https://www.economica.net/feed' },
  wallstreet: { name: 'Wall-Street.ro', url: 'https://www.wall-street.ro/rss' },
  profit_ro: { name: 'Profit.ro', url: 'https://www.profit.ro/rss' },
  startupro: { name: 'StartUp.ro', url: 'https://startup.ro/feed' },
  business_ro: { name: 'Business24', url: 'https://www.business24.ro/feed' },
  capital_ro: { name: 'Capital', url: 'https://www.capital.ro/feed' },
  zonait: { name: 'Zona IT', url: 'https://zonait.ro/feed' },
  go4it: { name: 'Go4IT', url: 'https://www.go4it.ro/feed' },
  mobilissimo: { name: 'Mobilissimo', url: 'https://www.mobilissimo.ro/feeds/stiri.xml' },
  nwradu: { name: 'nwradu blog', url: 'https://www.nwradu.ro/feed' },

  // Lifestyle & Regional
  click_ro: { name: 'Click.ro', url: 'https://click.ro/feed' },
  tabu: { name: 'TABU', url: 'https://tabu.ro/feed' },
  gds: { name: 'Gazeta de Sud', url: 'https://www.gds.ro/feed' },
  ziuaconstanta: { name: 'Ziua de Constanta', url: 'https://www.ziuaconstanta.ro/stiri/actualitate.xml' },
  bzi: { name: 'Bună Ziua Iași', url: 'https://www.bzi.ro/feed' }
};

function extractImage(item) {
  if (item.media && item.media.$ && item.media.$.url) return item.media.$.url;
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  const match = (item.content || item.summary || '').match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600';
}

// Function to auto-discover RSS endpoints from standard root website URLs
async function autoDiscoverRss(siteUrl) {
  try {
    let target = siteUrl.trim();
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
    
    const parsedUrl = new URL(target);
    const rootOrigin = parsedUrl.origin;

    // Common standard layout fallback combinations to evaluate instantly
    const commonPaths = ['/rss', '/feed', '/rss.xml', '/feed/rss2'];
    for (const path of commonPaths) {
      try {
        const testUrl = `${rootOrigin}${path}`;
        const res = await fetch(testUrl, { method: 'HEAD', headers: DEFAULT_HEADERS, signal: AbortSignal.timeout(2000) });
        if (res.ok && (res.headers.get('content-type')?.includes('xml') || res.headers.get('content-type')?.includes('rss'))) {
          return testUrl;
        }
      } catch (e) {}
    }

    // Scrape index page context to locate embedded links
    const pageResponse = await fetch(target, { headers: DEFAULT_HEADERS, signal: AbortSignal.timeout(4000) });
    const htmlText = await pageResponse.text();
    
    const rssMatch = htmlText.match(/<link[^>]+type="application\/(rss\+xml|xml)"[^>]+href="([^"]+)"/i) ||
                     htmlText.match(/href="([^"]+)"[^>]+type="application\/(rss\+xml|xml)"/i);
                     
    if (rssMatch && rssMatch[2]) {
      let discoveryPath = rssMatch[2];
      if (discoveryPath.startsWith('/')) discoveryPath = `${rootOrigin}${discoveryPath}`;
      return discoveryPath;
    }
    return target; // Return base as fallback
  } catch (err) {
    return siteUrl;
  }
}

// Main Pipeline Aggregator Engine
app.get('/api/news', async (req, res) => {
  try {
    const requestedSources = req.query.sources ? req.query.sources.split(',') : [];
    const page = parseInt(req.query.page) || 1;
    const limit = 10; 
    
    let allArticles = [];
    let jobs = [];

    // 1. Process preset directories
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

    // 2. Process custom inputs
    if (req.query.customUrls) {
      try {
        const customSourcesArray = JSON.parse(decodeURIComponent(req.query.customUrls));
        for (const source of customSourcesArray) {
          if (source.url) {
            jobs.push((async () => {
              try {
                // Run deep tracking logic
                const explicitUrl = await autoDiscoverRss(source.url);
                const feed = await parser.parseURL(explicitUrl);
                return feed.items.map(item => ({
                  title: item.title,
                  link: item.link,
                  date: new Date(item.pubDate || item.isoDate || Date.now()),
                  source: source.name || 'Custom Feed',
                  image: extractImage(item)
                }));
              } catch (err) {
                console.error(`Custom parsing error for ${source.url}:`, err.message);
                return [];
              }
            })());
          }
        }
      } catch (e) {}
    }

    const results = await Promise.all(jobs);
    results.forEach(articles => allArticles.push(...articles));

    // Chronological sorting
    allArticles.sort((a, b) => b.date - a.date);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    res.json({
      articles: allArticles.slice(startIndex, endIndex),
      hasMore: endIndex < allArticles.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed aggregation' });
  }
});

// Auto metadata label discovery
app.get('/api/fetch-title', async (req, res) => {
  try {
    let url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing target URL' });
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    const response = await fetch(url, { headers: DEFAULT_HEADERS, signal: AbortSignal.timeout(4000) });
    const text = await response.text();
    const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    
    res.json({ title: match ? match[1].trim() : 'Verified Target Feed' });
  } catch (err) {
    res.json({ title: 'Custom Target Feed' });
  }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`News Engine Online on port ${PORT}`));