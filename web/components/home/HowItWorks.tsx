"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { UserCircle2, Sparkles, CalendarClock, ArrowRight } from "lucide-react";

const STEPS = [
  {
    number: 1,
    icon: UserCircle2,
    title: "Build your profile",
    description:
      "Tell EducAI your academic background, test scores, budget, and target destinations. Takes under three minutes.",
  },
  {
    number: 2,
    icon: Sparkles,
    title: "Get matched programs",
    description:
      "Our AI scrapes hundreds of universities in real time and ranks programs by fit score — tuition, GPA match, and scholarship potential.",
  },
  {
    number: 3,
    icon: CalendarClock,
    title: "Plan your timeline",
    description:
      "Get a personalised application calendar, professor outreach templates, and a document checklist — tailored to each school.",
  },
] as const;

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it Works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Three steps from idea to application
            </h2>
          </div>
        </Reveal>

        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* connector line (desktop only) */}
          <div
            className="absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] hidden h-px bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 md:block"
            aria-hidden="true"
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.number} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Icon circle */}
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 shadow-lg shadow-primary/10">
                    <Icon className="size-8 text-primary" />
                    {/* Step number badge */}
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {step.description}
                  </p>

                  {/* Arrow between steps (mobile) */}
                  {i < STEPS.length - 1 && (
                    <ArrowRight
                      className="mt-6 size-5 text-primary/40 rotate-90 md:hidden"
                      aria-hidden="true"
                    />
                  )}
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
