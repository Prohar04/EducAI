from __future__ import annotations

import time
from typing import Any, Dict, List, Literal, Optional, Tuple
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field

from ...core.config import settings
from ...core.logger import logger
from ...domains.reasoning.llm_provider import (
    LLMProvider,
    RateLimitError,
    generate_text,
    parse_json_response,
)
from ...domains.scrapping.firecrawl_client import FirecrawlClient
from ...domains.searching.webSearch import WebSearch

router = APIRouter(tags=["Chat"])

SEARCH_CACHE_TTL_SECONDS = 24 * 60 * 60
PAGE_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60
MAX_WEB_RESULTS = 5
MAX_WEB_PAGES = 3
MAX_INTERNAL_PROGRAMS = 8
MAX_INTERNAL_MATCHES = 6

SEARCH_CACHE: Dict[str, Tuple[float, List[Dict[str, Any]]]] = {}
PAGE_CACHE: Dict[str, Tuple[float, str]] = {}

_web_search_client: Optional[WebSearch] = None
_firecrawl_client: Optional[FirecrawlClient] = None


class BudgetContext(BaseModel):
    model_config = ConfigDict(extra="ignore")

    currency: Optional[str] = None
    max: Optional[float] = None


class AcademicsContext(BaseModel):
    model_config = ConfigDict(extra="ignore")

    gpa: Optional[float] = None
    gpaScale: Optional[str] = None
    graduationYear: Optional[int] = None
    backlogs: Optional[int] = None
    workExperienceMonths: Optional[int] = None


class ProfileContext(BaseModel):
    model_config = ConfigDict(extra="ignore")

    sourceId: Optional[str] = None
    stage: Optional[str] = None
    targetIntake: Optional[str] = None
    targetCountries: List[str] = Field(default_factory=list)
    level: Optional[str] = None
    major: Optional[str] = None
    budget: BudgetContext = Field(default_factory=BudgetContext)
    academics: AcademicsContext = Field(default_factory=AcademicsContext)
    tests: Dict[str, Any] = Field(default_factory=dict)
    fundingNeed: Optional[bool] = None


class ProgramDeadlineContext(BaseModel):
    model_config = ConfigDict(extra="ignore")

    term: str
    deadline: str


class ProgramRequirementContext(BaseModel):
    model_config = ConfigDict(extra="ignore")

    key: str
    value: str


class SavedProgramContext(BaseModel):
    model_config = ConfigDict(extra="ignore")

    sourceId: Optional[str] = None
    programId: str
    title: str
    university: str
    countryCode: str
    country: str
    level: str
    field: str
    tuitionUSD: Dict[str, Optional[float]] = Field(default_factory=dict)
    deadlines: List[ProgramDeadlineContext] = Field(default_factory=list)
    requirements: List[ProgramRequirementContext] = Field(default_factory=list)
    sourceUrl: Optional[str] = None


class MatchTopContext(BaseModel):
    model_config = ConfigDict(extra="ignore")

    sourceId: Optional[str] = None
    resultId: str
    programId: Optional[str] = None
    title: str
    university: Optional[str] = None
    countryCode: Optional[str] = None
    score: float
    reasons: List[str] = Field(default_factory=list)


class TimelineSummaryContext(BaseModel):
    model_config = ConfigDict(extra="ignore")

    sourceId: Optional[str] = None
    roadmapId: str
    countryCode: str
    intake: Optional[str] = None
    range: Dict[str, str] = Field(default_factory=dict)
    highlights: List[str] = Field(default_factory=list)


class StrategySummaryContext(BaseModel):
    model_config = ConfigDict(extra="ignore")

    sourceId: Optional[str] = None
    strategyId: str
    countryCode: str
    intake: Optional[str] = None
    summary: Optional[str] = None
    admissionBand: Optional[str] = None
    recommendedActions: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)


class UserContext(BaseModel):
    model_config = ConfigDict(extra="ignore")

    profile: Optional[ProfileContext] = None
    savedPrograms: List[SavedProgramContext] = Field(default_factory=list)
    matchTop: List[MatchTopContext] = Field(default_factory=list)
    timelineSummary: Optional[TimelineSummaryContext] = None
    strategySummary: Optional[StrategySummaryContext] = None


class ConversationTurn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    role: Literal["user", "assistant"]
    content: str


