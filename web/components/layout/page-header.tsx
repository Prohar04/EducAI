"use client"
import { motion, useReducedMotion } from "framer-motion"
import { GradientText } from "@/components/ui/gradient-text"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  gradientWord?: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, gradientWord, subtitle, action, className }: PageHeaderProps) {
  const reduced = useReducedMotion()

  const titleParts = gradientWord
    ? title.split(new RegExp(`(${gradientWord})`, "i"))
    : [title]

  return (
    <motion.div
      className={cn("mb-8", className)}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
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
      <motion.div
        style={{
          marginTop: 20,
          height: 1,
          background: "linear-gradient(90deg, rgba(74,144,217,0.25) 0%, rgba(74,144,217,0) 100%)",
        }}
        initial={reduced ? false : { scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      />
    </motion.div>
  )
}

export default PageHeader
