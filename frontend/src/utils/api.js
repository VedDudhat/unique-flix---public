import axios from "axios";
import { getToken, clearAuth } from "./auth";

const BASE_URL = process.env.REACT_APP_API_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Request interceptor — attach JWT to every call
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints (public — no token required)
export const register = (data) =>
  api.post("/api/auth/register", data).then((r) => r.data);

export const login = (data) =>
  api.post("/api/auth/login", data).then((r) => r.data);

export const logout = () =>
  api.post("/api/auth/logout").then((r) => r.data);

export const getMe = () =>
  api.get("/api/auth/me").then((r) => r.data);

// Movies
export const getMoviesNowPlaying = (page = 1) =>
  api.get(`/api/movies/now-playing?page=${page}`).then((r) => r.data);

export const getMoviesPopular = (page = 1) =>
  api.get(`/api/movies/popular?page=${page}`).then((r) => r.data);

export const getMoviesTopRated = (page = 1) =>
  api.get(`/api/movies/top-rated?page=${page}`).then((r) => r.data);

export const getMoviesTrending = () =>
  api.get(`/api/movies/trending`).then((r) => r.data);

export const getMovieDetail = (id) =>
  api.get(`/api/movies/${id}`).then((r) => r.data);

export const getMovieStream = (id) =>
  api.get(`/api/movies/${id}/stream`).then((r) => r.data);

export const searchMovies = (q, page = 1) =>
  api.get(`/api/movies/search?q=${encodeURIComponent(q)}&page=${page}`).then((r) => r.data);

// TV Shows
export const getTVOnAir = (page = 1) =>
  api.get(`/api/tv-shows/on-air?page=${page}`).then((r) => r.data);

export const getTVPopular = (page = 1) =>
  api.get(`/api/tv-shows/popular?page=${page}`).then((r) => r.data);

export const getTVTrending = () =>
  api.get(`/api/tv-shows/trending`).then((r) => r.data);

export const getTVDetail = (id) =>
  api.get(`/api/tv-shows/${id}`).then((r) => r.data);

export const getTVSeason = (id, season) =>
  api.get(`/api/tv-shows/${id}/season/${season}`).then((r) => r.data);

export const getTVStream = (id, season = 1, episode = 1) =>
  api.get(`/api/tv-shows/${id}/stream?season=${season}&episode=${episode}`).then((r) => r.data);

export const searchTV = (q, page = 1) =>
  api.get(`/api/tv-shows/search?q=${encodeURIComponent(q)}&page=${page}`).then((r) => r.data);

// Combined search
export const searchAll = (q, page = 1) =>
  api.get(`/api/search?q=${encodeURIComponent(q)}&page=${page}`).then((r) => r.data);

export default api;