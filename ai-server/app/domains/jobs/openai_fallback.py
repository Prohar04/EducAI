import json
from datetime import datetime
from typing import List

from openai import AsyncOpenAI

from ...core.config import settings
from ...schemas.jobs import JobListing, JobType

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY or "")

JOB_FALLBACK_SYSTEM_PROMPT = """
You are a job listing aggregator for EducAI.

CRITICAL RULES — AI-generated fallback listings:
1. These listings are EXAMPLES only — label every listing with source "ai-example".
2. NEVER invent specific company names that imply a real live vacancy exists.
   Use generic descriptors: "Tech Startup", "Software Consultancy", "Research University",
   "Multinational Bank", "Healthcare Group", "Logistics Company".
3. Salary ranges must be realistic for the city but flagged as "typical range" estimates.
4. Application URLs must NOT be fabricated. Set apply_url to an empty string.
5. Never invent recruiter contact information or specific email addresses.
6. Generate at most 6 listings.
7. Descriptions must be generic role descriptions, NOT specific vacancy text.
"""


async def fetch_openai_fallback_jobs(
    country: str,
    city: str,
    field: str,
    job_type: JobType,
    visa_type: str | None = None,
) -> List[JobListing]:
    job_type_label = {
        JobType.PART_TIME: "part-time",
        JobType.INTERNSHIP: "internship",
        JobType.FULL_TIME: "full-time",
        JobType.REMOTE: "remote",
    }.get(job_type, "full-time")

    current_month = datetime.now().strftime("%B %Y")

    prompt = (
        f"Generate 6 representative {job_type_label} job listing EXAMPLES for {field} professionals "
        f"in {city}, {country} as of {current_month}.\n\n"
        f"IMPORTANT RULES:\n"
        f"- Use GENERIC company descriptors only (e.g. 'Tech Startup', 'Research University')\n"
        f"- Salary ranges must be realistic for {city} but expressed as 'typically X-Y'\n"
        f"- Set apply_url to an empty string for every listing\n"
        f"- Descriptions must be generic role descriptions (1 sentence max)\n"
        f"- If part-time: student-friendly roles (retail, hospitality, tutoring, campus jobs)\n"
        f"- If full-time: professional career roles in the field\n"
        f"- If internship: graduate/student training programs\n\n"
        f"Respond ONLY with a valid JSON object containing a 'jobs' array. No explanation, no markdown.\n"
        f"Each object must have exactly these fields:\n"
        f'{{"title": string, "company": string, "location": string (city, country), '
        f'"salary": string or null, "salary_min": number or null, "salary_max": number or null, '
        f'"currency": string (ISO code e.g. USD, GBP, EUR, CAD, AUD), '
        f'"posted_at": string (use "Representative listing"), '
        f'"visa_sponsorship": null, '
        f'"apply_url": "", '
        f'"description": string (max 100 chars, generic role description), '
        f'"is_remote": boolean}}'
    )

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": JOB_FALLBACK_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.5,
        max_tokens=2000,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content or "{}"

    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            jobs_data = parsed
        elif isinstance(parsed, dict):
            jobs_data = next((v for v in parsed.values() if isinstance(v, list)), [])
        else:
            jobs_data = []
    except json.JSONDecodeError:
        return []

    listings: List[JobListing] = []
    for job in jobs_data[:6]:
        listings.append(
            JobListing(
                title=job.get("title", ""),
                company=job.get("company", ""),
                company_logo=None,
                location=job.get("location", f"{city}, {country}"),
                job_type=job_type,
                salary=job.get("salary"),
                salary_min=job.get("salary_min"),
                salary_max=job.get("salary_max"),
                currency=job.get("currency"),
                posted_at="Representative listing",
                visa_sponsorship=None,
                apply_url="",
                description=(job.get("description") or "")[:100],
                source="ai-example",
                is_remote=bool(job.get("is_remote", False)),
                is_ai_generated=True,
                disclaimer="AI-generated example. Search this role on LinkedIn or Indeed for real listings.",
            )
        )

    return listings
