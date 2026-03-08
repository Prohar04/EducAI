"""POST /api/v1/module1/scrape-match — stateless scrape + rank.

Returns two blocks:
  normalized — canonical Country->University->Program tree
               ready to upsert into Neon
  ranked     — scored list with programKey (no raw_data) so
               the Express worker can resolve programIds after ingest

No DB writes happen here.
"""

from __future__ import annotations

import json
from collections import defaultdict
from typing import Any, Dict, List, Optional, Tuple

import httpx
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from ...core.config import settings
from ...core.logger import logger
from ...domains.scrapping.firecrawl_client import FirecrawlClient
from ...domains.searching.webSearch import WebSearch

router = APIRouter(tags=["Module 1 Scrape-Match"])

# ── Constants ─────────────────────────────────────────────────────────────

_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
_LLM_MODEL = "openai/gpt-4o-mini"
_MAX_URLS = 6
_MAX_MARKDOWN_CHARS = 40_000

# ── Country lookup tables ─────────────────────────────────────────────────

_NAME_TO_CODE: Dict[str, str] = {
    "united states": "US",
    "united states of america": "US",
    "usa": "US",
    "us": "US",
    "united kingdom": "GB",
    "uk": "GB",
    "great britain": "GB",
    "england": "GB",
    "canada": "CA",
    "ca": "CA",
    "australia": "AU",
    "au": "AU",
    "germany": "DE",
    "de": "DE",
    "france": "FR",
    "fr": "FR",
    "netherlands": "NL",
    "nl": "NL",
    "new zealand": "NZ",
    "nz": "NZ",
    "ireland": "IE",
    "ie": "IE",
    "singapore": "SG",
    "sg": "SG",
    "sweden": "SE",
    "se": "SE",
    "denmark": "DK",
    "dk": "DK",
    "norway": "NO",
    "no": "NO",
    "switzerland": "CH",
    "ch": "CH",
    "austria": "AT",
    "at": "AT",
    "italy": "IT",
    "it": "IT",
    "spain": "ES",
    "es": "ES",
    "japan": "JP",
    "jp": "JP",
    "malaysia": "MY",
    "my": "MY",
    "india": "IN",
    "in": "IN",
    "china": "CN",
    "cn": "CN",
    "south korea": "KR",
    "korea": "KR",
    "kr": "KR",
}

_CODE_TO_NAME: Dict[str, str] = {
    "US": "United States",
    "GB": "United Kingdom",
    "CA": "Canada",
    "AU": "Australia",
    "DE": "Germany",
    "FR": "France",
    "NL": "Netherlands",
    "NZ": "New Zealand",
    "IE": "Ireland",
    "SG": "Singapore",
    "SE": "Sweden",
    "DK": "Denmark",
    "NO": "Norway",
    "CH": "Switzerland",
    "AT": "Austria",
    "IT": "Italy",
    "ES": "Spain",
    "JP": "Japan",
    "MY": "Malaysia",
    "IN": "India",
    "CN": "China",
    "KR": "South Korea",
}

_LEVEL_MAP: Dict[str, str] = {
    "msc": "MSC",
    "masters": "MSC",
    "master": "MSC",
    "ms": "MSC",
    "meng": "MSC",
    "mba": "MSC",
    "bsc": "BSC",
    "bachelor": "BSC",
    "bachelors": "BSC",
    "bs": "BSC",
    "beng": "BSC",
    "undergraduate": "BSC",
    "phd": "PHD",
    "doctorate": "PHD",
    "doctoral": "PHD",
}


def _country_code(raw: str) -> Optional[str]:
    key = raw.strip().lower()
    if key in _NAME_TO_CODE:
        return _NAME_TO_CODE[key]
    if len(raw.strip()) == 2:
        return raw.strip().upper()
    return None


def _normalize_level(raw: str) -> str:
    key = (
        raw.strip()
        .lower()
        .replace(".", "")
        .replace("'", "")
        .replace(" ", "")
    )
    return _LEVEL_MAP.get(key, raw.upper()[:3])


def _req_list(p: Dict[str, Any]) -> List[Dict[str, str]]:
    reqs: List[Dict[str, str]] = []
    min_gpa = p.get("min_gpa")
    if min_gpa is not None:
        reqs.append({"key": "GPA", "value": str(min_gpa)})
    eng = p.get("english_requirement")
    if eng:
        reqs.append({"key": "IELTS", "value": str(eng)})
    return reqs


