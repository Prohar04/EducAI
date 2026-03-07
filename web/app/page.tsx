import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  Globe,
  Sparkles,
  Award,
  FileText,
  ArrowRight,
  GraduationCap,
  MapPin,
  BarChart3,
  CheckCircle2,
  BookOpen,
  Compass,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Logo component                                                     */
/* ------------------------------------------------------------------ */

// TODO: Replace with exported Figma logo in /public
function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <GraduationCap className="size-8 text-primary" />
      <span className="text-xl font-bold tracking-tight">
        Educ<span className="text-primary">AI</span>
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Logo />

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-8 md:flex" role="list">
          <li>
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </a>
          </li>
          <li>
            <a
              href="#destinations"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Destinations
            </a>
          </li>
        </ul>

        {/* Auth CTA */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Get Started Free</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

const DESTINATION_FLAGS = [
  { flag: "🇺🇸", label: "USA" },
  { flag: "🇬🇧", label: "UK" },
  { flag: "🇨🇦", label: "Canada" },
  { flag: "🇩🇪", label: "Germany" },
  { flag: "🇦🇺", label: "Australia" },
  { flag: "🇳🇱", label: "Netherlands" },
  { flag: "🇸🇬", label: "Singapore" },
];

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Decorative gradient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2"
      >
        <div className="h-[600px] w-[900px] rounded-full bg-primary/20 blur-[128px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 text-center sm:px-6 sm:pt-32 lg:px-8">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          AI Study-Abroad Advisor for International Students
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Find Your{" "}
          <span className="text-primary">Perfect University</span>
          {" "}Abroad — Powered by AI
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          EducAI matches your academic profile, budget, and goals to thousands
          of programs worldwide. Discover scholarships, compare universities,
          and build your application — all in one personalised workspace.
        </p>

        {/* Destination bubbles */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {DESTINATION_FLAGS.map(({ flag, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium shadow-sm"
            >
              <span>{flag}</span>
              {label}
            </span>
          ))}
          <span className="text-sm text-muted-foreground">+ more</span>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/auth/signup">
              Start Your Journey Free
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#features">See How It Works</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Features                                                           */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Search,
    title: "AI Programme Matching",
    description:
      "Enter your GPA, test scores, and goals — get ranked programme suggestions from universities worldwide, scored against your profile.",
  },
  {
    icon: Award,
    title: "Scholarship Finder",
    description:
      "Surface merit-based and need-based scholarships relevant to your nationality, field, and destination country.",
  },
  {
    icon: FileText,
    title: "Application Tracker",
    description:
      "Track every university, deadline, and document in one place. Get reminders before application windows close.",
  },
  {
    icon: Globe,
    title: "Country & Visa Guide",
    description:
      "Compare post-study work rights, PR pathways, cost of living, and visa processing times across destinations.",
  },
  {
    icon: BarChart3,
    title: "Profile Strength Score",
    description:
      "EducAI analyses your academic profile and suggests targeted improvements — extra courses, certifications, or test retakes.",
  },
  {
    icon: BookOpen,
    title: "Document Hub",
    description:
      "AI-assisted SOP drafting, LOR request templates, and CV checkers tailored for international graduate applications.",
  },
];

function Features() {
  return (
    <section
      id="features"
      className="border-t border-border/40 bg-muted/30 py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to{" "}
            <span className="text-primary">Study Abroad</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            From discovering your best-fit university to submitting your final application — EducAI guides every step.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="group rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How It Works                                                       */
/* ------------------------------------------------------------------ */

const steps = [
  {
    step: "01",
    icon: GraduationCap,
    title: "Build Your Profile",
    description:
      "Complete our 4-step onboarding — academic history, test scores, budget, and destination preferences.",
  },
  {
    step: "02",
    icon: Search,
    title: "Get AI Matches",
    description:
      "EducAI cross-references your profile against thousands of programmes and ranks them by your chance of admission.",
  },
  {
    step: "03",
    icon: Compass,
    title: "Explore & Compare",
    description:
      "Deep-dive into curricula, scholarships, tuition, and post-study work rights side-by-side.",
  },
  {
    step: "04",
    icon: FileText,
    title: "Apply with Confidence",
    description:
      "Track deadlines, draft documents, and submit stronger applications — all from your personalised workspace.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your Study-Abroad Journey{" "}
            <span className="text-primary">in 4 Steps</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            From first search to acceptance letter — EducAI is with you the whole way.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="relative text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <s.icon className="size-7 text-primary" />
              </div>
              <span className="text-5xl font-bold text-primary/20">
                {s.step}
              </span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Destinations Strip                                                 */
/* ------------------------------------------------------------------ */

const destinations = [
  { flag: "🇺🇸", name: "United States", programs: "15,000+ programmes" },
  { flag: "🇬🇧", name: "United Kingdom", programs: "8,000+ programmes" },
  { flag: "🇨🇦", name: "Canada", programs: "6,500+ programmes" },
  { flag: "🇩🇪", name: "Germany", programs: "5,000+ programmes" },
  { flag: "🇦🇺", name: "Australia", programs: "7,000+ programmes" },
  { flag: "🇳🇱", name: "Netherlands", programs: "2,000+ programmes" },
];

function Destinations() {
  return (
    <section id="destinations" className="border-t border-border/40 bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Top <span className="text-primary">Study Destinations</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Search across the world&apos;s leading higher-education systems in one place.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <div
              key={d.name}
              className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm"
            >
              <span className="text-4xl">{d.flag}</span>
              <div>
                <p className="font-semibold">{d.name}</p>
                <p className="text-sm text-muted-foreground">{d.programs}</p>
              </div>
              <MapPin className="ml-auto size-4 shrink-0 text-muted-foreground/40" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust / Stats Strip                                                */
/* ------------------------------------------------------------------ */

const stats = [
  { value: "40K+", label: "Programmes Indexed" },
  { value: "120+", label: "Countries Served" },
  { value: "12K+", label: "Scholarships Listed" },
  { value: "94%", label: "Match Accuracy" },
];

function Stats() {
  return (
    <section
      id="stats"
      className="border-y border-border/40 bg-primary/5 py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA Banner                                                         */
/* ------------------------------------------------------------------ */

function CtaBanner() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center shadow-lg sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to Find Your Dream University Abroad?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Join thousands of international students who discovered their best-fit
            programmes with EducAI. Free, forever.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="font-semibold text-primary"
              asChild
            >
              <Link href="/auth/signup">
                Start My Search Free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
          {/* Decorative circles */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-12 -top-12 size-64 rounded-full bg-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -right-16 size-80 rounded-full bg-white/10"
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Logo />

          <nav aria-label="Footer navigation">
            <ul
              className="flex gap-6 text-sm text-muted-foreground"
              role="list"
            >
              <li>
                <a
                  href="#features"
                  className="transition-colors hover:text-foreground"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="transition-colors hover:text-foreground"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#destinations"
                  className="transition-colors hover:text-foreground"
                >
                  Destinations
                </a>
              </li>
              <li>
                <Link
                  href="/auth/signin"
                  className="transition-colors hover:text-foreground"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} EducAI. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="size-3.5 text-primary" />
            <span>AI-powered study-abroad advisor for every student</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Destinations />
        <Stats />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
