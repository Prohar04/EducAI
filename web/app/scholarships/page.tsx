import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  Award,
  CheckCircle2,
  CalendarDays,
  Target,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Study Abroad Scholarships — Find Funding for International Students",
  description:
    "Discover 28+ verified scholarships for international students: DAAD, Chevening, Fulbright, Australia Awards, Vanier, Eiffel, and more. Pre-screen your eligibility and track deadlines with EducAI.",
  alternates: { canonical: "https://educai-web.vercel.app/scholarships" },
  openGraph: {
    title: "Study Abroad Scholarships — Find Funding for International Students",
    description:
      "Discover 28+ verified scholarships for international students: DAAD, Chevening, Fulbright, Australia Awards, Vanier, Eiffel, and more. Pre-screen your eligibility and track deadlines with EducAI.",
    url: "https://educai-web.vercel.app/scholarships",
  },
};

const SCHOLARSHIPS = [
  {
    name: "DAAD Scholarship",
    country: "Germany 🇩🇪",
    amount: "€850–€1,200/month",
    level: "Master's / PhD",
    type: "Full Funding",
    deadline: "Varies (Oct–Jan)",
    description:
      "Germany's largest scholarship organization. Funded by the German government. Covers tuition, living costs, health insurance, and travel. Available for over 60,000 students annually.",
  },
  {
    name: "Chevening Scholarship",
    country: "United Kingdom 🇬🇧",
    amount: "Full funding",
    level: "Master's",
    type: "Full Funding",
    deadline: "November annually",
    description:
      "UK government's flagship international scholarship. Covers full tuition, living stipend, return flights, and visa costs. Highly competitive — awarded based on leadership potential.",
  },
  {
    name: "Fulbright Program",
    country: "United States 🇺🇸",
    amount: "Full funding",
    level: "Master's / PhD",
    type: "Full Funding",
    deadline: "Varies by country",
    description:
      "US government scholarship for international students pursuing degrees in the USA. Covers tuition, fees, living expenses, health insurance, and round-trip travel. Country-specific programs vary.",
  },
  {
    name: "Australia Awards",
    country: "Australia 🇦🇺",
    amount: "Full funding",
    level: "Master's / PhD",
    type: "Full Funding",
    deadline: "April–May annually",
    description:
      "Australian government scholarships primarily for citizens of developing countries in Asia-Pacific. Covers tuition, living stipend, airfare, and health insurance. Strong development focus.",
  },
  {
    name: "Vanier Canada Graduate Scholarship",
    country: "Canada 🇨🇦",
    amount: "CAD $50,000/year",
    level: "PhD",
    type: "Partial Funding",
    deadline: "November annually",
    description:
      "Canada's most prestigious graduate scholarship. $50,000/year for up to 3 years for doctoral students. Awarded based on academic excellence, leadership, and research potential.",
  },
  {
    name: "Eiffel Excellence Scholarship",
    country: "France 🇫🇷",
    amount: "€1,181–€1,400/month",
    level: "Master's / PhD",
    type: "Partial Funding",
    deadline: "January annually",
    description:
      "French government scholarship for exceptional international students. Monthly stipend plus support for culture and sports activities. Administered by Campus France.",
  },
  {
    name: "Swedish Institute Scholarship",
    country: "Sweden 🇸🇪",
    amount: "SEK 11,000/month + tuition",
    level: "Master's",
    type: "Full Funding",
    deadline: "February annually",
    description:
      "Full funding for outstanding students from select countries. Covers tuition fees, monthly living stipend, travel grant, and insurance. Available for English-taught Master's programs.",
  },
  {
    name: "Gates-Cambridge Scholarship",
    country: "United Kingdom 🇬🇧",
    amount: "Full funding",
    level: "PhD / MPhil",
    type: "Full Funding",
    deadline: "October–December",
    description:
      "Highly prestigious full scholarship for outstanding postgraduate students at the University of Cambridge. Covers full tuition, living costs, and research expenses. Extremely competitive.",
  },
  {
    name: "Holland Scholarship",
    country: "Netherlands 🇳🇱",
    amount: "€5,000 (one-time)",
    level: "Bachelor's / Master's",
    type: "Partial Funding",
    deadline: "February–May",
    description:
      "One-time grant for international students from outside the EU/EEA studying at Dutch universities. Available for first year of Bachelor's or Master's programs. Funded by Dutch Ministry.",
  },
  {
    name: "Government of Ireland Scholarship",
    country: "Ireland 🇮🇪",
    amount: "€10,000/year",
    level: "Master's / PhD",
    type: "Partial Funding",
    deadline: "April annually",
    description:
      "Irish government scholarship for outstanding international postgraduate students. Covers tuition fees up to €10,000/year for EU/non-EU students. Administered through Irish universities.",
  },
];

