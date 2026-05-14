import os
from datetime import datetime
from typing import List

import httpx

from ...schemas.jobs import JobListing, JobType

RAPIDAPI_KEY = os.environ.get("RAPIDAPI_KEY", "")
JSEARCH_URL = "https://jsearch.p.rapidapi.com/search"


def _format_relative_time(dt_str: str | None) -> str | None:
    if not dt_str:
        return None
    try:
        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        delta = datetime.now(dt.tzinfo) - dt
        days = delta.days
        if days == 0:
            hours = delta.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago" if hours > 0 else "just now"
        if days == 1:
            return "Yesterday"
        if days < 7:
            return f"{days} days ago"
        if days < 30:
            weeks = days // 7
            return f"{weeks} week{'s' if weeks != 1 else ''} ago"
        return f"{days // 30} month{'s' if days // 30 != 1 else ''} ago"
    except Exception:
        return None


def _visa_signal(description: str | None) -> str | None:
    if not description:
        return None
    lower = description.lower()
    keywords = ["visa sponsor", "sponsorship", "work authorization", "h-1b", "h1b", "work permit", "immigration"]
    if any(k in lower for k in keywords):
        return "Mentioned"
    return None


_JSEARCH_DATE_MAP = {
    "today": "today",
    "3days": "3days",
    "week": "week",
    "month": "month",
}


async def fetch_jsearch_jobs(
    country: str,
    city: str,
    field: str,
    job_type: JobType,
    page: int = 1,
    keyword: str | None = None,
    date_posted: str | None = None,
) -> List[JobListing]:
    if not RAPIDAPI_KEY:
        raise ValueError("RAPIDAPI_KEY not configured")

    job_type_label = {
        JobType.PART_TIME: "part time",
        JobType.INTERNSHIP: "internship",
        JobType.REMOTE: "remote",
        JobType.FULL_TIME: "",
    }.get(job_type, "")

    # Use explicit keyword if provided, otherwise fall back to field of study
    search_term = keyword.strip() if keyword else field
    query = f"{search_term} {job_type_label} jobs in {city} {country}".strip()

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    }
    params = {
        "query": query,
        "page": str(page),
        "num_pages": "1",
        "date_posted": _JSEARCH_DATE_MAP.get(date_posted or "", "month"),
    }

    async with httpx.AsyncClient(timeout=12.0) as client:
        response = await client.get(JSEARCH_URL, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

    listings: List[JobListing] = []
    for job in data.get("data", []):
        salary_min = job.get("job_min_salary")
        salary_max = job.get("job_max_salary")
        currency = job.get("job_salary_currency", "")
        salary_str: str | None = None
        if salary_min and salary_max:
            salary_str = f"{currency}{int(salary_min):,} – {currency}{int(salary_max):,}"
        elif salary_min:
            salary_str = f"{currency}{int(salary_min):,}+"

        description_raw: str | None = job.get("job_description")
        description_short = description_raw[:150] if description_raw else None

        job_city = job.get("job_city") or ""
        job_country = job.get("job_country") or ""
        location = f"{job_city}, {job_country}".strip(", ") or f"{city}, {country}"

        listings.append(
            JobListing(
                title=job.get("job_title", ""),
                company=job.get("employer_name", "Unknown"),
                company_logo=job.get("employer_logo"),
                location=location,
                job_type=job_type,
                salary=salary_str,
                salary_min=float(salary_min) if salary_min is not None else None,
                salary_max=float(salary_max) if salary_max is not None else None,
                currency=currency or None,
                posted_at=_format_relative_time(job.get("job_posted_at_datetime_utc")),
                visa_sponsorship=_visa_signal(description_raw),
                apply_url=job.get("job_apply_link", ""),
                description=description_short,
                source="JSearch (Indeed/LinkedIn)",
                is_remote=bool(job.get("job_is_remote", False)),
            )
        )

    return listings
