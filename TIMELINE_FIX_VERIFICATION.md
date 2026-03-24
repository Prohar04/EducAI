# Timeline End-to-End Fix — Verification Guide

## Summary of Fixes

✅ **Backend Architecture**

- Route mounting: `/timeline` routes properly mounted in `server/src/app.ts:123`
- Auth middleware: `authMiddleware` correctly extracts JWT and attaches `req.userId`
- Controller methods: all 3 endpoints (latest, generate, inputs) properly exported/imported

✅ **Visa Templates**

- Seed script executed: `npm run seed:visa` completed (5 templates updated: US/UK/CA/AU/DE)
- Schema validated: `prisma validate` passed ✓
- Database populated with milestones for each country

✅ **Frontend Integration**

- Auth fetch: `authFetch` helper automatically includes `Authorization: Bearer {token}`
- API calls: getLatestTimeline, generateTimeline, getTimelineInputs all use correct endpoints
- Empty states: UI shows appropriate CTAs when no programs saved (→ /app/programs)

✅ **Diagnostics**

- New endpoint: `GET /health/timeline` returns status and counts
- Confirms visa templates exist and database is accessible

## Build Status

- ✅ Backend: `npm run build` passed (tsc)
- ✅ Schema: `npx prisma validate` passed
- ✅ Frontend: `npm run build` completed successfully
- ✅ Commit: `411191a fix(module1): timeline end-to-end wiring`

## Curl Verification Commands

### 1. Check Visa Templates Exist

```bash
curl -s http://localhost:5000/health/timeline | jq .
```

Expected response:

```json
{
  "ok": true,
  "timestamp": "...",
  "database": "connected",
  "visaTemplates": 5,
  "roadmaps": ...,
  "ready": true
}
```

### 2. Get Timeline Inputs (requires auth token)

```bash
TOKEN="your-access-token-here"
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/timeline/inputs?countryCode=US" | jq .
```

Expected: 200 OK with profile, savedPrograms, visaTemplate, scholarships

### 3. Generate Timeline (requires auth token)

```bash
TOKEN="your-access-token-here"
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"countryCode":"US","intake":"Fall 2027"}' \
  http://localhost:5000/timeline/generate | jq .
```

Expected: 201 OK with UserRoadmap object containing plan array

### 4. Get Latest Timeline (requires auth token)

```bash
TOKEN="your-access-token-here"
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/timeline/latest?countryCode=US" | jq .
```

Expected: 200 OK with latest UserRoadmap, or 404 if no roadmap generated yet

## No 404/401 Errors

- ✅ All routes mounted (no 404)
- ✅ Auth middleware verifies token (checks for Bearer header)
- ✅ If token invalid/missing: 401 Unauthorized
- ✅ If valid token: req.userId available to controllers

## No Broken UI

- ✅ Empty state when no saved programs: Shows "No deadlines to plan yet" with CTA to /app/programs
- ✅ Empty state when no roadmap generated: Shows "Your roadmap is ready to generate" with Generate button
- ✅ Loading skeletons shown while generating
- ✅ Success toast shown after generation
- ✅ Warning banner if visa template missing (but roadmap still builds from app deadlines)

## Database Schema

```sql
SELECT countryCode, title, milestones
FROM visa_timeline_templates
WHERE countryCode IN ('US', 'UK', 'CA', 'AU', 'DE');
```

All 5 records should exist with milestone JSON objects.

## Next Steps if Issues Persist

1. Check `/health/timeline` — confirms visa templates loaded
2. Check `/health/db` — confirms database connected
3. Review `server/src/controllers/timeline.controller.ts:187` — verify req.userId access
4. Check `web/lib/auth/session.ts` — confirm accessToken available in session
5. Run `npm run seed:visa` again if templates missing from database
