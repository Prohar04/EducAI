import os
from typing import List

import httpx

from ...schemas.jobs import JobListing, JobType

ADZUNA_APP_ID = os.environ.get("ADZUNA_APP_ID", "")
ADZUNA_APP_KEY = os.environ.get("ADZUNA_APP_KEY", "")
ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs"

ADZUNA_COUNTRIES: dict[str, str] = {
    "GB": "gb",
    "US": "us",
    "AU": "au",
    "CA": "ca",
    "DE": "de",
    "FR": "fr",
    "IN": "in",
    "PL": "pl",
    "RU": "ru",
    "ZA": "za",
    "BR": "br",
    "NL": "nl",
    "NZ": "nz",
    "SG": "sg",
    "AT": "at",
    "IT": "it",
}


def supports_country(country_code: str) -> bool:
    return country_code.upper() in ADZUNA_COUNTRIES


async def fetch_adzuna_jobs(
    country_code: str,
    city: str,
    field: str,
    job_type: JobType,
    page: int = 1,
    keyword: str | None = None,
) -> List[JobListing]:
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        raise ValueError("Adzuna credentials not configured")

    adzuna_country = ADZUNA_COUNTRIES[country_code.upper()]

    job_type_label = {
        JobType.PART_TIME: "part time",
        JobType.INTERNSHIP: "internship",
        JobType.REMOTE: "remote",
        JobType.FULL_TIME: "",
    }.get(job_type, "")

    # If keyword is given (e.g. "Software Engineer"), use it as the primary search term;
    # otherwise fall back to the field of study.
    search_term = keyword.strip() if keyword else field
    what = f"{search_term} {job_type_label}".strip()

    params: dict[str, str | int] = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_APP_KEY,
        "results_per_page": 10,
        "page": page,
        "what": what,
        "where": city,
        "content-type": "application/json",
    }

    if job_type == JobType.PART_TIME:
        params["part_time"] = 1
    if job_type == JobType.FULL_TIME:
        params["full_time"] = 1

    async with httpx.AsyncClient(timeout=12.0) as client:
        response = await client.get(
            f"{ADZUNA_BASE}/{adzuna_country}/search/{page}",
            params=params,
        )
        response.raise_for_status()
        data = response.json()

    listings: List[JobListing] = []
    for job in data.get("results", []):
        salary_min = job.get("salary_min")
        salary_max = job.get("salary_max")
        salary_str: str | None = None
        if salary_min and salary_max:
            salary_str = f"{int(salary_min):,} – {int(salary_max):,}"
        elif salary_min:
            salary_str = f"{int(salary_min):,}+"
        elif salary_max:
            salary_str = f"Up to {int(salary_max):,}"

        listings.append(
            JobListing(
                title=job.get("title", ""),
                company=job.get("company", {}).get("display_name", "Unknown"),
                company_logo=None,
                location=job.get("location", {}).get("display_name", city),
                job_type=job_type,
                salary=salary_str,
                salary_min=float(salary_min) if salary_min is not None else None,
                salary_max=float(salary_max) if salary_max is not None else None,
                currency=None,
                posted_at=job.get("created", ""),
                visa_sponsorship=None,
                apply_url=job.get("redirect_url", ""),
                description=(job.get("description", "") or "")[:150],
                source="Adzuna",
                is_remote=job_type == JobType.REMOTE,
            )
        )

    return listings
