"""POST /api/v1/module1/scrape-match-gpt — ChatGPT-search variant of scrape-match.

An alternative to `scrape_match.py`, which finds programmes by running Serper
queries, fetching each page through Firecrawl, and extracting structured data
from the raw markdown with a second LLM call. That works but is bounded by how
many pages can be fetched and parsed inside a serverless request — in practice
around six URLs, which yields only a couple of programmes per run.

This variant hands the whole acquisition step to OpenAI's search-enabled model:
one call that searches the web and returns structured programmes directly. No
Serper key, no Firecrawl fetch, no separate extraction pass.

Scoring and normalisation are imported from `scrape_match` rather than
reimplemented, so both endpoints return byte-identical response shapes and the
Node service can switch between them with an environment variable. Nothing here
modifies the original path — if this approach disappoints, point the caller back
at `/scrape-match` and delete this file.
"""

import json
import time
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, HTTPException, status

from ...core.config import settings
from ...core.logger import logger
from ...domains.reasoning.llm_provider import parse_json_response

# Reused verbatim so both variants score and normalise identically.
from .scrape_match import (
    NormalizedData,
    ProgramKey,
    RankedProgram,
    ScrapeMatchRequest,
    ScrapeMatchResponse,
    _build_normalized,
    _country_code,
    _normalize_level,
    _score_program,
)

router = APIRouter(tags=["Module 1 Scrape+Match (ChatGPT search)"])

# Search-enabled chat model. Overridable so the model can be changed without a
# deploy if OpenAI renames or supersedes it.
_SEARCH_MODEL = getattr(settings, "OPENAI_SEARCH_MODEL", None) or "gpt-4o-search-preview"

# The whole call must fit inside the serverless function budget.
_REQUEST_TIMEOUT_S = 90.0
_MAX_TOKENS = 8192

# How many programmes to ask for. Higher is not automatically better: the model
# starts inventing once it exhausts what it can actually find.
_TARGET_PROGRAMS = 12


_SYSTEM_PROMPT = (
    "You are a university programme researcher. Search the web and return ONLY "
    "real, currently-offered postgraduate programmes that you can verify from "
    "an official university page.\n\n"
    "Rules:\n"
    "- Never invent a programme, a tuition figure, or a URL. Omit a field you "
    "cannot verify rather than guessing.\n"
    "- source_url must be the programme's own page on the university's domain.\n"
    "- tuition figures are per year in USD, converted if the page quotes another "
    "currency.\n"
    "- Return valid JSON only, with no prose and no markdown fences."
)


def _user_prompt(req: ScrapeMatchRequest) -> str:
    countries = ", ".join(req.target_countries) if req.target_countries else "any country"
    return (
        f"Find up to {_TARGET_PROGRAMS} {req.intended_level} programmes in "
        f"{req.intended_major}, at universities in {countries}, with tuition at "
        f"or below ${int(req.budget_max_usd):,} per year where that is known.\n\n"
        "Return this exact JSON shape:\n"
        "{\n"
        '  "programs": [\n'
        "    {\n"
        '      "university_name": "string",\n'
        '      "program_title": "string",\n'
        '      "level": "BSc | MSc | PhD | MBA",\n'
        '      "field": "string",\n'
        '      "country": "ISO-2 code or country name",\n'
        '      "city": "string or null",\n'
        '      "duration_months": integer or null,\n'
        '      "tuition_min_usd": integer or null,\n'
        '      "tuition_max_usd": integer or null,\n'
        '      "description": "one or two sentences, or null",\n'
        '      "source_url": "https://university.edu/programme-page",\n'
        '      "university_website": "https://university.edu or null",\n'
        '      "requirements": [{"key": "GPA", "value": "3.0"}],\n'
        '      "deadlines": [{"term": "Semester 1 2027", "deadline": "2026-10-31"}]\n'
        "    }\n"
        "  ]\n"
        "}"
    )


