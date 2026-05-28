import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import {getMovieDetail, getTVDetail, getMovieStream, getTVStream, getTVSeason,} from "../utils/api";

export default function Player({ mediaType }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const seasonParam  = parseInt(searchParams.get("season")  || "1", 10);
  const episodeParam = parseInt(searchParams.get("episode") || "1", 10);

  const [meta, setMeta]                           = useState(null);
  const [seasons, setSeasons]               = useState([]);
  const [episodes, setEpisodes]             = useState([]);
  const [activeSeason, setActiveSeason]   = useState(seasonParam);
  const [activeEpisode, setActiveEpisode] = useState(episodeParam);
  const [loading, setLoading]             = useState(true);

  // Stream / server state
  const [servers, setServers]               = useState([]);
  const [activeServer, setActiveServer]           = useState(null);
  const [embedUrl, setEmbedUrl]            = useState("");
  const [iframeKey, setIframeKey]         = useState(0);

  // Load title metadata once
  useEffect(() => {
    if (mediaType === "movie") {
      getMovieDetail(id).then(setMeta).catch(() => {});
    }
    else
      {
        getTVDetail(id).then((d) => {
          setMeta(d);
          setSeasons(d.seasons?.filter((s) => s.season_number > 0) || []);
        }).catch(() => {});
      }
    }, [id, mediaType]);

  //Load episodes when season changes (TV only)
  useEffect(() => {
    if (mediaType !== "tv") return;
    getTVSeason(id, activeSeason)
      .then((d) => setEpisodes(d.episodes || []))
      .catch(() => setEpisodes([]));
  }, [id, mediaType, activeSeason]);

  // Load stream URL from backend + build mirror list
  const loadStream = useCallback(async () => {
    setLoading(true);
    try {
      const data = mediaType === "movie"
        ? await getMovieStream(id)
        : await getTVStream(id, activeSeason, activeEpisode);

      const mirrors = data.servers || [];

      setServers(mirrors);
      if (mirrors.length) {

        setActiveServer(
          mirrors[0].key
        );

        setEmbedUrl(
        mirrors[0].url
        );
      }
    }
    catch
    {
      setServers([]);
      setEmbedUrl("");

    } finally {
      setLoading(false);
    }
  }, [id, mediaType, activeSeason, activeEpisode]);


  useEffect(() => { loadStream(); }, [loadStream]);

  const handleSeason = (s) => {setActiveSeason(s); setActiveEpisode(1)};
  const handleEpisode = (ep) => setActiveEpisode(ep);
  const handleServer = (srv) => {
    setActiveServer(srv.key);
    setEmbedUrl(srv.url);
    setIframeKey((k) => k + 1);
  };

  const handleRefresh = () => setIframeKey((k) => k + 1);
  const currentEp = episodes.find((e) => e.episode_number === activeEpisode);
  const epBadge = mediaType === "tv"
    ? `S${String(activeSeason).padStart(2, "0")} E${String(activeEpisode).padStart(2, "0")}`
    : null;

  return (
    <div className="player-page" style={{ paddingTop: "64px" }}>
      <div className="player-topbar">
        <button className="player-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={15} /> Back
        </button>

        <div className="player-title-wrap">
          <span className="player-title">
            {meta?.title || meta?.name || "Loading…"}
          </span>
          {epBadge && <span className="player-ep-badge">{epBadge}</span>}
          {currentEp?.name && (
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              · {currentEp.name}
            </span>
          )}
        </div>

        <button className="player-refresh-btn" title="Refresh player" onClick={handleRefresh}>
          <FiRefreshCw size={16} />
        </button>
      </div>

      <div className="player-embed-wrap">
        {loading ? (
          <div className="spinner-wrap" style={{ background: "#000", height: "100%" }}>
            <div className="spinner" />
          </div>
        ) : embedUrl ? (
          <iframe
            key={iframeKey}
            src={embedUrl}
            className="player-iframe"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            referrerPolicy="origin"
            title="CineStream Player"
          />
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", gap: 16,
            color: "var(--text-secondary)", minHeight: "56vw",
          }}>
            <FiAlertTriangle size={40} color="var(--accent)" />
            <p>Stream not available for this title right now.</p>
          </div>
        )}
      </div>

      {servers.length > 0 && (
        <div className="player-servers-section">
          <div className="player-servers-label">
            Servers
            <span className="player-servers-hint">— try another if the player doesn't load</span>
          </div>
          <div className="player-servers-grid">
            {servers.map((srv) => (
              <button
                key={srv.key}
                className={`server-btn${activeServer === srv.key ? " active" : ""}`}
                onClick={() => handleServer(srv)}
              >
                {activeServer === srv.key && <span className="server-active-dot" />}
                <span className="server-label">Server</span>
                <span className="server-name">{srv.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {mediaType === "tv" && seasons.length > 0 && (
        <div className="player-servers-section" style={{ borderTop: "1px solid var(--border)" }}>
          {/* Seasons */}
          <div className="player-servers-label">Season</div>
          <div className="season-selector" style={{ marginBottom: 24 }}>
            {seasons.map((s) => (
              <button
                key={s.season_number}
                className={`season-btn${activeSeason === s.season_number ? " active" : ""}`}
                onClick={() => handleSeason(s.season_number)}
              >
                {s.name || `Season ${s.season_number}`}
              </button>
            ))}
          </div>

          {episodes.length > 0 && (
            <>
              <div className="player-servers-label" style={{ marginBottom: 12 }}>Episodes</div>
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
                    title={ep.name}
                  >
                    E{ep.episode_number}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="player-servers-section" style={{ borderTop: "1px solid var(--border)" }}>
        {meta && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 6 }}>
              {meta.title || meta.name}
              {epBadge && <span style={{ color: "var(--accent)", marginLeft: 8 }}>{epBadge}</span>}
            </div>
            <div className="player-meta">
              {mediaType === "movie"
                ? `${(meta.release_date || "").slice(0, 4)} · ${meta.runtime ? `${Math.floor(meta.runtime / 60)}h ${meta.runtime % 60}m` : ""} · ⭐ ${meta.vote_average?.toFixed(1)}`
                : `${(meta.first_air_date || "").slice(0, 4)} · ⭐ ${meta.vote_average?.toFixed(1)}`
              }
            </div>
          </div>
        )}

        <div style={{
          padding: "14px 18px",
          background: "rgba(229,9,20,0.06)",
          border: "1px solid rgba(229,9,20,0.2)",
          borderRadius: 10, fontSize: "0.8rem", color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}>
          <strong style={{ color: "var(--accent)" }}>ℹ️ Note:</strong> Streams are sourced via
          third-party hosters. If a title doesn't play, switch servers above or refresh.
          Availability may vary by region.
        </div>
      </div>
    </div>
  );
}