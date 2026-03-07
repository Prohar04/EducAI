from typing import AsyncGenerator
from prisma import Prisma
from app.db.prisma_connect import db, ensure_connected


async def get_db() -> AsyncGenerator[Prisma, None]:
    """FastAPI dependency that yields the shared Prisma client.

    Reconnects automatically if Neon's compute endpoint was sleeping.

    Usage::

        @router.get("/example")
        async def example(db: Prisma = Depends(get_db)):
            return await db.user.find_many()
    """
    await ensure_connected()
    yield db
