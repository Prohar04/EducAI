import json
from datetime import datetime
from typing import List

from openai import AsyncOpenAI

from ...core.config import settings
from ...schemas.jobs import JobListing, JobType

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY or "")


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
        f"You are a job market expert. Generate 8 realistic, specific, "
        f"currently available {job_type_label} job listings for {field} professionals "
        f"in {city}, {country} as of {current_month}.\n\n"
        f"Rules:\n"
        f"- Use real company names that actually operate in {country}\n"
        f"- Use realistic salary ranges for {city} in local currency\n"
        f"- Job titles must be specific and real (not generic)\n"
        f"- Descriptions must be 1-2 realistic sentences about the actual role\n"
        f"- Apply URLs must be realistic (company careers page format)\n"
        f"- Reflect actual job market conditions for {field} in {country}\n"
        f"- If {job_type_label} is part-time: include student-friendly roles "
        f"(retail, hospitality, tutoring, campus jobs, delivery)\n"
        f"- If {job_type_label} is full-time: include professional career roles\n"
        f"- If {job_type_label} is internship: include graduate/student programs\n\n"
        f"Respond ONLY with a valid JSON object containing a 'jobs' array. No explanation, no markdown.\n"
        f"Each object must have exactly these fields:\n"
        f'{{"title": string, "company": string, "location": string (city, country), '
        f'"salary": string or null, "salary_min": number or null, "salary_max": number or null, '
        f'"currency": string (ISO code e.g. USD, GBP, EUR, CAD, AUD), '
        f'"posted_at": string (realistic recent date), "visa_sponsorship": string or null, '
        f'"apply_url": string (realistic careers URL), "description": string (max 150 chars), '
        f'"is_remote": boolean}}'
    )

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
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
    for job in jobs_data[:8]:
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
                posted_at=job.get("posted_at"),
                visa_sponsorship=job.get("visa_sponsorship"),
                apply_url=job.get("apply_url", ""),
                description=(job.get("description") or "")[:150],
                source="AI Generated",
                is_remote=bool(job.get("is_remote", False)),
            )
        )

    return listings
