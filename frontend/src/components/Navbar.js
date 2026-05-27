import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiSearch, FiX, FiLogOut, FiUser, FiChevronDown } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const GENRES = [
  { name: "Action",      movieId: 28,    tvId: 10759 },
  { name: "Adventure",   movieId: 12,    tvId: 10759 },
  { name: "Animation",   movieId: 16,    tvId: 16 },
  { name: "Comedy",      movieId: 35,    tvId: 35 },
  { name: "Crime",       movieId: 80,    tvId: 80 },
  { name: "Documentary", movieId: 99,    tvId: 99 },
  { name: "Drama",       movieId: 18,    tvId: 18 },
  { name: "Family",      movieId: 10751, tvId: 10751 },
  { name: "Fantasy",     movieId: 14,    tvId: 10765 },
  { name: "History",     movieId: 36,    tvId: 36 },
  { name: "Horror",      movieId: 27,    tvId: 9648 },
  { name: "Music",       movieId: 10402, tvId: 10402 },
  { name: "Mystery",     movieId: 9648,  tvId: 9648 },
  { name: "Romance",     movieId: 10749, tvId: 10749 },
  { name: "Sci-Fi",      movieId: 878,   tvId: 10765 },
  { name: "Thriller",    movieId: 53,    tvId: 9648 },
  { name: "War",         movieId: 10752, tvId: 10768 },
  { name: "Western",     movieId: 37,    tvId: 37 },
];

export default function Navbar() {
  const { user, logout }            = useAuth();
  const [scrolled, setScrolled]     = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu,   setShowMenu]   = useState(false);
  const [showGenres, setShowGenres] = useState(false);
  const [query,      setQuery]      = useState("");
  const navigate  = useNavigate();
  const genreRef  = useRef(null);

  /* scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close user menu on outside click */
  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [showMenu]);

  /* close genre dropdown on outside click */
  useEffect(() => {
    if (!showGenres) return;
    const close = (e) => {
      if (genreRef.current && !genreRef.current.contains(e.target)) {
        setShowGenres(false);
      }
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [showGenres]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSearch(false);
      setQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  const handleGenreSelect = (genre) => {
    setShowGenres(false);
    navigate(
        `/genre?movieId=${genre.movieId}&tvId=${genre.tvId}&name=${encodeURIComponent(genre.name)}`
    )
  };

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
      <Link to="/" className="navbar-logo">Unique<span>Flix</span></Link>

      <ul className="navbar-links">
        <li><NavLink to="/" end>Home</NavLink></li>
        {/* Movies link — goes to /movies which only shows movies */}
        <li><NavLink to="/movies">Movies</NavLink></li>
        {/* TV Shows link — goes to /tv which only shows TV series */}
        <li><NavLink to="/tv">TV Shows</NavLink></li>

        {/* ── Genres dropdown ── */}
        <li ref={genreRef} style={{ position: "relative" }}>
          <button
            className={`genre-nav-btn${showGenres ? " open" : ""}`}
            onClick={(e) => { e.stopPropagation(); setShowGenres((v) => !v); }}
          >
            Genres <FiChevronDown size={13} style={{ marginLeft: 4 }} />
          </button>

          {showGenres && (
            <div className="genre-dropdown">
              <div className="genre-dropdown-inner">
                {GENRES.map((g) => (
                  <button
                    key={g.id}
                    className="genre-dropdown-item"
                    onClick={() => handleGenreSelect(g)}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </li>
      </ul>

      <div className="navbar-right">
        {/* ── Search ── */}
        {showSearch ? (
          <form className="search-bar" onSubmit={handleSearch}>
            <FiSearch className="search-icon" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, shows..."
            />
            <button
              type="button"
              className="search-toggle"
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
              onClick={() => setShowSearch(false)}
            >
              <FiX />
            </button>
          </form>
        ) : (
          <button className="search-toggle" onClick={() => setShowSearch(true)}>
            <FiSearch />
          </button>
        )}

        {/* ── User menu ── */}
        {user && (
          <div
            className="user-menu-wrap"
            onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
          >
            <button className="user-avatar-btn">
              <FiUser size={14} />
              <span className="user-avatar-name">{user.username}</span>
            </button>

            {showMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{user.username}</div>
                  <div className="user-dropdown-email">{user.email}</div>
                </div>

                {/* ── Profile link (uses getMe internally) ── */}
                <Link
                  to="/profile"
                  className="user-dropdown-item"
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <FiUser size={14} style={{ marginRight: 8 }} />
                  My Profile
                </Link>

                <button className="user-dropdown-item logout" onClick={handleLogout}>
                  <FiLogOut size={14} style={{ marginRight: 8 }} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}