"use client"
import { GradientText } from "@/components/ui/gradient-text"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  gradientWord?: string
  subtitle?: string
  action?: React.ReactNode
  animation?: React.ReactNode
  className?: string
}

export function PageHeader({ title, gradientWord, subtitle, action, animation, className }: PageHeaderProps) {
  const titleParts = gradientWord
    ? title.split(new RegExp(`(${gradientWord})`, "i"))
    : [title]

  return (
    <div
      className={cn("mb-8 animate-fade-up", className)}
      style={{ position: "relative" }}
    >
      {animation && (
        <div
          aria-hidden="true"
          className="hidden md:block"
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 340,
            height: 180,
            opacity: 0.65,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {animation}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{
            fontSize: "clamp(22px, 3vw, 30px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#E8EEF8",
            lineHeight: 1.2,
          }}>
            {gradientWord ? (
              titleParts.map((part, i) =>
                part.toLowerCase() === gradientWord.toLowerCase() ? (
                  <GradientText key={i} variant="hero">{part}</GradientText>
                ) : (
                  <span key={i}>{part}</span>
                )
              )
            ) : title}
          </h1>
          {subtitle && (
            <p style={{
              marginTop: 6,
              fontSize: 14,
              color: "#7A8BA8",
              fontWeight: 300,
              lineHeight: 1.6,
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
      {/* Gradient underline */}
      <div
        className="animate-fade-in delay-100"
        style={{
          marginTop: 20,
          height: 1,
          background: "linear-gradient(90deg, rgba(74,144,217,0.25) 0%, rgba(74,144,217,0) 100%)",
          transformOrigin: "left",
        }}
      />
    </div>
  )
}

export default PageHeader
