from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class JobType(str, Enum):
    PART_TIME = "PART_TIME"
    FULL_TIME = "FULL_TIME"
    INTERNSHIP = "INTERNSHIP"
    REMOTE = "REMOTE"


class JobSearchRequest(BaseModel):
    country: str = Field(..., description="Full country name")
    country_code: str = Field(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2 country code")
    city: str = Field(..., description="City to search jobs in")
    field: str = Field(..., description="Field of study or industry")
    job_type: JobType = Field(..., description="Type of employment")
    visa_type: Optional[str] = Field(None, description="Visa type the student holds")
    page: int = Field(1, ge=1, description="Result page")


class JobListing(BaseModel):
    title: str
    company: str
    company_logo: Optional[str] = None
    location: str
    job_type: JobType
    salary: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: Optional[str] = None
    posted_at: Optional[str] = None
    visa_sponsorship: Optional[str] = None
    apply_url: str
    description: Optional[str] = None
    source: str
    is_remote: bool = False


class JobSearchResponse(BaseModel):
    listings: List[JobListing]
    work_hour_limit: Optional[str] = None
    post_grad_permit_steps: Optional[List[str]] = None
    total: int
    query_used: str
    source_used: str
    ai_fallback_used: bool = False
    cached_at: Optional[str] = None


class SuggestRequest(BaseModel):
    type: str
    query: str
    context: Optional[str] = None


class SuggestResponse(BaseModel):
    suggestions: List[str]
