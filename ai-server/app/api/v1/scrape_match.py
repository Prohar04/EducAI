"""POST /api/v1/module1/scrape-match — stateless scrape + rank.

Returns two blocks:
  normalized — canonical Country->University->Program tree
               ready to upsert into Neon
  ranked     — scored list with programKey (no raw_data) so
               the Express worker can resolve programIds after ingest

No DB writes happen here.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from ...core.logger import logger
from ...domains.scrapping.firecrawl_client import FirecrawlClient
from ...domains.searching.webSearch import WebSearch
from ...domains.reasoning.llm_provider import generate_text, parse_json_response

router = APIRouter(tags=["Module 1 Scrape-Match"])

# ── Constants ─────────────────────────────────────────────────────────────

_MAX_URLS = 12
_MAX_CHUNK_CHARS = 12_000   # Max chars per LLM extraction chunk
_MAX_CHUNKS = 4              # Max chunks to extract per run

# ── Domain denylist — social/forum/unsupported sites ─────────────────────

_BLOCKED_DOMAINS = frozenset({
    "reddit.com", "old.reddit.com",
    "facebook.com", "fb.com", "m.facebook.com",
    "twitter.com", "x.com", "t.co",
    "youtube.com", "youtu.be",
    "linkedin.com", "lnkd.in",
    "instagram.com",
    "quora.com",
    "tiktok.com",
    "pinterest.com",
    "tumblr.com",
    "discord.com", "discord.gg",
    "telegram.org", "t.me",
    "whatsapp.com",
    "medium.com",   # low data quality for structured extraction
})


def _is_allowed_url(url: str) -> bool:
    """Return True only for URLs that Firecrawl can meaningfully extract program data from."""
    try:
        hostname = (urlparse(url).hostname or "").lower()
        host = hostname[4:] if hostname.startswith("www.") else hostname
        return host not in _BLOCKED_DOMAINS and bool(host)
    except Exception:
        return False

# ── Major taxonomy — canonical name → list of synonyms/related terms ──────

MAJOR_TAXONOMY: Dict[str, List[str]] = {
    "computer science": ["cs", "computing", "software engineering", "information technology", "it", "software development"],
    "artificial intelligence": ["ai", "machine learning", "ml", "deep learning", "neural networks", "data science", "intelligent systems"],
    "cybersecurity": ["information security", "network security", "cyber security", "digital forensics", "cyber defence", "infosec", "security engineering"],
    "data science": ["data analytics", "big data", "data engineering", "machine learning", "ml", "statistics", "business analytics"],
    "software engineering": ["cs", "computer science", "software development", "systems engineering", "information technology"],
    "electrical engineering": ["ee", "electronics", "power systems", "telecommunications", "signal processing", "embedded systems"],
    "mechanical engineering": ["me", "manufacturing engineering", "aerospace engineering", "thermal engineering", "robotics"],
    "civil engineering": ["structural engineering", "environmental engineering", "geotechnical engineering", "construction management"],
    "chemical engineering": ["process engineering", "materials engineering", "chemical technology"],
    "biomedical engineering": ["bioengineering", "medical engineering", "biomed", "biotechnology", "clinical engineering"],
    "engineering": ["mechanical engineering", "electrical engineering", "civil engineering", "chemical engineering", "engineering management"],
    "business administration": ["mba", "business management", "management", "business studies", "organizational management"],
    "finance": ["financial management", "financial engineering", "fintech", "banking", "investment management", "corporate finance"],
    "accounting": ["cpa", "auditing", "tax", "financial accounting", "management accounting"],
    "economics": ["econometrics", "financial economics", "applied economics", "development economics"],
    "marketing": ["digital marketing", "brand management", "advertising", "market research", "strategic marketing"],
    "management": ["business management", "mba", "leadership", "organizational behavior", "operations management"],
    "law": ["legal studies", "jurisprudence", "llm", "llb", "international law", "corporate law"],
    "public health": ["epidemiology", "global health", "health policy", "health management", "mph", "community health"],
    "medicine": ["mbbs", "medical science", "clinical medicine", "healthcare", "md"],
    "nursing": ["healthcare", "clinical nursing", "advanced practice nursing", "nurse practitioner"],
    "pharmacy": ["pharmaceutical sciences", "pharmacology", "drug development", "clinical pharmacy"],
    "psychology": ["cognitive science", "behavioral science", "clinical psychology", "counseling", "mental health"],
    "sociology": ["anthropology", "cultural studies", "social science", "social policy"],
    "political science": ["international relations", "political economy", "governance", "public policy", "public administration"],
    "international relations": ["diplomacy", "foreign policy", "global studies", "international affairs", "political science"],
    "environmental science": ["environmental studies", "sustainability", "ecology", "climate science", "environmental management"],
    "architecture": ["urban planning", "interior design", "landscape architecture", "urban design"],
    "design": ["graphic design", "ux design", "product design", "industrial design", "user experience", "interaction design"],
    "media": ["media studies", "journalism", "communications", "mass communication", "digital media"],
    "education": ["teaching", "pedagogy", "educational leadership", "curriculum", "educational technology"],
    "biotechnology": ["bioinformatics", "molecular biology", "genetic engineering", "biotech", "life sciences"],
    "mathematics": ["applied mathematics", "statistics", "actuarial science", "math", "mathematical sciences"],
    "physics": ["applied physics", "astrophysics", "quantum computing", "photonics"],
    "chemistry": ["applied chemistry", "biochemistry", "chemical sciences", "organic chemistry"],
    "biology": ["life sciences", "molecular biology", "ecology", "microbiology", "biochemistry"],
    "hospitality": ["hotel management", "tourism", "hospitality management", "food science", "culinary arts"],
    "fashion": ["fashion design", "textile design", "apparel design", "costume design"],
    "linguistics": ["applied linguistics", "language studies", "translation", "computational linguistics"],
    "geography": ["geographic information systems", "gis", "cartography", "spatial science"],
    "history": ["heritage studies", "archival studies", "historical studies"],
    "social work": ["social policy", "community development", "welfare", "human services"],
}


def _get_major_terms(major: str) -> List[str]:
    """
    Return the canonical major plus synonyms for broader search/matching.
    Tries exact match first, then partial word overlap.
    """
    lower = major.lower().strip()

    # Exact canonical key match
    if lower in MAJOR_TAXONOMY:
        return [lower] + MAJOR_TAXONOMY[lower]

    # Exact synonym match
    for canonical, synonyms in MAJOR_TAXONOMY.items():
        if lower in synonyms:
            return [canonical] + synonyms

    # Partial match — find the most overlapping canonical
    best: Optional[str] = None
    best_overlap = 0
    query_words = set(w for w in lower.split() if len(w) > 2)
    for canonical in MAJOR_TAXONOMY:
        canon_words = set(w for w in canonical.split() if len(w) > 2)
        overlap = len(query_words & canon_words)
        if overlap > best_overlap:
            best_overlap = overlap
            best = canonical

    if best and best_overlap > 0:
        return [lower] + [best] + MAJOR_TAXONOMY[best]

    # No taxonomy match — return the raw major split into words
    return [lower]

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

    terms = _get_major_terms(major)
    primary = terms[0]
    # Use the first synonym as an alt label if available
    alt = terms[1] if len(terms) > 1 else primary

    return [
        f"{level} {primary} programs in {countries_str} tuition under ${budget}",
        f"best universities for {primary} {level} {countries_str} admission requirements",
        f"{level} {primary} scholarships {countries_str} international students",
        f"{level} {alt} programs {countries_str} rankings 2024 2025",
        f"top {level} {primary} universities {countries_str} international students apply",
        f"{primary} {level} graduate programs {countries_str} fees deadlines",
    ]


_EXTRACT_SYSTEM = (
    "You are a university admissions data extractor. "
    "Given scraped web content, extract every distinct university program you can find. "
    "Return a JSON object with a single key 'programs' containing an array of program objects. "
    "Each program object must have these keys: "
    "university_name (string), program_title (string), level (string — e.g. MSc/BSc/PhD), "
    "field (string), country (string), city (string or null), "
    "tuition_usd_per_year (number or null), duration_months (number or null), "
    "min_gpa (number or null), english_requirement (string or null), "
    "application_url (string or null), description (string — 1-2 sentences). "
    "Only include programs that are real, named, and have at least university_name and program_title. "
    "If no programs are found return {\"programs\": []}."
)


async def _extract_chunk(
    chunk: str, req: ScrapeMatchRequest, chunk_idx: int
) -> List[Dict[str, Any]]:
    """Extract programs from a single content chunk using OpenAI JSON mode."""
    user_prompt = (
        f"Student profile: {req.intended_level} in {req.intended_major}, "
        f"target countries: {', '.join(req.target_countries) or 'any'}, "
        f"budget: ${int(req.budget_max_usd)}/yr, GPA: {req.gpa}.\n\n"
        f"Scraped content (chunk {chunk_idx + 1}):\n{chunk}"
    )
    try:
        content = await generate_text(
            prompt=user_prompt,
            system_prompt=_EXTRACT_SYSTEM,
            temperature=0.0,
            max_tokens=4096,
            json_mode=True,
        )
        data = parse_json_response(content)
        if isinstance(data, dict):
            programs = data.get("programs", [])
        elif isinstance(data, list):
            programs = data
        else:
            programs = []
        if not isinstance(programs, list):
            programs = []
        return [p for p in programs if isinstance(p, dict)]
    except Exception as exc:
        logger.warning(f"LLM extraction chunk {chunk_idx} failed: {exc}")
        return []


async def _llm_extract(
    markdown: str, req: ScrapeMatchRequest
) -> List[Dict[str, Any]]:
    """Split content into chunks and extract structured program data from each."""
    # Split on source separators first to keep source context together
    sections = markdown.split("\n\n---\n")
    chunks: List[str] = []
    current = ""
    for section in sections:
        if len(current) + len(section) > _MAX_CHUNK_CHARS and current:
            chunks.append(current.strip())
            current = section
        else:
            current = (current + "\n\n---\n" + section) if current else section
    if current.strip():
        chunks.append(current.strip())

    chunks = chunks[:_MAX_CHUNKS]
    logger.info(f"scrape-match: extracting from {len(chunks)} chunk(s)")

    all_programs: List[Dict[str, Any]] = []
    seen: set = set()
    for i, chunk in enumerate(chunks):
        programs = await _extract_chunk(chunk, req, i)
        for p in programs:
            key = f"{(p.get('university_name') or '').lower()}::{(p.get('program_title') or '').lower()}"
            if key and key not in seen:
                seen.add(key)
                all_programs.append(p)

    logger.info(f"scrape-match: LLM extracted {len(all_programs)} unique programs across all chunks")
    return all_programs


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
    # Build word set from all expanded terms (minimum 2 chars, not 4, so "AI", "CS", "ML" are included)
    major_terms = _get_major_terms(req.intended_major)
    all_match_words: set = set()
    for term in major_terms:
        for w in term.split():
            if len(w) > 1:
                all_match_words.add(w)
    if any(w in prog_field for w in all_match_words):
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
            results = await searcher.search(q, num_results=5)
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

    # Filter out social/forum/unsupported domains before scraping
    allowed_urls = [u for u in all_urls if _is_allowed_url(u)]
    blocked_count = len(all_urls) - len(allowed_urls)
    if blocked_count:
        logger.info(f"scrape-match run_id={req.run_id}: filtered out {blocked_count} unsupported URLs (social/forum)")
    if not allowed_urls:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="All search results were from unsupported domains. Adjust search terms.",
        )

    # Step 2 — scrape
    scraper = FirecrawlClient()
    combined_markdown = ""
    scraped = 0
    for url in allowed_urls[:_MAX_URLS]:
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
