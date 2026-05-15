import logging
import os
import time

from fastapi import APIRouter, Depends

from ...middleware.secure_keys import checkApiKey
from ...domains.searching.webSearch import WebSearch
from ...domains.jobs.adzuna import fetch_adzuna_jobs, supports_country, ADZUNA_APP_ID, ADZUNA_APP_KEY
from ...domains.jobs.jsearch import fetch_jsearch_jobs, RAPIDAPI_KEY
from ...schemas.jobs import (
    JobListing,
    JobSearchRequest,
    JobSearchResponse,
    JobType,
    SuggestRequest,
    SuggestResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Job Finder"])

# ── Work hour limits per country ─────────────────────────────────────────────

WORK_HOUR_LIMITS: dict[str, str] = {
    "US": (
        "F-1 visa: 20 hrs/week on-campus only during term. "
        "Off-campus work requires CPT or OPT authorization from your DSO."
    ),
    "GB": (
        "Student visa: 20 hrs/week during term time. "
        "Full-time during official university vacations and holidays."
    ),
    "CA": (
        "Study permit: 20 hrs/week off-campus during academic sessions. "
        "Full-time during scheduled breaks and holidays."
    ),
    "AU": (
        "Student visa 500: 48 hrs per fortnight during term. "
        "Unlimited hours during official course breaks."
    ),
    "DE": (
        "Student visa: 120 full days or 240 half days per calendar year. "
        "Working beyond this requires approval from the Foreigners Office."
    ),
    "FR": "Student visa: max 964 hrs/year (60% of the legal annual working time).",
    "NL": "Student visa: 16 hrs/week during term. Full-time in June, July, August.",
    "IE": "Student visa: 20 hrs/week during term. 40 hrs/week during holidays.",
    "SE": (
        "Student residence permit: no formal hour limit but must not interfere with studies. "
        "Practically max 20 hrs/week."
    ),
    "DK": (
        "Student residence permit: 15 hrs/week during term. "
        "Full-time in June, July, August."
    ),
    "AT": "Student visa: 20 hrs/week. Annual cap of 1,040 hrs applies in some categories.",
    "IT": "Student visa (tipo D): 20 hrs/week. Full-time during university holidays.",
    "IN": "No student work permit for international students in India generally. Check institution rules.",
    "PL": "Student visa: no formal hour limit for EU/EEA students; non-EU needs work permit after 6 months.",
    "SG": "Student pass: 16 hrs/week during term. Full-time during vacations with prior approval.",
    "NZ": "Student visa: 20 hrs/week during term. Full-time during scheduled holidays.",
    "ZA": "Student visa: part-time work allowed; full-time requires separate work permit.",
    "BR": "Student visa: no official work authorization for foreign students in Brazil.",
    "RU": "Student visa: work permit required; students may work up to 4 hrs/day with permit.",
}

# ── Post-graduation permit steps per country ─────────────────────────────────

POST_GRAD_PERMIT_STEPS: dict[str, list[str]] = {
    "US": [
        "Apply for OPT through your university's DSO — submit at least 90 days before graduation",
        "OPT gives 12 months of full-time work authorization in any job",
        "STEM degree holders can apply for a 24-month STEM OPT extension (36 months total)",
        "During OPT your employer must be enrolled in E-Verify for STEM extension",
        "After OPT your employer can sponsor H-1B — file in April lottery for October start",
    ],
    "GB": [
        "Apply for the Graduate Route visa after receiving your official degree result",
        "Graduate Route gives 2 years for Masters graduates, 3 years for PhD graduates",
        "No job offer required — work in any role at any skill level",
        "After 2-3 years switch to Skilled Worker visa with employer sponsorship",
        "Skilled Worker route can lead to Indefinite Leave to Remain after 5 years",
    ],
    "CA": [
        "Apply for PGWP within 180 days of receiving your final marks confirmation",
        "PGWP length equals your study duration — programs 2+ years get full 3-year PGWP",
        "PGWP lets you work full-time for any employer anywhere in Canada",
        "After 1 year of skilled work experience apply for Express Entry PR",
        "Provincial Nominee Programs (PNP) offer faster PR pathways in many provinces",
    ],
    "AU": [
        "Apply for Temporary Graduate visa (subclass 485) after graduation",
        "485 visa gives 2 years for Bachelor/Masters by coursework, 3 years for Masters by research, 4 for PhD",
        "Regional study graduates get additional 1-2 years on top",
        "Work for any employer in any role — no restrictions",
        "Build points for skilled migration (189/190 visa) or get employer sponsorship (482 visa)",
    ],
    "DE": [
        "Apply for 18-month job seeker visa at the German embassy or Foreigners Office",
        "Job seeker visa lets you stay in Germany to search for a job matching your degree",
        "Once you have a job offer matching your qualification switch to EU Blue Card",
        "EU Blue Card requires salary above threshold (around €45,000/year for most fields)",
        "After 21-33 months on EU Blue Card you can apply for permanent residence",
    ],
    "FR": [
        "Apply for Autorisation Provisoire de Séjour (APS) within 4 months of graduation",
        "APS gives 12 months to find a job matching your degree level",
        "Once employed, switch to a Salarié or Passeport Talent residence permit",
        "Passeport Talent (Highly Qualified Professional) requires salary ≥ 1.5× minimum wage",
        "After 5 years of legal residence apply for a 10-year resident permit",
    ],
    "NL": [
        "Apply for Zoekjaar (Orientation Year) permit within 3 years of graduating in the Netherlands",
        "Zoekjaar gives 12 months to search for work — no job offer required",
        "Once employed, switch to a Highly Skilled Migrant (Kennismigrant) permit with employer sponsorship",
        "Kennismigrant requires employer to be IND-recognised sponsor and meet salary threshold",
        "After 5 years of legal residence apply for permanent residence (verblijfsvergunning voor onbepaalde tijd)",
    ],
    "IE": [
        "Apply for Third Level Graduate Programme visa — open to Level 8+ degree holders",
        "Gives 12 months (ordinary degree) or 24 months (Masters/PhD) to find employment",
        "Secure a job offer and ask employer to apply for a Critical Skills Employment Permit (CSEP)",
        "CSEP holders can apply for Long Stay Residency after 2 years",
        "After 5 years apply for permanent residence (Long Term Residency or naturalisation)",
    ],
    "AT": [
        "Apply for Red-White-Red (RWR) Card as 'Other Key Worker' or 'Graduate' within 12 months of graduation",
        "Graduate RWR Card gives 12 months to find employment matching your qualification",
        "Once you have a job offer switch to a full RWR Card or EU Blue Card",
        "EU Blue Card requires a salary threshold of ~€3,800/month for most professions",
        "After 21 months on RWR Card you can apply for permanent residence",
    ],
    "IT": [
        "Obtain a Nulla Osta (work authorisation clearance) before leaving Italy if returning later",
        "If staying in Italy, apply for conversion from study permit to work permit at the local Questura",
        "Italy's decreto flussi (annual quota decree) opens slots for non-EU workers — apply when quotas open",
        "EU Blue Card Italy requires a job contract meeting minimum salary thresholds",
        "After 5 years of continuous legal residence apply for long-term EU residence permit",
    ],
    "SG": [
        "Secure a job offer from a Singapore employer — employer applies for your Employment Pass (EP)",
        "EP requires a minimum monthly salary of SGD 5,000 (higher for financial sector)",
        "If salary is below EP threshold check eligibility for S Pass (min SGD 3,150/month)",
        "Hold EP for 2+ years to become eligible for Permanent Residence (PR) application",
        "PR application considers salary, employer sponsorship, qualifications, and contribution",
    ],
    "NZ": [
        "Apply for Post-Study Work visa — open to graduates of NZ institutions",
        "Duration: up to 3 years based on your qualification level",
        "Work for any employer in any role — no restrictions during visa validity",
        "Build 2 years of skilled NZ work experience then apply for Skilled Migrant Category (SMC) residence",
        "Accredited employer work visa is an alternative pathway if you receive a qualifying job offer",
    ],
    "ZA": [
        "Secure a job offer matching your qualification from a South African employer",
        "Employer applies for a Critical Skills Work Visa on your behalf",
        "Critical Skills list covers engineering, IT, health, finance, and other scarce skills",
        "After working for 5 years on a Critical Skills Visa you can apply for permanent residence",
        "Alternatively, employer can apply for a General Work Visa if occupation is on the shortage list",
    ],
    "PL": [
        "Secure a job offer — employer must obtain a Zezwolenie na pracę (work permit) for you",
        "EU Blue Card Poland is available for highly qualified workers meeting salary thresholds",
        "Biała Karta (EU Blue Card) requires a minimum salary of ~€1,500/month gross",
        "After 5 years of legal residence apply for a long-term EU residence permit",
        "Simplified procedure available for citizens of specific neighbouring countries",
    ],
    "IN": [
        "Most international students in India study on student visas and must leave after graduation",
        "Employment in India requires a separate Employment visa sponsored by an Indian employer",
        "No dedicated post-study work pathway exists currently; employer must sponsor you from abroad",
        "OCI (Overseas Citizen of India) card holders have near-citizen rights including work rights",
        "Contact the Foreigners Regional Registration Office (FRRO) for up-to-date stay extension rules",
    ],
}

# ── In-memory suggest cache ───────────────────────────────────────────────────

_suggest_cache: dict[str, tuple[list[str], float]] = {}
_SUGGEST_TTL = 86400.0


def _suggest_cache_get(key: str) -> list[str] | None:
    entry = _suggest_cache.get(key)
    if entry and time.time() < entry[1]:
        return entry[0]
    return None


def _suggest_cache_set(key: str, suggestions: list[str]) -> None:
    _suggest_cache[key] = (suggestions, time.time() + _SUGGEST_TTL)


# ── Startup logging ───────────────────────────────────────────────────────────

_adzuna_ok = bool(ADZUNA_APP_ID and ADZUNA_APP_KEY)
_jsearch_ok = bool(RAPIDAPI_KEY)
_openai_ok = bool(os.environ.get("OPENAI_API_KEY"))
logger.info(
    "Job Finder sources: Adzuna=%s | JSearch=%s | OpenAI fallback=%s",
    "✓" if _adzuna_ok else "✗ (missing)",
    "✓" if _jsearch_ok else "✗ (missing)",
    "✓" if _openai_ok else "✗ (missing)",
)

# ── Routes ────────────────────────────────────────────────────────────────────


@router.post(
    "/jobs/search",
    response_model=JobSearchResponse,
    summary="Search for jobs for international students",
    dependencies=[Depends(checkApiKey)],
)
async def search_jobs(payload: JobSearchRequest) -> JobSearchResponse:
    listings: list[JobListing] = []
    source_used = "none"

    # SOURCE 1: Adzuna (official, 16 countries)
    if supports_country(payload.country_code) and ADZUNA_APP_ID and ADZUNA_APP_KEY:
        try:
            listings = await fetch_adzuna_jobs(
                payload.country_code,
                payload.city,
                payload.field,
                payload.job_type,
                payload.page,
                keyword=payload.keyword,
            )
            if listings:
                source_used = "adzuna"
        except Exception as e:
            logger.warning("Adzuna failed: %s", e)
            listings = []

    # SOURCE 2: JSearch (aggregated — all countries)
    if len(listings) < 3 and RAPIDAPI_KEY:
        try:
            jsearch_results = await fetch_jsearch_jobs(
                payload.country,
                payload.city,
                payload.field,
                payload.job_type,
                payload.page,
                keyword=payload.keyword,
                date_posted=payload.date_posted,
            )
            if jsearch_results:
                combined = listings + jsearch_results
                listings = combined
                source_used = "adzuna+jsearch" if source_used == "adzuna" else "jsearch"
        except Exception as e:
            status = getattr(getattr(e, "response", None), "status_code", None)
            if status == 403:
                logger.info("JSearch unavailable (not subscribed)")
            else:
                logger.warning("JSearch failed: %s", e)

    # SOURCE 3: NEVER use AI-generated jobs for user-facing search.
    # Return empty with fallback links instead.

    country_upper = payload.country_code.upper()
    work_hour_limit = WORK_HOUR_LIMITS.get(country_upper)

    post_grad_steps: list[str] | None = None
    if payload.job_type == JobType.FULL_TIME:
        post_grad_steps = POST_GRAD_PERMIT_STEPS.get(country_upper)

    if not listings:
        logger.info(
            "No live jobs from Adzuna or JSearch for %s in %s — returning empty (no AI fallback)",
            payload.field,
            payload.city,
        )

    return JobSearchResponse(
        listings=listings,
        work_hour_limit=work_hour_limit,
        post_grad_permit_steps=post_grad_steps,
        total=len(listings),
        query_used=(
            f"{payload.keyword or payload.field} {payload.job_type} in {payload.city}"
        ),
        source_used=source_used,
        ai_fallback_used=False,
        cached_at=None,
    )


@router.post(
    "/jobs/suggest",
    response_model=SuggestResponse,
    summary="Suggest job titles using search",
    dependencies=[Depends(checkApiKey)],
)
async def suggest_jobs(payload: SuggestRequest) -> SuggestResponse:
    if payload.type != "jobtitle":
        return SuggestResponse(suggestions=[])

    cache_key = f"jobtitle:{payload.query}:{payload.context or ''}"
    cached = _suggest_cache_get(cache_key)
    if cached is not None:
        return SuggestResponse(suggestions=cached)

    context_part = f" {payload.context}" if payload.context else ""
    query = f"{payload.query}{context_part} job title positions"

    searcher = WebSearch()
    raw_results = await searcher.search(query, num_results=10)

    seen: set[str] = set()
    suggestions: list[str] = []

    for r in raw_results:
        title = r.get("title") or ""
        if not title or r.get("error"):
            continue

        for part in title.split(" at ") + title.split(" - ") + title.split(" | "):
            candidate = part.strip()
            if 3 < len(candidate) <= 60 and candidate not in seen:
                seen.add(candidate)
                suggestions.append(candidate)
                if len(suggestions) >= 8:
                    break
        if len(suggestions) >= 8:
            break

    _suggest_cache_set(cache_key, suggestions)
    return SuggestResponse(suggestions=suggestions)
