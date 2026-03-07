"""POST /api/v1/edu/preferences

Accepts a student's educational preferences, persists them to Postgres,
and fires off the async RAG recommendation pipeline as a background task.
Returns a task_id immediately so the client can poll for results.
"""

import uuid
from typing import List

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from prisma.fields import Json

from ...core.logger import logger
from ...db.prisma_connect import db
from ...domains.reasoning.rag_pipeline import edu_rag_pipeline
from ...schemas.education import (
    EduContextRecord,
    EduPreferenceRecord,
    EduRecommendationRecord,
    TaskResponse,
    UserPreferenceInput,
)

router = APIRouter(tags=["Education Recommendations"])


@router.post(
    "/preferences",
    response_model=TaskResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Submit student preferences and trigger the recommendation pipeline",
)
async def submit_preferences(
    pref: UserPreferenceInput,
    background_tasks: BackgroundTasks,
) -> TaskResponse:
    """
    1. Persists the `UserPreferenceInput` to the `edu_user_preferences` table.
    2. Fires an async background task that runs the full RAG pipeline.
    3. Returns `{"status": "processing", "task_id": "<uuid>"}` immediately.
    """
    try:
        pref_record = await db.eduuserpreference.create(
            data={
                "user": {"connect": {"id": pref.user_id}},
                "targetDegree": pref.target_degree,
                "major": pref.major,
                "budgetLimitUsd": pref.budget_limit_usd,
                "preferredCountries": Json(pref.preferred_countries),
                "currentGpa": pref.current_gpa,
            }
        )
    except Exception as e:
        logger.error(f"Failed to persist EduUserPreference for user {pref.user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save preferences. Please try again.",
        )

    task_id = uuid.uuid4().hex
    background_tasks.add_task(edu_rag_pipeline.run, task_id, pref, pref_record.id)
    logger.info(f"task_id={task_id} queued for user={pref.user_id}")

    return TaskResponse(status="processing", task_id=task_id)


# ---------------------------------------------------------------------------
# Debug / inspection endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/preferences",
    response_model=List[EduPreferenceRecord],
    summary="[DEBUG] List all stored user preferences",
)
async def list_all_preferences() -> List[EduPreferenceRecord]:
    """Return every row in `edu_user_preferences` for inspection."""
    rows = await db.eduuserpreference.find_many(order={"createdAt": "desc"})
    return [
        EduPreferenceRecord(
            id=str(r.id),
            user_id=str(r.userId),
            target_degree=r.targetDegree,
            major=r.major,
            budget_limit_usd=r.budgetLimitUsd,
            preferred_countries=r.preferredCountries,
            current_gpa=r.currentGpa,
            created_at=r.createdAt.isoformat(),
        )
        for r in rows
    ]


@router.get(
    "/recommendations",
    response_model=List[EduRecommendationRecord],
    summary="[DEBUG] List all stored recommendations",
)
async def list_all_recommendations() -> List[EduRecommendationRecord]:
    """Return every row in `edu_recommendations` for inspection."""
    rows = await db.edurecommendation.find_many(order={"createdAt": "desc"})
    return [
        EduRecommendationRecord(
            id=str(r.id),
            university_name=r.universityName,
            program_name=r.programName,
            country=r.country,
            tuition_fee_usd=r.tuitionFeeUsd,
            scholarship_name=r.scholarshipName,
            scholarship_amount_usd=r.scholarshipAmountUsd,
            application_deadline=r.applicationDeadline,
            source_url=r.sourceUrl,
            scraped_at=r.scrapedAt.isoformat(),
            created_at=r.createdAt.isoformat(),
        )
        for r in rows
    ]


@router.get(
    "/context",
    response_model=List[EduContextRecord],
    summary="[DEBUG] Full context — preferences with their linked recommendations",
)
async def list_full_context() -> List[EduContextRecord]:
    """Return every `edu_user_preferences` row joined with its recommendations."""
    prefs = await db.eduuserpreference.find_many(
        include={
            "recommendations": {
                "include": {"recommendation": True},
            }
        },
        order={"createdAt": "desc"},
    )

    result: List[EduContextRecord] = []
    for p in prefs:
        pref_record = EduPreferenceRecord(
            id=str(p.id),
            user_id=str(p.userId),
            target_degree=p.targetDegree,
            major=p.major,
            budget_limit_usd=p.budgetLimitUsd,
            preferred_countries=p.preferredCountries,
            current_gpa=p.currentGpa,
            created_at=p.createdAt.isoformat(),
        )
        rec_records = [
            EduRecommendationRecord(
                id=str(link.recommendation.id),
                university_name=link.recommendation.universityName,
                program_name=link.recommendation.programName,
                country=link.recommendation.country,
                tuition_fee_usd=link.recommendation.tuitionFeeUsd,
                scholarship_name=link.recommendation.scholarshipName,
                scholarship_amount_usd=link.recommendation.scholarshipAmountUsd,
                application_deadline=link.recommendation.applicationDeadline,
                source_url=link.recommendation.sourceUrl,
                scraped_at=link.recommendation.scrapedAt.isoformat(),
                created_at=link.recommendation.createdAt.isoformat(),
            )
            for link in (p.recommendations or [])
            if link.recommendation is not None
        ]
        result.append(EduContextRecord(preference=pref_record, recommendations=rec_records))

    return result

