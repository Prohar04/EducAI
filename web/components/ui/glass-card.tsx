"use client"
import { forwardRef, memo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  subtle?: boolean
  static?: boolean
  gradient?: boolean
  hover?: boolean
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ glow = false, subtle = false, static: isStatic = false, gradient: _g,
     hover = true, className, children, style, ...props }, ref) => {
    const reduced = useReducedMotion()

    const base: React.CSSProperties = {
      background: subtle
        ? "rgba(8,13,24,0.40)"
        : "rgba(13,22,37,0.65)",
      border: "1px solid rgba(255,255,255,0.06)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderRadius: 16,
      transition: "border-color 300ms ease, box-shadow 300ms ease",
      ...style,
    }

    if (isStatic || !hover) {
      return (
        <div
          ref={ref}
          className={cn("relative overflow-hidden", className)}
          style={base}
          {...props}
        >
          {children}
        </div>
      )
    }

    return (
      <motion.div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        style={base}
        whileHover={reduced ? {} : {
          y: -2,
          borderColor: glow
            ? "rgba(74,144,217,0.20)"
            : "rgba(255,255,255,0.10)",
          boxShadow: glow
            ? "0 8px 32px rgba(0,0,0,0.45), 0 0 24px rgba(74,144,217,0.08)"
            : "0 8px 32px rgba(0,0,0,0.45)",
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        {...(props as React.ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    )
  }
)

GlassCard.displayName = "GlassCard"
const MemoGlassCard = memo(GlassCard)
MemoGlassCard.displayName = "GlassCard"
export { MemoGlassCard as GlassCard }
export default MemoGlassCard
