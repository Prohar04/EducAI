import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Sparkles, Zap, ArrowRight } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { GradientText } from "@/components/ui/gradient-text";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "EducAI is free to use. All core features — program matching, scholarship discovery, AI strategy, CV builder, and more — are available at no cost.",
};

const FREE_FEATURES = [
  "Browse 30,000+ university programs worldwide",
  "AI-powered program matching & ranking",
  "Scholarship discovery & deadline alerts",
  "AI application strategy report",
  "SOP & CV builder with AI assistance",
  "Gap Fix — identify and close your profile gaps",
  "Timeline & milestone planner",
  "Job Finder for international students",
  "Professor discovery tool",
  "Immigration guidance by country",
  "Unlimited saved programs",
  "AI chatbot assistant",
];

const COMING_SOON = [
  "Priority AI processing for faster results",
  "Unlimited AI strategy revisions",
  "Personal statement review by AI coach",
  "Application tracker with team collaboration",
  "Direct university contact tools",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav spacer */}
      <div className="h-16" />

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="size-3.5" />
            Simple pricing
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <GradientText>Free forever.</GradientText> <br className="sm:hidden" />
            <span className="text-foreground">No credit card required.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Every core feature of EducAI is free. We believe access to
            international education guidance should not depend on your budget.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Free tier */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary bg-card p-8">
            <div className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Current plan
            </div>
            <div className="mb-2 flex items-end gap-2">
              <span className="text-5xl font-extrabold">$0</span>
              <span className="mb-1.5 text-muted-foreground">/ forever</span>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Everything you need to plan your international education journey.
            </p>
            <Link
              href="/auth/signup"
              className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started free <ArrowRight className="size-4" />
            </Link>
            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro tier — coming soon */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 opacity-75">
            <div className="absolute right-4 top-4 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              Coming soon
            </div>
            <div className="mb-2 flex items-end gap-2">
              <span className="text-5xl font-extrabold">Pro</span>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Advanced features for serious applicants who want an edge.
            </p>
            <button
              disabled
              className="mb-8 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-border bg-muted px-6 py-3 text-sm font-semibold text-muted-foreground"
            >
              <Zap className="size-4" /> Notify me when available
            </button>
            <ul className="space-y-3">
              <li className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Everything in Free, plus:
              </li>
              {COMING_SOON.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Zap className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Frequently asked questions
          </h2>
          <div className="space-y-5">
            {[
              {
                q: "Is EducAI really free?",
                a: "Yes. All core features are free with no time limit. We may introduce optional Pro features in the future, but the free tier will always remain fully functional.",
              },
              {
                q: "Do I need a credit card to sign up?",
                a: "No. You can create an account and start using EducAI immediately — no payment information required.",
              },
              {
                q: "How does EducAI make money?",
                a: "We are currently in growth phase and focused on building the best possible product. We plan to introduce optional Pro features for power users in the future.",
              },
              {
                q: "What data do you store about me?",
                a: "Only the profile information you provide (GPA, test scores, preferences) to power the AI features. You can export or delete your data at any time from your account settings.",
              },
              {
                q: "Can I delete my account?",
                a: "Yes. Go to Profile → Settings and choose 'Delete Account'. All your data is permanently removed within 30 days.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-border bg-card p-5">
                <p className="font-semibold">{q}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="mt-2 text-muted-foreground">
            Join thousands of international students planning their studies with EducAI.
          </p>
          <Link
            href="/auth/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create free account <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
