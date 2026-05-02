import type { Metadata } from "next";
import React, { PropsWithChildren } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import Link from "next/link";
import { GraduationCap, Sparkles, BookOpen, Award, CalendarDays, Target } from "lucide-react";

const FEATURES = [
  { icon: Sparkles, text: "AI-matched programs from real university data" },
  { icon: Award, text: "28+ verified scholarships with eligibility scoring" },
  { icon: CalendarDays, text: "Month-by-month application timeline planner" },
  { icon: Target, text: "Admission strategy with honest chance bands" },
  { icon: BookOpen, text: "SOP Builder, CV Builder & Professor Finder" },
];

const QUOTE = {
  text: "Education is the most powerful weapon you can use to change the world.",
  author: "Nelson Mandela",
};

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <aside className="relative hidden w-[44%] flex-col overflow-hidden lg:flex" style={{ background: "linear-gradient(135deg, #1a1408 0%, #0f0f11 60%, #0c1a10 100%)" }}>
        {/* Decorative glows */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-primary/12 blur-[100px]" />
          <div className="absolute -bottom-24 right-0 h-[360px] w-[360px] rounded-full bg-primary/8 blur-[80px]" />
          <div className="absolute left-1/2 top-1/2 h-[200px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/4 blur-[120px]" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5" aria-label="Go to homepage">
            <GraduationCap className="size-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-white">
              Educ<span className="text-primary">AI</span>
            </span>
          </Link>

          {/* Middle: product value prop */}
          <div className="max-w-sm">
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              AI-Powered Study Abroad
            </div>
            <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-white xl:text-[2.125rem]">
              Find the right university.<br />
              <span className="text-primary/90">Get the right scholarship.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              Real program data, AI-matched recommendations, and a step-by-step application plan — all in one platform.
            </p>
            <ul className="mt-8 space-y-3.5">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/12">
                    <Icon className="size-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-white/70">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer: quote */}
          <div className="max-w-xs rounded-xl border border-white/6 bg-white/[0.03] px-4 py-4 backdrop-blur-sm">
            <p className="text-sm italic leading-relaxed text-white/60">
              &ldquo;{QUOTE.text}&rdquo;
            </p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-primary/70">— {QUOTE.author}</p>
          </div>
        </div>
      </aside>

      {/* Right form panel */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
