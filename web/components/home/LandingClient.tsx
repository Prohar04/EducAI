"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useMediaQuery } from "../../lib/hooks/use-media-query"

const StarField = dynamic(
  () => import("@/components/ui/star-field"),
  { loading: () => null, ssr: false }
)
const GlowOrb = dynamic(
  () => import("@/components/ui/glow-orb"),
  { loading: () => null, ssr: false }
)

interface LandingClientProps {
  isLoggedIn: boolean
}

export default function LandingClient({ isLoggedIn }: LandingClientProps) {
  const [scrolled, setScrolled] = useState(false)
  const isMobile = useMediaQuery("(max-width: 767px)")
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1279px)")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      {/* Background canvas */}
      {!isMobile && (
        <StarField
          density={isTablet ? 18000 : 12000}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* BMW center glow */}
      {!isMobile && (
        <GlowOrb
          size={isTablet ? 560 : 700}
          x="65%"
          y="35%"
          color="rgba(27,61,107,0.28)"
          blur={isTablet ? 120 : 150}
          pulse
          style={{ position: "fixed" }}
        />
      )}

      {/* Fixed navbar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "clamp(56px, 6vh, 60px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(16px, 3vw, 32px)",
          zIndex: 100,
          background: scrolled ? "rgba(8,13,24,0.92)" : "transparent",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "background 400ms ease, border-color 400ms ease, backdrop-filter 400ms ease",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 300, color: "#E8EEF8", letterSpacing: "-0.01em" }}>Educ</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#4A90D9" }}>AI</span>
        </Link>

        {/* Center links — desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontSize: 13,
                fontWeight: 300,
                color: "#3D4F6B",
                textDecoration: "none",
                transition: "color 200ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#7A8BA8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3D4F6B")}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isLoggedIn ? (
            <Link
              href="/app"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(74,144,217,0.88)",
                color: "#080D18",
                fontWeight: 500,
                fontSize: 13,
                padding: "8px 18px",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signin"
                prefetch={true}
                style={{
                  fontSize: 13,
                  fontWeight: 300,
                  color: "#3D4F6B",
                  textDecoration: "none",
                  transition: "color 200ms",
                  padding: "8px 12px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#7A8BA8")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#3D4F6B")}
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                prefetch={true}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "rgba(74,144,217,0.88)",
                  color: "#080D18",
                  fontWeight: 500,
                  fontSize: 13,
                  padding: "8px 18px",
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "background 200ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,144,217,1.0)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(74,144,217,0.88)")}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

    </>
  )
}
