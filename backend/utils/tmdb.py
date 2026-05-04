import os
from fastapi import HTTPException
import httpx

from dotenv import load_dotenv
load_dotenv()

TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_KEY = os.getenv("TMDB_API_KEY", "dd41c27d8ac583024d56ca6c34d506f6")
TMDB_IMG = "https://image.tmdb.org/t/p/w780"
TMDB_IMG_ORIGINAL = "https://image.tmdb.org/t/p/original"

VIDSRC_MOVIE = "https://vidsrc-embed.ru/embed/movie/{tmdb_id}"
VIDSRC_TV = "https://vidsrc-embed.ru/embed/tv/{tmdb_id}/{season}/{episode}"

# The shared client is injected at startup by app.py
_client: httpx.AsyncClient = None


def set_client(client: httpx.AsyncClient):
    """Called once during app lifespan startup."""
    global _client
    _client = client


async def tmdb_get(path: str, extra_params: dict = None) -> dict:
    params = {"api_key": TMDB_KEY, "language": "en-US"}
    if extra_params:
        params.update(extra_params)
    r = await _client.get(f"{TMDB_BASE}{path}", params=params)
    if r.status_code == 404:
        raise HTTPException(status_code=404, detail="Resource not found on TMDB")
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="TMDB API error")
    return r.json()


def format_movie(m: dict) -> dict:
    return {
        "id": m.get("id"),
        "title": m.get("title", ""),
        "overview": m.get("overview", ""),
        "release_date": m.get("release_date", ""),
        "vote_average": round(m.get("vote_average", 0), 1),
        "popularity": round(m.get("popularity", 0), 1),
        "poster_path": f"{TMDB_IMG}{m['poster_path']}" if m.get("poster_path") else None,
        "backdrop_path": f"{TMDB_IMG_ORIGINAL}{m['backdrop_path']}" if m.get("backdrop_path") else None,
        "genre_ids": m.get("genre_ids", []),
        "media_type": "movie",
    }


def format_tv(t: dict) -> dict:
    return {
        "id": t.get("id"),
        "title": t.get("name", ""),
        "overview": t.get("overview", ""),
        "release_date": t.get("first_air_date", ""),
        "vote_average": round(t.get("vote_average", 0), 1),
        "popularity": round(t.get("popularity", 0), 1),
        "poster_path": f"{TMDB_IMG}{t['poster_path']}" if t.get("poster_path") else None,
        "backdrop_path": f"{TMDB_IMG_ORIGINAL}{t['backdrop_path']}" if t.get("backdrop_path") else None,
        "genre_ids": t.get("genre_ids", []),
        "media_type": "tv",
    }
