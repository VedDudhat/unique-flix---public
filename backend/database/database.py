from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker,declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://neondb_owner:npg_DV24dMgJqzaR@ep-icy-dew-ao8xhqbu-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?ssl=require")

engine = create_async_engine(
    DATABASE_URL,
    # connect_args is required for SQLite so multiple threads can share one connection
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_pre_ping=True,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
Base = declarative_base()


async def get_db():
    """
    FastAPI dependency — yields a DB session and always closes it after the
    request, even if an exception is raised.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
