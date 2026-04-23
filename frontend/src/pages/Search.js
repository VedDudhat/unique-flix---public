import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import MovieCard from "../components/MovieCard";
import { searchAll } from "../utils/api";

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setPage(1);
    searchAll(query, 1).then((data) => {
      setResults(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 10));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    if (!query || page === 1) return;
    setLoading(true);
    searchAll(query, page).then((data) => {
      setResults(data.results || []);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }).catch(() => setLoading(false));
  }, [page]);

  return (
    <main>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">
            <FiSearch style={{ marginRight: 12 }} />
            {query ? `Results for "${query}"` : "Search"}
          </h1>
          {!loading && results.length > 0 && (
            <p className="page-subtitle">{results.length} titles found</p>
          )}
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>🎬</div>
            <p style={{ fontSize: "1.1rem" }}>
              {query ? `No results found for "${query}"` : "Start searching for movies and shows"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid">
              {results.map((item) => (
                <MovieCard key={`${item.media_type}-${item.id}`} item={item} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)} style={{ opacity: page === 1 ? 0.4 : 1 }}>‹</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = page <= 3 ? i + 1 : page - 2 + i;
                  if (p > totalPages) return null;
                  return (
                    <button key={p} className={`page-btn${page === p ? " active" : ""}`}
                      onClick={() => setPage(p)}>{p}</button>
                  );
                })}
                <button className="page-btn" disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)} style={{ opacity: page === totalPages ? 0.4 : 1 }}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

