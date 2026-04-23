from fastapi import APIRouter, Query, Depends
from backend.schemas.media import MediaListResponse, StreamResponse, SeasonResponse
from backend.auth import get_current_user
from backend.models.user import User
from backend.utils.tmdb import tmdb_get, format_tv, TMDB_IMG, VIDSRC_TV

router = APIRouter(prefix="/api/tv-shows", tags=["TV-SHOWS"])


# current TV shows
@router.get("/on-air", response_model=MediaListResponse, summary="TV shows currently airing",
            )
async def tv_on_air(
        page: int = Query(1, ge=1, le=500),
        _: User = Depends(get_current_user),
):
    data = await tmdb_get("/tv/on_the_air", {"page": page})
    return {
        "results": [format_tv(t) for t in data.get("results", [])],
        "total_pages": data.get("total_pages", 1),
        "page": data.get("page", 1),
    }


# popular TV shows
@router.get("/popular", response_model=MediaListResponse, summary="Popular TV shows",
            )
async def tv_popular(
        page: int = Query(1, ge=1, le=500),
        _: User = Depends(get_current_user),
):
    data = await tmdb_get("/discover/tv", {"page": page, "sort_by": "popularity.desc"})
    return {
        "results": [format_tv(t) for t in data.get("results", [])],
        "total_pages": data.get("total_pages", 1),
        "page": data.get("page", 1),
    }


# trending TV shows
@router.get("/trending", summary="Trending TV shows this week",
            )
async def tv_trending(_: User = Depends(get_current_user)):
    data = await tmdb_get("/trending/tv/week")
    return {"results": [format_tv(t) for t in data.get("results", [])]}


# search TV shows
@router.get("/search", response_model=MediaListResponse, summary="Search TV shows by name",
            )
async def search_tv(
        q: str = Query(..., min_length=1, description="Search query"),
        page: int = Query(1, ge=1),
        _: User = Depends(get_current_user),
):
    data = await tmdb_get("/search/tv", {"query": q, "page": page})
    return {
        "results": [format_tv(t) for t in data.get("results", [])],
        "total_pages": data.get("total_pages", 1),
        "page": data.get("page", 1),
    }

# episode list of season
@router.get("/{tv_id}/season/{season_num}", response_model=SeasonResponse, summary="Episode list for a specific season",
            )
async def tv_season(
        tv_id: int,
        season_num: int,
        _: User = Depends(get_current_user),
):
    data = await tmdb_get(f"/tv/{tv_id}/season/{season_num}")
    episodes = [
        {
            "episode_number": e.get("episode_number"),
            "name": e.get("name", ""),
            "overview": e.get("overview", ""),
            "air_date": e.get("air_date", ""),
            "still": f"{TMDB_IMG}{e['still_path']}" if e.get("still_path") else None,
            "runtime": e.get("runtime"),
        }
        for e in data.get("episodes", [])
    ]
    return {"season_number": season_num, "episodes": episodes}


# vidsrc url for TV show
@router.get("/{tv_id}/stream", response_model=StreamResponse, summary="Get VidSrc embed URL for a TV episode",
            )
async def tv_stream(
        tv_id: int,
        season: int = Query(1, ge=1),
        episode: int = Query(1, ge=1),
        _: User = Depends(get_current_user),
):
    """Returns the VidSrc iframe embed URL for a specific season + episode."""
    url = VIDSRC_TV.format(tmdb_id=tv_id, season=season, episode=episode)
    return {"embed_url": url, "tmdb_id": tv_id, "season": season, "episode": episode}


# TV show detail
@router.get("/{tv_id}", summary="Full TV show detail — seasons, cast, similar shows",
            )
async def tv_detail(
        tv_id: int,
        _: User = Depends(get_current_user),
):
    data = await tmdb_get(f"/tv/{tv_id}", {"append_to_response": "credits,similar"})
    result = format_tv(data)
    result["genres"] = [g["name"] for g in data.get("genres", [])]
    result["tagline"] = data.get("tagline", "")
    result["status"] = data.get("status", "")
    result["number_of_seasons"] = data.get("number_of_seasons", 1)
    result["number_of_episodes"] = data.get("number_of_episodes", 0)
    result["seasons"] = [
        {
            "season_number": s["season_number"],
            "name": s.get("name", f"Season {s['season_number']}"),
            "episode_count": s.get("episode_count", 0),
            "poster": f"{TMDB_IMG}{s['poster_path']}" if s.get("poster_path") else None,
        }
        for s in data.get("seasons", [])
        if s.get("season_number", 0) > 0
    ]
    cast = data.get("credits", {}).get("cast", [])[:10]
    result["cast"] = [
        {
            "name": c["name"],
            "character": c["character"],
            "profile": f"{TMDB_IMG}{c['profile_path']}" if c.get("profile_path") else None,
        }
        for c in cast
    ]
    result["similar"] = [format_tv(t) for t in data.get("similar", {}).get("results", [])[:8]]
    return result