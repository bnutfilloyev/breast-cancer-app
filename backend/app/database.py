"""Database configuration and session management."""

from __future__ import annotations

import os
from contextlib import asynccontextmanager, contextmanager
from typing import AsyncGenerator, Generator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlmodel import Session, SQLModel, create_engine

from .config import get_settings

settings = get_settings()

# Async engine for production (PostgreSQL)
async_engine = create_async_engine(
    settings.database_url,
    echo=settings.database_echo,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Sync engine for migrations and scripts
sync_database_url = settings.database_url.replace("+asyncpg", "").replace("postgresql://", "postgresql+psycopg2://")
sync_engine = create_engine(
    sync_database_url,
    echo=settings.database_echo,
    pool_pre_ping=True,
)


async def init_db() -> None:
    """Create database tables if they do not exist."""
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides an async SQLModel session."""
    async with AsyncSession(async_engine) as session:
        yield session


def get_session() -> Generator[Session, None, None]:
    """Dependency that provides a sync SQLModel session (for backwards compatibility)."""
    with Session(sync_engine) as session:
        yield session


@contextmanager
def session_scope() -> Generator[Session, None, None]:
    """Provide a transactional scope for scripts or background tasks."""
    with Session(sync_engine) as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise


@asynccontextmanager
async def async_session_scope() -> AsyncGenerator[AsyncSession, None]:
    """Provide an async transactional scope."""
    async with AsyncSession(async_engine) as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

