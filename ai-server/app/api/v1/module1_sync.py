"""POST /api/v1/module1/sync

Admin endpoint to manually trigger the Module 1 data pipeline for a
given set of search parameters. Fires the full RAG pipeline in the
background, which scrapes → structures → pushes data to the server's
/internal/module1/ingest endpoint.

Requires the same X-API-KEY auth as other protected routes.
Requires INGEST_API_KEY to be configured (otherwise returns 503).
"""

import uuid
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from ...core.config import settings
from ...core.logger import logger
from ...domains.reasoning.rag_pipeline import edu_rag_pipeline
from ...schemas.education import TaskResponse, UserPreferenceInput

router = APIRouter(tags=["Module 1 Admin Sync"])


@router.post(
    "/sync",
    response_model=TaskResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger Module 1 scrape → structure → ingest pipeline",
)
async def trigger_module1_sync(
    background_tasks: BackgroundTasks,
    major: str = "Computer Science",
    degree: str = "MSC",
    countries: Optional[List[str]] = None,
    budget: int = 30000,
    user_id: str = "admin-sync",
) -> TaskResponse:
    """
    Triggers the RAG pipeline with the given parameters (all optional,
    sensible defaults provided). The pipeline will:
      1. Scrape university/program pages
      2. Extract structured data
      3. Push to /internal/module1/ingest on the Node server

    Returns a task_id immediately for polling.
    """
    if not settings.INGEST_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "INGEST_API_KEY is not configured"
                " — cannot push data to server."
            ),
        )

    resolved_countries = countries or ["US", "UK", "CA", "AU", "DE"]

    pref = UserPreferenceInput(
        user_id=user_id,
        target_degree=degree,
        major=major,
        budget_limit_usd=float(budget),
        preferred_countries=resolved_countries,
        current_gpa=None,
    )

    task_id = uuid.uuid4().hex
    background_tasks.add_task(edu_rag_pipeline.run, task_id, pref, None)
    logger.info(
        f"module1/sync task_id={task_id} major={major}"
        f" degree={degree} countries={resolved_countries}"
    )

    return TaskResponse(status="processing", task_id=task_id)