# ── Pydantic I/O schemas ──────────────────────────────────────────────────


class ScrapeMatchRequest(BaseModel):
    user_id: str
    run_id: str
    target_countries: List[str] = Field(default_factory=list)
    intended_level: str = "MSc"
    intended_major: str = "Computer Science"
    budget_max_usd: float = 30_000
    gpa: float = 0.0
    english_test_type: Optional[str] = None
    english_score: Optional[float] = None


class ProgramKey(BaseModel):
    country_code: str
    university_name: str
    program_title: str
    level: str


class RankedProgram(BaseModel):
    program_key: ProgramKey
    score: float
    reasons: List[str]


# Normalised output — matches server ingest contract exactly
class NormalizedRequirement(BaseModel):
    key: str
    value: str


class NormalizedDeadline(BaseModel):
    term: str
    deadline: str


class NormalizedProgram(BaseModel):
    title: str
    field: str
    level: str
    duration_months: Optional[int] = None
    tuition_min_usd: Optional[int] = None
    tuition_max_usd: Optional[int] = None
    description: Optional[str] = None
    source_url: Optional[str] = None
    requirements: List[NormalizedRequirement] = Field(
        default_factory=list
    )
    deadlines: List[NormalizedDeadline] = Field(default_factory=list)


class NormalizedUniversity(BaseModel):
    name: str
    city: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    source_url: Optional[str] = None
    programs: List[NormalizedProgram] = Field(default_factory=list)


class NormalizedCountry(BaseModel):
    code: str
    name: str
    universities: List[NormalizedUniversity] = Field(
        default_factory=list
    )


class NormalizedData(BaseModel):
    countries: List[NormalizedCountry] = Field(default_factory=list)


class ScrapeMatchResponse(BaseModel):
    run_id: str
    normalized: NormalizedData
    ranked: List[RankedProgram]


# ── Helpers ───────────────────────────────────────────────────────────────


def _build_queries(req: ScrapeMatchRequest) -> List[str]:
    if req.target_countries:
        countries_str = ", ".join(req.target_countries)
    else:
        countries_str = "worldwide"
    level = req.intended_level
    major = req.intended_major
    budget = int(req.budget_max_usd)
    return [
        (
            f"{level} {major} programs in {countries_str}"
            f" tuition under ${budget}"
        ),
        (
            f"best universities for {major} {level}"
            f" {countries_str} admission requirements"
        ),
        (
            f"{level} {major} scholarships"
            f" {countries_str} international students"
        ),
    ]


async def _llm_extract(
    markdown: str, req: ScrapeMatchRequest
) -> List[Dict[str, Any]]:
    system_prompt = (
        "You are a university admissions data extractor. "
        "Given scraped web content, extract every distinct "
        "university program you can find. "
        "For each program output a JSON object with keys: "
        "university_name, program_title, level, field, country, city, "
        "tuition_usd_per_year (number or null), "
        "duration_months (number or null), "
        "min_gpa (number or null), "
        "english_requirement (string or null), "
        "application_url (string or null), "
        "description (short string). "
        "Return a JSON array only — no markdown, no explanation."
    )
    user_prompt = (
        f"Student preferences: {req.intended_level}"
        f" in {req.intended_major}, "
        f"countries: {', '.join(req.target_countries) or 'any'}, "
        f"budget: ${req.budget_max_usd}/yr, GPA: {req.gpa}.\n\n"
        f"Scraped content:\n{markdown[:_MAX_MARKDOWN_CHARS]}"
    )

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{_OPENROUTER_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPEN_ROUTER_APIKEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": _LLM_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.1,
                "max_tokens": 4096,
            },
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]

    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()

    try:
        programs: List[Dict[str, Any]] = json.loads(content)
        if not isinstance(programs, list):
            programs = []
    except json.JSONDecodeError:
        programs = []

    return programs


ScoreResult = Tuple[float, List[str]]


