import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { getMoviesByGenre, getTVByGenre } from "../utils/api";

const SECTIONS = [
  { key: "latest_movies",  label: "Latest Movies",   type: "movie", sort: "release_date.desc" },
  { key: "best_movies",    label: "Best Movies",     type: "movie", sort: "vote_average.desc"  },
  { key: "latest_tv",      label: "Latest TV Shows", type: "tv",    sort: "first_air_date.desc" },
  { key: "best_tv",        label: "Best TV Shows",   type: "tv",    sort: "vote_average.desc"  },
];

export default function Genre() {
  const [searchParams] = useSearchParams();
  const movieGenreId = searchParams.get("movieId");
  const tvGenreId = searchParams.get("tvId");
  const genreName = searchParams.get("name") || "Genre";

  const [data,    setData]    = useState({});
  const [loading, setLoading] = useState(true);
  const [pages,   setPages]   = useState({ latest_movies: 1, best_movies: 1, latest_tv: 1, best_tv: 1 });
  const [totals,  setTotals]  = useState({});

  const fetchSection = async (type, sort, page) => {
    try {
      const genreId =
        type === "movie"
          ? movieGenreId
          : tvGenreId;

      const res =
        type === "movie"
          ? await getMoviesByGenre(genreId, sort, page)
          : await getTVByGenre(genreId, sort, page);
      return { results: res.results || [], total_pages: res.total_pages || 1 };
    }
    catch (err)
    {
       console.error(err);

       return {
        results: [],
        total_pages: 1
      };
    }
  };

   useEffect(() => {
    setLoading(true);

    const load = async () => {

      const results = await Promise.all(
        SECTIONS.map(s =>
          fetchSection(s.type, s.sort, 1)
        )
      );

      const newData = {};
      const newTotals = {};

      SECTIONS.forEach((s, i) => {
        newData[s.key] = results[i].results;
        newTotals[s.key] = results[i].total_pages;
      });

      setData(newData);
      setTotals(newTotals);
      setLoading(false);
    };

    load();

    }, [movieGenreId, tvGenreId]);

  const loadMore = async (sectionKey) => {

    const sec = SECTIONS.find(
      s => s.key === sectionKey
    );

    const nextPage =
      pages[sectionKey] + 1;

    const res =
      await fetchSection(
        sec.type,
        sec.sort,
        nextPage
      );

    setData(prev => ({
      ...prev,
      [sectionKey]: [
        ...(prev[sectionKey] || []),
        ...res.results
      ]
    }));

    setPages(prev => ({
      ...prev,
      [sectionKey]: nextPage
    }));
  };

  return (
    <div className="genre-page">
      <div className="genre-page-header">
        <div className="container">
          <div className="genre-page-breadcrumb">
            Browse · Genres
          </div>
          <h1 className="genre-page-title">
            {genreName}
          </h1>
        </div>
      </div>

      <div className="container">

        {loading ? (
          <p>Loading...</p>
        ) : (

          SECTIONS.map(sec => {

            const items =
              data[sec.key] || [];

            if (!items.length)
              return null;

            return (
              <section
                  key={sec.key} className="genre-section"
              >
                <h2>{sec.label}</h2>

                <div className="cards-grid">
                  {items.map(item => (

                    <MovieCard
                      key={item.id}
                      item={{
                        ...item,
                        media_type: sec.type
                      }}
                    />
                  ))}
                </div>

                {pages[sec.key] <
                  totals[sec.key] && (

                  <button onClick={() => loadMore(sec.key)}>
                    Load More
                  </button>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}