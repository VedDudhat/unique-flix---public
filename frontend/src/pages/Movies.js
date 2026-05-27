import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiSearch, FiX, FiFilm } from "react-icons/fi";
import MovieCard from "../components/MovieCard";
// adjust imports to match your actual api.js exports
import { getMoviesPopular, searchMovies } from "../utils/api";

const SORT_TABS = [
  { key: "popular",    label: "Popular" },
  { key: "top_rated",  label: "Top Rated" },
  { key: "upcoming",   label: "Upcoming" },
  { key: "now_playing", label: "Now Playing" },
];

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQ = searchParams.get("q") || "";
  const [query,   setQuery]   = useState(initialQ);
  const [input,   setInput]   = useState(initialQ);
  const [sort,    setSort]    = useState("popular");
  const [movies,  setMovies]  = useState([]);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  const isSearching = query.trim().length > 0;

  const load = useCallback(async (pg = 1, append = false) => {
    setLoading(true);
    try {
      let data;
      if (isSearching) {
        // searchMovies only returns movies — never TV
        data = await searchMovies(query, pg);
      } else {
        // getPopularMovies with optional sort filter
        data = await getMoviesPopular(pg, sort);
      }
      const results = (data.results || []).map((m) => ({
        ...m,
        media_type: "movie",
        // normalise title field
        title: m.title || m.name,
      }));
      setMovies((prev) => (append ? [...prev, ...results] : results));
      setTotal(data.total_pages || 1);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [query, sort, isSearching]);

  // Reset to page 1 whenever query/sort changes
  useEffect(() => {
    setPage(1);
    load(1, false);
  }, [query, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    const q = input.trim();
    setQuery(q);
    if (q) setSearchParams({ q });
    else setSearchParams({});
  };

  const clearSearch = () => {
    setInput("");
    setQuery("");
    setSearchParams({});
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next, true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingTop: "80px" }}>

      {/* ── Page header ── */}
      <div className="page-header">
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <FiFilm size={28} color="var(--accent)" />
            <h1 className="page-title" style={{ marginBottom: 0 }}>Movies</h1>
          </div>
          <p className="page-subtitle">
            {isSearching
              ? `Search results for "${query}"`
              : "Discover the latest and greatest films"}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 60 }}>

        {/* ── Search bar ── */}
        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: 10, marginBottom: 28, maxWidth: 520 }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <FiSearch
              style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search movies…"
              style={{
                width: "100%", background: "var(--bg-card)",
                border: "1px solid var(--border)", color: "white",
                padding: "11px 42px 11px 42px", borderRadius: 50,
                fontSize: "0.9rem", outline: "none", fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            {input && (
              <button
                type="button"
                onClick={clearSearch}
                style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  color: "var(--text-muted)", padding: 4,
                }}
              >
                <FiX />
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary" style={{ padding: "11px 22px", borderRadius: 50 }}>
            Search
          </button>
        </form>

        {/* ── Sort tabs (only when not searching) ── */}
        {!isSearching && (
          <div className="filter-tabs" style={{ marginBottom: 28 }}>
            {SORT_TABS.map((t) => (
              <button
                key={t.key}
                className={`filter-tab${sort === t.key ? " active" : ""}`}
                onClick={() => setSort(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Grid ── */}
        {loading && movies.length === 0 ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : movies.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 0",
            color: "var(--text-secondary)",
          }}>
            <FiFilm size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
            <p style={{ fontSize: "1rem" }}>
              {isSearching ? `No movies found for "${query}"` : "No movies available."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid">
              {movies.map((m) => (
                <MovieCard key={`${m.id}-${m.media_type}`} item={m} />
              ))}
            </div>

            {/* Load more */}
            {page < total && (
              <div style={{ textAlign: "center", marginTop: 36 }}>
                <button
                  className="load-more-btn"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}