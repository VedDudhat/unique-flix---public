import asyncio
import os
from fastapi import HTTPException
import httpx

from dotenv import load_dotenv
load_dotenv()

TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_KEY = os.getenv("TMDB_API_KEY", "dd41c27d8ac583024d56ca6c34d506f6")
TMDB_IMG = "https://image.tmdb.org/t/p/w780"
TMDB_IMG_ORIGINAL = "https://image.tmdb.org/t/p/original"

VIDLINK_MOVIE = "https://vidlink.pro/movie/{tmdbId}"
VIDLINK_TV = "https://vidlink.pro/tv/{tmdbId}/{season}/{episode}"
VIDLINK_ANIME = "https://vidlink.pro/anime/{MALid}/{number}/{subOrDub}"

# The shared client is injected at startup by app.py
_client: httpx.AsyncClient = None


def set_client(client: httpx.AsyncClient):
    """Called once during app lifespan startup."""
    global _client
    _client = client


import httpx
from fastapi import HTTPException

async def tmdb_get(path:str, extra_params:dict=None):

    if _client is None:
        raise HTTPException(
            status_code=500,
            detail="TMDB client not initialized"
        )

    params = {
        "api_key": TMDB_KEY,
        "language":"en-US"
    }

    if extra_params:
        params.update(extra_params)

    url = f"{TMDB_BASE}{path}"

    retries = 3

    for attempt in range(retries):
        try:
            r = await _client.get(
                url,
                params=params,
            )
            r.raise_for_status()

            return r.json()

        except (
            httpx.ConnectError,
            httpx.ReadTimeout,
            httpx.RemoteProtocolError,
        ) as e:

            if attempt == retries - 1:
                raise HTTPException(
                    status_code=503,
                    detail=f"TMDB unavailable: {type(e).__name__}"
                )

            await asyncio.sleep(1)

        except httpx.HTTPStatusError as e:

            raise HTTPException(
                status_code=e.response.status_code,
                detail=e.response.text
            )

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