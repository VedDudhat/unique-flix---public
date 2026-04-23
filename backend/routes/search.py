from fastapi import APIRouter, Query, Depends
from backend.schemas.media import MediaListResponse
from backend.auth import get_current_user
from backend.models.user import User
from backend.utils.tmdb import tmdb_get, format_movie, format_tv

router = APIRouter(prefix="/api", tags=["Search & Genres"])


# search movies and TV shows
@router.get("/search", response_model=MediaListResponse, summary="Search movies AND TV shows simultaneously",
            )
async def search_all(
        q: str = Query(..., min_length=1, description="Search term"),
        page: int = Query(1, ge=1),
        _: User = Depends(get_current_user),
):
    data = await tmdb_get("/search/multi", {"query": q, "page": page})
    results = []
    for item in data.get("results", []):
        if item.get("media_type") == "movie":
            results.append(format_movie(item))
        elif item.get("media_type") == "tv":
            results.append(format_tv(item))
    return {
        "results": results,
        "total_pages": data.get("total_pages", 1),
        "page": data.get("page", 1),
    }

# list movies
@router.get("/genres/movies", summary="List all movie genre IDs and names",
            )
async def movie_genres(_: User = Depends(get_current_user)):
    data = await tmdb_get("/genre/movie/list")
    return data.get("genres", [])


# list TV shows
@router.get("/genres/tv-shows", summary="List all TV genre IDs and names",
            )
async def tv_genres(_: User = Depends(get_current_user)):
    data = await tmdb_get("/genre/tv/list")
    return data.get("genres", [])