import React, { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_SOURCES = [
  // Romanian News Sources
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
  // International News
  { id: 'bbc', name: 'BBC News' },
  { id: 'techcrunch', name: 'TechCrunch' },
  { id: 'theverge', name: 'The Verge' }
];

export default function App() {
  const [sources, setSources] = useState(DEFAULT_SOURCES);
  const [selectedSources, setSelectedSources] = useState([]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceId, setNewSourceId] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const observerTarget = useRef(null);

  const toggleSource = (id) => {
    setSelectedSources(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const addCustomSource = () => {
    if (newSourceName.trim() && newSourceId.trim()) {
      const customSource = {
        id: newSourceId.toLowerCase().replace(/\s+/g, '_'),
        name: newSourceName
      };
      setSources(prev => [...prev, customSource]);
      setNewSourceName('');
      setNewSourceId('');
    }
  };

  const removeSource = (id) => {
    setSources(prev => prev.filter(source => source.id !== id));
    setSelectedSources(prev => prev.filter(sourceId => sourceId !== id));
  };

  // Fetch news data from Node backend
  const fetchNews = useCallback(async () => {
    if (loading || !hasMore || selectedSources.length === 0) return;
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/api/news?sources=${selectedSources.join(',')}&page=${page}`
      );
      const data = await response.json();
      
      setArticles(prev => [...prev, ...data.articles]);
      setHasMore(data.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, selectedSources]);

  // Infinite scroll observer setup
  useEffect(() => {
    if (!isConfigured) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchNews();
        }
      },
      { threshold: 0.8 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [isConfigured, fetchNews, hasMore, loading]);

  // Fetch initial articles when sources are selected
  useEffect(() => {
    if (isConfigured && articles.length === 0) {
      fetchNews();
    }
  }, [isConfigured]);

  // View 1: Setup Dashboard with Source Management
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex">
        {/* Left Sidebar - Source Management */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            News Sources
          </h2>

          {/* Add Custom Source */}
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <h3 className="text-sm font-bold text-blue-400 mb-3 uppercase">Add Custom Source</h3>
            <input
              type="text"
              placeholder="Source name"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded mb-2 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Source ID"
              value={newSourceId}
              onChange={(e) => setNewSourceId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded mb-3 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={addCustomSource}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 rounded font-medium text-sm transition"
            >
              + Add Source
            </button>
          </div>

          {/* Source List */}
          <div className="space-y-2">
            {sources.map(source => (
              <div
                key={source.id}
                className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition group"
              >
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source.id)}
                  onChange={() => toggleSource(source.id)}
                  className="w-4 h-4 cursor-pointer accent-blue-500"
                />
                <label className="flex-1 cursor-pointer text-sm font-medium">
                  {source.name}
                </label>
                <button
                  onClick={() => removeSource(source.id)}
                  className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded transition"
                  title="Remove source"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-slate-700/30 rounded text-xs text-slate-400">
            Selected: {selectedSources.length}
          </div>
        </div>

        {/* Right Content - Start Button */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 text-center">
            <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              NewsHub
            </h1>
            <p className="text-slate-400 mb-8">
              {selectedSources.length === 0
                ? 'Select at least one news source from the left to start browsing.'
                : `Ready to browse ${selectedSources.length} source${selectedSources.length !== 1 ? 's' : ''}!`}
            </p>

            <button
              onClick={() => selectedSources.length > 0 && setIsConfigured(true)}
              disabled={selectedSources.length === 0}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Generate Stream
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View 2: Infinite Scroll Feed with Sidebar
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Left Sidebar - Source Management */}
      {showSidebar && (
        <div className="w-80 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Sources
          </h2>

          {/* Add Custom Source */}
          <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="text-xs font-bold text-blue-400 mb-2 uppercase">Add Source</h3>
            <input
              type="text"
              placeholder="Name"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded mb-2 text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="ID"
              value={newSourceId}
              onChange={(e) => setNewSourceId(e.target.value)}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded mb-2 text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={addCustomSource}
              className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-xs font-medium transition"
            >
              Add
            </button>
          </div>

          {/* Source List */}
          <div className="space-y-1 mb-4">
            {sources.map(source => (
              <div
                key={source.id}
                className="flex items-center gap-2 p-2 bg-slate-800/30 rounded hover:bg-slate-800/50 transition group"
              >
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source.id)}
                  onChange={() => toggleSource(source.id)}
                  className="w-3 h-3 cursor-pointer accent-blue-500"
                />
                <label className="flex-1 cursor-pointer text-xs font-medium truncate">
                  {source.name}
                </label>
                <button
                  onClick={() => removeSource(source.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-500 p-2 bg-slate-800/30 rounded">
            Selected: {selectedSources.length}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-slate-800 rounded transition"
                title="Toggle sidebar"
              >
                {showSidebar ? '◄' : '►'}
              </button>
              <h2 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                NEWSHUB LIVE
              </h2>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {selectedSources.slice(0, 3).map(s => (
                <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400 uppercase">
                  {s}
                </span>
              ))}
              {selectedSources.length > 3 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400">
                  +{selectedSources.length - 3}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Articles Feed */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          <div className="space-y-6">
            {articles.map((article, index) => (
              <article 
                key={index} 
                className="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-700/80 transition-all duration-200 shadow-md flex flex-col md:flex-row h-auto md:h-44"
              >
                <div className="md:w-1/3 relative h-48 md:h-full overflow-hidden bg-slate-800">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600'; }}
                  />
                </div>
                <div className="p-5 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">{article.source}</span>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-xs text-slate-400">{new Date(article.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <a href={article.link} target="_blank" rel="noreferrer" className="block text-base font-semibold text-slate-200 hover:text-white line-clamp-2 transition-colors">
                      {article.title}
                    </a>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    {new Date(article.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Infinite Scroll Trigger */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center mt-6">
            {loading && (
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-300"></div>
              </div>
            )}
            {!hasMore && <p className="text-slate-500 text-sm font-medium">You have caught up with all sources.</p>}
          </div>
        </main>
      </div>
    </div>
  );
}
