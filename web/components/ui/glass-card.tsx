"use client"
import { forwardRef, memo } from "react"
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

    const base: React.CSSProperties = {
      background: subtle
        ? "rgba(8,13,24,0.40)"
        : "rgba(13,22,37,0.65)",
      border: glow
        ? "1px solid rgba(74,144,217,0.18)"
        : "1px solid rgba(255,255,255,0.06)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderRadius: 16,
      ...style,
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          !isStatic && hover && "hover-lift hover-glow",
          className
        )}
        style={base}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = "GlassCard"
const MemoGlassCard = memo(GlassCard)
MemoGlassCard.displayName = "GlassCard"
export { MemoGlassCard as GlassCard }
export default MemoGlassCard
