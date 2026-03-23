"""POST /api/v1/module1/strategy — LLM-powered consultant-style strategy report.

Input:
  profile     — user profile dict
  countryCode — ISO-2 code
  intake      — "Fall 2027" etc.
  programs    — list of saved programs in that country
  savedCount  — total saved programs count

Output (strict JSON):
  summary, whyThisCountryFits, admissionChances,
  riskAssessment, recommendedActions, documentChecklist, disclaimer
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from ...core.logger import logger
from ...domains.reasoning.llm_provider import generate_text, parse_json_response

router = APIRouter(tags=["Module 1 Strategy"])

# ── Request / Response models ─────────────────────────────────────────────────


class ProgramDeadline(BaseModel):
    term: str
    deadline: str


class ProgramRequirement(BaseModel):
    key: str
    value: str


class ProgramInput(BaseModel):
    title: str
    university: str
    field: Optional[str] = None
    level: Optional[str] = None
    tuitionMinUSD: Optional[int] = None
    tuitionMaxUSD: Optional[int] = None
    deadlines: List[ProgramDeadline] = Field(default_factory=list)
    requirements: List[ProgramRequirement] = Field(default_factory=list)


class ProfileInput(BaseModel):
    currentStage: Optional[str] = None
    intendedLevel: Optional[str] = None
    majorOrTrack: Optional[str] = None
    intendedMajor: Optional[str] = None
    gpa: Optional[float] = None
    gpaScale: Optional[str] = None
    englishTestType: Optional[str] = None
    englishScore: Optional[float] = None
    gre: Optional[float] = None
    gmat: Optional[float] = None
    budgetCurrency: Optional[str] = None
    budgetMax: Optional[float] = None
    fundingNeed: Optional[bool] = None
    targetIntake: Optional[str] = None
    workExperienceMonths: Optional[int] = None


class StrategyRequest(BaseModel):
    profile: ProfileInput
    countryCode: str
    intake: Optional[str] = None
    programs: List[ProgramInput] = Field(default_factory=list)
    savedCount: int = 0


# ── Country name map ──────────────────────────────────────────────────────────

_CODE_TO_NAME: Dict[str, str] = {
    "US": "the United States",
    "GB": "the United Kingdom",
    "CA": "Canada",
    "AU": "Australia",
    "DE": "Germany",
    "FR": "France",
    "NL": "the Netherlands",
    "NZ": "New Zealand",
    "IE": "Ireland",
    "SE": "Sweden",
    "DK": "Denmark",
    "FI": "Finland",
    "NO": "Norway",
    "CH": "Switzerland",
    "SG": "Singapore",
    "JP": "Japan",
    "KR": "South Korea",
    "BD": "Bangladesh",
    "IN": "India",
    "PK": "Pakistan",
}


# ── Prompt builder ───────────────────────────────────────────────────────────

def _build_prompt(req: StrategyRequest) -> str:
    p = req.profile
    country_name = _CODE_TO_NAME.get(req.countryCode, req.countryCode)
    intake_str = req.intake or p.targetIntake or "next available"

    # Profile summary
    gpa_str = f"{p.gpa}/{p.gpaScale}" if p.gpa and p.gpaScale else (str(p.gpa) if p.gpa else "not provided")
    english_str = (
        f"{p.englishTestType} {p.englishScore}" if p.englishTestType and p.englishScore else "not provided"
    )
    budget_str = (
        f"{p.budgetCurrency} {p.budgetMax:,.0f}/year" if p.budgetMax else "not specified"
    )

    programs_text = ""
    for prog in req.programs[:8]:  # cap at 8 for token safety
        tuition = ""
        if prog.tuitionMinUSD and prog.tuitionMaxUSD:
            tuition = f" | Tuition: USD {prog.tuitionMinUSD:,}–{prog.tuitionMaxUSD:,}/yr"
        elif prog.tuitionMinUSD:
            tuition = f" | Tuition: from USD {prog.tuitionMinUSD:,}/yr"
        deadlines = ", ".join(f"{d.term} {d.deadline[:10]}" for d in prog.deadlines) if prog.deadlines else "unknown"
        reqs = ", ".join(f"{r.key}: {r.value}" for r in prog.requirements[:5]) if prog.requirements else "not listed"
        programs_text += (
            f"\n- **{prog.title}** @ {prog.university}"
            f"{tuition} | Deadlines: {deadlines} | Requirements: {reqs}"
        )

    if not programs_text:
        programs_text = "\n- No specific programs provided (base analysis on country and profile only)"

    return f"""You are an expert international education consultant. Your task is to write a detailed, personalised strategy report for a student applying to {country_name} for {intake_str} intake.

