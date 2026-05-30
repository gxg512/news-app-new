import React, { useState, useEffect, useRef, useCallback } from 'react';

const PRESET_CATEGORIES = {
  'Știri Generale & Politică': [
    { id: 'digi24', name: 'DIGI24' },
    { id: 'hotnews', name: 'HotNews' },
    { id: 'stirileprotv', name: 'Știrile ProTV' },
    { id: 'g4media', name: 'G4Media' },
    { id: 'recorder', name: 'Recorder' },
    { id: 'mediafax', name: 'Mediafax' },
    { id: 'realitatea', name: 'Realitatea' },
    { id: 'antena3', name: 'Antena 3' },
    { id: 'b1', name: 'B1 TV' },
    { id: 'stirile_tvr', name: 'Știrile TVR' },
    { id: 'libertatea', name: 'Libertatea' },
    { id: 'adevarul', name: 'Adevărul' },
    { id: 'dcnews', name: 'DC News' },
    { id: 'evz', name: 'Evenimentul Zilei' },
    { id: 'jurnalul', name: 'Jurnalul Național' },
    { id: 'gandul', name: 'Gândul' },
    { id: 'romaniatv', name: 'România TV' },
    { id: 'observator', name: 'Observator' },
    { id: 'agerpres', name: 'Agerpres' },
    { id: 'spotmedia', name: 'SpotMedia' },
    { id: 'pressone', name: 'PressOne' },
    { id: 'stiripesurse', name: 'Știri pe Surse' },
    { id: 'cotidianul', name: 'Cotidianul' }
  ],
  'Sport': [
    { id: 'digisport', name: 'DigiSport (Toate)' },
    { id: 'digisport_ro', name: 'DigiSport (Intern)' },
    { id: 'digisport_ext', name: 'DigiSport (Extern)' },
    { id: 'gsp', name: 'GSP (Gazeta Sporturilor)' },
    { id: 'prosport', name: 'ProSport' },
    { id: 'fanatik_sport', name: 'Fanatik Sport' },
    { id: 'eurosport', name: 'Eurosport RO' }
  ],
  'Business & Tech': [
    { id: 'zf_ro', name: 'Ziarul Financiar' },
    { id: 'economica', name: 'Economica.net' },
    { id: 'wallstreet', name: 'Wall-Street.ro' },
    { id: 'profit_ro', name: 'Profit.ro' },
    { id: 'startupro', name: 'StartUp.ro' },
    { id: 'capital_ro', name: 'Capital' },
    { id: 'business_ro', name: 'Business24' },
    { id: 'zonait', name: 'Zona IT' },
    { id: 'go4it', name: 'Go4IT' },
    { id: 'mobilissimo', name: 'Mobilissimo' },
    { id: 'nwradu', name: 'nwradu blog' }
  ],
  'Lifestyle & Regional': [
    { id: 'click_ro', name: 'Click.ro' },
    { id: 'tabu', name: 'TABU' },
    { id: 'gds', name: 'Gazeta de Sud' },
    { id: 'ziuaconstanta', name: 'Ziua de Constanța' },
    { id: 'bzi', name: 'Bună Ziua Iași' }
  ]
};

