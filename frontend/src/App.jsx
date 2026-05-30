import React, { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_SOURCES = [
  { id: 'digi24', name: 'DIGI24' },
  { id: 'hotnews', name: 'HotNews' },
  { id: 'mediafax', name: 'Mediafax' },
  { id: 'realitatea', name: 'Realitatea TV' },
  { id: 'romania_informa', name: 'România Informează' },
  { id: 'antena3', name: 'Antena 3' },
  { id: 'b1', name: 'B1 TV' },
  { id: 'stirileprotv', name: 'Stirile ProTV' },
  { id: 'stirile_tvr', name: 'Stirile TVR' },
  { id: 'gds', name: 'Gazeta de Stiri' },
  { id: 'zf_ro', name: 'Ziarul Financiar' },
  { id: 'business_ro', name: 'Business24' },
  { id: 'cotidianul', name: 'Cotidianul' },
  { id: 'libertatea', name: 'Libertatea' },
  { id: 'adevarul', name: 'Adevărul' },
  { id: 'dcnews', name: 'DCNEWS' },
  { id: 'evz', name: 'Evenimentul Zilei' },
  { id: 'jurnalul', name: 'Jurnalul' },
  { id: 'cristi_tudor', name: 'Cristi Tutor News' },
  { id: 'tabu', name: 'TABU' },
  { id: 'stiripesurse', name: 'Stiri pe Surse' },
  { id: 'economia_ro', name: 'Economia.net' },
  { id: 'startupro', name: 'StartUp.ro' },
  { id: 'sectiapolitie', name: 'Presa Romana' },
  { id: 'buzzcoin', name: 'BuzzCoin' },
  { id: 'newsroom_ro', name: 'Newsroom' },
  { id: 'capital_ro', name: 'Capital.ro' },
  { id: 'click_ro', name: 'Click.ro' },
  { id: 'prunu_ro', name: 'PruniNews' },
  { id: 'desprecriza', name: 'DesprecRiza' },
  { id: 'bbc', name: 'BBC News' },
  { id: 'techcrunch', name: 'TechCrunch' },
  { id: 'theverge', name: 'The Verge' }
];

export default function App() {
  // Source states
  const [selectedSources, setSelectedSources] = useState([]);
  const [customSources, setCustomSources] = useState(() => {
    const saved = localStorage.getItem('newshub_custom_sources');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCustomSources, setSelectedCustomSources] = useState([]);

  // Form input state
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [inputError, setInputError] = useState('');

  // Feed engine states
  const [isStreaming, setIsStreaming] = useState(false);
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [apiError, setApiError] = useState('');

  const observer = useRef();

  // Keep custom sources synchronized in browser cache
  useEffect(() => {
    localStorage.setItem('newshub_custom_sources', JSON.stringify(customSources));
  }, [customSources]);

  // Toggle selection for native sources
  const toggleSource = (id) => {
    setSelectedSources(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle selection for user added sources
  const toggleCustomSource = (url) => {
    setSelectedCustomSources(prev =>
      prev.includes(url) ? prev.filter(item => item !== url) : [...prev, url]
    );
  };

  // Add custom layout resource handler
  const handleAddCustomSource = (e) => {
    e.preventDefault();
    setInputError('');

    if (!customName.trim() || !customUrl.trim()) {
      setInputError('Both name and feed URL fields are required.');
      return;
    }

    // Quick regex validation checking for basic HTTP pattern
    if (!/^https?:\/\//i.test(customUrl.trim())) {
      setInputError('Please provide a valid URL starting with http:// or https://');
      return;
    }

    // Check if URL is duplicate
    if (customSources.some(src => src.url.toLowerCase() === customUrl.trim().toLowerCase())) {
      setInputError('This RSS feed source URL has already been added.');
      return;
    }

    const newSource = {
      name: customName.trim(),
      url: customUrl.trim()
    };

    setCustomSources(prev => [...prev, newSource]);
    setSelectedCustomSources(prev => [...prev, newSource.url]); // Auto-check it
    setCustomName('');
    setCustomUrl('');
  };

  // Clear a custom source option
  const handleDeleteCustomSource = (urlToDelete) => {
    setCustomSources(prev => prev.filter(src => src.url !== urlToDelete));
    setSelectedCustomSources(prev => prev.filter(url => url !== urlToDelete));
  };

  // Fetch feed payload function
  const fetchNews = useCallback(async (pageNum) => {
    setLoading(true);
    setApiError('');
    try {
      const sourceQuery = selectedSources.join(',');
      
      // Compile targeted custom pairs: Name|Url encoded cleanly
      const customPairs = customSources
        .filter(src => selectedCustomSources.includes(src.url))
        .map(src => `${encodeURIComponent(src.name)}|${encodeURIComponent(src.url)}`)
        .join(',');

      let url = `http://localhost:8000/api/news?page=${pageNum}`;
      if (sourceQuery) url += `&sources=${sourceQuery}`;
      if (customPairs) url += `&customUrls=${customPairs}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to retrieve server updates');
      
      const data = await res.json();
      
      setArticles(prev => pageNum === 1 ? data.articles : [...prev, ...data.articles]);
      setHasMore(data.hasMore);
    } catch (err) {
      setApiError(err.message || 'Server connection failed.');
    } finally {
      setLoading(false);
    }
  }, [selectedSources, customSources, selectedCustomSources]);

  // Handle stream initialization
  const handleGenerateStream = () => {
    if (selectedSources.length === 0 && selectedCustomSources.length === 0) {
      alert('Please check at least one source before streaming.');
      return;
    }
    setArticles([]);
    setPage(1);
    setHasMore(true);
    setIsStreaming(true);
  };

  // Trigger loading next pages
  useEffect(() => {
    if (isStreaming) {
      fetchNews(page);
    }
  }, [page, isStreaming, fetchNews]);

  // Infinite scroll hook configuration
  const lastArticleRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Go back to configuration layout dashboard
  const handleReset = () => {
    setIsStreaming(false);
    setArticles([]);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          NewsHub <span className="text-xs font-normal text-slate-400 border border-slate-700 px-2 py-0.5 rounded ml-2">v2.0</span>
        </h1>
        {isStreaming && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/30 hover:border-indigo-400 rounded-lg transition bg-indigo-500/5 hover:bg-indigo-500/10"
          >
            ← Modify Sources
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {!isStreaming ? (
          /* SOURCE SELECTION PANEL SCREEN layout */
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center max-w-xl mx-auto space-y-2 py-4">
              <h2 className="text-3xl font-extrabold text-white">Assemble Your Pipeline</h2>
              <p className="text-slate-400 text-sm">Select pre-built streams or paste custom RSS feeds below to construct an individualized content pipeline.</p>
            </div>

            {/* CUSTOM ADDITION FORM SECTION */}
            <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <span className="p-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm">＋</span> Add Custom RSS Website Source
              </h3>
              <form onSubmit={handleAddCustomSource} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Source Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., TechSpy"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">RSS Feed URL</label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/rss"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between pt-2">
                  {inputError ? <p className="text-xs text-rose-400 font-medium">{inputError}</p> : <div />}
                  <button 
                    type="submit"
                    className="ml-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    Add Source
                  </button>
                </div>
              </form>

              {/* USER CUSTOM SOURCE BADGES */}
              {customSources.length > 0 && (
                <div className="mt-6 border-t border-slate-800/60 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Your Added Feeds</p>
                  <div className="flex flex-wrap gap-2">
                    {customSources.map((src) => {
                      const isChecked = selectedCustomSources.includes(src.url);
                      return (
                        <div 
                          key={src.url}
                          className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border text-xs transition cursor-pointer select-none ${
                            isChecked 
                              ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' 
                              : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                          onClick={() => toggleCustomSource(src.url)}
                        >
                          <span className="font-medium truncate max-w-[120px]">{src.name}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomSource(src.url);
                            }}
                            className="text-slate-500 hover:text-rose-400 font-bold p-0.5"
                            title="Remove"
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

            {/* DEFAULT CORE ROMANIAN & INT DRIVER SOURCES COHORT GRID */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800/80 pb-2">Preset Directories Available</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {DEFAULT_SOURCES.map((source) => {
                  const isChecked = selectedSources.includes(source.id);
                  return (
                    <div 
                      key={source.id}
                      onClick={() => toggleSource(source.id)}
                      className={`p-4 rounded-xl border text-center font-semibold text-sm cursor-pointer select-none transition-all ${
                        isChecked 
                          ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 border-indigo-400 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]' 
                          : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      {source.name}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* FLOATING ACTION BOTTOM STICKY HUB FOOTER BAR FOR TRIGGER */}
            <div className="text-center pt-6">
              <button 
                onClick={handleGenerateStream}
                className="px-10 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-900/30 transition transform hover:-translate-y-0.5 text-base cursor-pointer"
              >
                Generate Combined Stream →
              </button>
            </div>
          </div>
        ) : (
          /* INFINITE STREAM FEED VIEWS */
          <div className="space-y-6 max-w-3xl mx-auto">
            {apiError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-sm">
                ⚠️ Error aggregation update: {apiError}
              </div>
            )}

            {/* DYNAMIC RENDER OF NEWS ARTICLE COMPONENT TILES */}
            <div className="space-y-4">
              {articles.map((article, idx) => {
                const isLastItem = articles.length === idx + 1;
                return (
                  <article 
                    key={`${article.link}-${idx}`}
                    ref={isLastItem ? lastArticleRef : null}
                    className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col sm:flex-row shadow-sm hover:shadow-md"
                  >
                    {/* Thumbnail box component layout setup */}
                    <div className="sm:w-48 h-40 sm:h-auto bg-slate-950 flex-shrink-0 relative overflow-hidden">
                      <img 
                        src={article.image} 
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover transition transform duration-500 hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600';
                        }}
                      />
                    </div>

                    {/* Article information component text body context blocks */}
                    <div className="p-5 flex flex-col justify-between flex-grow space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-400 font-bold border border-slate-700/60">
                            {article.source}
                          </span>
                          <span className="text-slate-400 font-medium">
                            {new Date(article.date).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white leading-snug hover:text-indigo-400 transition">
                          <a href={article.link} target="_blank" rel="noopener noreferrer">
                            {article.title}
                          </a>
                        </h3>
                      </div>
                      
                      <div className="pt-1">
                        <a 
                          href={article.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 group"
                        >
                          Read Story <span className="transform group-hover:translate-x-0.5 transition">→</span>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* ENGINE FEED STATUS LABELS FOOTERS SHOWN ON SCROLL OBSERVATION TRIGGER */}
            {loading && (
              <div className="py-8 text-center flex justify-center items-center gap-1.5 text-slate-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                <span className="ml-2">Aggregating timeline blocks...</span>
              </div>
            )}

            {!hasMore && articles.length > 0 && (
              <div className="py-12 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
                ✓ Fully caught up with selected timelines
              </div>
            )}

            {!loading && articles.length === 0 && !apiError && (
              <div className="py-20 text-center text-slate-400 text-sm">
                No articles discovered. Verify RSS sources connectivity paths.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}