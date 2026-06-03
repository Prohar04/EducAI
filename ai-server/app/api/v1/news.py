"""GET /api/v1/news/education — education news with Redis-backed cache.

Cache strategy:
  1. If REDIS_URL is configured → Redis is the primary store (shared across all workers).
     Each category is stored as a JSON string under `educai:news:<category>` with a TTL
     of CACHE_TTL_SECONDS so expiry is handled natively by Redis.
  2. If Redis is unavailable or unconfigured → falls back to a module-level in-memory
     dict (same behaviour as before, but worker-local).
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta
from typing import Any, Optional
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, Query

from ...core.config import settings
from ...domains.searching.webSearch import WebSearch
from ...middleware.secure_keys import checkApiKey

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Cache constants ────────────────────────────────────────────────────────────

CACHE_TTL_SECONDS = 3600
REDIS_KEY_PREFIX  = "educai:news:"

# ── Redis client (lazily initialised) ──────────────────────────────────────────

_redis_client: Any = None
_redis_broken       = False   # stop retrying after first failure


async def _get_redis() -> Any:
    """Return a connected async Redis client, or None if unavailable."""
    global _redis_client, _redis_broken

    if _redis_broken or not settings.REDIS_URL:
        return None
    if _redis_client is not None:
        return _redis_client

    try:
        import redis.asyncio as aioredis
        client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        await client.ping()
        _redis_client = client
        logger.info("[news] Redis connected: %s", settings.REDIS_URL)
        return _redis_client
    except Exception as exc:
        _redis_broken = True
        logger.warning("[news] Redis unavailable (%s) — using in-memory cache", exc)
        return None


# ── In-memory fallback ─────────────────────────────────────────────────────────

_mem_cache: dict[str, dict] = {}

# ── Category definitions ───────────────────────────────────────────────────────

CATEGORY_QUERIES: dict[str, list[str]] = {
    "university": [
        "international university admissions 2025 2026",
        "top university news international students this week",
        "university scholarship deadline 2025",
    ],
    "visa": [
        "student visa policy update 2025",
        "international student visa news today",
        "study abroad visa requirements change",
    ],
    "scholarship": [
        "new scholarship international students open apply 2025",
        "fully funded scholarship deadline 2025",
        "Chevening Fulbright DAAD Erasmus news",
    ],
    "general": [
        "study abroad news today",
        "international education update",
        "IELTS TOEFL GRE update 2025",
    ],
}

ALL_CATEGORIES = list(CATEGORY_QUERIES.keys())

# ── Helpers ────────────────────────────────────────────────────────────────────


def _extract_domain(url: str) -> str:
    try:
        return urlparse(url).netloc.replace("www.", "")
    except Exception:
        return "Unknown"


async def _fetch_category(category: str) -> list[dict]:
    searcher = WebSearch()
    results: list[dict] = []
    seen_urls: set[str] = set()

    for query in CATEGORY_QUERIES[category]:
        try:
            items = await searcher.search(query, num_results=4)
            for item in items:
                url = item.get("link", "")
                if not url or url in seen_urls or "error" in item:
                    continue
                seen_urls.add(url)
                results.append({
                    "title":    (item.get("title")   or "")[:140],
                    "url":      url,
                    "snippet":  (item.get("snippet") or "")[:200],
                    "source":   _extract_domain(url),
                    "date":     None,
                    "category": category,
                })
        except Exception as exc:
            logger.warning("[news] search failed for %r: %s", query, exc)

    return results[:6]


# ── Cache read / write ─────────────────────────────────────────────────────────


async def _cache_get(category: str) -> Optional[list[dict]]:
    redis = await _get_redis()

    if redis is not None:
        try:
            raw = await redis.get(f"{REDIS_KEY_PREFIX}{category}")
            if raw:
                return json.loads(raw)
        except Exception as exc:
            logger.warning("[news] Redis GET error: %s", exc)
        return None

    # In-memory fallback
    entry = _mem_cache.get(category)
    if not entry:
        return None
    if datetime.utcnow() - entry["timestamp"] > timedelta(seconds=CACHE_TTL_SECONDS):
        _mem_cache.pop(category, None)
        return None
    return entry["items"]


async def _cache_set(category: str, items: list[dict]) -> None:
    redis = await _get_redis()

    if redis is not None:
        try:
            await redis.setex(
                f"{REDIS_KEY_PREFIX}{category}",
                CACHE_TTL_SECONDS,
                json.dumps(items, default=str),
            )
            return
        except Exception as exc:
            logger.warning("[news] Redis SET error: %s", exc)

    _mem_cache[category] = {"items": items, "timestamp": datetime.utcnow()}


# ── Routes ─────────────────────────────────────────────────────────────────────


@router.get("/education", dependencies=[Depends(checkApiKey)])
async def get_education_news(category: Optional[str] = Query(None)):
    requested = [category] if category and category in CATEGORY_QUERIES else ALL_CATEGORIES

    response: dict[str, list[dict]] = {}
    for cat in requested:
        cached = await _cache_get(cat)
        if cached is not None:
            response[cat] = cached
        else:
            items = await _fetch_category(cat)
            await _cache_set(cat, items)
            response[cat] = items

    now = datetime.utcnow()
    return {
        "categories":   response,
        "fetched_at":   now.isoformat(),
        "next_refresh": (now + timedelta(seconds=CACHE_TTL_SECONDS)).isoformat(),
    }


@router.post("/refresh", dependencies=[Depends(checkApiKey)])
async def refresh_news_cache():
    refreshed = 0
    for cat in ALL_CATEGORIES:
        try:
            items = await _fetch_category(cat)
            await _cache_set(cat, items)
            refreshed += 1
        except Exception as exc:
            logger.error("[news] refresh failed for %s: %s", cat, exc)

    return {
        "refreshed_categories": refreshed,
        "total_categories":     len(ALL_CATEGORIES),
        "timestamp":            datetime.utcnow().isoformat(),
        "backend":              "redis" if _redis_client else "in-memory",
    }
