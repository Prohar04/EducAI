"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const AuthVisual = dynamic(
  () => import("@/components/ui/auth-visual"),
  { loading: () => <div style={{ width: "100%", height: "100%", background: "rgba(8,13,24,0.98)" }} />, ssr: false }
);

const FEATURES = [
  "Match universities to your profile",
  "AI-generated SOP and CV documents",
  "Scholarship discovery and tracking",
  "Visa timeline and job finder",
];

export function AuthBrandPanel() {
  const reduced = useReducedMotion();

  return (
    <aside
      className="relative hidden w-[50%] overflow-hidden lg:flex"
      style={{
        background: "linear-gradient(135deg, #080D18 0%, #0D1F35 50%, #080D18 100%)",
      }}
    >
      {/* Decorative glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{ background: "rgba(74,144,217,0.10)" }}
        />
        <div
          className="absolute -bottom-32 right-0 h-[400px] w-[400px] rounded-full blur-[100px]"
          style={{ background: "rgba(27,61,107,0.12)" }}
        />
      </div>

      {/* AuthVisual canvas — fills the entire panel */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <AuthVisual className="w-full h-full" />
      </div>

      {/* EducAI logo — top-left */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute"
        style={{ top: 28, left: 36, zIndex: 10 }}
      >
        <Link href="/" aria-label="Go to homepage">
          <span style={{ fontSize: 20 }}>
            <span style={{ color: "#E8EEF8", fontWeight: 300 }}>Educ</span>
            <span style={{ color: "#4A90D9", fontWeight: 700 }}>AI</span>
          </span>
        </Link>
      </motion.div>

      {/* Bottom feature list */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute"
        style={{ bottom: 40, left: 36, right: 36, zIndex: 10 }}
      >
        <h3
          style={{
            fontSize: 22,
            fontWeight: 300,
            color: "#E8EEF8",
            marginBottom: 20,
          }}
        >
          Your journey starts here
        </h3>

        <ul aria-label="Platform features">
          {FEATURES.map((text, i) => (
            <motion.li
              key={text}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <CheckCircle
                size={16}
                style={{ color: "#4A90D9", flexShrink: 0 }}
                aria-hidden="true"
              />
              <span style={{ fontSize: 14, fontWeight: 300, color: "#7A8BA8" }}>
                {text}
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </aside>
  );
}
