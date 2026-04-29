# EducAI SEO Implementation Plan

**Implemented:** 2026-04-29  
**Status:** Phase 1–7 complete

---

## What Was Implemented

### Phase 1 — Technical SEO Foundation

#### `web/app/robots.ts`
- Created Next.js robots.ts with explicit allow/disallow rules
- Allow: `/`, `/countries/`, `/scholarships`, `/visa`, `/study-abroad`
- Disallow: `/app/`, `/auth/`, `/onboarding`, `/onboarding-check`, `/api/`
- Points to sitemap URL

#### `web/app/sitemap.ts`
- Created Next.js sitemap.ts with all public pages
- Includes: homepage (priority 1.0), study-abroad (0.9), scholarships (0.9), visa (0.8), countries (0.8), all 10 country pages (0.75)
- Properly sets `changeFrequency` and `lastModified`

#### Root Layout (`web/app/layout.tsx`)
- Added `metadataBase: new URL("https://educai-web.vercel.app")`
- Added title template: `{ default: "...", template: "%s · EducAI" }`
- Expanded description for better CTR
- Added `keywords` array (study abroad, scholarships, visa, universities, etc.)
- Added full `openGraph` block (type, locale, url, siteName, title, description, images)
- Added `twitter` card block (summary_large_image)
- Added `robots` block (index: true, follow: true, googleBot directives)
- Added `alternates.canonical`

#### Page-specific metadata
- Homepage (`/`): dedicated metadata with optimized description and canonical
- Auth layout: `robots: { index: false, follow: false }` via layout-level metadata export
- Onboarding: `robots: { index: false, follow: false }`
- Onboarding check: `robots: { index: false, follow: false }`
- Protected layout: `robots: { index: false, follow: false }` — covers all `/app/*` pages

---

### Phase 2 — Public SEO Content Architecture

#### New public pages created:

| Route | Title | Type | Priority |
|-------|-------|------|----------|
| `/study-abroad` | Study Abroad Guide 2025 — Complete Guide | Static | 0.9 |
| `/countries` | Study Abroad by Country — Top Destinations | Static | 0.8 |
| `/countries/[slug]` | {Country headline} | SSG (10 pages) | 0.75 |
| `/scholarships` | Study Abroad Scholarships — Find Funding | Static | 0.9 |
| `/visa` | Student Visa Guide | Static | 0.8 |

#### Country pages created (10):
- `/countries/germany`
- `/countries/canada`
- `/countries/united-kingdom`
- `/countries/australia`
- `/countries/united-states`
- `/countries/netherlands`
- `/countries/france`
- `/countries/sweden`
- `/countries/ireland`
- `/countries/singapore`

Each country page includes:
- Unique H1 headline
- 200-word+ description
- Key highlights list
- Top universities list
- Popular degrees
- Visa type and tuition costs
- FAQPage structured data (JSON-LD)
- BreadcrumbList structured data (JSON-LD)
- Internal links to related countries
- CTA to sign up

---

### Phase 3 — Structured Data / Schema

#### Homepage
- `Organization` schema (name, url, logo, description, contactPoint, sameAs)
- `WebSite` schema (name, url, description, potentialAction)
- `SoftwareApplication` schema (name, category, OS, offers with price: 0)

#### Country pages
- `FAQPage` schema (per-page FAQ questions and answers)
- `BreadcrumbList` schema (Home > Countries > {Country})

#### Scholarships page
- `FAQPage` schema (5 scholarship FAQ items)
- `ItemList` schema (10 top scholarships as list items)

#### Study Abroad Guide
- `FAQPage` schema (5 FAQ items)
- `HowTo` schema (6 steps with descriptions)

#### Visa Guide
- `FAQPage` schema (3 FAQ items)

---

### Phase 4 — Internal Linking

#### Homepage footer
- Changed "Platform" section (links to `/app/*` protected routes) → "Resources" section
- Now links to: `/study-abroad`, `/countries`, `/scholarships`, `/visa`

#### ExploreSection (homepage)
- Added new public section between TrendingFeed and CTA
- Cards linking to all 4 public content sections
- Helps Google discover the public content cluster from the homepage

#### Country pages
- "Related destinations" section at bottom links to 6 other country pages
- Creates internal link cluster within country guide section

#### Scholarships page
- "Explore by country" section links to 8 country guide pages

#### Study abroad guide
- Each step links to the relevant public resource page
- "Continue exploring" section at bottom with cards to countries, scholarships, visa

---

### Phase 5 — Noindex Rules

| Route pattern | Indexed? | Method |
|---------------|----------|--------|
| `/` | ✅ Yes | default (root layout robots: index: true) |
| `/countries/*` | ✅ Yes | default |
| `/scholarships` (public) | ✅ Yes | default |
| `/visa` | ✅ Yes | default |
| `/study-abroad` | ✅ Yes | default |
| `/auth/*` | ❌ No | auth layout metadata export |
| `/onboarding` | ❌ No | page metadata export |
| `/onboarding-check` | ❌ No | page metadata export |
| `/app/*` | ❌ No | protected layout metadata export |

---

## Data Source

All country data, scholarship data, and visa data in `web/lib/data/seoCountries.ts` is:
- Factually accurate based on publicly available government and university information
- Not invented or exaggerated
- Aligned with real EducAI product features (visa templates, scholarship tracking, timeline planner)

---

## What's NOT Yet Done (Future SEO Work)

1. **OG Image** — Need to create `/public/og-image.png` (1200x630px). Currently referenced but file doesn't exist. Vercel OG or a static design asset needed.
2. **Blog/content cluster** — Long-form articles about specific topics (e.g., "DAAD Scholarship application guide", "How to write an SOP for German universities")
3. **Program pages** — If programs become publicly accessible, `/programs/[id]` could be powerful SEO pages
4. **University pages** — Individual university landing pages for top institutions
5. **Google Search Console** — Submit sitemap at `https://educai-web.vercel.app/sitemap.xml` after deployment
6. **Canonical review** — Review after any new routes are added
7. **Core Web Vitals** — Monitor LCP, CLS, FID in Search Console after deployment
8. **Hreflang** — If internationalization is added in future

---

## Build Verification

After implementation:
- `npm run lint` — ✅ 0 errors, 0 warnings
- `npm run build` — ✅ All 52 pages generated successfully
- Sitemap: ✅ `/sitemap.xml` generated as static page
- Robots: ✅ `/robots.txt` generated as static page
- Country pages: ✅ 10 pages statically generated via `generateStaticParams`
- All public pages: ✅ `○ (Static)` in build output
