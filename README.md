# 🎬 UniqueFlix

A full-stack movie & TV show streaming web application converted from an Android app.  
Built with **Python (Flask)** backend + **React** frontend, deployed on **Vercel**.

> demo link: (https://uniqflix.vercel.app/)

> **Streaming engine:** [cinezo.live](https://cinezo.live/) — free, no API key required.  
> **Metadata:** [TMDB (The Movie Database)](https://www.themoviedb.org/) — free API key required.

---

## 📋 Table of Contents

1. [What This App Does](#what-this-app-does)
2. [Project Structure](#project-structure)
3. [How It Works — Architecture](#how-it-works--architecture)
4. [Tech Stack](#tech-stack)
5. [Before You Begin — Get Your API Keys](#before-you-begin--get-your-api-keys)
6. [Local Development Setup](#local-development-setup)
7. [Deploy to Render — Step by Step](#deploy-to-render--step-by-step)
8. [Environment Variables Reference](#environment-variables-reference)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [How Streaming Works](#how-streaming-works)
11. [Troubleshooting](#troubleshooting)
12. [Feature Overview](#feature-overview)

---

## What This App Does

CineStream lets users:

- **Browse** trending, popular, now-playing movies and on-air TV shows
- **Search** for any movie or TV show by name
- **View details** — cast, genres, ratings, overview, similar titles
- **Watch** — full episodes and movies stream via an embedded player
- **Navigate seasons and episodes** for TV shows with a built-in episode selector

---

## Project Structure

```
cinestream/
├── backend/                   ← Python Flask API server
│   ├── app.py                 ← All API routes and TMDB calls
│   ├── requirements.txt       ← Python dependencies
│   └── .env.example           ← Copy to .env for local dev
│
├── frontend/                  ← React single-page application
│   ├── public/
│   │   └── index.html         ← HTML entry point
│   ├── src/
│   │   ├── App.js             ← Router setup
│   │   ├── index.js           ← React entry point
│   │   ├── index.css          ← Global styles (dark theme)
│   │   ├── components/
│   │   │   ├── Navbar.js      ← Sticky navigation with search
│   │   │   ├── Hero.js        ← Auto-rotating hero banner
│   │   │   └── MovieCard.js   ← Reusable card for movies/shows
│   │   ├── pages/
│   │   │   ├── Home.js        ← Homepage with all sections
│   │   │   ├── Movies.js      ← Movies listing (tabs + pagination)
│   │   │   ├── TVShows.js     ← TV listing (tabs + pagination)
│   │   │   ├── MovieDetail.js ← Movie detail + cast + similar
│   │   │   ├── TVDetail.js    ← TV detail + season/episode picker
│   │   │   ├── Player.js      ← Streaming player page (cinezo embed)
│   │   │   └── Search.js      ← Search results page
│   │   └── utils/
│   │       └── api.js         ← All axios API call functions
│   ├── package.json
│   └── .env.example
│
├── render.yaml                ← Render deployment blueprint
├── .gitignore
└── README.md
```

---

## How It Works — Architecture

```
User Browser
     │
     ▼
┌─────────────────────────────────────┐
│         React Frontend              │
│  (Render Static Site — free)        │
│                                     │
│  • Fetches metadata from Backend    │
│  • Renders movie cards, detail pages│
│  • Opens Player page for streaming  │
└──────────────┬──────────────────────┘
               │ HTTP requests to /api/*
               ▼
┌─────────────────────────────────────┐
│         Flask Backend               │
│  (Render Web Service — free)        │
│                                     │
│  • Calls TMDB API for metadata      │
│  • Returns stream embed URLs        │
│  • CORS-enabled for frontend        │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌────────────┐   ┌─────────────────────┐
│ TMDB API   │   │ cinezo.live           │
│ (metadata) │   │ (streaming player)  │
│ posters    │   │ free iframe embeds  │
│ cast, etc. │   │ no API key needed   │
└────────────┘   └─────────────────────┘
```

### Data flow explained

1. User opens CineStream → React fetches `/api/movies/trending` from Flask backend
2. Flask backend calls `https://api.themoviedb.org/3/trending/movie/week` using your TMDB key
3. TMDB returns JSON with movie metadata (titles, posters, ratings, IDs)
4. React renders the grid of movie cards
5. User clicks **Watch Now** → React calls `/api/movies/{id}/stream`
6. Flask returns a cinezo embed URL: `https://cinezo.live/embed/movie/{tmdb_id}`
7. React loads that URL inside an `<iframe>` — the movie plays directly in the browser

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend language | Python 3.11 | Clean, readable, great for API servers |
| Backend framework | Flask 3.0 | Lightweight, easy to deploy |
| WSGI server | Gunicorn | Production-grade, required by Render |
| CORS | flask-cors | Allows React frontend to call the Flask API |
| HTTP client | requests | Calls the TMDB API |
| Frontend | React 18 | Component-based, fast UI |
| Routing | React Router v6 | Client-side navigation |
| HTTP in React | axios | Clean API calls with interceptors |
| Styling | Custom CSS | Dark Netflix-inspired theme, no CSS framework needed |
| Metadata API | TMDB | Industry-standard movie/TV database, free tier |
| Streaming | cinezo.live | Free iframe-based streaming, no API key |
| Hosting | Render.com | Free tier supports both static + web services |

---

## API Endpoints Reference

All endpoints are served from the Flask backend.

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check if backend is running |

### Movies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies/trending` | Trending movies this week |
| GET | `/api/movies/popular?page=1` | Popular movies (paginated) |
| GET | `/api/movies/now-playing?page=1` | Movies in cinemas now |
| GET | `/api/movies/top-rated?page=1` | Highest rated movies |
| GET | `/api/movies/{id}` | Full detail: genres, cast, similar |
| GET | `/api/movies/{id}/stream` | Returns cinezo embed URL |
| GET | `/api/movies/search?q=batman&page=1` | Search movies by name |

### TV Shows

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tv/trending` | Trending shows this week |
| GET | `/api/tv/popular?page=1` | Popular TV shows |
| GET | `/api/tv/on-air?page=1` | Currently airing shows |
| GET | `/api/tv/{id}` | Full detail: genres, cast, seasons |
| GET | `/api/tv/{id}/season/{n}` | Episodes for a specific season |
| GET | `/api/tv/{id}/stream?season=1&episode=1` | Returns cinezo embed URL |
| GET | `/api/tv/search?q=breaking+bad` | Search shows by name |

### Combined Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=inception` | Search both movies and TV shows |

### Example response — `/api/movies/1/stream`

```json
{
  "embed_url": "https://cinezo.live/embed/movie/27205",
  "tmdb_id": 27205
}
```

The frontend puts this `embed_url` directly into an `<iframe src="...">`.

---

## How Streaming Works

### Why not YouTube?

The original Android app used TMDB's `/videos` endpoint which returns YouTube trailer keys (e.g. `dQw4w9WgXcQ`), then played them via the YouTube API. This only plays **trailers** — not the actual film.

### cinezo.live — the replacement

cinezo is a free streaming aggregator that indexes content from various third-party hosters. It provides a clean iframe embed URL format:

```
Movies:   https://cinezo.live/embed/movie/{tmdb_id}
TV Shows: https://cinezo.live/embed/tv/{tmdb_id}/{season}/{episode}
```

How the backend generates these (from `app.py`):

```python
CINEZO_MOVIE = "https://cinezo.live/embed/movie/{tmdb_id}"
CINEZO_TV    = "https://cinezo.live/embed/tv/{tmdb_id}/{season}/{episode}"

@app.route("/api/movies/<int:movie_id>/stream")
def movie_stream(movie_id):
    url = CINEZO_MOVIE.format(tmdb_id=movie_id)
    return jsonify({"embed_url": url})
```

How the frontend embeds it (from `Player.js`):

```jsx
<iframe
  src={embedUrl}
  allowFullScreen
  allow="autoplay; fullscreen"
  referrerPolicy="origin"
/>
```

### Important notes about cinezo

- **Not every title is available** — popular titles (Marvel, popular Netflix shows) are almost always available. Obscure films may not be.
- **Availability is regional** — some titles may be blocked in certain countries
- **No API key or account needed** — the URL works as long as cinezo has the content indexed
- **Alternative embed services** (if cinezo is down): You can swap the `CINEZO_MOVIE` and `CINEZO_TV` URLs in `app.py` to any other embed service like `https://2embed.cc/embed/{tmdb_id}` or `https://cinezo.me/embed/movie/{tmdb_id}`

---

## Troubleshooting

### Backend issues

**Problem:** `{"error": "Internal server error"}` on all requests  
**Fix:** Check that `TMDB_API_KEY` is correctly set in your Render environment variables. Test: `GET /api/health` should return `"tmdb_key_set": true`

**Problem:** Backend shows `503 Service Unavailable`  
**Fix:** The free Render service is still waking up. Wait 30–60 seconds and refresh.

**Problem:** `CORS error` in browser console  
**Fix:** Your backend's `CORS_ORIGINS` doesn't match your frontend URL. Update it in Render's environment variables for the backend service.

---

### Frontend issues

**Problem:** Blank white page after loading  
**Fix:** Open browser DevTools (F12) → Console tab. If you see `REACT_APP_API_URL is undefined`, you forgot to set the environment variable in Render before building. Go to Render → Static Site → Environment → add `REACT_APP_API_URL` → **Manual Deploy** → **Deploy Latest Commit**.

**Problem:** Movies load but "Watch Now" shows an empty iframe  
**Fix:** cinezo may not have this title indexed yet. Try another popular movie (e.g. Avengers, Inception). If many titles fail, check that the `embed_url` returned by `/api/movies/{id}/stream` is a valid cinezo URL.

**Problem:** Page refreshes give 404  
**Fix:** Make sure the Render Static Site has a Rewrite rule: `/* → /index.html`. This is essential for React Router.

---

### Local development issues

**Problem:** `ModuleNotFoundError: No module named 'flask'`  
**Fix:** Your virtual environment isn't activated. Run `source venv/bin/activate` (macOS/Linux) or `venv\Scripts\activate` (Windows).

**Problem:** `npm install` fails with peer dependency errors  
**Fix:** Run `npm install --legacy-peer-deps`

**Problem:** Frontend can't connect to backend  
**Fix:** Make sure `frontend/.env.local` has `REACT_APP_API_URL=http://localhost:5000` and the backend is running on port 5000.

---

## Feature Overview

| Feature | Status | Notes |
|---------|--------|-------|
| Trending movies homepage | ✅ | Auto-rotating hero + grid |
| Now Playing / Popular / Top Rated | ✅ | Tab switcher with pagination |
| TV Show listing (Popular / On Air) | ✅ | Same tab UI |
| Movie detail page | ✅ | Poster, cast, genres, similar |
| TV detail page | ✅ | Seasons, episode list, cast |
| Movie streaming | ✅ | cinezo iframe embed |
| TV episode streaming | ✅ | Season + episode selector |
| Global search | ✅ | Searches both movies and TV |
| Responsive design | ✅ | Works on mobile and desktop |
| Dark theme | ✅ | Netflix-inspired |
| Favourites | 🔜 | Can be added with localStorage |
| User accounts | ✅| In SQLite database |

---

## Credits

- **TMDB** — Movie and TV metadata ([themoviedb.org](https://www.themoviedb.org))
- **cinezo** — Streaming embeds ([cinezo.live](https://cinezo.live))

---

*Built with ❤️ — Python + React + Vercel*
