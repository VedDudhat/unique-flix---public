import React from "react";
import { useNavigate } from "react-router-dom";
import { FiPlay, FiStar } from "react-icons/fi";

export default function MovieCard({ item }) {
  const navigate = useNavigate();
  const isTV = item.media_type === "tv";
  const year = (item.release_date || "").slice(0, 4);

  const handleClick = () => {
    navigate(isTV ? `/tv/${item.id}` : `/movie/${item.id}`);
  };

  return (
    <div className="card" onClick={handleClick}>
      <div className="card-img-wrap">
        {item.poster_path ? (
          <img src={item.poster_path} alt={item.title} loading="lazy" />
        ) : (
          <div className="no-poster">🎬</div>
        )}
        <span className="card-badge">{isTV ? "TV" : "MOVIE"}</span>
        <div className="card-overlay">
          <div className="play-btn"><FiPlay /></div>
        </div>
      </div>
      <div className="card-body">
        <div className="card-title">{item.title}</div>
        <div className="card-meta">
          <span className="card-year">{year}</span>
          <span className="card-rating">
            <FiStar size={11} fill="#ffd700" stroke="none" />
            {item.vote_average}
          </span>
        </div>
      </div>
    </div>
  );
}

