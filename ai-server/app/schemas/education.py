from typing import List, Optional

from pydantic import BaseModel, Field


class UserPreferenceInput(BaseModel):
    user_id: str
    target_degree: str = Field(..., examples=["Bachelors", "Masters", "PhD"])
    major: str
    budget_limit_usd: int = Field(..., gt=0)
    preferred_countries: List[str] = Field(..., min_length=1)
    current_gpa: float = Field(..., ge=0.0, le=4.0)


class RecommendationOutput(BaseModel):
    university_name: str
    program_name: str
    country: str
    tuition_fee_usd: int
    scholarship_name: Optional[str] = None
    scholarship_amount_usd: Optional[int] = None
    application_deadline: str = Field(
        ..., description='ISO date string or "Rolling"'
    )
    source_url: str


class RecommendationList(BaseModel):
    """Wrapper used with LangChain with_structured_output to extract a list."""

    recommendations: List[RecommendationOutput]


class TaskResponse(BaseModel):
    status: str
    task_id: str


# ---------------------------------------------------------------------------
# Debug / inspection schemas
# ---------------------------------------------------------------------------

class EduPreferenceRecord(BaseModel):
    id: str
    user_id: str
    target_degree: str
    major: str
    budget_limit_usd: int
    preferred_countries: List
    current_gpa: float
    created_at: str

    model_config = {"from_attributes": True}


class EduRecommendationRecord(BaseModel):
    id: str
    university_name: str
    program_name: str
    country: str
    tuition_fee_usd: int
    scholarship_name: Optional[str] = None
    scholarship_amount_usd: Optional[int] = None
    application_deadline: str
    source_url: str
    scraped_at: str
    created_at: str

    model_config = {"from_attributes": True}


class EduContextRecord(BaseModel):
    preference: EduPreferenceRecord
    recommendations: List[EduRecommendationRecord]
