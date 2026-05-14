"""Tests for the job search endpoint — keyword, date_posted, and no-API-key paths."""
import os
from contextlib import contextmanager
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.schemas.jobs import JobListing, JobType

client = TestClient(app)

# Resolve configured API key at test-collection time.
_MASTER_KEY: str = (
    os.getenv("MASTER_APIKEY")
    or os.getenv("MASTER_API_KEY")
    or os.getenv("API_KEY")
    or ""
)
API_KEY_HEADER = {"X-API-Key": _MASTER_KEY}

# ── fixtures ──────────────────────────────────────────────────────────────────

_FAKE_LISTING = JobListing(
    title="Software Engineer",
    company="Acme Corp",
    location="Berlin, Germany",
    job_type=JobType.FULL_TIME,
    apply_url="https://example.com/apply/1",
    source="Adzuna",
    is_ai_generated=False,
)

_BASE_PAYLOAD = {
    "country": "Germany",
    "country_code": "DE",
    "city": "Berlin",
    "field": "Computer Science",
    "job_type": "FULL_TIME",
    "page": 1,
}


@contextmanager
def _mock_apis(adzuna_results, jsearch_results):
    """Patch Adzuna/JSearch functions AND their credential guards in the route module."""
    with (
        patch("app.api.v1.jobs.ADZUNA_APP_ID", "fake_id"),
        patch("app.api.v1.jobs.ADZUNA_APP_KEY", "fake_key"),
        patch("app.api.v1.jobs.RAPIDAPI_KEY", "fake_rapidapi"),
        patch("app.api.v1.jobs.fetch_adzuna_jobs", new_callable=AsyncMock) as mock_adzuna,
        patch("app.api.v1.jobs.fetch_jsearch_jobs", new_callable=AsyncMock) as mock_jsearch,
    ):
        mock_adzuna.return_value = adzuna_results
        mock_jsearch.return_value = jsearch_results
        yield mock_adzuna, mock_jsearch


def _needs_key(fn):
    """Skip a test when MASTER_APIKEY is not configured."""
    import pytest
    return pytest.mark.skipif(
        not _MASTER_KEY,
        reason="MASTER_APIKEY not configured — skipping authenticated endpoint tests",
    )(fn)


# ── schema tests (no auth needed) ────────────────────────────────────────────

def test_schema_accepts_keyword():
    from app.schemas.jobs import JobSearchRequest, JobType as JT

    req = JobSearchRequest(
        country="Germany", country_code="DE", city="Berlin",
        field="Computer Science", job_type=JT.FULL_TIME,
        keyword="Machine Learning Engineer", date_posted="week",
    )
    assert req.keyword == "Machine Learning Engineer"
    assert req.date_posted == "week"


def test_schema_keyword_is_optional():
    from app.schemas.jobs import JobSearchRequest, JobType as JT

    req = JobSearchRequest(
        country="Germany", country_code="DE", city="Berlin",
        field="Computer Science", job_type=JT.FULL_TIME,
    )
    assert req.keyword is None
    assert req.date_posted is None


def test_job_search_requires_api_key():
    """Unauthenticated request gets 401."""
    response = client.post("/api/v1/jobs/search", json=_BASE_PAYLOAD)
    assert response.status_code == 401


# ── authenticated route tests ─────────────────────────────────────────────────

@_needs_key
def test_job_search_without_keyword_uses_field_in_query():
    """No keyword → field name appears in query_used."""
    with _mock_apis([_FAKE_LISTING] * 5, []) as (mock_adzuna, _):
        response = client.post(
            "/api/v1/jobs/search", json=_BASE_PAYLOAD, headers=API_KEY_HEADER,
        )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5
    assert data["ai_fallback_used"] is False
    assert "Computer Science" in data["query_used"]
    call_kw = mock_adzuna.call_args.kwargs
    assert call_kw.get("keyword") is None  # no keyword was passed


@_needs_key
def test_keyword_passed_to_adzuna():
    """keyword field reaches fetch_adzuna_jobs and appears in query_used."""
    with _mock_apis([_FAKE_LISTING] * 4, []) as (mock_adzuna, _):
        payload = {**_BASE_PAYLOAD, "keyword": "Machine Learning Engineer"}
        response = client.post(
            "/api/v1/jobs/search", json=payload, headers=API_KEY_HEADER,
        )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 4
    assert "Machine Learning Engineer" in data["query_used"]
    call_kw = mock_adzuna.call_args.kwargs
    assert call_kw.get("keyword") == "Machine Learning Engineer"


@_needs_key
def test_keyword_passed_to_jsearch_when_adzuna_empty():
    """When Adzuna returns nothing, JSearch receives the keyword."""
    with _mock_apis([], [_FAKE_LISTING] * 3) as (_, mock_jsearch):
        payload = {**_BASE_PAYLOAD, "keyword": "Data Analyst"}
        response = client.post(
            "/api/v1/jobs/search", json=payload, headers=API_KEY_HEADER,
        )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert data["source_used"] == "jsearch"
    call_kw = mock_jsearch.call_args.kwargs
    assert call_kw.get("keyword") == "Data Analyst"


@_needs_key
def test_date_posted_passed_to_jsearch():
    """date_posted param is forwarded to JSearch."""
    with _mock_apis([], [_FAKE_LISTING]) as (_, mock_jsearch):
        payload = {**_BASE_PAYLOAD, "date_posted": "week"}
        response = client.post(
            "/api/v1/jobs/search", json=payload, headers=API_KEY_HEADER,
        )

    assert response.status_code == 200
    call_kw = mock_jsearch.call_args.kwargs
    assert call_kw.get("date_posted") == "week"


@_needs_key
def test_empty_result_not_ai_generated():
    """When both APIs return nothing, ai_fallback_used is False and listing list is empty."""
    with _mock_apis([], []) as _:
        response = client.post(
            "/api/v1/jobs/search", json=_BASE_PAYLOAD, headers=API_KEY_HEADER,
        )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["ai_fallback_used"] is False
    assert data["listings"] == []
