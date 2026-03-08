import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { GraduationCap, ArrowRight, Globe, Sparkles, BookOpen, Users, ExternalLink } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { Reveal } from "@/components/motion/Reveal";
import TrendingFeed from "@/components/home/TrendingFeed";
import RoadmapCards from "@/components/home/RoadmapCards";
import HowItWorks from "@/components/home/HowItWorks";
import QuoteStrip from "@/components/home/QuoteStrip";
import HeroIllustration from "@/components/home/HeroIllustration";
import { fetchEducationPulse } from "@/lib/data/fetchEducationPulse";
import quotesData from "@/lib/data/quotes.json";

// Revalidate the page every 24 hours so quote and feed both update daily
export const revalidate = 86_400;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getQuoteForToday(): string {
  // Use the calendar date string as a stable, day-scoped seed
  const dateKey = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const idx =
    dateKey.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    (quotesData as string[]).length;
  return (quotesData as string[])[idx];
}

// ─────────────────────────────────────────────
// Logo
// ─────────────────────────────────────────────

function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`} aria-label="EducAI home">
      <GraduationCap className="size-7 text-primary" />
      <span className="text-lg font-bold tracking-tight">
        Educ<span className="text-primary">AI</span>
      </span>
    </Link>
  );
}

// ─────────────────────────────────────────────
// Public Navbar
// ─────────────────────────────────────────────

async function PublicNavbar() {
  const session = await getSession().catch(() => null);
  const isLoggedIn = !!session;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Logo />
        <ul className="hidden items-center gap-7 md:flex" role="list">
          {[
            { label: "Home", href: "/" },
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
            { label: "Modules", href: "#roadmap" },
          ].map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:text-primary focus-visible:outline-none"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Button size="sm" asChild>
              <Link href="/app">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

// ─────────────────────────────────────────────
// Stats strip
// ─────────────────────────────────────────────

const STATS = [
  { value: "300+", label: "Universities tracked" },
  { value: "40+", label: "Countries covered" },
  { value: "12k+", label: "Scholarships indexed" },
  { value: "94%", label: "Avg. match accuracy" },
] as const;

function StatsStrip() {
  return (
    <div className="border-y border-border/50 bg-muted/20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center justify-center py-6 text-center">
            <span className="text-2xl font-bold text-primary">{s.value}</span>
            <span className="mt-1 text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Features grid
// ─────────────────────────────────────────────

const FEATURES = [
  {
    icon: "Globe",
    title: "Global coverage",
    description:
      "Real-time data from universities across the UK, USA, Canada, Germany, Australia, and more.",
  },
  {
    icon: "Sparkles",
    title: "AI-powered matching",
    description:
      "Programs are scored against your exact profile — GPA, budget, language, and career goals.",
  },
  {
    icon: "BookOpen",
    title: "Scholarship discovery",
    description:
      "Country-specific scholarships with deadline tracking and eligibility pre-screening.",
  },
  {
    icon: "Users",
    title: "Community insights",
    description:
      "See where students with similar profiles applied and what worked for them.",
  },
] as const;

type FeatureIconName = "Globe" | "Sparkles" | "BookOpen" | "Users";

const ICON_MAP: Record<FeatureIconName, React.ComponentType<{ className?: string }>> = {
  Globe,
  Sparkles,
  BookOpen,
  Users,
};

function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Platform</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Everything you need to study abroad
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              EducAI combines live university data, AI matching, and scholarship intelligence into one coherent workflow.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => {
            const Icon = ICON_MAP[f.icon as FeatureIconName];
            return (
              <Reveal key={f.title} delay={i * 0.1}>
                <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all h-full">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <Logo />
          <nav aria-label="Footer links">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {[
                { label: "About", href: "#" },
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
                { label: "Contact", href: "mailto:hello@educai.app" },
                {
                  label: "GitHub",
                  href: "https://github.com/Prohar04/EducAI",
                  external: true,
                },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="hover:text-foreground transition-colors focus-visible:text-primary focus-visible:outline-none inline-flex items-center gap-1"
                  >
                    {item.label}
                    {item.external && <ExternalLink className="size-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} EducAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────

async function HeroSection() {
  const session = await getSession().catch(() => null);
  const isLoggedIn = !!session;

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <FadeIn delay={0}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Live &middot; Program data updated daily
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
                Smart Decisions.{" "}
                <span className="text-primary">Global</span>{" "}
                Destination.
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground leading-relaxed">
                Find programs, scholarships, and a clear application plan &mdash; powered by data and AI.
                Built for ambitious students navigating the world&apos;s best universities.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" asChild className="gap-2 font-semibold">
                  <Link href={isLoggedIn ? "/app/programs" : "/auth/signin"}>
                    Explore Programs
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>
            </FadeIn>
          </div>
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

async function TrendingFeedSection() {
  const items = await fetchEducationPulse();
  return <TrendingFeed initialItems={items} />;
}

export default function HomePage() {
  const dailyQuote = getQuoteForToday();
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <HeroSection />
        <StatsStrip />
        <TrendingFeedSection />
        <QuoteStrip quote={dailyQuote} />
        <FeaturesSection />
        <HowItWorks />
        <RoadmapCards />
      </main>
      <Footer />
    </div>
  );
}
