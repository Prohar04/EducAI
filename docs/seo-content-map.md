# EducAI SEO Content Map

**Created:** 2026-04-29

---

## Public Content Architecture

```
https://educai-web.vercel.app/
├── /                          (Homepage — Organization + WebSite + SoftwareApp schema)
├── /study-abroad              (Complete guide — HowTo + FAQPage schema)
├── /countries                 (Country index — links to all 10 country guides)
│   ├── /countries/germany
│   ├── /countries/canada
│   ├── /countries/united-kingdom
│   ├── /countries/australia
│   ├── /countries/united-states
│   ├── /countries/netherlands
│   ├── /countries/france
│   ├── /countries/sweden
│   ├── /countries/ireland
│   └── /countries/singapore
├── /scholarships              (Scholarship directory — FAQPage + ItemList schema)
└── /visa                      (Visa guide — FAQPage schema)
```

---

## Target Search Queries by Page

### Homepage (`/`)
- "study abroad AI platform"
- "AI university matching"
- "study abroad app"
- "international student platform"

### Study Abroad Guide (`/study-abroad`)
- "how to study abroad"
- "study abroad guide 2025"
- "study abroad steps"
- "how to apply for university abroad"
- "study abroad process for international students"

### Countries Index (`/countries`)
- "best countries to study abroad"
- "study abroad destinations"
- "where to study internationally"
- "study abroad country comparison"

### Country: Germany (`/countries/germany`)
- "study in Germany"
- "study in Germany for free"
- "German university tuition free"
- "DAAD scholarship"
- "German student visa requirements"
- "study in Germany as international student"

### Country: Canada (`/countries/canada`)
- "study in Canada"
- "Canada PGWP visa"
- "study in Canada for international students"
- "Canada PR after study"
- "best universities in Canada for international students"

### Country: UK (`/countries/united-kingdom`)
- "study in UK"
- "UK Graduate Route visa"
- "UK master's degree 1 year"
- "Chevening scholarship"
- "UK student visa requirements"

### Country: Australia (`/countries/australia`)
- "study in Australia"
- "Australia Temporary Graduate visa"
- "study in Australia PR pathway"
- "Australia Awards scholarship"
- "Australian student visa subclass 500"

### Country: USA (`/countries/united-states`)
- "study in USA"
- "F1 visa requirements"
- "OPT STEM OPT"
- "US university for international students"
- "Fulbright scholarship"

### Scholarships (`/scholarships`)
- "scholarships for international students"
- "study abroad scholarships"
- "DAAD scholarship"
- "Chevening scholarship"
- "fully funded scholarships abroad"
- "scholarships for master's degree abroad"
- "Fulbright scholarship requirements"

### Visa Guide (`/visa`)
- "student visa requirements"
- "how to get student visa"
- "German student visa requirements"
- "Canada study permit"
- "UK student visa"
- "Australia student visa subclass 500"
- "post-study work visa"

---

## Internal Link Topology

```
Homepage → study-abroad, countries, scholarships, visa (ExploreSection + footer)
study-abroad → countries, scholarships, visa (Continue exploring + step links)
countries → /countries/[all slugs]
countries/[slug] → other country slugs (6 related), scholarships, signup
scholarships → country slugs (8 countries in "explore by country")
visa → country guides (inline links in each country section)
```

---

## Indexability Map

| Route | Indexed | Reason |
|-------|---------|--------|
| `/` | ✅ | Public homepage |
| `/study-abroad` | ✅ | Public SEO page |
| `/countries` | ✅ | Public SEO page |
| `/countries/[slug]` | ✅ | Public SEO pages (10) |
| `/scholarships` | ✅ | Public SEO page |
| `/visa` | ✅ | Public SEO page |
| `/auth/*` | ❌ | Auth pages — noindex |
| `/onboarding` | ❌ | App-only — noindex |
| `/onboarding-check` | ❌ | App-only — noindex |
| `/app/*` | ❌ | Protected — noindex |
| `/api/*` | ❌ | Disallowed in robots.txt |

---

## Schema Coverage

| Page | Organization | WebSite | SoftwareApp | FAQPage | HowTo | BreadcrumbList | ItemList |
|------|-------------|---------|------------|---------|-------|---------------|---------|
| Homepage | ✅ | ✅ | ✅ | — | — | — | — |
| /study-abroad | — | — | — | ✅ | ✅ | — | — |
| /countries/[slug] | — | — | — | ✅ | — | ✅ | — |
| /scholarships | — | — | — | ✅ | — | — | ✅ |
| /visa | — | — | — | ✅ | — | — | — |

---

## Next SEO Expansion Opportunities

1. **OG Image** — Create a proper 1200x630px branded image at `/public/og-image.png`
2. **More country guides** — Netherlands, Japan, South Korea, Switzerland, Denmark
3. **Scholarship-specific pages** — Individual pages for DAAD, Chevening, Fulbright
4. **University pages** — TUM, UoT, Imperial etc. if program data becomes publicly accessible
5. **Blog content** — "How to write an SOP", "GRE vs GMAT", "How to email a professor"
6. **Program search landing pages** — "MSc Computer Science in Germany", "MBA in Canada"
7. **Google Search Console** — Submit sitemap after Vercel deployment
