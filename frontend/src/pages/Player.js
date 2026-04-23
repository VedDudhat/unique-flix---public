import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiAlertTriangle } from "react-icons/fi";
import { getMovieDetail, getTVDetail, getMovieStream, getTVStream, getTVSeason } from "../utils/api";

export default function Player({ mediaType }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const seasonParam  = parseInt(searchParams.get("season")  || "1", 10);
  const episodeParam = parseInt(searchParams.get("episode") || "1", 10);

  const [embedUrl, setEmbedUrl]   = useState("");
  const [meta, setMeta]           = useState(null);
  const [seasons, setSeasons]     = useState([]);
  const [episodes, setEpisodes]   = useState([]);
  const [activeSeason, setActiveSeason]   = useState(seasonParam);
  const [activeEpisode, setActiveEpisode] = useState(episodeParam);
  const [loading, setLoading]     = useState(true);

  // Load title metadata once
  useEffect(() => {
    if (mediaType === "movie") {
      getMovieDetail(id).then(setMeta).catch(() => {});
    } else {
      getTVDetail(id).then((d) => {
        setMeta(d);
        setSeasons(d.seasons || []);
      }).catch(() => {});
    }
  }, [id, mediaType]);

  // Load episodes when season changes (TV only)
  useEffect(() => {
    if (mediaType !== "tv") return;
    getTVSeason(id, activeSeason)
      .then((d) => setEpisodes(d.episodes || []))
      .catch(() => {});
  }, [id, mediaType, activeSeason]);

  // Load stream URL
  useEffect(() => {
    setLoading(true);
    const fn = mediaType === "movie"
      ? getMovieStream(id)
      : getTVStream(id, activeSeason, activeEpisode);

    fn.then((data) => {
      setEmbedUrl(data.embed_url);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, mediaType, activeSeason, activeEpisode]);

  const handleEpisode = (ep) => {
    setActiveEpisode(ep);
  };

  const handleSeason = (s) => {
    setActiveSeason(s);
    setActiveEpisode(1);
  };

  const currentEp = episodes.find((e) => e.episode_number === activeEpisode);

  return (
    <div className="player-page">
      {/* Player frame */}
      <div className="player-container">
        {loading ? (
          <div className="spinner-wrap" style={{ background: "#000", height: "100%" }}>
            <div className="spinner" />
          </div>
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            referrerPolicy="origin"
            title="CineStream Player"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", gap: 16, color: "var(--text-secondary)"
          }}>
            <FiAlertTriangle size={40} color="var(--accent)" />
            <p>Stream not available for this title right now.</p>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="player-info">
        <button
          className="btn-secondary"
          style={{ marginBottom: 16, padding: "8px 18px", fontSize: "0.85rem" }}
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft /> Back
        </button>

        <div className="player-title">
          {meta?.title}
          {mediaType === "tv" && ` — S${String(activeSeason).padStart(2,"0")} E${String(activeEpisode).padStart(2,"0")}`}
          {currentEp ? ` · ${currentEp.name}` : ""}
        </div>
        {meta && (
          <div className="player-meta">
            {mediaType === "movie"
              ? `${(meta.release_date||"").slice(0,4)} · ${meta.runtime ? `${Math.floor(meta.runtime/60)}h ${meta.runtime%60}m` : ""} · ⭐ ${meta.vote_average}`
              : `${(meta.release_date||"").slice(0,4)} · ⭐ ${meta.vote_average}`
            }
          </div>
        )}

        {/* Season tabs (TV) */}
        {mediaType === "tv" && seasons.length > 0 && (
          <>
            <div style={{ marginTop: 20, marginBottom: 8, fontWeight: 700, fontSize: "0.9rem" }}>
              Season
            </div>
            <div className="season-selector">
              {seasons.map((s) => (
                <button
                  key={s.season_number}
                  className={`season-btn${activeSeason === s.season_number ? " active" : ""}`}
                  onClick={() => handleSeason(s.season_number)}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* Episode list */}
            {episodes.length > 0 && (
              <>
                <div style={{ marginTop: 20, marginBottom: 12, fontWeight: 700, fontSize: "0.9rem" }}>
                  Episodes
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {episodes.map((ep) => (
                    <button
                      key={ep.episode_number}
                      onClick={() => handleEpisode(ep.episode_number)}
                      style={{
                        padding: "7px 14px", borderRadius: 7,
                        background: activeEpisode === ep.episode_number ? "var(--accent)" : "var(--bg-card)",
                        color: activeEpisode === ep.episode_number ? "white" : "var(--text-secondary)",
                        border: "1px solid var(--border)",
                        fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      E{ep.episode_number}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Disclaimer */}
        <div style={{
          marginTop: 28, padding: "14px 18px",
          background: "rgba(229,9,20,0.06)",
          border: "1px solid rgba(229,9,20,0.2)",
          borderRadius: 10, fontSize: "0.8rem", color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}>
          <strong style={{ color: "var(--accent)" }}>ℹ️ Note:</strong> Streams are provided via VidSrc and sourced from third-party
          hosters. If a title doesn't play, try refreshing or check back later — availability can vary
          by region and title.
        </div>
      </div>
    </div>
  );
}

