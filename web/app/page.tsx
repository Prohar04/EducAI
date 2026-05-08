import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { fetchEducationPulse } from "@/lib/data/fetchEducationPulse";
import { GradientText } from "@/components/ui/gradient-text";
import LandingClient from "@/components/home/LandingClient";
import DailyQuote from "@/components/home/DailyQuote";
import EducationNews from "@/components/home/EducationNews";

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

const FEATURES = [
  {
    title: "Global program database",
    description: "Real-time data from universities across Germany, UK, USA, Canada, Australia, and more.",
    icon: "🌍",
  },
  {
    title: "Profile-matched recommendations",
    description: "Programs scored against your GPA, language scores, budget, and career goals — with reasoning.",
    icon: "✦",
  },
  {
    title: "Scholarship intelligence",
    description: "28+ verified scholarships with deadline tracking, eligibility pre-screening, and probability scoring.",
    icon: "◈",
  },
  {
    title: "Application strategy",
    description: "AI-generated admission chance band, risk assessment, and concrete action plan.",
    icon: "◎",
  },
  {
    title: "Timeline planner",
    description: "Month-by-month roadmap from saved program deadlines and country-specific visa milestones.",
    icon: "◷",
  },
  {
    title: "AI advisor chatbot",
    description: "Context-aware assistant that knows your saved programs, scholarships, and deadlines.",
    icon: "◬",
  },
] as const;

const STEPS = [
  {
    number: "01",
    title: "Build your profile",
    description: "Tell us your academic background, target countries, budget, and goals. Takes under three minutes.",
  },
  {
    number: "02",
    title: "Get matched programs",
    description: "AI analyzes thousands of programs and scores each one against your specific profile.",
  },
  {
    number: "03",
    title: "Discover funding",
    description: "We surface scholarships you actually qualify for — with deadlines, amounts, and next steps.",
  },
  {
    number: "04",
    title: "Execute your plan",
    description: "Use SOP builder, CV tools, professor finder, and visa guidance — all in one place.",
  },
] as const;

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org", "@type": "Organization",
  name: "EducAI", url: "https://educai-web.vercel.app",
  logo: "https://educai-web.vercel.app/og-image.png",
  description: "AI-powered study abroad platform that helps international students find programs, discover scholarships, plan visa timelines, and build their application strategy.",
};
const WEBSITE_SCHEMA = {
  "@context": "https://schema.org", "@type": "WebSite",
  name: "EducAI", url: "https://educai-web.vercel.app",
  description: "Find the right university program, discover scholarships, and build your study abroad application strategy.",
};