const FAQ_ITEMS = [
  {
    q: "How do I know which scholarships I'm eligible for?",
    a: "EducAI pre-screens your eligibility for 28+ verified scholarships based on your nationality, GPA, field of study, target country, and degree level. When you build your profile, you'll see a personalized eligibility score for each scholarship.",
  },
  {
    q: "What is the difference between full funding and partial funding?",
    a: "Full funding scholarships cover all major costs: tuition, living expenses, travel, and health insurance. Partial funding scholarships cover some costs — often just tuition or a monthly stipend — and you'll need to fund the rest through savings, family support, or part-time work.",
  },
  {
    q: "When should I start applying for scholarships?",
    a: "Most scholarship applications open 9–12 months before the program start date. For September intake programs, major scholarships like Chevening and DAAD typically open in October and close in November–January. Start your scholarship research at least 12 months in advance.",
  },
  {
    q: "Can I apply for multiple scholarships at once?",
    a: "Yes, and you should. Scholarship success rates are low — top scholarships like Gates-Cambridge and Fulbright have acceptance rates below 5%. Applying to 3–5 scholarships simultaneously maximizes your funding options. EducAI helps you track multiple applications and deadlines.",
  },
  {
    q: "Do I need a job offer to apply for scholarships?",
    a: "No — scholarships are for students, not employees. You apply for scholarships before or alongside your university application. Some scholarships require university admission first; others run concurrent processes.",
  },
];

export default function PublicScholarshipsPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top Study Abroad Scholarships for International Students",
    description:
      "Verified scholarships for international students including DAAD, Chevening, Fulbright, Australia Awards, and more",
    numberOfItems: SCHOLARSHIPS.length,
    itemListElement: SCHOLARSHIPS.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      description: s.description,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                Scholarships
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Study abroad scholarships for international students
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Explore 28+ verified funding opportunities — from fully funded government scholarships to
                university merit awards. EducAI pre-screens your eligibility and tracks every deadline
                automatically.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild className="h-12 px-8 font-semibold">
                  <Link href="/auth/signup">
                    Check my eligibility <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8">
                  <a href="#scholarships">Browse scholarships</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <div className="border-y border-border/50 bg-muted/30">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
            {[
              { value: "28+", label: "Verified scholarships" },
              { value: "10+", label: "Countries covered" },
              { value: "AI", label: "Eligibility pre-screening" },
              { value: "Free", label: "Deadline tracking" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center py-7 text-center">
                <span className="text-2xl font-extrabold tracking-tight text-primary">{s.value}</span>
                <span className="mt-1 text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scholarship cards */}
        <section id="scholarships" className="py-20 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Top scholarships for international students
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SCHOLARSHIPS.map((s) => (
                <article
                  key={s.name}
                  className="flex flex-col rounded-2xl border border-border bg-card p-6"
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Award className="size-5 text-primary" />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        s.type === "Full Funding"
                          ? "border border-green-500/30 bg-green-500/10 text-green-500"
                          : "border border-amber-500/30 bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {s.type}
                    </span>
                  </div>
                  <h3 className="mb-1 font-bold text-foreground">{s.name}</h3>
                  <p className="mb-1 text-xs text-muted-foreground">{s.country}</p>
                  <p className="mb-3 text-sm font-semibold text-primary">{s.amount}</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                      {s.level}
                    </span>
                    <span className="flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                      <CalendarDays className="size-3" /> {s.deadline}
                    </span>
                  </div>
                  <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How EducAI helps */}
        <section className="border-t border-border/50 bg-muted/20 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                How EducAI helps you win scholarships
              </h2>
              <p className="text-base text-muted-foreground">
                Finding scholarships is hard. Checking eligibility is time-consuming. EducAI automates both.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                {
                  icon: Target,
                  title: "AI eligibility screening",
                  desc: "Input your profile once. EducAI scores your eligibility for every tracked scholarship based on GPA, nationality, field, and degree level.",
                },
                {
                  icon: CalendarDays,
                  title: "Deadline tracking",
                  desc: "Never miss a scholarship deadline. EducAI tracks opening and closing dates and sends alerts before deadlines arrive.",
                },
                {
                  icon: CheckCircle2,
                  title: "Funding probability band",
                  desc: "See a realistic probability range for each scholarship — based on your profile strength relative to typical awardee profiles.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <h3 className="mb-2 font-bold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-background">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-extrabold tracking-tight">
              Scholarship FAQs
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

        {/* Explore by country */}
        <section className="border-t border-border/50 bg-muted/20 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-xl font-extrabold tracking-tight">
              Explore scholarships by country
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                { name: "Germany", slug: "germany", flag: "🇩🇪" },
                { name: "Canada", slug: "canada", flag: "🇨🇦" },
                { name: "United Kingdom", slug: "united-kingdom", flag: "🇬🇧" },
                { name: "Australia", slug: "australia", flag: "🇦🇺" },
                { name: "United States", slug: "united-states", flag: "🇺🇸" },
                { name: "France", slug: "france", flag: "🇫🇷" },
                { name: "Sweden", slug: "sweden", flag: "🇸🇪" },
                { name: "Netherlands", slug: "netherlands", flag: "🇳🇱" },
              ].map((c) => (
                <Link
                  key={c.slug}
                  href={`/countries/${c.slug}`}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  <span>{c.flag}</span>
                  {c.name}
                  <ChevronRight className="size-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-primary/10 bg-primary/5 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <GraduationCap className="mx-auto mb-4 size-10 text-primary" />
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Find scholarships you actually qualify for
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
              Build your profile in 3 minutes and get an instant eligibility pre-screen for 28+
              verified scholarships — matched to your nationality, GPA, and target degree.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="h-12 px-8 font-semibold">
                <Link href="/auth/signup">
                  Check my eligibility — free <ArrowRight className="ml-2 size-4" />
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
          <Link href="/countries" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Countries
          </Link>
          <Link href="/scholarships" className="text-sm font-medium text-primary">
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
