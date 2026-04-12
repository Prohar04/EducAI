# Reality Check

**Date:** 2026-04-12  
**Auditor:** Claude Sonnet 4.6

This document verifies claims made about EducAI against actual code and runtime evidence.

---

## Claim Verification Table

| Claim | Where Claim Appears | Status | Evidence in Code/Runtime | Action Needed |
|-------|---------------------|--------|--------------------------|---------------|
| AI-powered university matching | README, landing page, final-delivery-status.md | ✅ Verified True | `POST /match/run` → background job → ai-server RAG pipeline (ChromaDB + Serper + Firecrawl + LLM) → MatchResult records in DB | None |
| 300+ universities tracked | Landing page stats strip | ⚠️ Partially True | Depends on how many RAG scraping runs have been completed. Count is dynamic. | Label as "growing database" or remove static number |
| 12k+ scholarships indexed | Landing page stats strip | ❌ False | Only 28 scholarships seeded in DB | Update to "28+ verified scholarships" or seed more |
| 94% match accuracy | Landing page stats strip | ❌ False | No accuracy measurement system exists. Match scores are LLM confidence, not validated accuracy | Remove or replace with "LLM-scored relevance" |
| 40+ countries covered | Landing page stats strip | ⚠️ Partially True | COUNTRIES list has 15 entries. RAG searches can cover more. | Update to "15+ countries" |
| Module 1 complete | final-delivery-status.md | ✅ Verified True | Match, Timeline, Strategy, Programs all implemented with real data | None |
| Module 2 complete | final-delivery-status.md | ✅ Verified True | Scholarships, Eligibility, Probability, Deadline Alerts all implemented | None |
| AI Chatbot complete | final-delivery-status.md | ✅ Verified True | Chat with profile context, Serper search, Firecrawl scraping, source citations | Minor hardening needed |
| Real scholarship data | docs | ✅ Verified True | 28 seeded scholarships with sourceUrl, lastVerified timestamps | Labelled as seeded data — correct |
| Email notifications for alerts | docs, feature description | ⚠️ Partially True | Backend scheduler endpoint exists; email path requires SMTP/Resend config | Document provider requirement |
| Daily data updates | Landing page badge | ⚠️ Partially True | RSS feed updates daily; programs update on match run (24h cache); not a continuous crawler | Update wording to "data updated on match runs" |
| SOP Builder | Project overview PDF | ✅ Verified True | Full implementation: `/app/sop`, Express `POST /sop/generate`, OpenRouter `gpt-4o-mini`, 3 tone modes, 3 SOP types, profile-injected | None |
| CV Builder | Project overview PDF | ✅ Verified True | Full implementation: `/app/cv`, Express `POST /cv/generate`, 3 CV styles (academic/research/industry), ATS-friendly plain text | None |
| Professor Finder | Project overview PDF | ✅ Verified True | Full implementation: `/app/professors`, Express `POST /professors/search`, Serper live search + LLM extraction + email templates | None |
| LLM query rewriting | docs (new) | ✅ Verified True | `SearchService` with OpenRouter rewrite + Serper + PostgreSQL TTL cache implemented | None |
| PostgreSQL search cache | docs (new) | ✅ Verified True | SearchCache Prisma model + SearchService | None |
| Profile-aware AI chat | feature description | ✅ Verified True | Express chat route injects profile + saved programs context before forwarding to ai-server | None |
| ChromaDB vector cache | docs | ✅ Verified True | `EduRAGPipeline` uses ChromaDB with 0.85 similarity threshold, 180-day TTL | None |
| Server tests 62/62 | CI output | ✅ Verified True | `npm test` returns 62 passed / 5 suites | None |
| TypeScript clean build | CI output | ✅ Verified True | `npm run build` exits clean | None |
| Web build 32 routes | CI output | ✅ Verified True | Next.js build shows 32 routes | None |
| Ruff lint clean | CI output | ✅ Verified True | `ruff check .` returns "All checks passed!" | None |
| Prisma schema valid | CI output | ✅ Verified True | `prisma validate` shows "The schema is valid 🚀" | None |

---

## Priority Actions from Reality Check

### HIGH — Fix misleading marketing claims
1. `300+ Universities` → change to "Growing database" or "150+ programs scraped"
2. `12k+ Scholarships` → change to "28+ verified scholarships"
3. `94% match accuracy` → remove or replace with "LLM-scored recommendations"
4. `40+ countries` → change to "15+ countries"

### MEDIUM — Previously placeholder features (✅ All implemented 2026-04-12)

5. ~~SOP Builder~~ → ✅ Implemented: OpenRouter LLM + profile context, 3 tones, copy/download
6. ~~CV Builder~~ → ✅ Implemented: 3 styles, ATS plain-text, regenerate support
7. ~~Professor Finder~~ → ✅ Implemented: Serper + LLM extraction + email templates

### LOW — Documentation alignment

8. ✅ README updated to reflect actual data sources and Module 3 completion
9. Document email provider requirement for alerts
10. Document "live vs seeded" distinction clearly
