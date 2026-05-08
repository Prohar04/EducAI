"use client"
import { forwardRef, memo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

const sizeStyles = {
  sm: { padding: "8px 16px", fontSize: 13, borderRadius: 8 },
  md: { padding: "11px 22px", fontSize: 14, borderRadius: 10 },
  lg: { padding: "14px 28px", fontSize: 15, borderRadius: 12 },
}

const variantStyles = {
  primary: {
    background: "rgba(74,144,217,0.88)",
    color: "#080D18",
    border: "none",
    fontWeight: 500,
  },
  ghost: {
    background: "rgba(255,255,255,0.04)",
    color: "#E8EEF8",
    border: "1px solid rgba(255,255,255,0.09)",
    fontWeight: 400,
  },
  outline: {
    background: "transparent",
    color: "#4A90D9",
    border: "1px solid rgba(74,144,217,0.35)",
    fontWeight: 400,
  },
}

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
  loading?: boolean
  variant?: "primary" | "ghost" | "outline"
}

const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ className, size = "md", loading = false, variant = "primary",
     children, disabled, ...props }, ref) => {
    const reduced = useReducedMotion()
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        whileHover={(!isDisabled && !reduced) ? {
          scale: variant === "primary" ? 1.01 : 1,
          background: variant === "primary"
            ? "rgba(74,144,217,1.0)"
            : variant === "ghost"
            ? "rgba(255,255,255,0.07)"
            : "rgba(74,144,217,0.08)",
        } : {}}
        whileTap={(!isDisabled && !reduced) ? { scale: 0.98 } : {}}
        transition={{ duration: 0.18 }}
        style={{
          ...sizeStyles[size],
          ...variantStyles[variant],
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.45 : 1,
          letterSpacing: "0.01em",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          position: "relative",
          overflow: "hidden",
          outline: "none",
          transition: "opacity 200ms",
        }}
        disabled={isDisabled}
        className={cn("select-none", className)}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {/* Shimmer sweep — only primary, only on hover */}
        {variant === "primary" && !reduced && (
          <motion.span
            aria-hidden="true"
            initial={{ x: "-110%" }}
            whileHover={{ x: "110%" }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.09) 50%, transparent 100%)",
              pointerEvents: "none",
            }}
          />
        )}

        {loading && (
          <span style={{
            width: 14, height: 14, borderRadius: "50%",
            border: "2px solid rgba(8,13,24,0.3)",
            borderTopColor: "#080D18",
            animation: "spin 0.7s linear infinite",
            display: "inline-block",
            flexShrink: 0,
          }} />
        )}

        {children}
      </motion.button>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"
const MemoShimmerButton = memo(ShimmerButton)
MemoShimmerButton.displayName = "ShimmerButton"
export { MemoShimmerButton as ShimmerButton }
export default MemoShimmerButton
