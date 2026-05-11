"""POST /api/v1/gap-fix/verify-evidence — AI evidence verification for gap fix.
POST /api/v1/gap-fix/analyze          — AI gap analysis from student profile.

Score MUST NOT update unless verify-evidence returns verified=true.
"""

from __future__ import annotations

import json
from typing import Any, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ...middleware.secure_keys import checkApiKey
from ...domains.reasoning.llm_provider import generate_text, parse_json_response
from ...core.logger import logger

router = APIRouter(tags=["Gap Fix"])


# ─── Verify Evidence ─────────────────────────────────────────────

class EvidenceVerifyRequest(BaseModel):
    gap_id: Optional[str] = None
    gap_type: str
    gap_title: Optional[str] = None
    gap_description: str
    evidence_text: Optional[str] = None
    evidence_url: Optional[str] = None
    pdf_url: Optional[str] = None
    current_status: Optional[str] = "not_started"


class EvidenceVerifyResponse(BaseModel):
    verified: bool
    confidence: float
    feedback: str
    new_status: str
    score_impact: str  # "full" | "partial" | "none"


@router.post("/verify-evidence", response_model=EvidenceVerifyResponse, dependencies=[Depends(checkApiKey)])
async def verify_evidence(req: EvidenceVerifyRequest) -> EvidenceVerifyResponse:
    """
    Verify student evidence using the configured LLM.
    Returns verified=true ONLY if evidence genuinely proves progress.
    Score MUST NOT update unless this returns verified=true.
    """
    if not req.evidence_text and not req.evidence_url and not req.pdf_url:
        return EvidenceVerifyResponse(
            verified=False,
            confidence=0.0,
            feedback=(
                "No evidence provided. Please submit at least one of: "
                "a written description of what you did, a URL link to proof, "
                "or upload a PDF document."
            ),
            new_status="not_started",
            score_impact="none",
        )

    evidence_parts: list[str] = []
    if req.evidence_text:
        evidence_parts.append(f"Written evidence:\n{req.evidence_text}")
    if req.evidence_url:
        evidence_parts.append(f"URL provided: {req.evidence_url}")
    if req.pdf_url:
        evidence_parts.append("PDF document uploaded: Yes (stored securely)")

    evidence_summary = "\n\n".join(evidence_parts)
    gap_title = req.gap_title or req.gap_type

    prompt = f"""You are a strict academic profile evaluator for an international student platform.

Evaluate if a student's submitted evidence genuinely proves they have addressed
a specific weakness in their study-abroad application profile.

Be STRICT. Only mark as verified if the evidence clearly demonstrates real, concrete action.

RULES:
- "I will do X" = NOT verified (future intention, not proof)
- "I did X" with specific details = potentially verified
- A URL to a real course/certificate = likely verified
- A URL that is vague or unrelated = NOT verified
- A PDF document upload = likely verified
- Vague text with no specifics = NOT verified

GAP TYPE: {req.gap_type}
GAP TITLE: {gap_title}
GAP DESCRIPTION: {req.gap_description}

SUBMITTED EVIDENCE:
{evidence_summary}

Return ONLY valid JSON with no markdown:
{{
  "verified": true or false,
  "confidence": 0.0 to 1.0,
  "feedback": "Specific, helpful feedback in 1-2 sentences. If not verified, tell exactly what would be accepted.",
  "new_status": "completed" or "in_progress" or "pending_verification" or "not_started",
  "score_impact": "full" or "partial" or "none"
}}

score_impact must be: "full" if new_status=completed AND verified, "partial" if new_status=in_progress AND verified, "none" otherwise."""

    try:
        raw = await generate_text(prompt, max_tokens=300, temperature=0.1)
        data = parse_json_response(raw)
        return EvidenceVerifyResponse(
            verified=bool(data.get("verified", False)),
            confidence=float(data.get("confidence", 0.0)),
            feedback=str(data.get("feedback", "Verification failed. Please try again.")),
            new_status=str(data.get("new_status", "not_started")),
            score_impact=str(data.get("score_impact", "none")),
        )
    except Exception as e:
        logger.error(f"Evidence verification error: {e}")
        return EvidenceVerifyResponse(
            verified=False,
            confidence=0.0,
            feedback="Verification service temporarily unavailable. Your evidence has been saved.",
            new_status="pending_verification",
            score_impact="none",
        )


# ─── Analyze Profile Gaps ─────────────────────────────────────────

class GapAnalysisRequest(BaseModel):
    profile: dict[str, Any]
    target_countries: list[str] = []
    target_field: str = "General"


@router.post("/analyze", dependencies=[Depends(checkApiKey)])
async def analyze_gaps(req: GapAnalysisRequest) -> dict[str, Any]:
    """
    Analyze user profile and return list of actionable gaps.
    Each gap has: gapType, title, description, priority, resourceLinks.
    """
    prompt = f"""You are a study-abroad admissions expert analyzing a student's profile.
Identify real, specific gaps that would hurt their university application.

Profile: {json.dumps(req.profile, indent=2)}
Target Countries: {', '.join(req.target_countries) if req.target_countries else 'Not specified'}
Target Field: {req.target_field}

Return ONLY valid JSON with no markdown:
{{
  "gaps": [
    {{
      "gapType": "gpa|english|gre|experience|research|publications|portfolio|references|financial|other",
      "title": "Short gap title (max 60 chars)",
      "description": "Specific description of the gap and why it matters for applications (2-3 sentences)",
      "priority": "high|medium|low",
      "resourceLinks": [
        {{"title": "Resource name", "url": "https://real-url.com", "description": "How this helps"}}
      ]
    }}
  ],
  "overall_competitiveness": "strong|competitive|below_average|weak",
  "top_strength": "The student strongest point in one sentence",
  "critical_gap": "The single most urgent gap to fix"
}}

RULES:
- Only include REAL, SPECIFIC gaps based on actual profile data
- resourceLinks must be real, working URLs (IELTS.org, Coursera, edX, GRE official, etc.)
- Maximum 8 gaps — only the most important
- NEVER invent achievements or misrepresent the profile"""

    try:
        raw = await generate_text(prompt, max_tokens=2000, temperature=0.2)
        return parse_json_response(raw)
    except Exception as e:
        logger.error(f"Gap analysis error: {e}")
        return {
            "gaps": [],
            "overall_competitiveness": "unknown",
            "top_strength": "Unable to analyze profile",
            "critical_gap": "Please complete your profile and try again",
        }
