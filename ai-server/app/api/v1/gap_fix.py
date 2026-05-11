"""POST /api/v1/gap-fix/verify-evidence — AI-powered evidence verification for gap fix.

Input:
  gap_description — description of the gap being addressed
  gap_type        — category of the gap
  evidence_text   — optional text evidence
  evidence_url    — optional URL evidence
  pdf_url         — optional PDF URL

Output (JSON):
  verified    — bool
  confidence  — float 0-1
  feedback    — string
  new_status  — not_started | in_progress | pending_verification | completed
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ...middleware.secure_keys import checkApiKey
from ...domains.reasoning.llm_provider import generate_text, parse_json_response
from ...core.logger import logger

router = APIRouter(tags=["Gap Fix"])


class EvidenceVerifyRequest(BaseModel):
    gap_description: str
    gap_type: str
    evidence_text: Optional[str] = None
    evidence_url: Optional[str] = None
    pdf_url: Optional[str] = None


class EvidenceVerifyResponse(BaseModel):
    verified: bool
    confidence: float
    feedback: str
    new_status: str


@router.post("/verify-evidence", response_model=EvidenceVerifyResponse, dependencies=[Depends(checkApiKey)])
async def verify_evidence(req: EvidenceVerifyRequest) -> EvidenceVerifyResponse:
    if not req.evidence_text and not req.evidence_url and not req.pdf_url:
        return EvidenceVerifyResponse(
            verified=False,
            confidence=0.0,
            feedback="No evidence provided. Please add text description, a URL, or upload a PDF.",
            new_status="not_started",
        )

    evidence_parts: list[str] = []
    if req.evidence_text:
        evidence_parts.append(f"Text evidence: {req.evidence_text}")
    if req.evidence_url:
        evidence_parts.append(f"URL provided: {req.evidence_url}")
    if req.pdf_url:
        evidence_parts.append("PDF document uploaded")

    prompt = f"""A student is addressing this academic profile gap:
Gap type: {req.gap_type}
Gap description: {req.gap_description}

Evidence submitted:
{chr(10).join(evidence_parts)}

Evaluate if this evidence sufficiently demonstrates the gap is being addressed.

Return ONLY valid JSON with no markdown or extra text:
{{
  "verified": true or false,
  "confidence": 0.0 to 1.0,
  "feedback": "specific actionable feedback for the student (1-2 sentences)",
  "new_status": "completed" or "in_progress" or "pending_verification"
}}

Be strict: verified=true only if evidence clearly demonstrates real action taken toward addressing this gap."""

    try:
        raw = await generate_text(prompt, max_tokens=300, temperature=0.3)
        data = parse_json_response(raw)
        return EvidenceVerifyResponse(
            verified=bool(data.get("verified", False)),
            confidence=float(data.get("confidence", 0.5)),
            feedback=str(data.get("feedback", "Evidence received and under review.")),
            new_status=str(data.get("new_status", "pending_verification")),
        )
    except Exception as e:
        logger.error(f"Evidence verification error: {e}")
        return EvidenceVerifyResponse(
            verified=False,
            confidence=0.0,
            feedback="Verification service temporarily unavailable. Your evidence has been saved.",
            new_status="pending_verification",
        )
