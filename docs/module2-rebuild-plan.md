# Module 2 Rebuild Plan

**Date:** 2026-04-12

---

## Module 2 Scope

Module 2 = Scholarship Hunter + Eligibility Checker + Deadline Alert System + Probability Predictor

---

## Current State (as of audit)

| Feature | Backend | Frontend | Quality |
|---------|---------|----------|---------|
| Scholarship list | ✅ 28 seeded scholarships | ✅ filter UI | Good |
| Eligibility checker | ✅ deterministic scoring | ✅ eligibility badge | Good |
| Probability predictor | ✅ weighted scoring | ✅ probability band | Good |
| Deadline alerts | ✅ model + routes | ✅ alerts page | Good |
| Scholarship detail | ✅ GET /scholarships/:id | — no detail page | Gap |
| Saved scholarships | — no model | — no save feature | Gap |

---

## What is Preserved (no changes)

- `Scholarship` Prisma model (all 15+ fields)
- `ScholarshipService` eligibility + probability algorithms
- All scholarship routes: list, detail, eligible, probability
- `DeadlineAlert` model and routes
- 28 seeded scholarships covering major global funding sources

---

## What is Enhanced

### 1. Scholarship Detail Page (Gap — Phase 4)
- New page at `/app/scholarships/[id]`
- Shows full scholarship details: requirements, funding coverage, provider info
- Eligibility check result inline
- Probability band with explanation

### 2. UI Polish (Phase 4)
- Better scholarship cards with funding type color bands
- Eligibility status chip on cards (eligible/partial/not-eligible)
- Probability band chip with color coding
- Empty states with actionable CTAs

### 3. Deadline Alert UX (Phase 4)
- Alert creation form with date picker
- Alert list with dismiss/complete actions
- Upcoming vs past alerts distinction
- Link from alert → scholarship

### 4. Data Provenance (Phase 4)
- Show scholarship source URL as verified link
- Provider logos or flags for country-specific scholarships
- Last updated timestamp on scholarship card

---

## Scholarship Data Quality

28 seeded scholarships include:
- Merit-based: Chevening, DAAD, Fulbright, Commonwealth
- Need-based: Gates Cambridge, Aga Khan
- Country-specific: Australia Awards, Canadian Government, NZ Development
- University-specific: several top-10 university fellowships

All 28 have: name, provider, description, countryCode, level (masters/phd/undergrad), field coverage, deadline, fundingType (full/partial/living/research), financialNeed flag, eligibility criteria.

---

## Success Criteria

- [ ] Scholarship list loads with filters applied
- [ ] Eligibility check runs and returns eligible/partial/not-eligible
- [ ] Probability prediction returns band + explanation
- [ ] Deadline alerts can be created and listed
- [ ] Scholarship cards show funding type badge
- [ ] TypeScript build clean
