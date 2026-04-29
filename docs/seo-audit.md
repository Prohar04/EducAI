# EducAI SEO Audit

**Date:** 2026-04-29  
**Audited by:** SEO implementation pass (autonomous)  
**Frontend URL:** https://educai-web.vercel.app

---

## Summary

EducAI had a partially-built SEO foundation with reasonable homepage content but missing the majority of technical SEO infrastructure. This document records the pre-implementation state and audit findings.

---

## Pre-Implementation State

### Strengths
- Homepage had a clear H1: "The intelligent platform for studying abroad"
- Homepage metadata existed (title + description)
- Homepage content was topically relevant (programs, scholarships, strategy, visa, timelines)
- Next.js 16 App Router correctly used for page structure
- `lang="en"` on HTML root
- Semantic aria-labels on navigation elements
- `revalidate = 86400` on homepage (ISR)

### Weaknesses

#### Technical SEO
- **No `robots.txt`** — crawlers had no guidance on what to index
- **No `sitemap.xml`** — no structured page discovery for search engines
- **No `metadataBase`** — OG URLs were relative and broken in sharing previews
- **No Open Graph metadata** — pages shared poorly on social/Slack/Twitter
- **No Twitter card metadata**
- **No canonical URL tags**
- **No structured data (JSON-LD)** anywhere on the site
- **No OG image** (`/og-image.png` referenced but not yet created)

#### Indexability Issues
- **Auth pages** (`/auth/signin`, `/auth/signup`, etc.) had no `noindex` directive
- **Onboarding pages** had no `noindex` directive
- **Protected app pages** had no `noindex` directive (though redirect-protected, no robots meta)

#### On-Page SEO
- Metadata title was a flat string with no template (`%s · EducAI` pattern missing)
- No keywords defined in metadata
- Homepage metadata description was thin vs. available content
- Footer linked only to protected `/app/*` routes — no internal links to public content
- No public SEO content pages for primary topic clusters

#### Content Architecture
- **No country study guides** (e.g., `/countries/germany`)
- **No public scholarship page** (existing `/app/scholarships` is gated)
- **No visa guide page**
- **No study abroad guide page**
- No SEO-targetable content cluster around study abroad topics

---

## Issues by Severity

### Critical
1. No `robots.txt` — bots have no guidance
2. No sitemap — pages not discoverable by search engines systematically
3. No `noindex` on auth/onboarding/app pages — risk of crawling dead-end pages

### High
4. No Open Graph metadata — poor social sharing appearance
5. No `metadataBase` — OG image URLs invalid in social previews
6. No structured data — no rich results in search
7. No public content pages for SEO topic clusters

### Medium
8. Footer links pointing only to protected routes
9. Metadata description not optimized for CTR
10. No title template (`%s · EducAI`)
11. No canonical URL tags

### Low
12. No Twitter card metadata
13. No keyword hints in metadata
14. Missing `og:image` asset

---

## Quick Wins Identified
- Add `robots.ts` and `sitemap.ts` (Next.js built-in support)
- Add `noindex` to protected layout, auth layout, onboarding pages
- Add `metadataBase` and OG/Twitter metadata to root layout
- Update footer to link to public content pages
- Add JSON-LD structured data to homepage

## Medium-Term Opportunities
- Create country guide pages (`/countries/[slug]`)
- Create public scholarship page (`/scholarships`)
- Create visa guide page (`/visa`)
- Create study abroad guide (`/study-abroad`)
- Add `og:image` asset (1200x630px)
- Add FAQPage schema to content pages
- Add BreadcrumbList schema to nested pages
- Create blog/resource content around study abroad topics
