# API Contracts

**Date:** 2026-04-12

All backend routes are served from `BACKEND_URL` (default `http://localhost:3001`).
All protected routes require `Authorization: Bearer <accessToken>` header.

---

## Auth Routes (`/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/signup | No | Register new user |
| POST | /auth/signin | No | Email/password login → tokens |
| GET  | /auth/me | Yes | Get current user |
| POST | /auth/signout | Yes | Revoke tokens |
| POST | /auth/refresh | No | Refresh access token |
| POST | /auth/forgot-password | No | Send reset email |
| POST | /auth/reset-password | No | Reset with token |
| POST | /auth/verify-email | No | Verify email token |

---

## User Routes (`/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | /users/me/profile | Yes | Get user profile |
| POST | /users/me/profile | Yes | Upsert user profile |

---

## Programs (`/programs`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | /programs | Yes | Search/list programs with filters |
| GET  | /programs/:id | Yes | Get program by ID |

Query params for GET /programs:
- `q` — search query
- `countryCode` — filter by country
- `level` — BSC/MSC/PHD
- `field` — field of study
- `maxTuition` — max tuition in USD
- `page`, `limit` — pagination

---

## Match (`/match`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /match/run | Yes | Trigger AI scrape-match background job |
| GET  | /match/latest | Yes | Get latest match run + results |
| GET  | /match/run/:runId/status | Yes | Poll run status |

---

## Saved Programs (`/saved-programs`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | /saved-programs | Yes | List user's saved programs |
| POST | /saved-programs | Yes | Save a program |
| DELETE | /saved-programs/:programId | Yes | Unsave a program |

---

## Timeline (`/timeline`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | /timeline/inputs | Yes | Get inputs (profile, saved, visa template) |
| POST | /timeline/generate | Yes | Generate/regenerate roadmap |
| GET  | /timeline/latest | Yes | Fetch latest roadmap |

POST /timeline/generate body: `{ countryCode: string, intake?: string }`

---

## Strategy (`/strategy`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /strategy/generate | Yes | Generate strategy report |
| GET  | /strategy/latest | Yes | Fetch latest strategy report |

POST /strategy/generate body: `{ countryCode: string, intake?: string, focusProgramIds?: string[] }`

---

## Chat (`/chat`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /chat | Yes | Send message, get structured reply |

POST /chat body:
```json
{
  "message": "string",
  "conversationId": "string",
  "history": [{ "role": "user|assistant", "content": "string" }]
}
```

Response:
```json
{
  "reply": {
    "answer": "string",
    "bullets": ["string"],
    "nextSteps": ["string"],
    "sources": [{ "type": "internal|web", "title": "string", "url": "string?" }],
    "confidence": "high|medium|low"
  }
}
```

---

## Scholarships (`/scholarships`) — NEW

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | /scholarships | Yes | Search/filter scholarships |
| GET  | /scholarships/:id | Yes | Get scholarship details |
| GET  | /scholarships/eligible | Yes | Get scholarships user is eligible for |
| GET  | /scholarships/deadlines | Yes | Get upcoming scholarship deadlines |
| POST | /scholarships/:id/probability | Yes | Get funding probability for scholarship |
| POST | /scholarships/:id/eligibility | Yes | Detailed eligibility check |

GET /scholarships query params:
- `q` — search query
- `countryCode` — target country
- `level` — BSC/MSC/PHD
- `field` — field of study
- `fundingType` — full/partial/living/research
- `maxGpaRequired` — filter by min GPA threshold (show achievable ones)
- `financialNeed` — true/false
- `page`, `limit`

Response for GET /scholarships:
```json
{
  "items": [ScholarshipItem],
  "page": 1,
  "limit": 20,
  "total": 150
}
```

ScholarshipItem:
```json
{
  "id": "string",
  "title": "string",
  "provider": "string",
  "countryCode": "string",
  "level": "BSC|MSC|PHD|null",
  "field": "string|null",
  "amount": "string",
  "fundingType": "full|partial|living|research",
  "description": "string",
  "url": "string",
  "minGpa": 3.0,
  "requiresEnglishTest": true,
  "financialNeedRequired": false,
  "eligibleNationalities": ["BD","IN","PK"],
  "tags": ["STEM","merit"],
  "deadlines": [{ "id": "...", "term": "Fall 2026", "deadline": "ISO8601" }],
  "isActive": true,
  "lastVerified": "ISO8601"
}
```

POST /scholarships/:id/eligibility body:
```json
{
  "profileOverride": { ... }  // optional — uses authenticated user profile by default
}
```

Response:
```json
{
  "scholarshipId": "string",
  "status": "eligible|partially_eligible|not_eligible",
  "score": 78,
  "metCriteria": ["string"],
  "missingCriteria": ["string"],
  "improvementActions": ["string"],
  "confidence": "high|medium|low"
}
```

POST /scholarships/:id/probability response:
```json
{
  "scholarshipId": "string",
  "probabilityBand": "High|Medium|Low",
  "probabilityPct": 62,
  "factors": [
    { "factor": "GPA", "weight": 0.25, "score": 0.85, "note": "3.8/4.0 meets 3.5 min" }
  ],
  "weaknesses": ["string"],
  "improvementActions": ["string"],
  "confidence": "high|medium|low"
}
```

---

## Health Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Basic health |
| GET | /health/db | No | DB connection + counts |
| GET | /health/schema | No | Migration status |
| GET | /health/timeline | No | Visa templates + roadmap count |
| GET | /health/whoami | Yes | Auth debug |

---

## AI Server Endpoints (`AI_SERVER_URL` default `http://localhost:8001`)

Internal-only. Called from Express server, not from the browser.

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/chat/answer | LLM chat with web+internal context |
| POST | /api/v1/module1/scrape_match | AI scrape + rank universities |
| POST | /api/v1/module1/strategy | LLM strategy report |
| GET  | /api/v1/health | Health check |
