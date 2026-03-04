import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Brain,
  Sparkles,
  Target,
  Users,
  ArrowRight,
  GraduationCap,
  Lightbulb,
  BarChart3,
  CheckCircle2,
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
              href="#stats"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Why EducAI
            </a>
          </li>
        </ul>

        {/* Auth CTA */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Sign up</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

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
          AI-Powered Learning Platform
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Learn Smarter with{" "}
          <span className="text-primary">Artificial Intelligence</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          EducAI personalizes your study experience using cutting-edge AI. Get
          tailored content, instant feedback, and insights that help you master
          any subject faster.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/auth/signup">
              Get Started Free
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#features">See Features</a>
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
    icon: Brain,
    title: "AI-Powered Tutoring",
    description:
      "Ask questions in natural language and get detailed, context-aware explanations powered by advanced AI models.",
  },
  {
    icon: Target,
    title: "Personalized Learning Paths",
    description:
      "EducAI adapts to your skill level and learning pace, creating a unique roadmap tailored just for you.",
  },
  {
    icon: BookOpen,
    title: "Smart Study Materials",
    description:
      "Automatically generate flashcards, summaries, and quizzes from any content to reinforce your knowledge.",
  },
  {
    icon: Lightbulb,
    title: "Instant Feedback",
    description:
      "Submit answers and get immediate, constructive feedback with step-by-step reasoning to deepen understanding.",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Track your growth over time with intuitive charts and insights so you know exactly where to focus next.",
  },
  {
    icon: Users,
    title: "Collaborative Learning",
    description:
      "Study together in shared sessions, compare notes, and benefit from peer explanations enhanced by AI.",
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
            <span className="text-primary">Excel</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Powerful AI features designed to transform the way you learn.
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
    title: "Create Your Account",
    description:
      "Sign up in seconds \u2014 no credit card required. Start your AI learning journey instantly.",
  },
  {
    step: "02",
    title: "Set Your Goals",
    description:
      "Tell EducAI what you want to learn, and we\u2019ll build a personalized study plan for you.",
  },
  {
    step: "03",
    title: "Learn & Practice",
    description:
      "Engage with AI-generated lessons, quizzes, and explanations crafted to match your level.",
  },
  {
    step: "04",
    title: "Track & Improve",
    description:
      "Monitor progress with analytics, identify weak areas, and keep leveling up your knowledge.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How <span className="text-primary">EducAI</span> Works
          </h2>
          <p className="mt-4 text-muted-foreground">
            Four simple steps to unlock your full learning potential.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="relative text-center">
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
/*  Trust / Stats Strip                                                */
/* ------------------------------------------------------------------ */

const stats = [
  { value: "50K+", label: "Active Learners" },
  { value: "1M+", label: "Questions Answered" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "200+", label: "Subjects Covered" },
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
            Ready to Transform Your Learning?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Join thousands of students who are already learning smarter with
            EducAI. No credit card needed.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="font-semibold text-primary"
              asChild
            >
              <Link href="/auth/signup">
                Create Free Account
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
            <span>AI-powered education for everyone</span>
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
        <Stats />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