def _score_program(
    program: Dict[str, Any], req: ScrapeMatchRequest
) -> ScoreResult:
    score = 0.0
    reasons: List[str] = []

    # Country match (+25)
    raw_country = program.get("country") or ""
    country_code = _country_code(raw_country) or raw_country.upper()[:2]
    target_codes = [c.upper() for c in req.target_countries]
    target_lower = [c.lower() for c in req.target_countries]
    in_targets = country_code in target_codes or any(
        n in raw_country.lower() for n in target_lower
    )
    if target_codes and in_targets:
        score += 25
        reasons.append(
            f"Located in {program.get('country', country_code)}"
        )

    # Level match (+20)
    prog_level = (program.get("level") or "").lower()
    req_level = req.intended_level.lower()
    level_syns: Dict[str, List[str]] = {
        "msc": ["msc", "masters", "master", "m.sc", "ms", "meng", "mba"],
        "bsc": ["bsc", "bachelor", "bachelors", "b.sc", "bs", "beng"],
        "phd": ["phd", "ph.d", "doctorate", "doctoral"],
    }
    req_key = next(
        (
            k
            for k, v in level_syns.items()
            if req_level in v or req_level == k
        ),
        req_level,
    )
    if any(syn in prog_level for syn in level_syns.get(req_key, [req_level])):
        score += 20
        reasons.append(f"{req.intended_level} level match")

    # Field/major match (+20)
    prog_field = (
        program.get("field") or program.get("program_title") or ""
    ).lower()
    major_words = req.intended_major.lower().split()
    if any(w in prog_field for w in major_words if len(w) > 3):
        score += 20
        field_val = program.get(
            "field", program.get("program_title", "")
        )
        reasons.append(f"Field match: {field_val}")

    # Budget match (+20)
    tuition = program.get("tuition_usd_per_year")
    if tuition is not None and isinstance(tuition, (int, float)):
        if tuition <= req.budget_max_usd:
            score += 20
            reasons.append(f"Within budget (${int(tuition):,}/yr)")
        elif tuition <= req.budget_max_usd * 1.15:
            score += 10
            reasons.append(f"Slightly over budget (${int(tuition):,}/yr)")
    else:
        score += 5
        reasons.append("Tuition info not listed")

    # GPA check (+15)
    min_gpa = program.get("min_gpa")
    gpa_known = min_gpa is not None and isinstance(min_gpa, (int, float))
    if gpa_known and req.gpa > 0:
        if req.gpa >= min_gpa:
            score += 15
            reasons.append(f"GPA {req.gpa} meets minimum {min_gpa}")
        else:
            reasons.append(f"GPA {req.gpa} below minimum {min_gpa}")
    else:
        score += 5

    return min(100.0, score), reasons


def _build_normalized(
    programs: List[Dict[str, Any]], req: ScrapeMatchRequest
) -> NormalizedData:
    """Build the canonical Country->University->Program tree."""
    # country_code -> { name, universities: { uni_name -> [programs] } }
    tree: Dict[str, Dict[str, Any]] = {}
    target_codes = {c.upper() for c in req.target_countries}

    for p in programs:
        raw_country = (p.get("country") or "").strip()
        country_code = _country_code(raw_country)
        # Fall back to best-effort if code is unknown
        if not country_code:
            if len(raw_country) == 2:
                country_code = raw_country.upper()
            elif target_codes:
                country_code = next(iter(target_codes))
            else:
                continue

        country_name = _CODE_TO_NAME.get(
            country_code, raw_country or country_code
        )
        uni_name = (p.get("university_name") or "").strip()
        if not uni_name:
            continue

        prog_title = (
            p.get("program_title") or p.get("title") or ""
        ).strip()
        if not prog_title:
            continue

        level = _normalize_level(p.get("level") or req.intended_level)
        tuition = p.get("tuition_usd_per_year")
        tuition_int = (
            int(tuition) if isinstance(tuition, (int, float)) else None
        )
        dur = p.get("duration_months")
        dur_int = dur if isinstance(dur, int) else None

        norm_prog = NormalizedProgram(
            title=prog_title,
            field=(p.get("field") or prog_title).strip(),
            level=level,
            duration_months=dur_int,
            tuition_min_usd=tuition_int,
            tuition_max_usd=tuition_int,
            description=(p.get("description") or "")[:500] or None,
            source_url=p.get("application_url") or None,
            requirements=[
                NormalizedRequirement(**r) for r in _req_list(p)
            ],
            deadlines=[],
        )

        if country_code not in tree:
            tree[country_code] = {
                "name": country_name,
                "universities": defaultdict(list),
            }
        tree[country_code]["universities"][uni_name].append(norm_prog)

    countries: List[NormalizedCountry] = []
    for code, data in tree.items():
        unis: List[NormalizedUniversity] = []
        for uni_name, progs in data["universities"].items():
            unis.append(NormalizedUniversity(name=uni_name, programs=progs))
        countries.append(
            NormalizedCountry(
                code=code, name=data["name"], universities=unis
            )
        )

    return NormalizedData(countries=countries)