async def _search_programs(req: ScrapeMatchRequest) -> List[Dict[str, Any]]:
    """One search-enabled model call returning structured programmes."""
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OPENAI_API_KEY is not configured — ChatGPT search unavailable.",
        )

    payload: Dict[str, Any] = {
        "model": _SEARCH_MODEL,
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": _user_prompt(req)},
        ],
        "max_tokens": _MAX_TOKENS,
        # Enables the model's own web search. Search-preview models reject
        # `temperature`, so it is deliberately absent.
        "web_search_options": {},
    }

    async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT_S) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )

    if response.status_code != 200:
        body = response.text[:300]
        logger.error(f"scrape-match-gpt: OpenAI {response.status_code}: {body}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"ChatGPT search failed ({response.status_code}).",
        )

    data = response.json()
    try:
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        logger.error(f"scrape-match-gpt: unexpected response shape: {exc}")
        return []

    try:
        # parse_json_response handles fences and salvages complete records from
        # a response truncated at the token ceiling.
        parsed = parse_json_response(content)
    except json.JSONDecodeError:
        logger.warning("scrape-match-gpt: could not parse any programmes from the response")
        return []

    if isinstance(parsed, dict):
        programs = parsed.get("programs", [])
    elif isinstance(parsed, list):
        programs = parsed
    else:
        programs = []

    return [p for p in programs if isinstance(p, dict)]


def _dedupe(programs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Drop repeats of the same university + programme title."""
    seen: set = set()
    unique: List[Dict[str, Any]] = []
    for p in programs:
        key = (
            f"{(p.get('university_name') or '').strip().lower()}"
            f"::{(p.get('program_title') or '').strip().lower()}"
        )
        if key == "::" or key in seen:
            continue
        seen.add(key)
        unique.append(p)
    return unique


def _has_usable_source(p: Dict[str, Any]) -> bool:
    """Require a plausible source URL, since fabricated entries usually lack one."""
    url = (p.get("source_url") or "").strip()
    return url.startswith("http")


@router.post(
    "/scrape-match-gpt",
    response_model=ScrapeMatchResponse,
    summary="Find and rank programmes using ChatGPT's web search",
)
async def scrape_match_gpt(req: ScrapeMatchRequest) -> ScrapeMatchResponse:
    started = time.monotonic()
    logger.info(
        f"scrape-match-gpt run_id={req.run_id} user_id={req.user_id}"
        f" major={req.intended_major} level={req.intended_level}"
        f" countries={req.target_countries} model={_SEARCH_MODEL}"
    )

    raw = await _search_programs(req)
    programs = [p for p in _dedupe(raw) if _has_usable_source(p)]

    dropped = len(_dedupe(raw)) - len(programs)
    if dropped:
        logger.info(f"scrape-match-gpt run_id={req.run_id}: dropped {dropped} entry/entries with no source URL")

    if not programs:
        logger.info(f"scrape-match-gpt run_id={req.run_id}: no programmes found")
        return ScrapeMatchResponse(
            run_id=req.run_id, normalized=NormalizedData(), ranked=[]
        )

    normalized = _build_normalized(programs, req)

    ranked: List[RankedProgram] = []
    for p in programs:
        # _score_program returns (score, reasons); country resolution mirrors
        # the Serper variant so both endpoints key programmes identically.
        score, reasons = _score_program(p, req)

        raw_country = (p.get("country") or "").strip()
        if _country_code(raw_country):
            code = _country_code(raw_country)
        elif len(raw_country) >= 2:
            code = raw_country.upper()[:2]
        else:
            code = next(iter(req.target_countries), "XX").upper()

        prog_title = (p.get("program_title") or p.get("title") or "").strip()
        uni_name = (p.get("university_name") or "").strip()
        if not prog_title or not uni_name:
            continue

        ranked.append(
            RankedProgram(
                program_key=ProgramKey(
                    country_code=code,
                    university_name=uni_name,
                    program_title=prog_title,
                    level=_normalize_level(p.get("level") or req.intended_level),
                ),
                score=score,
                reasons=reasons,
            )
        )
    ranked.sort(key=lambda r: r.score, reverse=True)
    ranked = ranked[:20]

    logger.info(
        f"scrape-match-gpt run_id={req.run_id}: returning {len(ranked)} ranked"
        f" + {len(programs)} normalized programs in {time.monotonic() - started:.1f}s"
    )
    return ScrapeMatchResponse(run_id=req.run_id, normalized=normalized, ranked=ranked)
