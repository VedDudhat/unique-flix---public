import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiPlay, FiStar, FiClock, FiCalendar, FiArrowLeft } from "react-icons/fi";
import MovieCard from "../components/MovieCard";
import { getMovieDetail } from "../utils/api";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    getMovieDetail(id)
      .then((data) => { setMovie(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner-wrap" style={{ minHeight: "100vh" }}><div className="spinner" /></div>;
  if (!movie) return <div className="container" style={{ paddingTop: 120 }}>Movie not found.</div>;

  const year = (movie.release_date || "").slice(0, 4);

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* Hero backdrop */}
      <div className="detail-hero">
        <div className="detail-hero-bg">
          {movie.backdrop_path
            ? <img src={movie.backdrop_path} alt={movie.title} />
            : <div style={{ background: "#1a1a2e", width: "100%", height: "100%" }} />}
        </div>
        <div className="detail-content">
          <div className="detail-poster">
            {movie.poster_path
              ? <img src={movie.poster_path} alt={movie.title} />
              : <div className="no-poster" style={{ height: 330 }}>🎬</div>}
          </div>
          <div className="detail-info">
            {movie.genres?.length > 0 && (
              <div className="detail-genres">
                {movie.genres.map((g) => <span key={g} className="genre-chip">{g}</span>)}
              </div>
            )}
            <h1 className="detail-title">{movie.title}</h1>
            {movie.tagline && (
              <p style={{ color: "var(--accent)", fontStyle: "italic", marginBottom: 12 }}>"{movie.tagline}"</p>
            )}
            <div className="detail-meta">
              <span className="detail-rating">
                <FiStar size={15} fill="#ffd700" stroke="none" style={{ marginRight: 4 }} />
                {movie.vote_average} / 10
              </span>
              {year && <span><FiCalendar size={13} style={{ marginRight: 4 }} />{year}</span>}
              {movie.runtime && <span><FiClock size={13} style={{ marginRight: 4 }} />{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
              <span style={{ background: "var(--bg-card)", padding: "2px 10px", borderRadius: 6, fontSize: "0.8rem" }}>{movie.status}</span>
            </div>
            <p className="detail-overview">{movie.overview}</p>
            <div className="detail-actions">
              <button
                className="btn-primary"
                onClick={() => navigate(`/watch/movie/${movie.id}`)}
              >
                <FiPlay /> Watch Now
              </button>
              <button className="btn-secondary" onClick={() => navigate(-1)}>
                <FiArrowLeft /> Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cast */}
      {movie.cast?.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Cast</h2>
            </div>
            <div className="cast-grid">
              {movie.cast.map((c) => (
                <div key={c.name} className="cast-card">
                  {c.profile
                    ? <img src={c.profile} alt={c.name} className="cast-avatar" />
                    : <div className="cast-avatar-placeholder">👤</div>}
                  <div className="cast-name">{c.name}</div>
                  <div className="cast-char">{c.character}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Similar */}
      {movie.similar?.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Similar Movies</h2>
            </div>
            <div className="grid">
              {movie.similar.map((m) => <MovieCard key={m.id} item={m} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