Student Profile:
- Stage: {p.currentStage or 'not specified'}
- Target level: {p.intendedLevel or p.majorOrTrack or 'not specified'}
- Major/field: {p.majorOrTrack or p.intendedMajor or 'not specified'}
- GPA: {gpa_str}
- English: {english_str}
- GRE: {p.gre or 'not provided'} | GMAT: {p.gmat or 'not provided'}
- Work experience: {f"{p.workExperienceMonths} months" if p.workExperienceMonths else 'none'}
- Budget: {budget_str}
- Funding needed: {'Yes' if p.fundingNeed else 'No' if p.fundingNeed is False else 'not specified'}

Saved Programs for {country_name}:
{programs_text}

Instructions:
1. Be specific and consultant-level — no generic advice.
2. Reference the actual profile numbers and program names.
3. Give honest admission probability: do not over-promise, do not dismiss.
4. Identify real risks (low score, budget gap, visa complexity) with actionable mitigations.
5. Language must be international, neutral, and professional.
6. Do NOT make guarantees about admission outcomes.

Return ONLY valid JSON (no markdown, no explanation), matching this EXACT schema:
{{
  "summary": "<2-3 sentence executive summary tailored to this student>",
  "whyThisCountryFits": ["<specific reason 1>", "<specific reason 2>", "<specific reason 3>"],
  "admissionChances": {{
    "band": "<High|Medium|Low>",
    "confidence": <0.0-1.0>,
    "explanation": ["<explanation point 1>", "<explanation point 2>"]
  }},
  "riskAssessment": [
    {{"risk": "<risk name>", "severity": "<High|Medium|Low>", "mitigation": ["<step 1>", "<step 2>"]}}
  ],
  "recommendedActions": [
    {{"title": "<action title>", "timeframe": "<e.g. Next 4 weeks>", "steps": ["<step 1>", "<step 2>"]}}
  ],
  "documentChecklist": ["<doc 1>", "<doc 2>", "..."],
  "disclaimer": "<One sentence safety disclaimer about estimates being indicative only>"
}}"""


# ── Endpoint ─────────────────────────────────────────────────────────────────
@router.post("/strategy")
async def generate_strategy(req: StrategyRequest) -> Dict[str, Any]:
    logger.info(
        f"[strategy] Generating for user country={req.countryCode} "
        f"intake={req.intake} programs={len(req.programs)}"
    )

    prompt = _build_prompt(req)
    system_prompt = (
        "You are a world-class international education consultant. "
        "You always respond with strict JSON only — no markdown, no extra text."
    )

    try:
        content = await generate_text(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.4,
            json_mode=True,
        )
        report = parse_json_response(content)
    except Exception as exc:
        logger.error(f"[strategy] LLM generation failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="LLM service error. Please try again.",
        )

    # Validate required top-level keys
    required_keys = {
        "summary", "whyThisCountryFits", "admissionChances",
        "riskAssessment", "recommendedActions", "documentChecklist", "disclaimer",
    }
    missing = required_keys - set(report.keys())
    if missing:
        logger.warning(f"[strategy] LLM response missing keys: {missing}")
        # Fill defaults rather than 500-ing
        for key in missing:
            report[key] = [] if key not in {"summary", "disclaimer"} else ""

    logger.info(f"[strategy] Report generated for country={req.countryCode}")
    return report