export default async function HomePage() {
  const session = await getSession().catch(() => null);
  const isLoggedIn = !!session;
  const feedItems = await fetchEducationPulse().catch(() => []);

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }} />

      {/* Client component handles canvas + interactive navbar */}
      <LandingClient isLoggedIn={isLoggedIn} />

      <main id="main-content">
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section
          aria-label="Hero"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            position: "relative",
            paddingTop: 80,
          }}
        >
          <div style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "80px 24px 60px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(74,144,217,0.07)",
              border: "1px solid rgba(74,144,217,0.14)",
              color: "#4A90D9",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              borderRadius: 100,
              padding: "5px 14px",
              marginBottom: 36,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4A90D9", display: "inline-block" }} />
              Study Abroad Intelligence
            </div>

            {/* H1 */}
            <h1 style={{
              fontSize: "clamp(44px, 7vw, 82px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 0,
            }}>
              <span style={{ fontWeight: 300, color: "#7A8BA8", display: "block" }}>
                Study abroad,
              </span>
              <span style={{ fontWeight: 700, display: "block" }}>
                <GradientText variant="hero">without the chaos</GradientText>
              </span>
            </h1>

            {/* Subtext */}
            <p style={{
              marginTop: 28,
              maxWidth: 500,
              margin: "28px auto 0",
              fontSize: 16,
              fontWeight: 300,
              color: "#7A8BA8",
              lineHeight: 1.75,
            }}>
              EducAI handles program matching, scholarships, documents, visas, and job search — so you can focus on getting in.
            </p>

            {/* CTAs */}
            <div style={{ marginTop: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link
                href={isLoggedIn ? "/app" : "/auth/signup"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(74,144,217,0.88)",
                  color: "#080D18",
                  fontWeight: 500,
                  fontSize: 15,
                  padding: "14px 28px",
                  borderRadius: 12,
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                  transition: "background 200ms",
                }}
              >
                {isLoggedIn ? "Go to dashboard" : "Get started"}
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: 15,
                  fontWeight: 300,
                  color: "#3D4F6B",
                  textDecoration: "none",
                  transition: "color 200ms",
                }}
              >
                See how it works →
              </a>
            </div>

            {/* Trust indicators */}
            <div style={{ marginTop: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
              {["No credit card required", "Free to start", "Real program data"].map((item) => (
                <span key={item} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#3D4F6B" }}>
                  <CheckCircle2 size={12} style={{ color: "#3D9970" }} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{
            position: "absolute",
            bottom: 48,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            zIndex: 1,
          }}>
            <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.12)" }} />
            <span style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2A3A52" }}>SCROLL</span>
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────────────── */}
        <section id="features" aria-labelledby="features-heading" style={{ paddingTop: 140, paddingBottom: 100 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
            {/* Section label */}
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2A3A52", marginBottom: 16 }}>
                WHAT WE DO
              </p>
              <h2 id="features-heading" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300, letterSpacing: "-0.02em", color: "#E8EEF8", lineHeight: 1.15 }}>
                Everything you <GradientText variant="hero">need</GradientText>
              </h2>
            </div>

            {/* Feature grid — borderless cells */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 1,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.03)",
              borderRadius: 16,
              overflow: "hidden",
            }}>
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="feature-cell"
                  style={{
                    padding: 32,
                    background: "#080D18",
                    transition: "background 300ms",
                  }}
                >
                  <div style={{ fontSize: 20, color: "#4A90D9", marginBottom: 14 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 14, fontWeight: 500, color: "#E8EEF8", marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, fontWeight: 300, color: "#7A8BA8", lineHeight: 1.65 }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STAY INFORMED ───────────────────────────────────────────── */}
        <section aria-labelledby="news-heading" style={{ paddingTop: 100, paddingBottom: 100 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2A3A52", marginBottom: 16 }}>
              DAILY UPDATES
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 48 }} className="news-grid">
              {/* Left column: heading + quote */}
              <div>
                <h2 id="news-heading" style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 300, letterSpacing: "-0.02em", color: "#E8EEF8", lineHeight: 1.15, marginBottom: 8 }}>
                  Your daily{" "}
                  <GradientText variant="hero">education briefing</GradientText>
                </h2>
                <p style={{ fontSize: 15, fontWeight: 300, color: "#7A8BA8", lineHeight: 1.7, marginBottom: 28, maxWidth: 420 }}>
                  Real news from universities, embassies, and scholarship boards — curated daily so you never miss what matters.
                </p>
                <DailyQuote />
              </div>

              {/* Right column: news grid */}
              <div>
                <EducationNews items={feedItems} />
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
        <section id="how-it-works" aria-labelledby="how-heading" style={{ paddingTop: 120, paddingBottom: 80 }}>
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2A3A52", marginBottom: 16 }}>
              HOW IT WORKS
            </p>
            <h2 id="how-heading" style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 300, letterSpacing: "-0.02em", color: "#E8EEF8", marginBottom: 60 }}>
              Four steps to your dream university
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {STEPS.map((step, i) => (
                <div key={step.number} style={{ display: "flex", gap: 24, paddingBottom: 40, position: "relative" }}>
                  {/* Vertical connecting line */}
                  {i < STEPS.length - 1 && (
                    <div style={{
                      position: "absolute",
                      left: 20,
                      top: 48,
                      bottom: 0,
                      width: 1,
                      background: "rgba(255,255,255,0.05)",
                    }} />
                  )}
                  {/* Step number background decoration */}
                  <div style={{
                    fontSize: 96,
                    fontWeight: 900,
                    color: "rgba(74,144,217,0.05)",
                    lineHeight: 1,
                    position: "absolute",
                    left: -12,
                    top: -16,
                    userSelect: "none",
                    pointerEvents: "none",
                  }}>
                    {step.number}
                  </div>
                  <div style={{ flex: 1, paddingLeft: 48 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 500, color: "#E8EEF8", marginBottom: 8 }}>{step.title}</h3>
                    <p style={{ fontSize: 14, fontWeight: 300, color: "#7A8BA8", lineHeight: 1.7 }}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ─────────────────────────────────────────────── */}
        <section style={{
          padding: "80px 40px",
          background: "rgba(13,22,37,0.55)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Ambient glow behind */}
          <div style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "rgba(27,61,107,0.22)",
            filter: "blur(120px)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2A3A52", marginBottom: 20 }}>
              GET STARTED
            </p>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 300, letterSpacing: "-0.02em", color: "#E8EEF8", marginBottom: 12, lineHeight: 1.2 }}>
              Your dream university is{" "}
              <GradientText variant="hero">closer than you think</GradientText>
            </h2>
            <p style={{ fontSize: 15, fontWeight: 300, color: "#7A8BA8", marginBottom: 36, maxWidth: 460, margin: "12px auto 36px" }}>
              Build your profile in under three minutes and get AI-matched program recommendations, scholarship options, and a personalized application timeline — all for free.
            </p>
            <Link
              href={isLoggedIn ? "/app" : "/auth/signup"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(74,144,217,0.88)",
                color: "#080D18",
                fontWeight: 500,
                fontSize: 15,
                padding: "14px 28px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              {isLoggedIn ? "Go to dashboard" : "Start for free — no credit card"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "32px 40px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
            {/* Logo */}
            <div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 300, color: "#E8EEF8" }}>Educ</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#4A90D9" }}>AI</span>
              </div>
              <p style={{ fontSize: 12, color: "#2A3A52", maxWidth: 220 }}>
                AI-powered study abroad platform. Real data, honest AI.
              </p>
            </div>
            {/* Copyright */}
            <p style={{ fontSize: 12, color: "#2A3A52" }}>
              © {new Date().getFullYear()} EducAI
            </p>
            {/* Links */}
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
                { label: "GitHub", href: "https://github.com/Prohar04/EducAI" },
              ].map((item) => (
                <a key={item.label} href={item.href} className="footer-link" style={{ fontSize: 12, color: "#2A3A52", textDecoration: "none", transition: "color 200ms" }}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