export default function App() {
  const [selectedSources, setSelectedSources] = useState([]);
  const [customSources, setCustomSources] = useState(() => {
    const saved = localStorage.getItem('newshub_custom_v3');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCustomSources, setSelectedCustomSources] = useState([]);

  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [inputError, setInputError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  const [isStreaming, setIsStreaming] = useState(false);
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [apiError, setApiError] = useState('');

  const observer = useRef();

  useEffect(() => {
    localStorage.setItem('newshub_custom_v3', JSON.stringify(customSources));
  }, [customSources]);

  const toggleSource = (id) => {
    setSelectedSources(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleCustomSource = (url) => {
    setSelectedCustomSources(prev => prev.includes(url) ? prev.filter(x => x !== url) : [...prev, url]);
  };

  const handleAddCustomSource = async (e) => {
    e.preventDefault();
    setInputError('');
    let targetUrl = customUrl.trim();

    if (!targetUrl) {
      setInputError('Please enter a website domain or layout URL.');
      return;
    }

    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    if (customSources.some(src => src.url.toLowerCase() === targetUrl.toLowerCase())) {
      setInputError('This custom website target has already been added.');
      return;
    }

    setLookupLoading(true);
    try {
      let finalName = customName.trim();
      if (!finalName) {
        // Query server to scrape the site name dynamically
        const response = await fetch(`http://localhost:8000/api/fetch-title?url=${encodeURIComponent(targetUrl)}`);
        const result = await response.json();
        finalName = result.title || 'Custom Site';
      }

      const newSource = { name: finalName, url: targetUrl };
      setCustomSources(prev => [...prev, newSource]);
      setSelectedCustomSources(prev => [...prev, targetUrl]);
      setCustomName('');
      setCustomUrl('');
    } catch (err) {
      setInputError('Could not communicate with discovery service.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleDeleteCustomSource = (urlToDelete) => {
    setCustomSources(prev => prev.filter(src => src.url !== urlToDelete));
    setSelectedCustomSources(prev => prev.filter(url => url !== urlToDelete));
  };

  const fetchNews = useCallback(async (pageNum) => {
    setLoading(true);
    setApiError('');
    try {
      const sourceQuery = selectedSources.join(',');
      const activeCustomSources = customSources.filter(src => selectedCustomSources.includes(src.url));

      let url = `http://localhost:8000/api/news?page=${pageNum}`;
      if (sourceQuery) url += `&sources=${sourceQuery}`;
      if (activeCustomSources.length > 0) {
        url += `&customUrls=${encodeURIComponent(JSON.stringify(activeCustomSources))}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed tracking updates.');
      const data = await res.json();
      
      setArticles(prev => pageNum === 1 ? data.articles : [...prev, ...data.articles]);
      setHasMore(data.hasMore);
    } catch (err) {
      setApiError(err.message || 'Server pipeline error.');
    } finally {
      setLoading(false);
    }
  }, [selectedSources, customSources, selectedCustomSources]);

  const handleGenerateStream = () => {
    if (selectedSources.length === 0 && selectedCustomSources.length === 0) {
      alert('Please check at least one timeline stream to combine.');
      return;
    }
    setArticles([]);
    setPage(1);
    setHasMore(true);
    setIsStreaming(true);
  };

  useEffect(() => {
    if (isStreaming) fetchNews(page);
  }, [page, isStreaming, fetchNews]);

  const lastArticleRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
          NewsHub <span className="text-xs font-normal text-slate-400 border border-slate-700 px-2 py-0.5 rounded ml-1">v3.0</span>
        </h1>
        {isStreaming && (
          <button 
            onClick={() => setIsStreaming(false)}
            className="px-4 py-2 text-xs font-bold text-indigo-400 border border-indigo-500/30 hover:border-indigo-400 rounded-xl bg-indigo-500/5 cursor-pointer"
          >
            ← Modify Directory Selection
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {!isStreaming ? (
          <div className="space-y-10">
            {/* AUTO DISCOVERY SUBMIT FRAMEWORK */}
            <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md max-w-3xl mx-auto">
              <h3 className="text-base font-bold text-slate-200 mb-1 flex items-center gap-2">
                🌐 Intelligent URL / Website Custom Addition
              </h3>
              <p className="text-xs text-slate-400 mb-4">You can paste plain domains here (e.g., <code className="text-indigo-300">digisport.ro</code>). The engine will crawl the source target and resolve hidden paths automatically.</p>
              
              <form onSubmit={handleAddCustomSource} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Website Name (Optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm sm:w-1/3 focus:outline-none focus:border-indigo-500 text-white"
                />
                <input 
                  type="text" 
                  placeholder="Website Link / Domain (e.g., digisport.ro)"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white font-mono"
                />
                <button 
                  type="submit"
                  disabled={lookupLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold text-sm rounded-xl transition shadow-md cursor-pointer flex-shrink-0"
                >
                  {lookupLoading ? 'Crawling...' : 'Discover Feed'}
                </button>
              </form>
              
              {inputError && <p className="text-xs text-rose-400 font-medium mt-2">{inputError}</p>}

              {customSources.length > 0 && (
                <div className="mt-5 border-t border-slate-800/60 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Active Custom Crawls</p>
                  <div className="flex flex-wrap gap-2">
                    {customSources.map((src) => {
                      const isChecked = selectedCustomSources.includes(src.url);
                      return (
                        <div 
                          key={src.url}
                          onClick={() => toggleCustomSource(src.url)}
                          className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                            isChecked ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold' : 'bg-slate-950/50 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span>{src.name}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteCustomSource(src.url); }}
                            className="text-slate-500 hover:text-rose-400 font-bold ml-1 p-0.5"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* PRESETS ORGANIZED BY CATEGORY */}
            <div className="space-y-6">
              {Object.entries(PRESET_CATEGORIES).map(([category, items]) => (
                <section key={category} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-900 pb-1.5 pl-1">{category}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                    {items.map((source) => {
                      const isChecked = selectedSources.includes(source.id);
                      return (
                        <div 
                          key={source.id}
                          onClick={() => toggleSource(source.id)}
                          className={`p-3.5 rounded-xl border font-medium text-xs text-center cursor-pointer select-none transition-all ${
                            isChecked 
                              ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 border-indigo-400 text-white shadow-md' 
                              : 'bg-slate-900 border-slate-800/60 text-slate-300 hover:bg-slate-900/40'
                          }`}
                        >
                          {source.name}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="text-center pt-4">
              <button 
                onClick={handleGenerateStream}
                className="px-12 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 text-sm tracking-wide cursor-pointer"
              >
                Compile Feeds & Generate Stream →
              </button>
            </div>
          </div>
        ) : (
          /* UNIFIED CHRONOLOGICAL SCROLL AGGREGATOR DISPLAY */
          <div className="space-y-5 max-w-3xl mx-auto">
            {apiError && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">⚠️ {apiError}</div>}
            
            <div className="space-y-3.5">
              {articles.map((article, idx) => (
                <article 
                  key={`${article.link}-${idx}`}
                  ref={articles.length === idx + 1 ? lastArticleRef : null}
                  className="bg-slate-900/90 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col sm:flex-row hover:border-slate-700/80 transition"
                >
                  <div className="sm:w-44 h-36 sm:h-auto bg-slate-950 flex-shrink-0">
                    <img 
                      src={article.image} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600'; }}
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-400 font-bold">{article.source}</span>
                        <span className="text-slate-400">
                          {new Date(article.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white hover:text-indigo-400 transition leading-snug">
                        <a href={article.link} target="_blank" rel="noopener noreferrer">{article.title}</a>
                      </h3>
                    </div>
                    <div className="pt-2">
                      <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-400 inline-flex items-center gap-1">
                        Vezi Știrea <span>→</span>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {loading && (
              <div className="py-6 text-center text-slate-400 text-xs flex justify-center items-center gap-1">
                <span className="animate-pulse">Parsing timelines...</span>
              </div>
            )}
            
            {!hasMore && articles.length > 0 && (
              <div className="py-8 text-center text-xs uppercase tracking-widest text-slate-500 font-bold">✓ End of Pipeline Stream</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}