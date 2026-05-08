"use client"
import { cn } from "@/lib/utils"

interface GradientTextProps {
  children: React.ReactNode
  variant?: "hero" | "accent" | "subtle"
  from?: string
  to?: string
  animate?: boolean
  className?: string
  as?: "span" | "h1" | "h2" | "h3" | "p"
}

const gradients = {
  hero:   "linear-gradient(135deg, #FFFFFF 0%, #B8CCE8 100%)",
  accent: "linear-gradient(135deg, #4A90D9 0%, #B8CCE8 100%)",
  subtle: "linear-gradient(135deg, #E8EEF8 0%, #7A8BA8 100%)",
}

export function GradientText({
  children,
  variant = "hero",
  from,
  to,
  animate: _a,
  className,
  as: Tag = "span",
}: GradientTextProps) {
  const gradient = (from && to)
    ? `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
    : gradients[variant]

  return (
    <Tag
      className={cn(className)}
      style={{
        background: gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        display: "inline",
      }}
    >
      {children}
    </Tag>
  )
}

export default GradientText
