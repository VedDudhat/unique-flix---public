import os
from contextlib import asynccontextmanager

import httpx
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse

load_dotenv()

from backend.models.user import User
from backend.models.token import TokenRecord
from backend.database.database import engine
from backend.database.database import Base
import backend.utils.tmdb as tmdb_utils

from routes import auth_router, movie_router, search_router, tv_router
from schemas.media import HealthResponse


# database init & bind
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    client = httpx.AsyncClient(timeout=10)
    tmdb_utils.set_client(client)
    yield
    await client.aclose()


# app
app = FastAPI(title="UniqueFlix API", description=(
    "Movie & TV show streaming website"
),
              version="2.0.0",
              lifespan=lifespan,
              )

# cors
cors_origins = os.getenv("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routes
app.include_router(auth_router)
app.include_router(movie_router)
app.include_router(tv_router)
app.include_router(search_router)


# root end point
@app.get("/")
def root():
    return RedirectResponse(url="/register")


# health check
@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health():
    tmdb_key = os.getenv("TMDB_API_KEY", "")
    return {"status": "ok", "tmdb_key_set": bool(tmdb_key)}


# main
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("backend.app:app", host=host, port=port, reload=True)
