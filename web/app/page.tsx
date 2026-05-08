import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import {
  GraduationCap, ArrowRight, Sparkles, BookOpen, Users, ExternalLink,
  Globe, CalendarDays, Target, FileText, Award, CheckCircle2, ChevronRight,
  MessageSquare, Zap,
} from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { Reveal } from "@/components/motion/Reveal";
import TrendingFeed from "@/components/home/TrendingFeed";
import QuoteStrip from "@/components/home/QuoteStrip";
import HowItWorks from "@/components/home/HowItWorks";
import { fetchEducationPulse } from "@/lib/data/fetchEducationPulse";
import quotesData from "@/lib/data/quotes.json";
import { GradientText } from "@/components/ui/gradient-text";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GlassCard } from "@/components/ui/glass-card";
import { RevealAnimation } from "@/components/ui/reveal-animation";

export const metadata: Metadata = {
  title: "EducAI — AI-Powered Study Abroad Platform",
  description:
    "Match to the right university programs, discover scholarships you qualify for, get visa guidance, and build a step-by-step application plan — all powered by real data and AI.",
  alternates: { canonical: "https://educai-web.vercel.app" },
  openGraph: {
    url: "https://educai-web.vercel.app",
    title: "EducAI — AI-Powered Study Abroad Platform",
    description:
      "Match to the right university programs, discover scholarships you qualify for, get visa guidance, and build a step-by-step application plan — all powered by real data and AI.",
  },
};

export const revalidate = 86_400;

function getQuoteForToday(): string {
  const dateKey = new Date().toISOString().slice(0, 10);
  const idx = dateKey.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % (quotesData as string[]).length;
  return (quotesData as string[])[idx];
}

function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`} aria-label="EducAI home">
      <GraduationCap className="size-6 text-primary" aria-hidden="true" />
      <span className="text-base font-bold tracking-tight">
        Educ<GradientText>AI</GradientText>
      </span>
    </Link>
  );
}

async function PublicNavbar() {
  const session = await getSession().catch(() => null);
  const isLoggedIn = !!session;
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0a0a0f]/85 backdrop-blur-xl backdrop-saturate-150">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Logo />
        <ul className="hidden items-center gap-1 md:flex" role="list">
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
            { label: "Modules", href: "#modules" },
          ].map((item) => (
            <li key={item.label}>
              <a href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Link href="/app" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
              Dashboard <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link href="/auth/signin" className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link href="/auth/signup" className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

async function HeroSection() {
  const session = await getSession().catch(() => null);
  const isLoggedIn = !!session;
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center" aria-label="Hero">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[100px]" />
        <div className="absolute -left-20 bottom-0 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn delay={0}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.08] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              Live · Real university data, updated daily
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="text-[clamp(2.4rem,5.5vw,4.5rem)] font-bold tracking-[-0.03em] leading-[1.04]">
              Study abroad,{" "}
              <GradientText from="#6366f1" to="#8b5cf6">without the chaos</GradientText>
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-[1.65] text-muted-foreground sm:text-lg">
              EducAI handles program matching, scholarships, documents, visas, and job search — so you can focus on getting in.
            </p>
          </FadeIn>
          <FadeIn delay={0.24}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={isLoggedIn ? "/app/programs" : "/auth/signup"} className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-7 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                Start for free <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-7 text-base font-medium text-foreground hover:bg-white/[0.06] transition-colors"
              >
                See how it works
              </a>
            </div>
          </FadeIn>
          <FadeIn delay={0.32}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {["No credit card required", "Free to start", "Real program data"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-400/70" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Dashboard preview mockup */}
        <FadeIn delay={0.4}>
          <div className="mx-auto mt-20 max-w-5xl">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111118] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6),0_0_80px_rgba(99,102,241,0.06)]">
              {/* Window chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/50" />
                </div>
                <div className="ml-3 flex-1 rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground/60">
                  educai.app/app/dashboard
                </div>
              </div>
              <div className="grid grid-cols-12 gap-3 p-5 sm:p-7">
                <div className="col-span-12 sm:col-span-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Profile Snapshot</p>
                  <div className="space-y-2">
                    {[["Stage","Final Year BSc"],["Target","Master&apos;s"],["Major","Computer Science"],["Countries","Germany, UK"],["GPA","3.8 / 4.0"]].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-center text-[11px] font-semibold text-primary">Profile 90% Complete</div>
                </div>
                <div className="col-span-12 sm:col-span-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    <Sparkles className="mr-1 inline size-3 text-primary" aria-hidden="true" />AI Matched Programs
                  </p>
                  <div className="space-y-2">
                    {[["MSc Computer Science","TU Munich","Germany",94],["MSc AI & ML","University of Edinburgh","UK",88],["MSc Data Science","KIT Karlsruhe","Germany",82]].map(([prog,univ,country,score]) => (
                      <div key={prog as string} className="flex items-center gap-3 rounded-lg border border-white/[0.06] px-3 py-2 text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-foreground">{prog as string}</p>
                          <p className="text-muted-foreground">{univ as string} · {country as string}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${(score as number) >= 90 ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                          {score as number}% fit
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

const STATS = [
  { value: 150, suffix: "+", label: "Programs analyzed" },
  { value: 15, suffix: "+", label: "Countries covered" },
  { value: 28, suffix: "+", label: "Verified scholarships" },
  { value: 100, suffix: "%", label: "Free to start" },
] as const;

function StatsStrip() {
  return (
    <div className="border-y border-white/[0.06] bg-white/[0.01]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col items-center justify-center py-10 text-center ${i < STATS.length - 1 ? "border-r border-white/[0.06]" : ""}`}
          >
            <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              <GradientText>{s.value}{s.suffix}</GradientText>
            </span>
            <span className="mt-1.5 text-xs font-medium text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: Globe, title: "Global program database", description: "Real-time data from universities across Germany, UK, USA, Canada, Australia, and more.", badge: "Live data" },
  { icon: Sparkles, title: "Profile-matched recommendations", description: "Programs scored against your GPA, language scores, budget, and career goals — with reasoning.", badge: "AI reasoning" },
  { icon: Award, title: "Scholarship intelligence", description: "28+ verified scholarships with deadline tracking, eligibility pre-screening, and probability scoring.", badge: "Verified data" },
  { icon: Target, title: "Application strategy", description: "AI-generated admission chance band, risk assessment, and concrete action plan.", badge: "AI + profile" },
  { icon: CalendarDays, title: "Timeline planner", description: "Month-by-month roadmap from saved program deadlines and country-specific visa milestones.", badge: "Personalized" },
  { icon: MessageSquare, title: "AI advisor chatbot", description: "Context-aware assistant that knows your saved programs, scholarships, and deadlines.", badge: "Profile-aware" },
] as const;

