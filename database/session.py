from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from config import get_settings

# Initialised to None at import time; replaced in the FastAPI lifespan.
# get_db() reads this at call time, so startup order is safe.
AsyncSessionLocal: async_sessionmaker[AsyncSession] | None = None


def get_db_url() -> str:
    s = get_settings()
    ssl = f"?ssl={s.db_ssl_mode}" if s.db_ssl_mode != "disable" else ""
    return f"postgresql+asyncpg://{s.db_user}:{s.db_password}@{s.db_host}:{s.db_port}/{s.db_name}{ssl}"


def create_engine() -> AsyncEngine:
    return create_async_engine(
        get_db_url(),
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
    )


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    assert AsyncSessionLocal is not None, "Database session not initialised"
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
