# Data Model

**Date:** 2026-04-12

All models are in `server/prisma/schema.prisma`.

---

## Auth Domain

### User
Core user account. Supports email/password and OAuth (Google).  
Account lockout after 5 failed logins (10-min window).

### UserProfile
One-to-one with User. Multi-step onboarding fields:
- Stage/intake/countries/level (Step 1)
- GPA/institution/major/graduation (Step 2)
- English test/GRE/GMAT (Step 3)
- Budget/funding/cities/priorities (Step 4)

### Auth Tokens
- `RefreshToken` — JWT refresh tokens with TTL, revocation, remember-me
- `PasswordResetToken` — hashed one-time reset tokens
- `EmailVerificationToken` — email confirm tokens
- `EmailChangeToken` — email change confirm tokens
- `UserSession` — Express session storage in Postgres
- `OAuthCode` — one-time OAuth code exchange

---

## Module 1: University & Program Matching

### Country
Lookup table. Code (ISO 3166-1 alpha-2), Name.

### University
Name, city, website, country FK.  
Unique: (countryId, name)

### Program
Title, field, level (BSC/MSC/PHD), duration, tuition range, description, sourceUrl.  
Belongs to University.

### ProgramRequirement
Key-value pairs per program (minGPA, IELTS, documents, etc.)

### ProgramDeadline
Term + deadline date per program.

### SavedProgram
User ↔ Program junction. One per user-program pair.

### MatchRun
Background match job. Status: pending/running/done/error. Progress 0-100.

### MatchResult
Score + reasons per run. Links to Program or stores rawData for scraped-only results.

### DataSourceMeta
Cache metadata. Prevents re-scraping same (countries, major, level) within 24h.

---

## Module 1: Timeline & Strategy

### VisaTimelineTemplate
Per country visa milestone offsets (JSON). Seeded for US, UK, CA, AU, DE.

### UserRoadmap
Month-by-month plan JSON. Linked to User + countryCode.  
Plan format: `[{ month, label, items: [{ type, title, description, date? }] }]`

### StrategyReport
LLM-generated report JSON. Linked to User + countryCode.  
Report format: `{ summary, whyThisCountryFits[], admissionChances, riskAssessment[], recommendedActions[], documentChecklist[], disclaimer }`

---

## Module 2: Scholarships

### Scholarship (extended)
Base: title, provider, countryCode, level, field, url  
Added: description, amount, fundingType, minGpa, requiresEnglishTest,  
financialNeedRequired, eligibleNationalities (JSON string[]),  
tags (JSON string[]), isActive, sourceUrl, lastVerified

### ScholarshipDeadline
Scholarship ↔ deadline date. Multiple per scholarship.

---

## Audit

### AuditLog
Generic event log. userId (optional), action, entityType, entityId, changes (JSON), IP, userAgent.

---

## Enum

```
ProgramLevel: BSC | MSC | PHD
```

---

## Relationship Diagram (simplified)

```
User
 ├── UserProfile (1:1)
 ├── RefreshToken[] / PasswordResetToken[] / etc.
 ├── SavedProgram[] → Program → University → Country
 ├── MatchRun[] → MatchResult[] → Program?
 ├── UserRoadmap[] (countryCode)
 └── StrategyReport[] (countryCode)

Scholarship → ScholarshipDeadline[]

Country → University[] → Program[]
          → VisaTimelineTemplate (countryCode)
```
