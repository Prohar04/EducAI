import os
import importlib
import shutil
import subprocess
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from app.core.config import settings
from app.core.logger import logger


PRISMA_CACHE_DIR = Path(__file__).resolve().parents[2] / ".prisma-cache"
os.environ.setdefault("PRISMA_BINARY_CACHE_DIR", str(PRISMA_CACHE_DIR))

Prisma = importlib.import_module("prisma").Prisma


def _ensure_prisma_query_engine() -> None:
    from prisma.engine.utils import query_engine_name

    engine_name = query_engine_name()
    project_root = Path(__file__).resolve().parents[2]
    expected_locations = [project_root / engine_name, PRISMA_CACHE_DIR / engine_name]

    if any(path.exists() for path in expected_locations):
        return

    logger.warning("Prisma query engine missing at startup; fetching it now.")

    fetch_env = os.environ.copy()
    fetch_env.setdefault("PRISMA_BINARY_CACHE_DIR", str(PRISMA_CACHE_DIR))
    fetch_env.setdefault("PRISMA_CLIENT_ENGINE_TYPE", "binary")
    fetch_env.setdefault("PRISMA_PY_CONFIG_ENGINE_TYPE", "binary")

    subprocess.run([sys.executable, "-m", "prisma", "py", "fetch"], check=True, env=fetch_env)

    source_engine = next((PRISMA_CACHE_DIR / "node_modules" / "prisma").glob("query-engine-*"), None)
    if source_engine is None:
        raise RuntimeError("Prisma engine fetch completed but no query-engine binary was found in the cache.")

    for destination in expected_locations:
        if not destination.exists():
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source_engine, destination)
            destination.chmod(0o755)


_ensure_prisma_query_engine()


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