function FeaturesSection() {
  return (
    <section id="features" className="py-28 bg-background" aria-labelledby="features-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-16 text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">Platform</p>
            <h2 id="features-heading" className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
              Everything you need, <GradientText>nothing you don&apos;t</GradientText>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              EducAI combines live program data, AI matching, and scholarship intelligence into one coherent workflow.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <RevealAnimation key={f.title} variant="fadeUp" delay={i * 0.06}>
                <GlassCard glow className="p-6 h-full">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12">
                      <Icon className="size-[18px] text-primary" aria-hidden="true" />
                    </div>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-muted-foreground">{f.badge}</span>
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </GlassCard>
              </RevealAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const MODULES = [
  { number: "01", name: "Program Finder", description: "AI-matched programs from real scraped data. Every result shows why it fits your profile.", features: ["Profile-based scoring", "GPA & test score fit", "Budget & country filters", "Admission requirement analysis"], href: "/app/programs", icon: BookOpen },
  { number: "02", name: "Scholarship Hunter", description: "28+ verified scholarships with eligibility scoring, deadline tracking, and funding probability estimates.", features: ["Eligibility pre-screening", "Deadline alerts via email", "Funding probability band", "Country + field filters"], href: "/app/scholarships", icon: Award },
  { number: "03", name: "Application Tools", description: "AI-generated SOP, ATS-ready CV, and professor outreach — tailored to your academic profile.", features: ["SOP Builder (3 tones)", "CV Builder (3 styles)", "Professor Finder + email templates", "Application timeline planner"], href: "/app/sop", icon: FileText },
  { number: "04", name: "Strategy & Guidance", description: "Admission chance band, risk factors, and step-by-step action plan with honest AI reasoning.", features: ["Admission chance band", "Risk assessment", "Action plan with timeframes", "AI advisor chatbot"], href: "/app/strategy", icon: Target },
] as const;

function ModulesSection() {
  return (
    <section id="modules" className="py-28 bg-white/[0.01]" aria-labelledby="modules-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-16 text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">Modules</p>
            <h2 id="modules-heading" className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
              Four modules. <GradientText>One complete journey.</GradientText>
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <RevealAnimation key={mod.number} variant="fadeUp" delay={i * 0.08}>
                <GlassCard glow className="p-7 h-full flex flex-col">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12">
                        <Icon className="size-6 text-primary" aria-hidden="true" />
                      </div>
                      <span className="text-3xl font-black text-foreground/[0.06] select-none">{mod.number}</span>
                    </div>
                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">● Live</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{mod.name}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground flex-1">{mod.description}</p>
                  <ul className="mb-6 space-y-2">
                    {mod.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="size-3.5 shrink-0 text-primary/50" aria-hidden="true" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link href={mod.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5">
                    Explore module <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </GlassCard>
              </RevealAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const TRUST_POINTS = [
  { icon: CheckCircle2, title: "Real data, clearly labeled", desc: "Every program and scholarship shows its source URL, provider, and verification date." },
  { icon: Sparkles, title: "AI reasoning, not magic scores", desc: "Match scores, eligibility checks, and probability bands come with explanations." },
  { icon: Users, title: "Profile-grounded guidance", desc: "Every recommendation is grounded in your actual GPA, test scores, budget, and destinations." },
] as const;

function TrustSection() {
  return (
    <section className="py-24" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <GlassCard className="p-8 sm:p-12">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">Trust</p>
              <h2 id="trust-heading" className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.02em]">
                Transparent, trustworthy, <GradientText>data-grounded</GradientText>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {TRUST_POINTS.map((point, i) => {
              const Icon = point.icon;
              return (
                <RevealAnimation key={point.title} variant="scale" delay={i * 0.08}>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/8">
                      <Icon className="size-5 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 text-sm font-semibold">{point.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{point.desc}</p>
                  </div>
                </RevealAnimation>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

async function CTASection() {
  const session = await getSession().catch(() => null);
  const isLoggedIn = !!session;
  return (
    <section className="relative overflow-hidden py-28 border-y border-white/[0.06]" aria-labelledby="cta-heading">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />
      </div>
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <GraduationCap className="mx-auto mb-4 size-12 text-primary" aria-hidden="true" />
          <h2 id="cta-heading" className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
            Your dream university is <GradientText>closer than you think</GradientText>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Build your profile in under three minutes and get AI-matched program recommendations, scholarship options, and a personalized application timeline — all for free.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={isLoggedIn ? "/app" : "/auth/signup"} className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
              {isLoggedIn ? "Go to dashboard" : "Start for free — no credit card"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-background py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2">
            <Logo className="mb-4" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI-powered study abroad platform. Find the right programs, discover scholarships,
              and plan your application — grounded in real data.
            </p>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Resources</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[["Study Abroad Guide", "/study-abroad"], ["Country Guides", "/countries"], ["Scholarships", "/scholarships"], ["Visa Guide", "/visa"]].map(([label, href]) => (
                <li key={label as string}>
                  <Link href={href as string} className="transition-colors hover:text-foreground">{label as string}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Links</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
                { label: "Contact", href: "mailto:hello@educai.app" },
                { label: "GitHub", href: "https://github.com/Prohar04/EducAI", external: true },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
                    {item.label}{item.external && <ExternalLink className="size-3" aria-hidden="true" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/[0.06] pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} EducAI. All rights reserved.
          {" · "}Data sourced from official university websites and public scholarship databases.
        </div>
      </div>
    </footer>
  );
}

const EXPLORE_LINKS = [
  { href: "/study-abroad", icon: BookOpen, title: "Study Abroad Guide 2025", desc: "Complete step-by-step guide: choosing a country, finding programs, scholarships, visa, and timeline." },
  { href: "/countries", icon: Globe, title: "Country Guides", desc: "Compare Germany, Canada, UK, Australia, USA and more — tuition, visa, scholarships, top universities." },
  { href: "/scholarships", icon: Award, title: "Scholarship Directory", desc: "28+ verified scholarships — DAAD, Chevening, Fulbright, Australia Awards, Vanier, and more." },
  { href: "/visa", icon: FileText, title: "Visa Guide", desc: "Student visa requirements, documents, timelines, and post-study work rights for top destinations." },
] as const;

function ExploreSection() {
  return (
    <section className="py-24 border-t border-white/[0.06]" aria-labelledby="explore-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Resources</p>
            <h2 id="explore-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Free guides for international students
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EXPLORE_LINKS.map((item, i) => {
            const Icon = item.icon;
            return (
              <RevealAnimation key={item.href} variant="fadeUp" delay={i * 0.06}>
                <Link href={item.href} className="group flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 h-full hover:border-primary/25 hover:bg-white/[0.04] transition-all duration-200">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12">
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                    Explore <ChevronRight className="size-3.5" aria-hidden="true" />
                  </div>
                </Link>
              </RevealAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}

async function TrendingFeedSection() {
  const items = await fetchEducationPulse();
  return <TrendingFeed initialItems={items} />;
}

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org", "@type": "Organization",
  name: "EducAI", url: "https://educai-web.vercel.app",
  logo: "https://educai-web.vercel.app/og-image.png",
  description: "AI-powered study abroad platform that helps international students find programs, discover scholarships, plan visa timelines, and build their application strategy.",
  contactPoint: { "@type": "ContactPoint", email: "hello@educai.app", contactType: "customer support" },
  sameAs: ["https://github.com/Prohar04/EducAI"],
};
const WEBSITE_SCHEMA = {
  "@context": "https://schema.org", "@type": "WebSite",
  name: "EducAI", url: "https://educai-web.vercel.app",
  description: "Find the right university program, discover scholarships, and build your study abroad application strategy — powered by real data and AI.",
  potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: "https://educai-web.vercel.app/auth/signup" }, "query-input": "required name=search_term_string" },
};
const SOFTWARE_APP_SCHEMA = {
  "@context": "https://schema.org", "@type": "SoftwareApplication",
  name: "EducAI", applicationCategory: "EducationApplication", operatingSystem: "Web",
  url: "https://educai-web.vercel.app",
  description: "AI-powered study abroad platform for international students.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function HomePage() {
  const dailyQuote = getQuoteForToday();
  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_APP_SCHEMA) }} />
      <PublicNavbar />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <StatsStrip />
        <FeaturesSection />
        <HowItWorks />
        <ModulesSection />
        <TrustSection />
        <ExploreSection />
        <TrendingFeedSection />
        <QuoteStrip quote={dailyQuote} />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
