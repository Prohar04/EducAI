"""Push scraped Module 1 data to the server ingestion endpoint.

/internal/module1/ingest

Usage inside the RAG pipeline (after structured extraction):

    from ..ingestion.server_client import server_ingestion_client

    await server_ingestion_client.push_module1(
        run_id=task_id,
        recommendations=recs,        # List[RecommendationOutput]
        target_degree=pref.target_degree,
        major=pref.major,
    )
"""

import json
from pathlib import Path
from typing import List, Optional

import httpx

from ...core.config import settings
from ...core.logger import logger

# Fallback directory for failed payloads
_FAILED_DIR = Path(__file__).resolve().parent.parent.parent.parent / "logs"

# ── Country name → ISO 3166-1 alpha-2 code ─────────────────────────────── #

_COUNTRY_MAP: dict[str, str] = {
    "united states": "US",
    "usa": "US",
    "u.s.a.": "US",
    "us": "US",
    "united kingdom": "GB",
    "uk": "GB",
    "great britain": "GB",
    "canada": "CA",
    "australia": "AU",
    "germany": "DE",
    "france": "FR",
    "netherlands": "NL",
    "sweden": "SE",
    "norway": "NO",
    "denmark": "DK",
    "finland": "FI",
    "singapore": "SG",
    "new zealand": "NZ",
    "ireland": "IE",
    "japan": "JP",
    "south korea": "KR",
    "china": "CN",
    "india": "IN",
    "malaysia": "MY",
    "uae": "AE",
    "united arab emirates": "AE",
    "switzerland": "CH",
    "italy": "IT",
    "spain": "ES",
    "portugal": "PT",
    "austria": "AT",
    "belgium": "BE",
    "hong kong": "HK",
    "taiwan": "TW",
    "thailand": "TH",
    "indonesia": "ID",
    "brazil": "BR",
    "mexico": "MX",
    "south africa": "ZA",
}


def _to_country_code(country_name: str) -> str:
    """Best-effort country name → ISO 3166-1 alpha-2 code."""
    key = country_name.strip().lower()
    return _COUNTRY_MAP.get(key, country_name[:2].upper())


def _to_level(target_degree: str) -> str:
    """Map a free-text degree preference to the canonical Program level."""
    d = target_degree.strip().upper().replace(" ", "")
    if d in ("BSC", "BACHELOR", "BACHELORS", "UNDERGRADUATE"):
        return "BSC"
    if d in ("MSC", "MASTER", "MASTERS", "GRADUATE", "POSTGRADUATE"):
        return "MSC"
    if d in ("PHD", "DOCTORATE", "DOCTORAL"):
        return "PHD"
    return "MSC"  # sensible default


# ── Client ──────────────────────────────────────────────────────────────── #


class ServerIngestionClient:
    """Transforms RAG recommendations into the canonical Module 1 payload
    and POSTs it to the Node server's /internal/module1/ingest endpoint."""

    def __init__(self) -> None:
        self._base_url: str = (settings.SERVER_BASE_URL or "http://localhost:8000").rstrip("/")
        self._key: Optional[str] = settings.INGEST_API_KEY

    async def push_module1(
        self,
        run_id: str,
        recommendations: list,  # List[RecommendationOutput]
        target_degree: str,
        major: str,
    ) -> dict:
        """Transform and POST scraped recommendations to the server.

        If INGEST_API_KEY is not configured the call is skipped with a warning.
        On HTTP or network failure the payload is written to
        logs/failed_ingest_<run_id>.json for manual retry.
        """
        if not self._key:
            logger.warning(f"[ingest:{run_id}] INGEST_API_KEY not set — skipping Module 1 server push.")
            return {}

        payload = self._build_payload(run_id, recommendations, target_degree, major)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{self._base_url}/internal/module1/ingest",
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "X-INGEST-KEY": self._key,
                    },
                )
                resp.raise_for_status()
                result: dict = resp.json()
                logger.info(f"[ingest:{run_id}] ✓ pushed {len(recommendations)} recs → {result.get('upserted', {})}")
                return result
        except Exception as exc:
            logger.error(f"[ingest:{run_id}] Server push failed: {exc}")
            self._save_failed(run_id, payload)
            raise

    # ── Internal helpers ─────────────────────────────────────────────────── #

    @staticmethod
    def _build_payload(
        run_id: str,
        recommendations: list,
        target_degree: str,
        major: str,
    ) -> dict:
        """Group recommendations by country/university.

        Returns the canonical JSON payload."""
        # country_code → { code, name, universities: { univ_name → {...} } }
        by_country: dict = {}

        for rec in recommendations:
            code = _to_country_code(rec.country)
            if code not in by_country:
                by_country[code] = {
                    "code": code,
                    "name": rec.country,
                    "universities": {},
                }
            univs = by_country[code]["universities"]

            if rec.university_name not in univs:
                univs[rec.university_name] = {
                    "name": rec.university_name,
                    "city": None,
                    "website": None,
                    "description": None,
                    "sourceUrl": rec.source_url,
                    "programs": [],
                }

            # Build deadline entry (skip "Rolling" / unparseable)
            deadlines: List[dict] = []
            dl = rec.application_deadline or ""
            if dl and dl.lower() != "rolling":
                deadlines.append({"term": "Application Deadline", "deadline": dl})

            univs[rec.university_name]["programs"].append(
                {
                    "title": rec.program_name,
                    "field": major,
                    "level": _to_level(target_degree),
                    "durationMonths": None,
                    "tuitionMinUSD": rec.tuition_fee_usd or None,
                    "tuitionMaxUSD": rec.tuition_fee_usd or None,
                    "description": None,
                    "sourceUrl": rec.source_url,
                    "requirements": [],
                    "deadlines": deadlines,
                }
            )

        countries = [
            {
                "code": c["code"],
                "name": c["name"],
                "universities": list(c["universities"].values()),
            }
            for c in by_country.values()
        ]

        return {
            "source": "firecrawl_grok",
            "runId": run_id,
            "countries": countries,
        }

    def _save_failed(self, run_id: str, payload: dict) -> None:
        """Persist a failed payload to disk so it can be retried manually."""
        try:
            _FAILED_DIR.mkdir(parents=True, exist_ok=True)
            path = _FAILED_DIR / f"failed_ingest_{run_id}.json"
            with open(path, "w", encoding="utf-8") as fh:
                json.dump(payload, fh, indent=2, default=str)
            logger.info(f"[ingest:{run_id}] Failed payload saved → {path}")
        except Exception as save_exc:
            logger.error(f"[ingest:{run_id}] Could not save failed payload: {save_exc}")


# Module-level singleton (created lazily to allow tests to patch settings)
server_ingestion_client = ServerIngestionClient()