# ── Route ─────────────────────────────────────────────────────────────────

_ROUTE_SUMMARY = (
    "Scrape programs matching a student profile"
    " and return normalized + ranked results"
)


@router.post(
    "/scrape-match",
    response_model=ScrapeMatchResponse,
    summary=_ROUTE_SUMMARY,
)
async def scrape_match(req: ScrapeMatchRequest) -> ScrapeMatchResponse:
    logger.info(
        f"scrape-match run_id={req.run_id} user_id={req.user_id} "
        f"major={req.intended_major} level={req.intended_level} "
        f"countries={req.target_countries}"
    )

    # Step 1 — query -> URLs
    searcher = WebSearch()
    queries = _build_queries(req)
    all_urls: List[str] = []
    for q in queries:
        try:
            results = await searcher.search(q, num_results=3)
            for r in results:
                link = r.get("link") or r.get("url") or ""
                if link and link not in all_urls:
                    all_urls.append(link)
        except Exception as exc:
            logger.warning(f"Search query failed: {q!r} — {exc}")

    if not all_urls:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Search returned no URLs"
                " — check SERPER_APIKEY configuration."
            ),
        )

    # Step 2 — scrape
    scraper = FirecrawlClient()
    combined_markdown = ""
    scraped = 0
    for url in all_urls[:_MAX_URLS]:
        try:
            md = await scraper.scrape_url(url)
            if md:
                combined_markdown += f"\n\n---\nSource: {url}\n{md}"
                scraped += 1
        except Exception as exc:
            logger.warning(f"Scrape failed for {url}: {exc}")

    if not combined_markdown:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "No content scraped"
                " — check FIRECRAWL_API_KEY configuration."
            ),
        )

    logger.info(
        f"scrape-match run_id={req.run_id}: scraped {scraped} URLs,"
        f" {len(combined_markdown)} chars"
    )

    # Step 3 — LLM extraction
    programs = await _llm_extract(combined_markdown, req)
    logger.info(
        f"scrape-match run_id={req.run_id}:"
        f" LLM extracted {len(programs)} programs"
    )

    # Step 4 — score & rank
    scored: List[tuple[Dict[str, Any], float, List[str]]] = []
    for p in programs:
        score, reasons = _score_program(p, req)
        if score > 0:
            scored.append((p, score, reasons))

    scored.sort(key=lambda x: x[1], reverse=True)
    top = scored[:20]

    # Step 5 — build normalized tree (all extracted programs)
    normalized = _build_normalized(programs, req)

    # Step 6 — build ranked list with programKey (no raw_data)
    ranked: List[RankedProgram] = []
    for p, score, reasons in top:
        raw_country = (p.get("country") or "").strip()
        if _country_code(raw_country):
            code = _country_code(raw_country)
        elif len(raw_country) >= 2:
            code = raw_country.upper()[:2]
        else:
            code = next(iter(req.target_countries), "XX").upper()
        prog_title = (
            p.get("program_title") or p.get("title") or ""
        ).strip()
        uni_name = (p.get("university_name") or "").strip()
        level = _normalize_level(p.get("level") or req.intended_level)

        if not prog_title or not uni_name:
            continue

        ranked.append(
            RankedProgram(
                program_key=ProgramKey(
                    country_code=code,
                    university_name=uni_name,
                    program_title=prog_title,
                    level=level,
                ),
                score=score,
                reasons=reasons,
            )
        )

    logger.info(
        f"scrape-match run_id={req.run_id}: returning"
        f" {len(ranked)} ranked + {len(programs)} normalized programs"
    )

    return ScrapeMatchResponse(
        run_id=req.run_id, normalized=normalized, ranked=ranked
    )
