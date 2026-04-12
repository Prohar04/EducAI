# UI/UX System Plan

**Date:** 2026-04-12

---

## Design Philosophy

EducAI targets international students making high-stakes decisions. The UI must:
- Feel credible and professional (not like a student project)
- Communicate data clearly — charts, badges, progress states
- Be navigable under stress (students are anxious users)
- Work in dark mode by default (existing Tailwind setup preserved)

---

## Design System (existing — preserved)

| Element | Implementation |
|---------|---------------|
| Font: Sans | Poppins (Google Fonts) |
| Font: Serif | Source Serif 4 (Google Fonts) |
| Font: Mono | JetBrains Mono (Google Fonts) |
| Component lib | shadcn/ui (Radix primitives) |
| Styling | Tailwind CSS v3 |
| Icons | lucide-react |
| Animation | framer-motion (FadeIn, Reveal, Stagger, AnimatedCard) |
| Dark mode | Tailwind `dark:` classes, system default |

---

## Current Page Inventory

| Page | Route | Status |
|------|-------|--------|
| Landing | `/` | Good — needs minor polish |
| Dashboard / Home | `/app` | Good — real RSS feed |
| Match | `/app/match` | Good — needs result card polish |
| Programs | `/app/programs` | Good — needs NLP search bar |
| Scholarships | `/app/scholarships` | Good — needs detail page |
| Timeline | `/app/timeline` | Good — needs print export |
| Strategy | `/app/strategy` | Good — needs collapsible sections |
| Agent | `/app/agent` | Weak — needs full-screen layout |
| Onboarding | `/app/onboard` | Good |
| Settings | `/app/settings` | Exists |

---

## Polish Pass Plan

### Global (applies to all pages)

1. **Page headers**: Every protected page should have a consistent page header block:
   - Title (Poppins Bold, ~2rem)
   - Subtitle / description (muted text)
   - Optional action button (right-aligned)

2. **Empty states**: Every list/data view should have a designed empty state:
   - Illustration or icon
   - Descriptive message
   - Primary CTA button

3. **Loading states**: Every async view needs a skeleton loader (not a spinner alone)

4. **Error states**: Every fetch can fail — show error card with retry

5. **Card consistency**: All data cards should follow:
   - Border radius: `rounded-xl`
   - Padding: `p-5` or `p-6`
   - Shadow: `shadow-sm` (light) / `shadow-none` (dark)
   - Hover: `hover:shadow-md transition-shadow`

### Page-Specific Polish

#### Programs Page
- Add natural language search bar (Phase 3)
- Show total program count in header
- Filter chips for active filters (dismissible)
- Better program card: university logo placeholder, field badge, tuition range

#### Match Page
- Match score as radial progress gauge
- Fit band badge (Strong/Good/Stretch) as colored chip
- Expandable program card showing requirements + deadlines
- "Save all results" bulk action

#### Scholarships Page
- Funding type badge with distinct colors:
  - Full funding: `bg-green-500/20 text-green-400`
  - Partial: `bg-blue-500/20 text-blue-400`
  - Living allowance: `bg-purple-500/20 text-purple-400`
  - Research: `bg-amber-500/20 text-amber-400`
- Eligibility chip on every card
- Probability band indicator
- Detail page for each scholarship

#### Strategy Page
- Accordion for each section (summary, risks, actions, checklist)
- Risk severity badges: High=red, Medium=amber, Low=green
- Action steps with numbered list styling
- Print/export button

#### Timeline Page
- Print-friendly layout
- Month cards with milestone completion checkmarks (client-side)
- Visa step status indicators

#### Agent Page
- Full-screen two-panel layout
- Source chip pills below each message
- Typing animation indicator

---

## Motion System (preserved, extended)

| Component | Motion |
|-----------|--------|
| `FadeIn` | opacity 0→1, y+8→0, 0.4s ease |
| `Reveal` | viewport-triggered fade+slide |
| `Stagger` | children stagger 0.08s delay |
| `AnimatedCard` | hover scale 1.02, shadow up |

New additions:
- `ProgressBar`: width animation via CSS transition
- `Skeleton`: pulse animation for loading states

---

## Accessibility Baseline

- All interactive elements have `aria-label` or visible text
- Color is never the only differentiator (badges have text too)
- Focus rings preserved (Tailwind `focus-visible:ring`)
- Dark mode meets WCAG AA contrast minimums
