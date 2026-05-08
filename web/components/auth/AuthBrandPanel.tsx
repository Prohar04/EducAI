"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap, Sparkles, BookOpen, Award, CalendarDays, Target, CheckCircle } from "lucide-react";
import { FloatingCards3D } from "@/components/3d/floating-cards-3d";
import { GradientText } from "@/components/ui/gradient-text";

const FEATURES = [
  { icon: Sparkles, text: "Match programs in minutes" },
  { icon: Award, text: "AI-generated SOP and CV" },
  { icon: CalendarDays, text: "Visa timeline and job finder" },
];

export function AuthBrandPanel() {
  const reduced = useReducedMotion();

  return (
    <aside
      className="relative hidden w-[50%] flex-col overflow-hidden lg:flex"
      style={{
        background: "linear-gradient(135deg, #0a0a14 0%, #0e0e1e 50%, #0a0a14 100%)",
      }}
    >
      {/* Decorative glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#6366f1]/10 blur-[120px]" />
        <div className="absolute -bottom-32 right-0 h-[400px] w-[400px] rounded-full bg-[#8b5cf6]/8 blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex h-full flex-col p-10 xl:p-14">
        {/* Logo */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/" className="flex items-center gap-2.5" aria-label="Go to homepage">
            <GraduationCap className="size-7 text-[#6366f1]" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight text-white">
              Educ<GradientText>AI</GradientText>
            </span>
          </Link>
        </motion.div>

        {/* 3D floating cards */}
        <div className="flex-1 flex items-center justify-center my-8">
          <div className="w-full h-64">
            <FloatingCards3D className="w-full h-full" />
          </div>
        </div>

        {/* Value prop */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-2xl font-bold tracking-tight text-white xl:text-3xl">
            Study abroad,{" "}
            <GradientText>without the chaos</GradientText>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            EducAI handles program matching, scholarships, documents, visas, and job search — so you can focus on getting in.
          </p>

          <ul className="mt-6 space-y-2.5" aria-label="Platform features">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={reduced ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.2 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-2.5"
              >
                <CheckCircle className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                <span className="text-sm text-white/65">{text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </aside>
  );
}
