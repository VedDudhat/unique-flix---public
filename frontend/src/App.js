import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Home        from "./pages/Home";
import Movies      from "./pages/Movies";
import TVShows     from "./pages/TVShows";
import Search      from "./pages/Search";
import MovieDetail from "./pages/MovieDetail";
import TVDetail    from "./pages/TVDetail";
import Player      from "./pages/Player";

import "./index.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#1a1a2e", color: "#fff", border: "1px solid #e50914" },
          }}
        />

        <Routes>
          {/* ── Public routes (no JWT needed) ──────────────────────────── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register"    element={<Register />} />

          {/* ── Protected routes (JWT required) ────────────────────────── */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/"                  element={<Home />} />
                    <Route path="/movies"            element={<Movies />} />
                    <Route path="/tv"                element={<TVShows />} />
                    <Route path="/search"            element={<Search />} />
                    <Route path="/movie/:id"         element={<MovieDetail />} />
                    <Route path="/tv/:id"            element={<TVDetail />} />
                    <Route path="/watch/movie/:id"   element={<Player mediaType="movie" />} />
                    <Route path="/watch/tv/:id"      element={<Player mediaType="tv" />} />
                    {/* Catch-all inside protected area */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Analytics />
      </BrowserRouter>
    </AuthProvider>
  );
}