class ConversationContext(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: Optional[str] = None
    history: List[ConversationTurn] = Field(default_factory=list)


class ChatAnswerRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    message: str = Field(..., min_length=1, max_length=4000)
    userContext: UserContext = Field(default_factory=UserContext)
    conversation: Optional[ConversationContext] = None


class ChatSource(BaseModel):
    type: Literal["internal", "web"]
    title: str
    id: Optional[str] = None
    url: Optional[str] = None


class ChatAnswerResponse(BaseModel):
    answer: str
    bullets: List[str] = Field(default_factory=list)
    nextSteps: List[str] = Field(default_factory=list)
    sources: List[ChatSource] = Field(default_factory=list)
    confidence: Literal["high", "medium", "low"] = "medium"


class WebEvidence(BaseModel):
    source_id: str
    title: str
    url: str
    snippet: str = ""
    extract: str = ""
    credibility: str = "credible"


INTERNAL_KEYWORDS = (
    "saved",
    "compare",
    "deadline",
    "deadlines",
    "program",
    "programs",
    "match",
    "timeline",
    "strategy",
    "profile",
)

WEB_KEYWORDS = (
    "visa",
    "latest",
    "news",
    "update",
    "updates",
    "rule",
    "rules",
    "policy",
    "policies",
    "scholarship",
    "scholarships",
)


def _clean_text(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def _clean_string_list(value: Any, limit: int = 5) -> List[str]:
    if not isinstance(value, list):
        return []
    cleaned: List[str] = []
    for item in value:
        text = _clean_text(item)
        if text:
            cleaned.append(text)
        if len(cleaned) >= limit:
            break
    return cleaned


def _unique_preserve_order(values: List[str]) -> List[str]:
    seen = set()
    ordered: List[str] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        ordered.append(value)
    return ordered


def _has_internal_context(user_context: UserContext) -> bool:
    return bool(
        user_context.profile
        or user_context.savedPrograms
        or user_context.matchTop
        or user_context.timelineSummary
        or user_context.strategySummary
    )


def _route_intent(message: str, user_context: UserContext) -> Tuple[bool, bool]:
    lowered = message.lower()
    needs_internal = any(keyword in lowered for keyword in INTERNAL_KEYWORDS)
    needs_web = any(keyword in lowered for keyword in WEB_KEYWORDS)

    if "my " in lowered or "me " in lowered or "for me" in lowered:
        needs_internal = True
    if _has_internal_context(user_context) and not needs_web:
        needs_internal = True
    if "latest" in lowered or "today" in lowered or "current" in lowered:
        needs_web = True

    return needs_internal, needs_web


def _format_budget(profile: ProfileContext) -> str:
    if profile.budget.max:
        currency = profile.budget.currency or "USD"
        return f"{currency} {profile.budget.max:,.0f}/year"
    return "not specified"


def _build_internal_lane(user_context: UserContext) -> Tuple[str, Dict[str, ChatSource], List[str]]:
    lines: List[str] = []
    sources: Dict[str, ChatSource] = {}
    fallback_ids: List[str] = []

    if user_context.profile:
        profile = user_context.profile
        source_id = profile.sourceId or "profile"
        sources[source_id] = ChatSource(type="internal", title="Profile snapshot", id=source_id)
        fallback_ids.append(source_id)

        tests = ", ".join(f"{key}: {value}" for key, value in profile.tests.items()) or "not provided"
        countries = ", ".join(profile.targetCountries) or "not specified"
        lines.append(
            f"- {source_id} | Profile | stage={profile.stage or 'not specified'} | "
            f"intake={profile.targetIntake or 'not specified'} | countries={countries} | "
            f"level={profile.level or 'not specified'} | major={profile.major or 'not specified'} | "
            f"budget={_format_budget(profile)} | GPA={profile.academics.gpa or 'not provided'} "
            f"({profile.academics.gpaScale or 'scale n/a'}) | tests={tests} | "
            f"fundingNeed={profile.fundingNeed if profile.fundingNeed is not None else 'unknown'}"
        )

    for program in user_context.savedPrograms[:MAX_INTERNAL_PROGRAMS]:
        source_id = program.sourceId or f"program:{program.programId}"
        sources[source_id] = ChatSource(
            type="internal",
            title=f"Program: {program.title} - {program.university}",
            id=source_id,
        )
        fallback_ids.append(source_id)
        deadlines = ", ".join(f"{item.term} {item.deadline[:10]}" for item in program.deadlines) or "none listed"
        requirements = ", ".join(f"{item.key}: {item.value}" for item in program.requirements) or "none listed"
        tuition = program.tuitionUSD or {}
        tuition_text = (
            f"USD {tuition.get('min') or '?'}-{tuition.get('max') or '?'}"
            if tuition.get("min") is not None or tuition.get("max") is not None
            else "not listed"
        )
        lines.append(
            f"- {source_id} | Saved program | {program.title} @ {program.university} ({program.country}) | "
            f"level={program.level} | field={program.field} | tuition={tuition_text} | "
            f"deadlines={deadlines} | requirements={requirements}"
        )

    for match in user_context.matchTop[:MAX_INTERNAL_MATCHES]:
        source_id = match.sourceId or f"match:{match.resultId}"
        if source_id not in sources:
            title = f"Match result: {match.title}"
            if match.university:
                title = f"{title} - {match.university}"
            sources[source_id] = ChatSource(type="internal", title=title, id=source_id)
        fallback_ids.append(source_id)
        reasons = ", ".join(match.reasons) or "no reasons provided"
        lines.append(
            f"- {source_id} | Match result | score={match.score:.2f} | title={match.title} | "
            f"university={match.university or 'unknown'} | reasons={reasons}"
        )

    if user_context.timelineSummary:
        timeline = user_context.timelineSummary
        source_id = timeline.sourceId or f"roadmap:{timeline.roadmapId}"
        sources[source_id] = ChatSource(
            type="internal",
            title=f"Timeline roadmap: {timeline.countryCode}",
            id=source_id,
        )
        fallback_ids.append(source_id)
        highlights = ", ".join(timeline.highlights) or "no highlights stored"
        start_month = timeline.range.get("startMonth", "unknown")
        end_month = timeline.range.get("endMonth", "unknown")
        lines.append(
            f"- {source_id} | Timeline | country={timeline.countryCode} | intake={timeline.intake or 'not specified'} | "
            f"range={start_month} to {end_month} | highlights={highlights}"
        )

    if user_context.strategySummary:
        strategy = user_context.strategySummary
        source_id = strategy.sourceId or f"strategy:{strategy.strategyId}"
        sources[source_id] = ChatSource(
            type="internal",
            title=f"Strategy report: {strategy.countryCode}",
            id=source_id,
        )
        fallback_ids.append(source_id)
        actions = ", ".join(strategy.recommendedActions) or "no actions stored"
        risks = ", ".join(strategy.risks) or "no risks stored"
        lines.append(
            f"- {source_id} | Strategy | country={strategy.countryCode} | intake={strategy.intake or 'not specified'} | "
            f"admissionBand={strategy.admissionBand or 'unknown'} | summary={strategy.summary or 'none'} | "
            f"actions={actions} | risks={risks}"
        )

    if not lines:
        lines.append("- No internal context available.")

    return "\n".join(lines), sources, _unique_preserve_order(fallback_ids)


def _credibility_score(url: str, title: str = "") -> Tuple[int, str]:
    hostname = urlparse(url).netloc.lower()
    title_lower = title.lower()
    score = 0
    label = "credible"

    if hostname.endswith(".gov") or ".gov." in hostname:
        score += 8
        label = "official government"
    elif hostname.endswith(".edu") or ".edu." in hostname or hostname.endswith(".ac.uk"):
        score += 7
        label = "official university"
    elif any(term in hostname for term in ("university", "college", "daad", "chevening", "fulbright")):
        score += 5
        label = "official organization"
    elif any(term in hostname for term in ("reddit", "youtube", "facebook", "instagram", "linkedin", "quora")):
        score -= 8
        label = "low trust"

    if "official" in title_lower:
        score += 1

    return score, label


def _build_web_query(message: str, user_context: UserContext) -> str:
    parts = [message.strip()]
    profile = user_context.profile

    if profile:
        if profile.targetCountries:
            parts.append(" ".join(profile.targetCountries[:2]))
        if profile.major:
            parts.append(profile.major)
        if profile.level:
            parts.append(profile.level)

    lowered = message.lower()
    if any(keyword in lowered for keyword in ("visa", "scholarship", "latest", "news", "rules", "policy")):
        parts.append("official")

    return " ".join(part for part in parts if part).strip()


def _get_web_search_client() -> WebSearch:
    global _web_search_client
    if _web_search_client is None:
        _web_search_client = WebSearch()
    return _web_search_client


def _get_firecrawl_client() -> Optional[FirecrawlClient]:
    global _firecrawl_client
    if not settings.FIRECRAWL_API_KEY:
        return None
    if _firecrawl_client is None:
        _firecrawl_client = FirecrawlClient()
    return _firecrawl_client


async def _search_web(query: str) -> List[Dict[str, Any]]:
    cached = SEARCH_CACHE.get(query)
    now = time.time()
    if cached and now - cached[0] < SEARCH_CACHE_TTL_SECONDS:
        return cached[1]

    results = await _get_web_search_client().search(query, num_results=MAX_WEB_RESULTS)
    SEARCH_CACHE[query] = (now, results)
    return results


async def _fetch_page_extract(url: str) -> str:
    cached = PAGE_CACHE.get(url)
    now = time.time()
    if cached and now - cached[0] < PAGE_CACHE_TTL_SECONDS:
        return cached[1]

    firecrawl = _get_firecrawl_client()
    if not firecrawl:
        return ""

    raw_text = await firecrawl.scrape_url(url)
    if not raw_text:
        return ""

    cleaned = " ".join(raw_text.split())
    cleaned = cleaned[:2400]
    PAGE_CACHE[url] = (now, cleaned)
    return cleaned


async def _build_web_lane(message: str, user_context: UserContext) -> Tuple[str, Dict[str, ChatSource], List[str], Optional[str]]:
    if not settings.SERPER_APIKEY:
        return (
            "Fresh web search is unavailable because SERPER_API_KEY is not configured.",
            {},
            [],
            "Fresh web verification is currently unavailable.",
        )

    query = _build_web_query(message, user_context)
    raw_results = await _search_web(query)
    if raw_results and raw_results[0].get("error"):
        warning = raw_results[0]["error"]
        logger.warning(f"[chat] serper returned an error for query={query!r}: {warning}")
        return ("Fresh web search failed.", {}, [], "Fresh web verification is currently unavailable.")

    ranked_results: List[Dict[str, Any]] = []
    seen_urls = set()
    for result in raw_results:
        url = _clean_text(result.get("link"))
        title = _clean_text(result.get("title"))
        snippet = _clean_text(result.get("snippet"))
        if not url or url in seen_urls:
            continue
        seen_urls.add(url)
        score, credibility = _credibility_score(url, title)
        ranked_results.append(
            {
                "title": title or url,
                "url": url,
                "snippet": snippet,
                "position": result.get("position", 999),
                "score": score,
                "credibility": credibility,
            }
        )

    ranked_results.sort(key=lambda item: (-int(item["score"]), int(item["position"])))

    sources: Dict[str, ChatSource] = {}
    fallback_ids: List[str] = []
    evidence_lines: List[str] = []

    for index, result in enumerate(ranked_results[:MAX_WEB_PAGES], start=1):
        source_id = f"web:{index}"
        extract = await _fetch_page_extract(result["url"])
        evidence = WebEvidence(
            source_id=source_id,
            title=result["title"],
            url=result["url"],
            snippet=result["snippet"],
            extract=extract,
            credibility=result["credibility"],
        )
        sources[source_id] = ChatSource(type="web", title=evidence.title, url=evidence.url)
        fallback_ids.append(source_id)

        summary_text = evidence.extract or evidence.snippet or "No extract available."
        evidence_lines.append(
            f"- {source_id} | {evidence.title} | {evidence.url} | credibility={evidence.credibility} | "
            f"evidence={summary_text}"
        )

    if not evidence_lines:
        evidence_lines.append("- No fresh web evidence found.")

    return "\n".join(evidence_lines), sources, fallback_ids, None


def _history_to_text(conversation: Optional[ConversationContext]) -> str:
    if not conversation or not conversation.history:
        return "No prior conversation history."

    lines = []
    for turn in conversation.history[-6:]:
        speaker = "User" if turn.role == "user" else "Assistant"
        lines.append(f"{speaker}: {turn.content.strip()}")
    return "\n".join(lines)


def _build_prompt(
    request: ChatAnswerRequest,
    *,
    needs_internal: bool,
    needs_web: bool,
    internal_context_text: str,
    web_context_text: str,
    web_warning: Optional[str],
) -> str:
    return f"""
User question:
{request.message.strip()}

Conversation history:
{_history_to_text(request.conversation)}

Routing:
- Internal lane active: {"yes" if needs_internal else "no"}
- Web lane active: {"yes" if needs_web else "no"}
- Web warning: {web_warning or "none"}

Internal evidence:
{internal_context_text}

Web evidence:
{web_context_text}

Instructions:
1. You are an international education consultant writing in professional international English.
2. Advice only. Do not offer to save programs, edit profiles, run matches, or take actions on the user's behalf.
3. Never guarantee admissions, scholarships, or visa outcomes.
4. Prefer internal evidence for personalised recommendations. Use web evidence for fresh external facts, especially visas, policy changes, or live scholarships.
5. If key data is missing or fresh web verification is unavailable, say that clearly.
6. Every important claim must be backed by source IDs from the evidence above.
7. Keep the answer compact: one short paragraph, 2-5 bullets, and 2-4 next steps.

Return ONLY valid JSON with this exact shape:
{{
  "answer": "string",
  "bullets": ["string"],
  "nextSteps": ["string"],
  "confidence": "high|medium|low",
  "sourceIds": ["source-id"]
}}
""".strip()


def _provider_sequence() -> List[Optional[LLMProvider]]:
    configured = (settings.LLM_PROVIDER or "").strip().lower()
    providers: List[Optional[LLMProvider]] = []

    if configured == "gemini":
        providers.append(LLMProvider.GEMINI)
    elif configured == "openrouter":
        providers.append(LLMProvider.OPENROUTER)
    elif settings.OPENROUTER_API_KEY:
        providers.append(LLMProvider.OPENROUTER)
    elif settings.GEMINI_API_KEY:
        providers.append(LLMProvider.GEMINI)
    else:
        providers.append(None)

    if settings.GEMINI_API_KEY and LLMProvider.GEMINI not in providers:
        providers.append(LLMProvider.GEMINI)

    return providers


async def _generate_structured_answer(prompt: str) -> Dict[str, Any]:
    system_prompt = (
        "You are EducAI's advice-only admissions consultant. "
        "Return strict JSON only, grounded in the provided evidence, and always cite source IDs."
    )

    last_error: Optional[Exception] = None
    for provider in _provider_sequence():
        try:
            content = await generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.2,
                json_mode=True,
                provider=provider,
            )
            return parse_json_response(content)
        except RateLimitError:
            raise
        except Exception as exc:
            provider_name = provider.value if isinstance(provider, LLMProvider) else "auto"
            logger.warning(f"[chat] provider={provider_name} failed: {exc}")
            last_error = exc

    raise RuntimeError(f"All configured LLM providers failed: {last_error}")


def normalize_chat_response(
    raw_payload: Any,
    source_catalog: Dict[str, ChatSource],
    fallback_source_ids: List[str],
) -> ChatAnswerResponse:
    payload = raw_payload if isinstance(raw_payload, dict) else {}
    answer = _clean_text(payload.get("answer"))
    bullets = _clean_string_list(payload.get("bullets"))
    next_steps = _clean_string_list(payload.get("nextSteps"))
    requested_ids = _clean_string_list(payload.get("sourceIds"), limit=6)

    if not answer:
        if bullets:
            answer = bullets[0]
        else:
            answer = "I could not produce a reliable answer from the available evidence."

    confidence = _clean_text(payload.get("confidence")).lower()
    if confidence not in {"high", "medium", "low"}:
        confidence = "medium" if source_catalog else "low"

    source_ids = _unique_preserve_order(requested_ids or fallback_source_ids)
    if not source_ids:
        source_ids = list(source_catalog.keys())[:3]

    sources = [source_catalog[source_id] for source_id in source_ids if source_id in source_catalog][:6]
    if not sources:
        confidence = "low"

    return ChatAnswerResponse(
        answer=answer,
        bullets=bullets,
        nextSteps=next_steps,
        sources=sources,
        confidence=confidence,  # type: ignore[arg-type]
    )


@router.post("/chat", response_model=ChatAnswerResponse, deprecated=True)
@router.post("/chat/answer", response_model=ChatAnswerResponse)
async def answer_chat(request: ChatAnswerRequest) -> ChatAnswerResponse:
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message is required.")

    needs_internal, needs_web = _route_intent(message, request.userContext)

    internal_context_text, internal_sources, internal_fallback = _build_internal_lane(request.userContext)
    web_context_text = "Fresh web lane not required for this question."
    web_sources: Dict[str, ChatSource] = {}
    web_fallback: List[str] = []
    web_warning: Optional[str] = None

    if needs_web:
        web_context_text, web_sources, web_fallback, web_warning = await _build_web_lane(message, request.userContext)

    source_catalog = {**internal_sources, **web_sources}
    fallback_source_ids = _unique_preserve_order(internal_fallback + web_fallback)
    prompt = _build_prompt(
        request,
        needs_internal=needs_internal,
        needs_web=needs_web,
        internal_context_text=internal_context_text,
        web_context_text=web_context_text,
        web_warning=web_warning,
    )

    try:
        raw_answer = await _generate_structured_answer(prompt)
    except RateLimitError as exc:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc)) from exc
    except Exception as exc:
        logger.error(f"[chat] generation failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="LLM provider error. Please try again shortly.",
        ) from exc

    response = normalize_chat_response(raw_answer, source_catalog, fallback_source_ids)
    if needs_web and web_warning and not response.sources:
        response.confidence = "low"

    return response
