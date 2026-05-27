import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiSearch, FiX, FiTv } from "react-icons/fi";
import MovieCard from "../components/MovieCard";
// adjust imports to match your actual api.js exports
import { getTVPopular, searchTV } from "../utils/api";

const SORT_TABS = [
  { key: "popular",     label: "Popular" },
  { key: "top_rated",   label: "Top Rated" },
  { key: "on_the_air",  label: "On The Air" },
  { key: "airing_today", label: "Airing Today" },
];

export default function TVShows() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const [query,   setQuery]   = useState(initialQ);
  const [input,   setInput]   = useState(initialQ);
  const [sort,    setSort]    = useState("popular");
  const [shows,   setShows]   = useState([]);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  const isSearching = query.trim().length > 0;

  const load = useCallback(async (pg = 1, append = false) => {
    setLoading(true);
    try {
      let data;
      if (isSearching) {
        // searchTV only returns TV shows — never movies
        data = await searchTV(query, pg);
      } else {
        data = await getTVPopular(pg, sort);
      }
      const results = (data.results || []).map((s) => ({
        ...s,
        media_type: "tv",
        // normalise title field (TV uses name)
        title: s.name || s.title,
        release_date: s.first_air_date,
      }));
      setShows((prev) => (append ? [...prev, ...results] : results));
      setTotal(data.total_pages || 1);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [query, sort, isSearching]);

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
            <FiTv size={28} color="var(--accent)" />
            <h1 className="page-title" style={{ marginBottom: 0 }}>TV Shows</h1>
          </div>
          <p className="page-subtitle">
            {isSearching
              ? `Search results for "${query}"`
              : "Browse the best series from around the world"}
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
              placeholder="Search TV shows…"
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

        {/* ── Sort tabs ── */}
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
        {loading && shows.length === 0 ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : shows.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 0",
            color: "var(--text-secondary)",
          }}>
            <FiTv size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
            <p style={{ fontSize: "1rem" }}>
              {isSearching ? `No shows found for "${query}"` : "No shows available."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid">
              {shows.map((s) => (
                <MovieCard key={`${s.id}-tv`} item={s} />
              ))}
            </div>

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