import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Globe,
  FileText,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Student Visa Guide — How to Get a Study Visa for Germany, Canada, UK, Australia & More",
  description:
    "Complete student visa guide for international students. Learn how to apply for study visas in Germany, Canada, UK, Australia, and the USA — including documents, timelines, costs, and post-study work rights.",
  alternates: { canonical: "https://educai-web.vercel.app/visa" },
  openGraph: {
    title: "Student Visa Guide for International Students · EducAI",
    description:
      "Complete student visa guide: Germany, Canada, UK, Australia, USA. Documents, timelines, costs, and post-study work rights explained.",
    url: "https://educai-web.vercel.app/visa",
  },
};

const VISA_GUIDES = [
  {
    country: "Germany",
    flag: "🇩🇪",
    slug: "germany",
    visaName: "German Student Visa (National Visa Type D)",
    processingTime: "4–12 weeks",
    cost: "~€75",
    postStudyRights: "18-month job-seeker visa",
    requirements: [
      "University admission letter (Zulassungsbescheid)",
      "Proof of financial means (€11,208/year blocked account or scholarship proof)",
      "Valid passport (6+ months validity beyond study period)",
      "Health insurance confirmation",
      "Academic transcripts and certificates",
      "German language proof (for German-taught programs)",
      "English language proof — IELTS/TOEFL (for English-taught programs)",
    ],
    tip: "Open a blocked account (Sperrkonto) at Deutsche Bank, Fintiba, or Expatrio before your visa appointment — this is mandatory for most German student visas.",
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    slug: "canada",
    visaName: "Canadian Study Permit",
    processingTime: "4–16 weeks",
    cost: "CAD $150",
    postStudyRights: "PGWP: up to 3 years",
    requirements: [
      "Letter of Acceptance from a Designated Learning Institution (DLI)",
      "Proof of financial support (CAD $10,000+ per year)",
      "Valid passport",
      "Medical exam (if required based on nationality or stay duration)",
      "Police clearance certificate",
      "Biometric enrollment",
      "Statement of purpose explaining study plans",
    ],
    tip: "Apply as early as possible — Canadian study permit processing times vary widely. Use the Student Direct Stream (SDS) if eligible for faster 20-day processing.",
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    slug: "united-kingdom",
    visaName: "UK Student Visa",
    processingTime: "3 weeks (standard); 5 days (priority)",
    cost: "£490 + NHS surcharge (~£776/year)",
    postStudyRights: "Graduate Route: 2 years (3 for PhD)",
    requirements: [
      "CAS (Confirmation of Acceptance for Studies) from your university",
      "Proof of English language proficiency — IELTS for UKVI",
      "Financial proof (tuition + £1,334/month for London or £1,023/month outside London)",
      "Valid passport",
      "ATAS certificate (for certain subjects — security-sensitive courses)",
      "TB test results (if from a listed country)",
      "Parental consent (if under 18)",
    ],
    tip: "The NHS surcharge is paid upfront and covers all NHS healthcare during your stay — factor this into your budget. IELTS for UKVI is a specific test variant required for the UK Student Visa.",
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    slug: "australia",
    visaName: "Australian Student Visa (Subclass 500)",
    processingTime: "1–4 months",
    cost: "AUD $710",
    postStudyRights: "Temporary Graduate visa (485): 2–6 years",
    requirements: [
      "Confirmation of Enrolment (CoE) from an Australian institution",
      "Genuine Temporary Entrant (GTE) statement",
      "Financial capacity proof (AUD $21,041/year minimum)",
      "English language proficiency — IELTS/TOEFL/PTE",
      "Valid passport",
      "Health insurance (Overseas Student Health Cover — OSHC, mandatory)",
      "Health examination (if required)",
      "Character documentation (police clearance)",
    ],
    tip: "Arrange your OSHC health insurance before applying — it's mandatory for the duration of your visa. The Genuine Temporary Entrant statement is critical: be clear about your study intentions and ties to your home country.",
  },
  {
    country: "United States",
    flag: "🇺🇸",
    slug: "united-states",
    visaName: "F-1 Student Visa",
    processingTime: "Varies widely by embassy (days to months)",
    cost: "USD $185 (visa fee) + USD $350 SEVIS fee",
    postStudyRights: "OPT: 12 months; STEM OPT: up to 36 months total",
    requirements: [
      "Form I-20 from your US university (issued after acceptance)",
      "SEVIS fee payment (Form I-901)",
      "DS-160 nonimmigrant visa application form",
      "Valid passport (6+ months beyond intended stay)",
      "Financial proof of ability to cover tuition and living costs",
      "Proof of ties to home country (to show intention to return)",
      "GRE/GMAT scores (if required by program)",
      "English language test scores (TOEFL/IELTS)",
    ],
    tip: "The visa interview at a US Embassy is a key step — prepare to clearly explain your study plans and demonstrate strong ties to your home country. Denial rates vary significantly by nationality and consulate.",
  },
];

