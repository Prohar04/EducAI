import type { ReactNode } from "react"
import Link from "next/link"

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

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "24px clamp(16px, 4vw, 40px)",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 12,
          alignItems: "center",
        }}>
          <p style={{ fontSize: 12, color: "#3D4F6B" }}>
            © 2025 EducAI. All rights reserved.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/terms" style={{ fontSize: 12, color: "#3D4F6B", textDecoration: "none" }}>
              Terms of Service
            </Link>
            <span style={{ color: "#2A3A52", fontSize: 12 }}>·</span>
            <Link href="/privacy" style={{ fontSize: 12, color: "#3D4F6B", textDecoration: "none" }}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
