"""Async Firecrawl client for web scraping.

Uses the native AsyncFirecrawl (v2 API) client from the firecrawl-py SDK so
all network I/O is truly non-blocking inside the FastAPI event loop.
"""

import asyncio
from typing import List, Optional

from firecrawl import AsyncFirecrawlApp

from ...core.config import settings
from ...core.logger import logger


class FirecrawlClient:
    def __init__(self) -> None:
        self._app = AsyncFirecrawlApp(api_key=settings.FIRECRAWL_API_KEY)

    async def scrape_url(self, url: str) -> Optional[str]:
        """Scrape a single URL and return its markdown content, or None on error."""
        try:
            result = await self._app.scrape(url, formats=["markdown"])
            return result.markdown if result else None
        except Exception as e:
            logger.error(f"Firecrawl: failed to scrape {url!r}: {e}")
            return None

    async def scrape_urls(self, urls: List[str]) -> List[str]:
        """Scrape multiple URLs concurrently and return non-empty markdown strings."""
        results = await asyncio.gather(
            *[self.scrape_url(u) for u in urls],
            return_exceptions=True,
        )
        return [r for r in results if isinstance(r, str) and r.strip()]
