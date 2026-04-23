from pydantic import BaseModel
from typing import Optional, List


# cast of movie or series
class CastMember(BaseModel):
    name: str
    character: str
    profile: Optional[str]


# season information
class SeasonInfo(BaseModel):
    season_number: int
    name: str
    episode_count: int
    poster: Optional[str]


# episode information
class EpisodeInfo(BaseModel):
    episode_number: int
    name: str
    overview: str
    air_date: str
    still: Optional[str]
    runtime: Optional[int]


# media items
class MediaItem(BaseModel):
    id: int
    title: str
    overview: str
    release_date: str
    vote_average: float
    popularity: float
    poster_path: Optional[str]
    backdrop_path: Optional[str]
    genre_ids: List[int]
    media_type: str


# media list response
class MediaListResponse(BaseModel):
    results: List[MediaItem]
    total_pages: int
    page: int


# stream response
class StreamResponse(BaseModel):
    embed_url: str
    tmdb_id: int
    season: Optional[int] = None
    episode: Optional[int] = None


# season response
class SeasonResponse(BaseModel):
    season_number: int
    episodes: List[EpisodeInfo]


# health check
class HealthResponse(BaseModel):
    status: str
    tmdb_key_set: bool