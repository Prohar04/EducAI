import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from prisma import Prisma
from app.core.config import settings
from app.core.logger import logger


def _build_neon_url(url: str) -> str:
    """Append Neon-serverless-compatible params to the connection string.

    - pgbouncer=true   : disables prepared statements (required for Neon's
                         transaction-mode pgbouncer pooler)
    - connect_timeout  : gives Neon time to wake its compute endpoint
    - connection_limit : keeps pool size small for serverless
    """
    sep = "&" if "?" in url else "?"
    return f"{url}{sep}pgbouncer=true&connect_timeout=30&connection_limit=1"


# Ensure DATABASE_URL is visible to the Prisma client at import time
os.environ.setdefault("DATABASE_URL", settings.DATABASE_URL)

# Single global Prisma client instance.
# The datasource override injects Neon-safe URL params without modifying .env.
db = Prisma(
    auto_register=True,
    datasource={"url": _build_neon_url(settings.DATABASE_URL)},
)


async def ensure_connected() -> None:
    """Reconnect if Neon's compute woke up and dropped the idle connection."""
    if not db.is_connected():
        logger.warning("Prisma connection lost, reconnecting...")
        await db.connect()
        logger.info("Reconnected to the database.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to the database on startup and disconnect on shutdown."""
    logger.info("Connecting to the database...")
    await db.connect()
    logger.info("Database connected.")
    try:
        yield
    finally:
        if db.is_connected():
            await db.disconnect()
            logger.info("Database disconnected.")
