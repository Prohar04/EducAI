from fastapi import APIRouter, Depends, Query
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from urllib.parse import urlparse

from ...middleware.secure_keys import checkApiKey
from ...domains.searching.webSearch import WebSearch

router = APIRouter()

class NewsItem(BaseModel):
    title: str
    url: str
    snippet: str
    source: str
    date: Optional[str] = None
    category: str

# In-memory cache — refreshed twice daily by cron
_cache: dict[str, dict] = {}
CACHE_TTL_HOURS = 12

CATEGORY_QUERIES: dict[str, list[str]] = {
    "university": [
        "international university admissions news 2025",
        "top universities international students update",
        "university ranking changes",
    ],
    "visa": [
        "student visa policy changes 2025",
        "international student visa news",
        "study abroad visa requirements update",
    ],
    "scholarship": [
        "international scholarship announcements 2025",
        "study abroad scholarships open applications",
        "fully funded scholarships international students",
    ],
    "general": [
        "study abroad news",
        "international education trends 2025",
        "international student tips guidance",
    ],
}

ALL_CATEGORIES = list(CATEGORY_QUERIES.keys())


def _is_cache_valid(category: str) -> bool:
    if category not in _cache:
        return False
    ts = _cache[category].get("timestamp")
    if not ts:
        return False
    return datetime.utcnow() - ts < timedelta(hours=CACHE_TTL_HOURS)


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
                    "title": (item.get("title") or "")[:140],
                    "url": url,
                    "snippet": (item.get("snippet") or "")[:200],
                    "source": _extract_domain(url),
                    "date": None,
                    "category": category,
                })
        except Exception as e:
            print(f"Search failed for '{query}': {e}")
            continue

    return results[:6]


@router.get("/education", dependencies=[Depends(checkApiKey)])
async def get_education_news(category: Optional[str] = Query(None)):
    requested = [category] if category and category in CATEGORY_QUERIES else ALL_CATEGORIES

    response: dict[str, list[dict]] = {}
    for cat in requested:
        if _is_cache_valid(cat):
            response[cat] = _cache[cat]["items"]
        else:
            items = await _fetch_category(cat)
            _cache[cat] = {"items": items, "timestamp": datetime.utcnow()}
            response[cat] = items

    return {
        "categories": response,
        "fetched_at": datetime.utcnow().isoformat(),
        "next_refresh": (datetime.utcnow() + timedelta(hours=CACHE_TTL_HOURS)).isoformat(),
    }


@router.post("/refresh", dependencies=[Depends(checkApiKey)])
async def refresh_news_cache():
    refreshed = 0
    for cat in ALL_CATEGORIES:
        try:
            items = await _fetch_category(cat)
            _cache[cat] = {"items": items, "timestamp": datetime.utcnow()}
            refreshed += 1
        except Exception as e:
            print(f"Refresh failed for {cat}: {e}")

    return {
        "refreshed_categories": refreshed,
        "total_categories": len(ALL_CATEGORIES),
        "timestamp": datetime.utcnow().isoformat(),
    }
