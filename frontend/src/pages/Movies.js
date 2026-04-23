import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { getMoviesNowPlaying, getMoviesPopular, getMoviesTopRated } from "../utils/api";

const TABS = [
  { id: "popular", label: "Popular", fn: getMoviesPopular },
  { id: "now-playing", label: "Now Playing", fn: getMoviesNowPlaying },
  { id: "top-rated", label: "Top Rated", fn: getMoviesTopRated },
];

export default function Movies() {
  const [params] = useSearchParams();
  const defaultTab = params.get("tab") || "popular";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const tab = TABS.find((t) => t.id === activeTab) || TABS[0];
    tab.fn(page).then((data) => {
      setMovies(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 20));
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }).catch(() => setLoading(false));
  }, [activeTab, page]);

  const handleTab = (id) => { setActiveTab(id); setPage(1); };

  return (
    <main>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">🎬 Movies</h1>
          <p className="page-subtitle">Discover and watch thousands of movies in HD</p>
        </div>
      </div>
      <div className="container">
        <div className="filter-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`filter-tab${activeTab === t.id ? " active" : ""}`}
              onClick={() => handleTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div className="grid">
            {movies.map((m) => <MovieCard key={m.id} item={m} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              style={{ opacity: page === 1 ? 0.4 : 1 }}
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = page <= 3 ? i + 1 : page - 2 + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  className={`page-btn${page === p ? " active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}
            <button
              className="page-btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{ opacity: page === totalPages ? 0.4 : 1 }}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

