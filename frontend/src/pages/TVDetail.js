import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlay, FiStar, FiCalendar, FiArrowLeft, FiTv } from "react-icons/fi";
import MovieCard from "../components/MovieCard";
import { getTVDetail, getTVSeason } from "../utils/api";

export default function TVDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSeason, setActiveSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [epLoading, setEpLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    getTVDetail(id)
      .then((data) => {
        setShow(data);
        setLoading(false);
        // Load first season
        if (data.seasons?.length > 0) {
          const first = data.seasons[0].season_number;
          setActiveSeason(first);
          loadSeason(first);
        }
      })
      .catch(() => setLoading(false));
  }, [id]);

  const loadSeason = (season) => {
    setEpLoading(true);
    getTVSeason(id, season)
      .then((data) => { setEpisodes(data.episodes || []); setEpLoading(false); })
      .catch(() => setEpLoading(false));
  };

  const handleSeasonChange = (s) => {
    setActiveSeason(s);
    loadSeason(s);
  };

  if (loading) return <div className="spinner-wrap" style={{ minHeight: "100vh" }}><div className="spinner" /></div>;
  if (!show) return <div className="container" style={{ paddingTop: 120 }}>Show not found.</div>;

  const year = (show.release_date || "").slice(0, 4);

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <div className="detail-hero">
        <div className="detail-hero-bg">
          {show.backdrop_path
            ? <img src={show.backdrop_path} alt={show.title} />
            : <div style={{ background: "#1a1a2e", width: "100%", height: "100%" }} />}
        </div>
        <div className="detail-content">
          <div className="detail-poster">
            {show.poster_path
              ? <img src={show.poster_path} alt={show.title} />
              : <div className="no-poster" style={{ height: 330 }}>📺</div>}
          </div>
          <div className="detail-info">
            {show.genres?.length > 0 && (
              <div className="detail-genres">
                {show.genres.map((g) => <span key={g} className="genre-chip">{g}</span>)}
              </div>
            )}
            <h1 className="detail-title">{show.title}</h1>
            {show.tagline && (
              <p style={{ color: "var(--accent)", fontStyle: "italic", marginBottom: 12 }}>"{show.tagline}"</p>
            )}
            <div className="detail-meta">
              <span className="detail-rating">
                <FiStar size={15} fill="#ffd700" stroke="none" style={{ marginRight: 4 }} />
                {show.vote_average} / 10
              </span>
              {year && <span><FiCalendar size={13} style={{ marginRight: 4 }} />{year}</span>}
              <span><FiTv size={13} style={{ marginRight: 4 }} />{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? "s" : ""}</span>
              <span style={{ background: "var(--bg-card)", padding: "2px 10px", borderRadius: 6, fontSize: "0.8rem" }}>{show.status}</span>
            </div>
            <p className="detail-overview">{show.overview}</p>
            <div className="detail-actions">
              <button
                className="btn-primary"
                onClick={() => navigate(`/watch/tv/${show.id}?season=${activeSeason}&episode=1`)}
              >
                <FiPlay /> Watch S{activeSeason} E1
              </button>
              <button className="btn-secondary" onClick={() => navigate(-1)}>
                <FiArrowLeft /> Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Season selector + Episode list */}
      {show.seasons?.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Episodes</h2>
            </div>

            <div className="season-selector">
              {show.seasons.map((s) => (
                <button
                  key={s.season_number}
                  className={`season-btn${activeSeason === s.season_number ? " active" : ""}`}
                  onClick={() => handleSeasonChange(s.season_number)}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {epLoading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : (
              <div className="episodes-list">
                {episodes.map((ep) => (
                  <div
                    key={ep.episode_number}
                    className="episode-item"
                    onClick={() =>
                      navigate(`/watch/tv/${show.id}?season=${activeSeason}&episode=${ep.episode_number}`)
                    }
                  >
                    <div className="episode-thumb">
                      {ep.still
                        ? <img src={ep.still} alt={ep.name} />
                        : <FiPlay />}
                    </div>
                    <div className="episode-info">
                      <div className="episode-num">S{String(activeSeason).padStart(2, "0")} E{String(ep.episode_number).padStart(2, "0")}</div>
                      <div className="episode-title">{ep.name}</div>
                      {ep.overview && <div className="episode-overview">{ep.overview}</div>}
                      <div style={{ marginTop: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {ep.air_date} {ep.runtime ? `· ${ep.runtime}m` : ""}
                      </div>
                    </div>
                    <button
                      className="play-btn"
                      style={{ flexShrink: 0, alignSelf: "center" }}
                    >
                      <FiPlay />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Cast */}
      {show.cast?.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: 20 }}>Cast</h2>
            <div className="cast-grid">
              {show.cast.map((c) => (
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
      {show.similar?.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: 20 }}>Similar Shows</h2>
            <div className="grid">
              {show.similar.map((s) => <MovieCard key={s.id} item={s} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

