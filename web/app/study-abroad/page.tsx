import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Globe,
  BookOpen,
  Award,
  FileText,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Study Abroad Guide 2025 — Complete Guide for International Students",
  description:
    "Complete guide to studying abroad in 2025: how to choose a country, find programs, apply for scholarships, get your visa, and plan your application timeline. Powered by EducAI.",
  alternates: { canonical: "https://educai-web.vercel.app/study-abroad" },
  openGraph: {
    title: "Study Abroad Guide 2025 — Complete Guide for International Students",
    description:
      "Complete guide to studying abroad in 2025: choosing a country, finding programs, scholarships, visas, and application timelines.",
    url: "https://educai-web.vercel.app/study-abroad",
  },
};

const STEPS = [
  {
    number: "01",
    icon: Globe,
    title: "Choose your destination country",
    description:
      "Your destination choice affects tuition costs, visa difficulty, post-study work rights, language requirements, and career prospects. Consider: tuition fees, living costs, PR pathway, language of instruction, and industry presence in your field.",
    tips: [
      "Germany: free tuition at public universities, strong engineering/CS programs",
      "Canada: clear PR pathway via PGWP + Express Entry",
      "UK: 1-year Master's degrees, Graduate Route visa",
      "Australia: 2–6 year Temporary Graduate visa, strong STEM sector",
      "USA: world's top research universities, OPT + STEM OPT extensions",
    ],
    link: { label: "Compare all destinations", href: "/countries" },
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Find the right programs",
    description:
      "Search programs that match your academic background, career goals, and budget. Look beyond rankings — consider admission requirements, program structure, faculty research areas, and graduate employment outcomes in your target field.",
    tips: [
      "Check GPA requirements — most Master's programs expect 3.0–3.7 GPA",
      "Verify English test score cutoffs (IELTS/TOEFL varies by university)",
      "Review application deadlines — apply 1 year before intended start",
      "Look for co-op, internship, or industry collaboration components",
      "Check if GRE/GMAT is required — many programs have waived it",
    ],
    link: { label: "Explore program matching", href: "/auth/signup" },
  },
  {
    number: "03",
    icon: Award,
    title: "Find and apply for scholarships",
    description:
      "Funding your education abroad often means combining scholarships, assistantships, savings, and part-time work. Start scholarship research early — most major scholarships open 12 months before program start.",
    tips: [
      "DAAD (Germany): up to €1,200/month for Master's and PhD",
      "Chevening (UK): full funding + living costs",
      "Fulbright (USA): full funding for selected international students",
      "Australia Awards: full funding for Asia-Pacific nationals",
      "University merit scholarships are available at most institutions",
    ],
    link: { label: "Browse all scholarships", href: "/scholarships" },
  },
  {
    number: "04",
    icon: FileText,
    title: "Prepare your application materials",
    description:
      "A strong application includes a compelling Statement of Purpose (SOP), a well-formatted CV/resume, strong recommendation letters, and polished transcripts. Each document should be tailored to the program.",
    tips: [
      "SOP: explain your academic journey, research interest, and career goals clearly",
      "CV: use an ATS-friendly format; tailor to academic or professional focus",
      "Letters of recommendation: give referees 4–6 weeks notice",
      "Transcripts: get official sealed copies well in advance",
      "Portfolio: required for architecture, design, and arts programs",
    ],
    link: { label: "Use EducAI's SOP & CV builder", href: "/auth/signup" },
  },
  {
    number: "05",
    icon: Globe,
    title: "Apply for your student visa",
    description:
      "Once you have your admission letter, start the visa application immediately. Processing times range from 2 weeks to 4 months. You'll typically need financial proof, health insurance, and language test certificates.",
    tips: [
      "Apply as soon as you receive your admission letter",
      "Germany: blocked account (€11,208/year) required for visa",
      "UK: pay NHS surcharge upfront (£776/year in addition to visa fee)",
      "Canada: use Student Direct Stream (SDS) for faster 20-day processing",
      "Australia: OSHC health insurance is mandatory before applying",
    ],
    link: { label: "Full visa guide by country", href: "/visa" },
  },
  {
    number: "06",
    icon: CalendarDays,
    title: "Plan your application timeline",
    description:
      "The biggest mistake study abroad applicants make is starting too late. Language tests, scholarship applications, university applications, and visa applications all have fixed timelines that must be planned 12–18 months in advance.",
    tips: [
      "Month -18: Research countries and programs; take language tests",
      "Month -12: Apply for scholarships (Chevening, DAAD, Fulbright)",
      "Month -9: Submit university applications",
      "Month -6: Receive admission letters; start visa process",
      "Month -3: Finalize accommodation, flights, and pre-departure checks",
    ],
    link: { label: "Get your personalized timeline", href: "/auth/signup" },
  },
];

