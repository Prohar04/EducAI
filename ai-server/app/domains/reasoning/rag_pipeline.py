"""Educational RAG (Retrieval-Augmented Generation) Pipeline.

Four phases, run as a FastAPI BackgroundTask:

  Phase A  — ChromaDB cache check
                Embed the student's preferences, query the vector store, and
                re-use existing Prisma recommendations when they are < 6 months
                old and sufficiently similar (cosine score > 0.85).

  Phase B  — LLM-guided search & Firecrawl scrape
                Ask the LLM to produce 3 targeted Google queries, execute them
                through the Serper API, then scrape the top URLs with
                Firecrawl.  Returns concatenated markdown.

  Phase C  — Structured extraction → Prisma + ChromaDB
                Feed the markdown to the LLM (bound to RecommendationList via
                with_structured_output), persist each recommendation to
                Postgres, create the join record, and upsert the embedding for
                future cache hits.
"""

import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import chromadb
from langchain_chroma import Chroma
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from ...core.config import settings
from ...core.logger import logger
from ...db.prisma_connect import db
from ...schemas.education import (
    RecommendationList,
    RecommendationOutput,
    UserPreferenceInput,
)
from ..scrapping.firecrawl_client import FirecrawlClient
from ..searching.webSearch import WebSearch
from ..ingestion.server_client import server_ingestion_client

# ── Configuration ─────────────────────────────────────────────────────────── #
_CHROMA_COLLECTION = "edu_recommendations"
_SIMILARITY_THRESHOLD = 0.85
_CACHE_TTL_DAYS = 180       # 6 months
_MAX_URLS_TO_SCRAPE = 9
_MAX_MARKDOWN_CHARS = 50_000
_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
_LLM_MODEL = "openai/gpt-4o-mini"

# ── Small pure helpers ─────────────────────────────────────────────────────── #

def _pref_to_text(pref: UserPreferenceInput) -> str:
    return (
        f"{pref.target_degree} in {pref.major}, "
        f"budget ${pref.budget_limit_usd} USD, "
        f"countries: {', '.join(pref.preferred_countries)}, "
        f"GPA {pref.current_gpa}"
    )


def _rec_to_text(rec: RecommendationOutput) -> str:
    parts = [
        rec.university_name,
        rec.program_name,
        rec.country,
        f"${rec.tuition_fee_usd} tuition",
    ]
    if rec.scholarship_name:
        amt = f"${rec.scholarship_amount_usd}" if rec.scholarship_amount_usd else "amount TBD"
        parts.append(f"{rec.scholarship_name} ({amt})")
    parts.append(f"deadline: {rec.application_deadline}")
    return ", ".join(parts)


# ── Prompt templates (defined once at module level) ────────────────────────── #

_QUERY_GEN_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            (
                "You are an expert international education researcher. "
                "Generate a JSON array of exactly 3 Google search queries to find "
                "the best matching university programs for the student. "
                "Queries should be specific and include the year {year}. "
                "Respond ONLY with a valid JSON array of 3 strings — no markdown, "
                "no explanation."
            ),
        ),
        (
            "human",
            "Student preferences: {preferences}\n\nReturn exactly 3 search queries as a JSON array.",
        ),
    ]
)

_EXTRACTION_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            (
                "You are a precise data extractor for an educational platform. "
                "From the scraped web content below, extract university/program "
                "recommendation records that best match the student's preferences. "
                "Return up to 5 recommendations. "
                "For any field you cannot determine, use a sensible placeholder "
                "(e.g. tuition_fee_usd = 0, application_deadline = 'Rolling')."
            ),
        ),
        (
            "human",
            (
                "Student preferences: {preferences}\n\n"
                "Scraped content (truncated):\n{markdown}\n\n"
                "Extract structured university recommendations."
            ),
        ),
    ]
)


# ── Pipeline class ─────────────────────────────────────────────────────────── #

