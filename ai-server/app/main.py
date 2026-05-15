from dotenv import load_dotenv

load_dotenv()

# ═══════════════════════════════════════════════════════════════════════════════
# EducAI AI Server — FastAPI Microservice
# ═══════════════════════════════════════════════════════════════════════════════

# BASE
from fastapi import APIRouter, Depends, FastAPI
from fastapi.responses import Response

from .api.v1.chat import router as chat_router
from .api.v1.gap_fix import router as gap_fix_router
from .api.v1.health import router as health_router
from .api.v1.jobs import router as jobs_router
from .api.v1.module1_sync import router as module1_sync_router
from .api.v1.news import router as news_router
from .api.v1.recommendations import router as recommendations_router
from .api.v1.scrape_match import router as scrape_match_router
from .api.v1.strategy import router as strategy_router

# Prisma DB
from .db.prisma_connect import lifespan
from .middleware.audit_log import AuditLogMiddleware

# CONFIG
from .middleware.secure_keys import checkApiKey

# ─────────────────────────────────────────────────────────────────────────────
# FastAPI Application Initialization
# ─────────────────────────────────────────────────────────────────────────────
# Init FastAPI app
app = FastAPI(
    title="EducAI AI Server",
    description="A microservice for AI-powered operations: chat, recommendations, program matching, and strategy generation",
    version="1.0.0",
    lifespan=lifespan,
)

# Add audit logging middleware
app.add_middleware(AuditLogMiddleware)

# ─────────────────────────────────────────────────────────────────────────────
# Public Routes
# ─────────────────────────────────────────────────────────────────────────────
# Health check endpoints (unauthenticated, used by deployment orchestration)
app.include_router(health_router, prefix="/api/v1")

# ─────────────────────────────────────────────────────────────────────────────
# Protected Routes (Require API Key Authentication)
# ─────────────────────────────────────────────────────────────────────────────
# AI Chatbot: Conversational interface with full user profile context
app.include_router(chat_router, prefix="/api/v1")


# Data utility endpoint
@app.get("/data")
async def get_data(server_name: str = Depends(checkApiKey)):
    """Protected data endpoint - requires valid API key via checkApiKey dependency."""
    return {"message": f"Hello {server_name}, here is your data."}


# AI Recommendations: Personalized suggestions based on user profile
app.include_router(recommendations_router, prefix="/api/v1/edu")

# Module 1 Operations: Program matching, scraping, and synchronization
app.include_router(module1_sync_router, prefix="/api/v1/module1")
# Web scraping for live university program data
app.include_router(scrape_match_router, prefix="/api/v1/module1")
# Application strategy and planning
app.include_router(strategy_router, prefix="/api/v1/module1")
# Job Finder: live job search for international students
app.include_router(jobs_router, prefix="/api/v1")
# Education News: categorized news with in-memory caching
app.include_router(news_router, prefix="/api/v1/news")
# Gap Fix: AI evidence verification
app.include_router(gap_fix_router, prefix="/api/v1/gap-fix")

# ─────────────────────────────────────────────────────────────────────────────
# Root & Health Endpoints
# ─────────────────────────────────────────────────────────────────────────────


@app.get("/")
async def get():
    """Root endpoint - basic connectivity check."""
    return {"message": "EducAI AI Server is running", "version": "1.0.0"}


@app.head("/")
async def root_head():
    return Response(status_code=200)


# Compatibility health endpoint for external monitors (no /api/v1 prefix).
@app.get("/health")
async def health_root():
    return {"status": "ok", "service": "educai-ai", "version": "1.0.0"}


@app.head("/health")
async def health_root_head():
    return Response(status_code=200)


# ─────────────────────────────────────────────────────────────────────────────
# Protected Router Setup
# ─────────────────────────────────────────────────────────────────────────────
# All routes registered via protected_router require API key validation
# The checkApiKey dependency is executed once per request before route handling
protected_router = APIRouter(dependencies=[Depends(checkApiKey)])


# protected_router.include_router(recommendations_router, prefix="/api/v1/edu")


app.include_router(protected_router)
