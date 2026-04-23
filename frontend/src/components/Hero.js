import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlay, FiInfo, FiStar } from "react-icons/fi";

export default function Hero({ items = [] }) {
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const item = items[idx];
  const isTV = item.media_type === "tv";
  const year = (item.release_date || "").slice(0, 4);

  return (
    <div className="hero">
      <div className="hero-bg">
        {item.backdrop_path ? (
          <img src={item.backdrop_path} alt={item.title} />
        ) : (
          <div style={{ background: "#1a1a2e", width: "100%", height: "100%" }} />
        )}
      </div>
      <div className="container">
        <div className="hero-content">
          <span className="hero-badge">{isTV ? "📺 TV SHOW" : "🎬 MOVIE"}</span>
          <h1 className="hero-title">{item.title}</h1>
          <div className="hero-meta">
            <span className="hero-rating">
              <FiStar size={14} fill="#ffd700" stroke="none" /> {item.vote_average}
            </span>
            {year && <span>{year}</span>}
            <span>HD Available</span>
          </div>
          <p className="hero-overview">{item.overview}</p>
          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() =>
                navigate(
                  isTV
                    ? `/watch/tv/${item.id}?season=1&episode=1`
                    : `/watch/movie/${item.id}`
                )
              }
            >
              <FiPlay /> Watch Now
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate(isTV ? `/tv/${item.id}` : `/movie/${item.id}`)}
            >
              <FiInfo /> More Info
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div style={{ position: "absolute", bottom: 24, right: 40, display: "flex", gap: 8, zIndex: 3 }}>
        {items.slice(0, 6).map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 24 : 8, height: 8, borderRadius: 4,
              background: i === idx ? "#e50914" : "rgba(255,255,255,0.3)",
              border: "none", cursor: "pointer", transition: "all 0.3s",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

