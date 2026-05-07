from fastapi import APIRouter, Query, Depends
from backend.schemas.media import MediaListResponse, StreamResponse
from backend.auth import get_current_user
from backend.models.user import User
from backend.utils.tmdb import CINEZO_MOVIE

router = APIRouter(prefix="/api/movies", tags=["Movies"])

# The TMDB helper and formatters are imported from a shared utility module
# so routes stay thin and readable.
from backend.utils.tmdb import tmdb_get, format_movie


# now plying
@router.get("/now-playing", response_model=MediaListResponse, summary="Movies currently in cinemas",
            )
async def movies_now_playing(
        page: int = Query(1, ge=1, le=500),
        _: User = Depends(get_current_user),
):
    data = await tmdb_get("/movie/now_playing", {"page": page})
    return {
        "results": [format_movie(m) for m in data.get("results", [])],
        "total_pages": data.get("total_pages", 1),
        "page": data.get("page", 1),
    }


# poplar movies
@router.get("/popular", response_model=MediaListResponse, summary="Popular movies",
            )
async def movies_popular(
        page: int = Query(1, ge=1, le=500),
        _: User = Depends(get_current_user),
):
    data = await tmdb_get("/discover/movie", {"page": page, "sort_by": "popularity.desc"})
    return {
        "results": [format_movie(m) for m in data.get("results", [])],
        "total_pages": data.get("total_pages", 1),
        "page": data.get("page", 1),
    }


# top rated movies
@router.get("/top-rated", response_model=MediaListResponse, summary="Highest rated movies",
            )
async def movies_top_rated(
        page: int = Query(1, ge=1, le=500),
        _: User = Depends(get_current_user),
):
    data = await tmdb_get("/movie/top_rated", {"page": page})
    return {
        "results": [format_movie(m) for m in data.get("results", [])],
        "total_pages": data.get("total_pages", 1),
        "page": data.get("page", 1),
    }


# trending movies
@router.get("/trending", summary="Trending movies this week",
            )
async def movies_trending(_: User = Depends(get_current_user)):
    data = await tmdb_get("/trending/movie/week")
    return {"results": [format_movie(m) for m in data.get("results", [])]}


# search movies
@router.get("/search", response_model=MediaListResponse, summary="Search movies by title",
            )
async def search_movies(
        q: str = Query(..., min_length=1, description="Search query"),
        page: int = Query(1, ge=1),
        _: User = Depends(get_current_user),
):
    data = await tmdb_get("/search/movie", {"query": q, "page": page})
    return {
        "results": [format_movie(m) for m in data.get("results", [])],
        "total_pages": data.get("total_pages", 1),
        "page": data.get("page", 1),
    }


# stream movie using vidsrc
@router.get("/{movie_id}/stream", response_model=StreamResponse, summary="Get VidSrc embed URL for a movie",
            )
async def movie_stream(
        movie_id: int,
        _: User = Depends(get_current_user),
):
    """Returns the VidSrc iframe embed URL — no extra API key needed."""

    return {"embed_url": CINEZO_MOVIE.format(tmdbId=movie_id), "tmdbId": movie_id}


# movies details
@router.get("/{movie_id}",summary="Full movie detail — cast, genres, similar titles",
            )
async def movie_detail(
        movie_id: int,
        _: User = Depends(get_current_user),
):
    from backend.utils.tmdb import TMDB_IMG
    data = await tmdb_get(f"/movie/{movie_id}", {"append_to_response": "credits,similar"})
    result = format_movie(data)
    result["runtime"] = data.get("runtime")
    result["genres"] = [g["name"] for g in data.get("genres", [])]
    result["tagline"] = data.get("tagline", "")
    result["status"] = data.get("status", "")
    result["budget"] = data.get("budget", 0)
    result["revenue"] = data.get("revenue", 0)
    cast = data.get("credits", {}).get("cast", [])[:10]
    result["cast"] = [
        {
            "name": c["name"],
            "character": c["character"],
            "profile": f"{TMDB_IMG}{c['profile_path']}" if c.get("profile_path") else None,
        }
        for c in cast
    ]
    result["similar"] = [format_movie(m) for m in data.get("similar", {}).get("results", [])[:8]]
    return result