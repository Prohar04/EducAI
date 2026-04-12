# EducAI Master Rebuild Plan

**Date:** 2026-04-12  
**Lead architect/engineer:** Claude Sonnet 4.6  
**Goal:** Elevate EducAI from university prototype to showcase-grade, industry-standard product

---

## Executive Summary

EducAI has strong foundational bones: a complete auth system, rich Prisma domain model, AI server with Serper+Firecrawl+LLM RAG pipeline, and fully wired Module 1 and Module 2 backend. The gaps are:

1. No PostgreSQL-backed search cache (key concept from the uploaded University Search API reference)
2. Programs discovery lacks natural-language intent support at the route level
3. UI/UX needs a full polish pass to feel production-grade
4. Documentation was overly optimistic vs actual state

## Decisions: Preserve vs Rebuild vs Enhance

### PRESERVED (solid, don't touch core logic)
- Auth system (JWT, sessions, OAuth, refresh tokens, email verification)
- Prisma schema (all domain models: User, Profile, Program, University, Scholarship, etc.)
- AI server RAG pipeline (ChromaDB + Serper + Firecrawl + LLM)
- Match controller with background job + polling pattern
- Scholarship service (eligibility + probability scoring)
- Timeline planner with visa templates
- Strategy report generator
- Chat service with profile/program context injection

### REBUILT / ENHANCED
- **Search intelligence layer**: Add `SearchCache` model + NLP search route (integrates uploaded API concept)
- **Programs page**: Add natural language search bar backed by LLM query rewriting + cached results
- **UI/UX system**: Full polish pass — spacing, typography, cards, states, animations
- **Agent page**: Harden full-page chat with proper layout and context awareness
- **Documentation**: Replace overly optimistic docs with honest current-state audit

---

## Architecture Decision: Search Intelligence

See `docs/search-architecture-decision.md` for full reasoning.

**Decision:** Integrate search intelligence as a new service **within the Express server** (not ai-server), exposing `POST /search/intelligent` and `GET /search/cached`. The ai-server's LLM is called via HTTP for query rewriting. PostgreSQL caches results with TTL and SHA-256 key.

---

## Phase Execution Plan

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Audit + documentation | ✅ Complete |
| 2 | Search intelligence layer (SearchCache + NLP route) | ✅ Complete |
| 3 | Programs/discovery UI with NLP search | ✅ Complete |
| 4 | Scholarship page polish + data provenance | ✅ Complete |
| 5 | Chatbot hardening | ✅ Complete |
| 6 | Full UI/UX polish pass | ✅ Complete |
| 7 | Engineering quality (types, README, env) | ✅ Complete |
| 8 | Build verification + tests | ✅ Complete |
| 9 | Commit + push milestones | ✅ Complete |

---

## Local Run Commands

```bash
# Prerequisites: Node ≥20, Python ≥3.13, PostgreSQL (or Neon URL)

# 1. Server (Express + Prisma)
cd server
cp .env.example .env   # fill DATABASE_URL, JWT_SECRET, etc.
npm install
npx prisma generate
npx prisma db push
npm run dev             # port 4000

# 2. Web (Next.js)
cd web
cp .env.example .env.local   # fill NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev             # port 3000

# 3. AI Server (FastAPI)
cd ai-server
cp .env.example .env   # fill OPENROUTER_API_KEY, SERPER_API_KEY, etc.
uv pip install -e .
uvicorn app.main:app --reload --port 8888
```