const GENERAL_TIPS = [
  {
    icon: Clock,
    title: "Apply early",
    desc: "Start your visa application as soon as you receive your university admission letter. Processing times can range from 2 weeks to 4 months depending on the country and your nationality.",
  },
  {
    icon: FileText,
    title: "Document checklist everything",
    desc: "Missing a single document can cause rejection or significant delays. Create a checklist for each visa requirement and verify that each document is in the correct format (certified, translated, notarized).",
  },
  {
    icon: CheckCircle2,
    title: "Prepare your finances",
    desc: "Proof of financial means is required for every student visa. This typically means bank statements, a blocked account, or scholarship confirmation letters. Amounts vary by country — see individual country guides.",
  },
  {
    icon: AlertCircle,
    title: "Understand post-study rights",
    desc: "Post-study work rights are a major factor in choosing a destination. Germany, Canada, Australia, and the UK all offer 1–3 years of post-study work authorization. The USA offers OPT and STEM OPT extensions.",
  },
  {
    icon: Globe,
    title: "Check country-specific timelines",
    desc: "EducAI's Application Timeline Planner generates a month-by-month visa checklist based on your target country, program, and intake — including when to book language tests and schedule embassy appointments.",
  },
];

export default function VisaGuidePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How long does it take to get a student visa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Processing times vary significantly by country and nationality. German student visas typically take 4–12 weeks. UK visas take about 3 weeks (or 5 days with priority service). Canadian study permits take 4–16 weeks. Australian student visas take 1–4 months. Apply as early as possible after receiving your admission letter.",
        },
      },
      {
        "@type": "Question",
        name: "What is a post-study work visa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A post-study work visa allows international graduates to remain in the destination country after completing their degree to work or seek employment. Germany offers an 18-month job-seeker visa. Canada offers the PGWP for up to 3 years. The UK offers the Graduate Route for 2 years (3 for PhD graduates). Australia offers the Temporary Graduate visa for 2–6 years.",
        },
      },
      {
        "@type": "Question",
        name: "How much money do I need to show for a student visa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Financial proof requirements vary by country. Germany requires proof of €11,208/year (often through a blocked account). Canada requires CAD $10,000+ per year. The UK requires £1,334/month in London or £1,023/month elsewhere, plus tuition. Australia requires AUD $21,041/year minimum. These amounts are minimums — actual costs of living may be higher.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                Visa Guide
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Student visa guide for international students
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Everything you need to know about student visas for top study destinations — Germany, Canada, UK,
                Australia, and the USA. Documents, timelines, costs, and post-study work rights explained clearly.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild className="h-12 px-8 font-semibold">
                  <Link href="/auth/signup">
                    Get personalized visa timeline <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8">
                  <a href="#guides">Browse visa guides</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* General tips */}
        <section className="border-y border-border/50 bg-muted/20 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-xl font-extrabold tracking-tight sm:text-2xl">
              5 things every student visa applicant should know
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {GENERAL_TIPS.map((tip) => {
                const Icon = tip.icon;
                return (
                  <div key={tip.title} className="flex flex-col rounded-xl border border-border bg-card p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <h3 className="mb-2 text-sm font-bold">{tip.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{tip.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Country visa guides */}
        <section id="guides" className="py-16 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Student visa requirements by country
            </h2>
            <div className="space-y-8">
              {VISA_GUIDES.map((guide) => (
                <article
                  key={guide.country}
                  className="rounded-2xl border border-border bg-card p-6 sm:p-8"
                >
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{guide.flag}</span>
                      <div>
                        <h3 className="text-xl font-extrabold">{guide.country}</h3>
                        <p className="text-sm text-muted-foreground">{guide.visaName}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium">
                        {guide.processingTime}
                      </span>
                      <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium">
                        {guide.cost}
                      </span>
                      <span className="rounded-full border border-[#3D9970]/30 bg-[#3D9970]/10 px-3 py-1 text-xs font-medium text-[#3D9970]">
                        {guide.postStudyRights}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                      <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Required documents
                      </h4>
                      <ul className="space-y-2">
                        {guide.requirements.map((req) => (
                          <li key={req} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary/70" />
                            <span className="text-muted-foreground">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col justify-between gap-5">
                      <div className="rounded-xl border border-[#C49A3C]/30 bg-[#C49A3C]/5 p-4">
                        <p className="mb-1 text-xs font-bold text-[#C49A3C]">
                          Key tip
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">{guide.tip}</p>
                      </div>
                      <Link
                        href={`/countries/${guide.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
                      >
                        Full {guide.country} study guide <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* EducAI timeline planner CTA */}
        <section className="border-t border-primary/10 bg-primary/5 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <GraduationCap className="mx-auto mb-4 size-10 text-primary" />
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Get a personalized visa timeline
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
              EducAI generates a month-by-month checklist for your specific country, program, and intake —
              including when to book language tests, prepare finances, and submit your visa application.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="h-12 px-8 font-semibold">
                <Link href="/auth/signup">
                  Build my visa timeline — free <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8">
                <Link href="/countries">Country guides</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center gap-2" aria-label="EducAI home">
          <GraduationCap className="size-6 text-primary" />
          <span className="text-base font-bold tracking-tight">
            Educ<span className="text-primary">AI</span>
          </span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/countries" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Countries
          </Link>
          <Link href="/scholarships" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Scholarships
          </Link>
          <Link href="/visa" className="text-sm font-medium text-primary">
            Visa Guide
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Get started</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2" aria-label="EducAI home">
            <GraduationCap className="size-5 text-primary" />
            <span className="text-sm font-bold">
              Educ<span className="text-primary">AI</span>
            </span>
          </Link>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/countries" className="hover:text-foreground transition-colors">Countries</Link>
            <Link href="/scholarships" className="hover:text-foreground transition-colors">Scholarships</Link>
            <Link href="/visa" className="hover:text-foreground transition-colors">Visa Guide</Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} EducAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
