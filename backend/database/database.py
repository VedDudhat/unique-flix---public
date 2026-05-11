from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker,declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./uniqueflix.db")

engine = create_async_engine(
    DATABASE_URL,
    # connect_args is required for SQLite so multiple threads can share one connection
    echo=True,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
Base = declarative_base()


def get_db():
    """
    FastAPI dependency — yields a DB session and always closes it after the
    request, even if an exception is raised.
    """
    db = AsyncSessionLocal()
    try:
        yield db
    finally:
        db.close()
