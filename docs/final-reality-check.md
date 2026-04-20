# EducAI Final Reality Check

**Date:** 2026-04-20

---

## Feature Verification Table

| Feature / Module | Expected Scope | Current State | Runtime Verification | Action Needed |
|-----------------|----------------|---------------|---------------------|---------------|
| **M1: AI Program Match** | Background job → scrape → rank → poll → display | Complete | Route: `POST /match/start`, `GET /match/status`, `GET /match/latest`. Frontend polls until done. Results scored with reasons. | None |
| **M1: Programs Browse** | Filter/search by country, level, field; detail page with requirements | Complete | `GET /programs`, detail at `/app/programs/[id]`. Requirements, deadlines, university info rendered. | None |
| **M1: Saved Programs** | Save/unsave from any program card; dedicated saved list | Complete | `POST /programs/:id/save`, `DELETE /programs/:id/save`. Saved list at `/app/saved`. | None |
| **M1: Timeline Planner** | Country select → roadmap → month cards with milestones | Complete | `POST /timeline/generate`, `GET /timeline/latest`. Visa templates seeded for US/UK/CA/AU/DE. | None |
| **M1: Strategy Report** | LLM report: admission band + risk factors + actions | Complete | `POST /strategy/generate` → ai-server → LLM → structured JSON persisted. | None |
| **M2: Scholarship Hunter** | 28 real scholarships, search + filter + detail | Complete | `GET /scholarships`, detail pages. Seeds at `npm run seed:scholarships`. | None |
| **M2: Eligibility Checker** | Per-scholarship deterministic eligibility scoring | Complete | `GET /scholarships/:id/eligibility` — profile-aware, labeled as estimate. | None |
| **M2: Funding Probability** | 6-factor weighted score | Complete | Rendered on scholarship detail page, profile-driven. | None |
| **M2: Deadline Alerts** | Daily cron → 30/14/7/1-day windows → email/bell | Complete | GitHub Actions `scholarship-deadline-alerts.yml` at 08:00 UTC. DB deduplication. | None |
| **M3: SOP Builder** | 3 tones × 3 types, AI-generated, copy/download | Complete | `POST /sop/generate` → OpenAI gpt-4o-mini. Fallback template if key absent. | None |
| **M3: CV Builder** | 3 styles, ATS-friendly, AI-generated | Complete | `POST /cv/generate` → OpenAI gpt-4o-mini. Fallback template if key absent. | None |
| **M3: Professor Finder** | Serper search → LLM extraction → cold email template | Complete | `POST /professors/search` → Serper + OpenAI. Fallback to snippet extraction. | None |
| **M3: Gap Fix Recommender** | Profile gap analysis → score → recs with priority | Complete | `POST /gap-fix/analyze` → OpenAI. Rule-based fallback. | None |
| **M4: Career Predictor** | Employability score + pathways + salary + trends | Complete | `POST /career/predict` → OpenAI. Country-template fallback. | None |
| **M4: PR & Immigration** | Country-specific visa/PR step-by-step pathways | Complete | `POST /immigration/guide` → OpenAI. Hard-coded pathway templates as fallback. | None |
| **M4: Data Sync Agent** | Manual trigger + scheduled refresh + run history | Complete | `POST /data-sync/run`, `GET /data-sync/status`. GitHub Actions `data-sync.yml`. | None |
| **AI Chatbot** | Floating widget, profile-aware, citations, multi-turn | Complete | `POST /chat/answer` → OpenAI primary → Groq → OpenRouter → Anthropic → Gemini → ai-server. | None |
| **Auth** | Sign up / verify / sign in / Google OAuth / reset | Complete | Email verification, JWT access + refresh, 5-attempt lockout. | None |
| **Dashboard** | Profile snapshot + roadmap + deadlines + programs | Complete | Server component fetching all data in parallel with graceful fallbacks. | None |
| **Navbar Tools** | All 4 new tools accessible from dropdown | Complete | Gap Fix, Career Outlook, Immigration, Data Sync all present. | None |

---

## OpenAI Migration Verification

- `server/.env`: `OPENAI_API_KEY` set ✅
- `ai-server/.env`: `OPENAI_API_KEY` set, `LLM_PROVIDER=openai` ✅
- `server/src/services/chat.service.ts`: OpenAI is priority 1 in callDirectLLM chain ✅
- All 7 server LLM services: prefer `OPENAI_API_KEY`, fall back to `OPENROUTER_API_KEY` ✅
- `ai-server/app/domains/reasoning/llm_provider.py`: `LLMProvider.OPENAI` as priority 0 ✅
- `ai-server/app/domains/embeddings/openapi.py`: direct OpenAI embeddings when key present ✅

---

## CI Verification (2026-04-20)

- Latest run: `fix(ai): migrate all AI features to OpenAI as primary provider` → **success**
- All 6 CI jobs green: server, web, ai-server, neon-migrate, docker-build, deploy
- No flaky tests, no unescaped entity lint errors, no Neon P1001 false-positives

---

## Known Remaining Optional Dependencies

| Dependency | If absent | Impact |
|-----------|-----------|--------|
| `FIRECRAWL_API_KEY` | No live scraping | Match returns cached programs; still functional |
| `SERPER_API_KEY` | No web search | Professor Finder returns stub data |
| Email SMTP | No email alerts | Console log in dev; deadline bell still works |
| `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` | No Docker push | CI build still runs; just no push |
| `DATABASE_URL_CLOUD` | No auto-migration | Migration job skipped gracefully |
