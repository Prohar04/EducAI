import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getSession } from "@/lib/auth/session";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { fetchEducationPulse } from "@/lib/data/fetchEducationPulse";
import { GradientText } from "@/components/ui/gradient-text";
import LandingClient from "@/components/home/LandingClient";

const DailyQuote = dynamic(
  () => import("@/components/home/DailyQuote"),
  { loading: () => <div style={{ height: 120 }} /> }
);
const EducationNews = dynamic(
  () => import("@/components/home/EducationNews"),
  { loading: () => <div style={{ height: 400 }} /> }
);

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
  { icon: "🎓", title: "Program Match",     description: "AI-ranked universities by fit score across GPA, language, budget, and career goals." },
  { icon: "💰", title: "Scholarships",      description: "28+ real scholarships with deadline alerts, eligibility pre-screening, and probability scoring." },
  { icon: "📅", title: "Timeline",          description: "Month-by-month application roadmap from your saved programs and visa milestones." },
  { icon: "♟️", title: "Strategy",          description: "AI admission strategy with chance bands, risk assessment, and concrete action plan." },
  { icon: "📝", title: "SOP Builder",       description: "Statement of purpose generated in your voice from your real academic profile." },
  { icon: "📄", title: "CV Builder",        description: "ATS-friendly resume in 3 styles: US Standard, European, and Academic." },
  { icon: "👨‍🏫", title: "Professor Finder", description: "Research supervisor discovery matched to your intended thesis area." },
  { icon: "⚡", title: "Gap Fix",           description: "Profile weakness analysis with verified evidence tracking and AI verification." },
  { icon: "📈", title: "Career Outlook",    description: "Salary ranges, top employers, and career pathways per country." },
  { icon: "💼", title: "Job Finder",        description: "Real jobs from Adzuna and JSearch — zero AI-generated listings." },
  { icon: "🛂", title: "Immigration",       description: "Visa, post-study work permit, and PR guide per target country." },
  { icon: "🤖", title: "AI Advisor",        description: "Context-aware study abroad chatbot that knows your profile and deadlines." },
  { icon: "📊", title: "Data Freshness",    description: "Real-time data health monitor showing when each source was last synced." },
] as const;

const STEPS = [
  {
    number: "01",
    title: "Complete your profile (5 minutes)",
    description: "Tell us your academic background, target countries, budget, and goals. Our wizard guides you step by step.",
  },
  {
    number: "02",
    title: "Let AI analyze your fit",
    description: "AI analyzes programs, scholarships, and career pathways across all your target countries simultaneously.",
  },
  {
    number: "03",
    title: "Apply with AI-generated documents",
    description: "Use SOP builder, CV tools, job listings, and visa guides — all tailored to your profile and target country.",
  },
] as const;

const REAL_STATS = [
  { value: "30+",  label: "Countries supported" },
  { value: "28",   label: "Real scholarships in database" },
  { value: "13",   label: "Features built" },
  { value: "4",    label: "AI providers integrated" },
] as const;

const TRUST_TECH = ["Next.js", "FastAPI", "PostgreSQL", "OpenAI"] as const;
const TRUST_INFRA = ["Vercel", "Render", "Neon"] as const;
const TRUST_DATA = ["Adzuna", "JSearch", "Serper", "Firecrawl"] as const;

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
    <div style={{ minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
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
        <section id="features" aria-labelledby="features-heading" className="below-fold" style={{ paddingTop: 140, paddingBottom: 100 }}>
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
        <section aria-labelledby="news-heading" className="below-fold" style={{ paddingTop: 100, paddingBottom: 100 }}>
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

        {/* ── REAL STATS ──────────────────────────────────────────────── */}
        <section aria-label="Platform stats" className="below-fold" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24 }}>
              {REAL_STATS.map((s) => (
                <div key={s.label} style={{
                  textAlign: "center",
                  padding: "28px 20px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: 14,
                }}>
                  <div style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 700, color: "#4A90D9", letterSpacing: "-0.02em" }}>{s.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 300, color: "#7A8BA8", marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
        <section id="how-it-works" aria-labelledby="how-heading" className="below-fold" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2A3A52", marginBottom: 16 }}>
              HOW IT WORKS
            </p>
            <h2 id="how-heading" style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 300, letterSpacing: "-0.02em", color: "#E8EEF8", marginBottom: 60 }}>
              Three steps to your dream university
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {STEPS.map((step, i) => (
                <div key={step.number} style={{ display: "flex", gap: 24, paddingBottom: 40, position: "relative" }}>
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
                  <div style={{
                    fontSize: "clamp(80px, 12vw, 120px)",
                    fontWeight: 900,
                    color: "rgba(74,144,217,0.22)",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    position: "absolute",
                    left: -12,
                    top: -16,
                    userSelect: "none",
                    pointerEvents: "none",
                    filter: "blur(0.5px)",
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

        {/* ── TRUST INDICATORS ────────────────────────────────────────── */}
        <section aria-label="Technology stack" className="below-fold" style={{ paddingTop: 40, paddingBottom: 80 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <span style={{ fontSize: 11, color: "#3D4F6B", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Built with</span>
                {TRUST_TECH.map((t) => (
                  <span key={t} style={{ fontSize: 12, color: "#7A8BA8", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 10px" }}>{t}</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <span style={{ fontSize: 11, color: "#3D4F6B", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Deployed on</span>
                {TRUST_INFRA.map((t) => (
                  <span key={t} style={{ fontSize: 12, color: "#7A8BA8", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 10px" }}>{t}</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <span style={{ fontSize: 11, color: "#3D4F6B", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Data sources</span>
                {TRUST_DATA.map((t) => (
                  <span key={t} style={{ fontSize: 12, color: "#7A8BA8", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 10px" }}>{t}</span>
                ))}
              </div>
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
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "GitHub", href: "https://github.com/Prohar04/EducAI" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="footer-link"
                  style={{ fontSize: 12, color: "#2A3A52", textDecoration: "none", transition: "color 200ms" }}
                  {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
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
