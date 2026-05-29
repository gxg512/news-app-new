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

// Map of available sources and their RSS endpoints
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

// Helper function to extract an image from various RSS formats
function extractImage(item) {
  if (item.media && item.media.$ && item.media.$.url) return item.media.$.url;
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  
  // Fallback: Check if there's an <img> tag buried in the content/description
  const match = (item.content || item.summary || '').match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600'; // Default placeholder
}

app.get('/api/news', async (req, res) => {
  try {
    // Expecting comma-separated sources, e.g., ?sources=bbc,techcrunch&page=1
    const requestedSources = req.query.sources ? req.query.sources.split(',') : Object.keys(NEWS_SOURCES);
    const page = parseInt(req.query.page) || 1;
    const limit = 10; 

    let allArticles = [];

    // Fetch data from all selected sources simultaneously
    await Promise.all(requestedSources.map(async (sourceKey) => {
      const source = NEWS_SOURCES[sourceKey];
      if (!source) return;

      try {
        const feed = await parser.parseURL(source.url);
        const articles = feed.items.map(item => ({
          title: item.title,
          link: item.link,
          date: new Date(item.pubDate || item.isoDate),
          source: source.name,
          image: extractImage(item)
        }));
        allArticles.push(...articles);
      } catch (err) {
        console.error(`Failed to fetch source ${sourceKey}:`, err.message);
      }
    }));

    // CRITICAL: Sort chronologically (newest first)
    allArticles.sort((a, b) => b.date - a.date);

    // Paginate the sorted results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = allArticles.slice(startIndex, endIndex);

    res.json({
      articles: paginatedArticles,
      hasMore: endIndex < allArticles.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to aggregate news feeds' });
  }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`News API running on port ${PORT}`));