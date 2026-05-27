import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import MovieCard from "../components/MovieCard";
import {
  getMoviesTrending,
  getMoviesNowPlaying,
  getMoviesTopRated,
  getTVTrending,
  getTVOnAir,
} from "../utils/api";

function Section({ title, items, viewAllTo }) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          {viewAllTo && <Link to={viewAllTo} className="view-all">View All →</Link>}
        </div>
        <div className="grid">
          {items.map((item) => (
            <MovieCard key={`${item.media_type}-${item.id}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [tvTrending, setTvTrending] = useState([]);
  const [tvOnAir, setTvOnAir] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMoviesTrending(),
      getMoviesNowPlaying(),
      getMoviesTopRated(),
      getTVTrending(),
      getTVOnAir(),
    ]).then(([mt, mnp, mtr, tvt, tvo]) => {
      setTrending(mt.results || []);
      setNowPlaying(mnp.results || []);
      setTopRated(mtr.results || []);
      setTvTrending(tvt.results || []);
      setTvOnAir(tvo.results || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="spinner-wrap" style={{ minHeight: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  const heroItems = [
    ...trending.slice(0, 3),
    ...tvTrending.slice(0, 3),
  ];

  return (
    <main>
      <Hero items={heroItems} />
      <Section title="Trending Movies" items={trending.slice(0, 12)} viewAllTo="/movies" />
      <Section title="Now Playing" items={nowPlaying.slice(0, 12)} viewAllTo="/movies?tab=now-playing" />
      <Section title="Top Rated Movies" items={topRated.slice(0, 12)} viewAllTo="/movies?tab=top-rated" />
      <Section title="Trending TV Shows" items={tvTrending.slice(0, 12)} viewAllTo="/tv" />
      <Section title="Currently Airing" items={tvOnAir.slice(0, 12)} viewAllTo="/tv?tab=on-air" />
    </main>
  );
}