const FAQ_ITEMS = [
  {
    q: "When should I start preparing to study abroad?",
    a: "Start at least 18 months before your intended program start date. Language tests (IELTS/TOEFL/GRE) require preparation time, scholarship deadlines are 12 months before intake, and visa processing adds further delays. For September intake, start your preparation in the January–March of the year before.",
  },
  {
    q: "What GPA do I need to study abroad?",
    a: "Most international Master's programs require a minimum GPA of 3.0/4.0 (or equivalent). Competitive programs at top universities typically expect 3.5+. Some programs weight research experience and work experience heavily alongside GPA.",
  },
  {
    q: "Do I need to know the local language to study abroad?",
    a: "Not necessarily. Most top universities in Germany, Netherlands, Sweden, and other non-English-speaking countries offer fully English-taught programs. You'll need IELTS or TOEFL scores regardless. German-taught programs require TestDaF or DSH.",
  },
  {
    q: "Can I work while studying abroad?",
    a: "Yes — most student visas allow part-time work. Germany allows 120 full days or 240 half days per year. The UK allows 20 hours/week during term. Canada allows 20 hours/week during studies. Australia allows 48 hours per fortnight. The USA limits F-1 students to on-campus work during studies.",
  },
  {
    q: "What is the cheapest country to study abroad in?",
    a: "Germany is the most popular choice for affordable high-quality education — most public universities charge only a semester fee (€150–€350) regardless of nationality. France charges ~€2,770/year for non-EU Master's students at public universities. Norway and Finland also offer subsidized or low-fee higher education.",
  },
];

export default function StudyAbroadGuidePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Study Abroad — Complete Step-by-Step Guide",
    description:
      "Complete guide for international students on how to choose a destination, find programs, apply for scholarships, prepare application materials, get a student visa, and plan the timeline.",
    totalTime: "P18M",
    step: STEPS.map((step) => ({
      "@type": "HowToStep",
      name: step.title,
      text: step.description,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                Study Abroad Guide
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                The complete guide to studying abroad in 2025
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                From choosing a destination to getting your visa — a step-by-step guide for international students
                planning to study in Germany, Canada, the UK, Australia, the USA, or anywhere in between.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild className="h-12 px-8 font-semibold">
                  <Link href="/auth/signup">
                    Start your plan — free <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8">
                  <a href="#steps">Read the guide</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick nav */}
        <div className="border-y border-border/50 bg-muted/20 py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mr-2">
                Jump to:
              </span>
              {STEPS.map((step) => (
                <a
                  key={step.number}
                  href={`#step-${step.number}`}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  {step.number}. {step.title.split(" ").slice(0, 3).join(" ")}…
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Step-by-step guide */}
        <section id="steps" className="py-16 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <article
                    id={`step-${step.number}`}
                    key={step.number}
                    className="grid grid-cols-1 gap-8 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:grid-cols-2"
                  >
                    <div>
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <Icon className="size-6 text-primary" />
                        </div>
                        <span className="text-3xl font-black text-foreground/10 select-none">
                          {step.number}
                        </span>
                      </div>
                      <h2 className="mb-3 text-xl font-extrabold tracking-tight">{step.title}</h2>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                      <div className="mt-5">
                        <Link
                          href={step.link.href}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
                        >
                          {step.link.label} <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Key tips
                      </p>
                      <ul className="space-y-2.5">
                        {step.tips.map((tip) => (
                          <li key={tip} className="flex items-start gap-2.5 text-sm">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary/70" />
                            <span className="text-muted-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/50 bg-muted/20 py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-extrabold tracking-tight">
              Frequently asked questions
            </h2>
            <div className="space-y-5">
              {FAQ_ITEMS.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-3 font-bold">{faq.q}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related pages */}
        <section className="border-t border-border py-12 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-xl font-extrabold tracking-tight">Continue exploring</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  href: "/countries",
                  icon: Globe,
                  title: "Country guides",
                  desc: "Compare Germany, Canada, UK, Australia, and more — tuition, visa, scholarships, universities.",
                },
                {
                  href: "/scholarships",
                  icon: Award,
                  title: "Scholarship guide",
                  desc: "28+ verified scholarships — DAAD, Chevening, Fulbright, Australia Awards and more.",
                },
                {
                  href: "/visa",
                  icon: FileText,
                  title: "Visa guide",
                  desc: "Student visa requirements, documents, timelines, and post-study work rights by country.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <h3 className="mb-1.5 font-bold group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                      Explore <ChevronRight className="size-3.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-primary/10 bg-primary/5 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <GraduationCap className="mx-auto mb-4 size-10 text-primary" />
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Ready to start your study abroad journey?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
              EducAI matches you to the right programs, pre-screens your scholarship eligibility,
              and builds a month-by-month application timeline — all in one platform, for free.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="h-12 px-8 font-semibold">
                <Link href="/auth/signup">
                  Build my plan — free <ArrowRight className="ml-2 size-4" />
                </Link>
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
          <Link href="/study-abroad" className="text-sm font-medium text-primary">
            Study Abroad Guide
          </Link>
          <Link href="/countries" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Countries
          </Link>
          <Link href="/scholarships" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Scholarships
          </Link>
          <Link href="/visa" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/study-abroad" className="hover:text-foreground transition-colors">Study Abroad Guide</Link>
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