class EduRAGPipeline:
    """Stateless-ish pipeline instance.

    Heavy objects (LangChain clients, vector store) are created once at startup
    and reused across all background tasks.
    """

    def __init__(self) -> None:
        self._embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=settings.OPEN_ROUTER_APIKEY,
            base_url=_OPENROUTER_BASE_URL,
        )
        self._llm = ChatOpenAI(
            model=_LLM_MODEL,
            api_key=settings.OPEN_ROUTER_APIKEY,
            base_url=_OPENROUTER_BASE_URL,
            temperature=0.1,
        )
        _chroma_client = chromadb.HttpClient(
            host=settings.CHROMADB_HOST,
            port=settings.CHROMADB_PORT,
        )
        self._vector_store = Chroma(
            collection_name=_CHROMA_COLLECTION,
            embedding_function=self._embeddings,
            client=_chroma_client,
        )
        self._web_search = WebSearch()
        self._firecrawl = FirecrawlClient()

    # ── Public entry point ───────────────────────────────────────────────── #

    async def run(
        self,
        task_id: str,
        pref: UserPreferenceInput,
        pref_db_id: str,
    ) -> None:
        """Execute the full pipeline for one preferences record."""
        logger.info(f"[{task_id}] RAG pipeline started.")
        try:
            # Phase A — cache check
            cached_ids = await self._phase_a_cache_check(task_id, pref)
            if cached_ids:
                await self._link_recommendations(task_id, pref_db_id, cached_ids)
                logger.info(
                    f"[{task_id}] Cache HIT — linked {len(cached_ids)} existing records."
                )
                return

            logger.info(f"[{task_id}] Cache MISS — proceeding to search & scrape.")

            # Phase B — search & scrape
            markdown = await self._phase_b_search_scrape(task_id, pref)
            if not markdown:
                logger.warning(f"[{task_id}] No content scraped. Aborting pipeline.")
                return

            # Phase C — structure & save
            await self._phase_c_structure_save(task_id, pref, pref_db_id, markdown)
            logger.info(f"[{task_id}] RAG pipeline completed.")

        except Exception:
            logger.exception(f"[{task_id}] Unhandled error in RAG pipeline.")

    # ── Phase A ──────────────────────────────────────────────────────────── #

    async def _phase_a_cache_check(
        self,
        task_id: str,
        pref: UserPreferenceInput,
    ) -> List[str]:
        """Return Prisma IDs of fresh cached recommendations, or an empty list."""
        pref_text = _pref_to_text(pref)
        cutoff = datetime.now(tz=timezone.utc) - timedelta(days=_CACHE_TTL_DAYS)

        try:
            results = await self._vector_store.asimilarity_search_with_relevance_scores(
                pref_text, k=3
            )
        except Exception as e:
            logger.error(f"[{task_id}] ChromaDB query failed: {e}")
            return []

        cached_ids: List[str] = []
        for doc, score in results:
            if score < _SIMILARITY_THRESHOLD:
                continue
            scraped_at_str: Optional[str] = doc.metadata.get("scraped_at")
            if not scraped_at_str:
                continue
            try:
                scraped_at = datetime.fromisoformat(scraped_at_str)
                if scraped_at.tzinfo is None:
                    scraped_at = scraped_at.replace(tzinfo=timezone.utc)
            except ValueError:
                continue
            if scraped_at >= cutoff:
                prisma_id: Optional[str] = doc.metadata.get("prisma_id")
                if prisma_id:
                    cached_ids.append(prisma_id)

        return cached_ids

    # ── Phase B ──────────────────────────────────────────────────────────── #

    async def _phase_b_search_scrape(
        self,
        task_id: str,
        pref: UserPreferenceInput,
    ) -> str:
        """Generate search queries → search Serper → scrape Firecrawl.

        Returns concatenated markdown from all scraped pages.
        """
        # B1 — LLM query generation
        queries = await self._generate_search_queries(task_id, pref)
        logger.info(f"[{task_id}] Search queries: {queries}")

        # B2 — Serper search (parallel)
        search_tasks = [self._web_search.search(q, num_results=3) for q in queries]
        try:
            search_results_list = await asyncio.gather(
                *search_tasks, return_exceptions=True
            )
        except Exception as e:
            logger.error(f"[{task_id}] Serper batch search failed: {e}")
            return ""

        all_urls: List[str] = []
        for result in search_results_list:
            if isinstance(result, list):
                for item in result:
                    url: Optional[str] = item.get("link")
                    if url:
                        all_urls.append(url)

        # Deduplicate, preserve order, cap
        all_urls = list(dict.fromkeys(all_urls))[:_MAX_URLS_TO_SCRAPE]
        if not all_urls:
            logger.warning(f"[{task_id}] No URLs found from Serper.")
            return ""

        logger.info(f"[{task_id}] Scraping {len(all_urls)} URLs via Firecrawl.")

        # B3 — Firecrawl scrape (parallel inside FirecrawlClient.scrape_urls)
        try:
            markdown_pieces = await self._firecrawl.scrape_urls(all_urls)
        except Exception as e:
            logger.error(f"[{task_id}] Firecrawl batch scrape failed: {e}")
            return ""

        return "\n\n---\n\n".join(markdown_pieces)

    async def _generate_search_queries(
        self,
        task_id: str,
        pref: UserPreferenceInput,
    ) -> List[str]:
        """Ask the LLM for 3 targeted search queries; fall back on error."""
        try:
            chain = _QUERY_GEN_PROMPT | self._llm | JsonOutputParser()
            raw = await chain.ainvoke(
                {
                    "preferences": _pref_to_text(pref),
                    "year": datetime.now(tz=timezone.utc).year,
                }
            )
            queries = raw if isinstance(raw, list) else []
            # Sanitise: keep only string entries, cap at 3
            queries = [q for q in queries if isinstance(q, str)][:3]
            if queries:
                return queries
        except Exception as e:
            logger.error(f"[{task_id}] Query generation LLM call failed: {e}")

        # Fallback: construct a basic query from preferences
        countries = " ".join(pref.preferred_countries[:2])
        return [
            f"{pref.target_degree} programs {pref.major} {countries} {datetime.now().year}",
            f"fully funded {pref.major} {pref.target_degree} scholarship {countries}",
            f"best universities {pref.major} {countries} admission requirements",
        ]

    # ── Phase C ──────────────────────────────────────────────────────────── #

    async def _phase_c_structure_save(
        self,
        task_id: str,
        pref: UserPreferenceInput,
        pref_db_id: str,
        markdown: str,
    ) -> None:
        """Extract structured recommendations → Prisma → ChromaDB."""
        structured_llm = self._llm.with_structured_output(RecommendationList)
        chain = _EXTRACTION_PROMPT | structured_llm

        try:
            result: RecommendationList = await chain.ainvoke(
                {
                    "preferences": _pref_to_text(pref),
                    "markdown": markdown[:_MAX_MARKDOWN_CHARS],
                }
            )
        except Exception as e:
            logger.error(f"[{task_id}] Structured extraction failed: {e}")
            return

        recs: List[RecommendationOutput] = (
            result.recommendations if result and result.recommendations else []
        )
        logger.info(f"[{task_id}] Extracted {len(recs)} recommendation(s).")

        scraped_at = datetime.now(tz=timezone.utc)

        for rec in recs:
            await self._persist_recommendation(task_id, pref_db_id, rec, scraped_at)

        # Push normalized data to server Module 1 tables
        if recs:
            try:
                await server_ingestion_client.push_module1(
                    run_id=task_id,
                    recommendations=recs,
                    target_degree=pref.target_degree,
                    major=pref.major,
                )
            except Exception:
                logger.warning(
                    f"[{task_id}] Module 1 server push failed (non-fatal); "
                    "check logs/failed_ingest_*.json for retry payload."
                )

    async def _persist_recommendation(
        self,
        task_id: str,
        pref_db_id: str,
        rec: RecommendationOutput,
        scraped_at: datetime,
    ) -> None:
        """Save one recommendation to Prisma, link it, and index it in ChromaDB."""
        try:
            # 1 — Prisma create
            db_rec = await db.edurecommendation.create(
                data={
                    "universityName": rec.university_name,
                    "programName": rec.program_name,
                    "country": rec.country,
                    "tuitionFeeUsd": rec.tuition_fee_usd,
                    "scholarshipName": rec.scholarship_name,
                    "scholarshipAmountUsd": rec.scholarship_amount_usd,
                    "applicationDeadline": rec.application_deadline,
                    "sourceUrl": rec.source_url,
                    "scrapedAt": scraped_at,
                }
            )

            # 2 — Join record: preference ↔ recommendation
            await db.eduuserrecommendation.create(
                data={
                    "preferenceId": pref_db_id,
                    "recommendationId": db_rec.id,
                }
            )

            # 3 — Embed and insert into ChromaDB
            vector_id = f"edu_rec_{db_rec.id}"
            await self._vector_store.aadd_texts(
                texts=[_rec_to_text(rec)],
                metadatas=[
                    {
                        "prisma_id": db_rec.id,
                        "scraped_at": scraped_at.isoformat(),
                        "university": rec.university_name,
                        "country": rec.country,
                    }
                ],
                ids=[vector_id],
            )

            # 4 — Back-fill the chroma_vector_id so the record is self-describing
            await db.edurecommendation.update(
                where={"id": db_rec.id},
                data={"chromaVectorId": vector_id},
            )

            logger.info(
                f"[{task_id}] Saved: {rec.university_name} / {rec.program_name}"
            )

        except Exception as e:
            logger.error(
                f"[{task_id}] Failed to persist '{rec.university_name}': {e}"
            )

    # ── Helpers ──────────────────────────────────────────────────────────── #

    async def _link_recommendations(
        self,
        task_id: str,
        pref_db_id: str,
        rec_ids: List[str],
    ) -> None:
        """Create EduUserRecommendation join rows for cached hit IDs."""
        for rec_id in rec_ids:
            try:
                await db.eduuserrecommendation.create(
                    data={
                        "preferenceId": pref_db_id,
                        "recommendationId": rec_id,
                    }
                )
            except Exception as e:
                logger.error(
                    f"[{task_id}] Failed to link rec {rec_id} to pref {pref_db_id}: {e}"
                )


# Module-level singleton reused across all background tasks
edu_rag_pipeline = EduRAGPipeline()
