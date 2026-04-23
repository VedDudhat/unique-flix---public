import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiSearch, FiX, FiLogOut, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout }             = useAuth();
  const [scrolled, setScrolled]      = useState(false);
  const [showSearch, setShowSearch]  = useState(false);
  const [showMenu, setShowMenu]      = useState(false);
  const [query, setQuery]            = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [showMenu]);

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

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
      <Link to="/" className="navbar-logo">Unique<span>Flix</span></Link>

      <ul className="navbar-links">
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/movies">Movies</NavLink></li>
        <li><NavLink to="/tv">TV Shows</NavLink></li>
      </ul>

      <div className="navbar-right">
        {/* Search */}
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

        {/* User menu */}
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