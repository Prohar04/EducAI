"use client"
import { forwardRef, memo } from "react"
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
     children, disabled, style, ...props }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn("btn-press select-none", className)}
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
          ...style,
        }}
        {...props}
      >
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
      </button>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"
const MemoShimmerButton = memo(ShimmerButton)
MemoShimmerButton.displayName = "ShimmerButton"
export { MemoShimmerButton as ShimmerButton }
export default MemoShimmerButton
