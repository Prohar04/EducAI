# Module 1 Rebuild Plan

**Date:** 2026-04-12

---

## Module 1 Scope

Module 1 = University Matching + Admission Analyzer + Timeline Planner + Strategy Generator

---

## Current State (as of audit)

| Feature | Backend | Frontend | Quality |
|---------|---------|----------|---------|
| University search | ✅ naive SQL LIKE | ✅ keyword search bar | Weak — no NLP |
| AI match (RAG) | ✅ background job pattern | ✅ polling + progress bar | Strong |
| Timeline planner | ✅ visa templates + roadmap | ✅ country/intake selector | Good |
| Strategy report | ✅ LLM consultant output | ✅ full report UI | Strong |
| Saved programs | ✅ SavedProgram model | ✅ save/unsave buttons | Good |
| Admission analyzer | — partial (in match score) | — no dedicated view | Gap |

---

## What is Preserved (no changes)

- `POST /match/run` background job pattern — well-architected
- `GET /match/latest`, `GET /match/run/:id/status` polling pattern
- `MatchRun`, `MatchResult` Prisma models
- AI server RAG pipeline (ChromaDB + Serper + Firecrawl + LLM)
- Timeline planner routes + visa template seed data
- Strategy report LLM prompt (consultant-grade output)
- SavedProgram model and routes

---

## What is Enhanced

### 1. Search Intelligence Layer (Phase 2)
- Add `SearchCache` model to Prisma schema
- Add `SearchService` with LLM rewrite + Serper + PostgreSQL TTL cache
- Expose `POST /search/intelligent` route
- Keep existing keyword search as fallback

### 2. Programs Page (Phase 3)
- Natural language search bar replaces/augments the keyword input
- Wire to `POST /search/intelligent`
- Show `cacheHit` indicator
- Keep all existing filters (level, country, field)

### 3. Match Results UI (Phase 6 — polish)
- Better fit band visual (color-coded badges)
- Program card expanded view with requirements + deadlines
- "Save all matches" bulk action

### 4. Timeline Planner (Phase 6 — polish)
- Print/export roadmap as PDF
- Timeline zoom controls (condensed vs full view)
- Milestone completion checkmarks (client-side state)

### 5. Strategy Report (Phase 6 — polish)
- Collapsible sections
- PDF export button
- Risk severity badges (High=red, Medium=amber, Low=green)

---

## Admission Analyzer Gap

The current match score (from LLM) provides an implicit admission probability. The gap is there is no dedicated UI view for admission analysis separate from the match results.

**Decision:** Integrate admission analysis into the match result card itself:
- Show `fitBand` prominently
- Show `matchScore` as a radial gauge
- Pull `admissionChances` from strategy report if generated

This avoids building a duplicate feature and keeps the UX coherent.

---

## Success Criteria

- [ ] `POST /search/intelligent` returns results for a natural language query
- [ ] Programs page search bar triggers NLP search
- [ ] Match run completes and shows ranked results with fit bands
- [ ] Timeline generates a roadmap for at least US and UK
- [ ] Strategy report generates for any country with saved programs
- [ ] All routes pass auth middleware
- [ ] TypeScript build clean
