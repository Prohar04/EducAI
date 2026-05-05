# ═══════════════════════════════════════════════════════════════════════════════
# Health Check Endpoints
# ═══════════════════════════════════════════════════════════════════════════════
# These endpoints are used by orchestration systems (Docker, Kubernetes, Render)
# to verify service health and readiness. They do not require authentication.

import time
from datetime import datetime, timezone
from fastapi import APIRouter
from fastapi.responses import Response
from ...domains.reasoning.llm_provider import _get_provider, _get_model
from ...core.config import settings

router = APIRouter()

# Track server uptime from module load
_START_TIME = time.time()


# ─────────────────────────────────────────────────────────────────────────────
# Liveness & Readiness Probes
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/health")
async def health_check():
    """
    GET /health
    General health check endpoint. Returned by orchestration systems to verify
    service is alive and able to respond. Includes uptime and environment info.
    """
    return {
        "status": "ok",
        "service": "educai-ai",
        "version": "0.1.0",
        "environment": __import__("os").environ.get("NODE_ENV", "production"),
        "uptime": int(time.time() - _START_TIME),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.head("/health")
async def health_check_head():
    """
    HEAD /health
    Lightweight health check used by load balancers. Responds with 200 OK.
    Does not return a body, only HTTP status.
    """
    return Response(status_code=200)


@router.get("/health/llm")
async def llm_health_check():
    """
    Check LLM provider configuration and availability.

    Returns:
        - provider: Active LLM provider name
        - model: Model being used
        - ok: Whether provider is properly configured
    """
    try:
        provider = _get_provider()
        model = _get_model(provider, None)

        return {
            "ok": True,
            "provider": provider.value,
            "model": model,
            "available_providers": {
                "openrouter": bool(settings.OPENROUTER_API_KEY),
                "gemini": bool(settings.GEMINI_API_KEY),
                "groq": bool(settings.GROQ_API_KEY),
                "xai": bool(settings.XAI_API_KEY),
            },
        }
    except RuntimeError as e:
        return {
            "ok": False,
            "provider": None,
            "model": None,
            "error": str(e),
            "available_providers": {
                "openrouter": bool(settings.OPENROUTER_API_KEY),
                "gemini": bool(settings.GEMINI_API_KEY),
                "groq": bool(settings.GROQ_API_KEY),
                "xai": bool(settings.XAI_API_KEY),
            },
        }
