import type { ReactNode } from "react"
import Link from "next/link"
import Footer from "@/components/layout/Footer"

interface LegalLayoutProps {
  children: ReactNode
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div style={{ minHeight: "100svh", background: "#080D18", position: "relative", overflowX: "hidden" }}>
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          right: "-10%",
          top: "30%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(27,61,107,0.18)",
          filter: "blur(130px)",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.4,
        }}
      />

      {/* Top nav */}
      <header style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "clamp(56px, 6vh, 64px)",
        background: "rgba(8,13,24,0.92)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(16px, 4vw, 24px)",
        zIndex: 50,
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 300, color: "#E8EEF8" }}>Educ</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#4A90D9" }}>AI</span>
        </Link>
        <Link
          href="/"
          style={{
            fontSize: 13,
            color: "#7A8BA8",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "color 200ms",
          }}
          className="legal-back-link"
        >
          ← Back to EducAI
        </Link>
      </header>

      {/* Page content */}
      <div style={{ position: "relative", zIndex: 1, paddingTop: "clamp(72px, 8vh, 96px)" }}>
        {children}
      </div>

      <Footer />
    </div>
  )
}
