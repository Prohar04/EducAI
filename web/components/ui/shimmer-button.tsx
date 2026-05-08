"use client";

import { forwardRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 px-4 text-sm rounded-lg gap-1.5",
  md: "h-10 px-5 text-sm rounded-xl gap-2",
  lg: "h-12 px-7 text-base rounded-xl gap-2",
};

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  variant?: "primary" | "outline";
}

const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ className, size = "md", loading = false, variant = "primary", children, disabled, ...props }, ref) => {
    const [hovered, setHovered] = useState(false);
    const reduced = useReducedMotion();

    const isPrimary = variant === "primary";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative inline-flex items-center justify-center font-semibold overflow-hidden",
          "transition-all duration-200 cursor-pointer select-none",
          "focus-visible:outline-2 focus-visible:outline-primary/70 focus-visible:outline-offset-2",
          "active:scale-[0.97]",
          isPrimary
            ? "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-primary/25"
            : "border border-white/10 bg-white/[0.03] text-foreground hover:bg-white/[0.06]",
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {/* Shimmer sweep */}
        {isPrimary && !reduced && (
          <motion.span
            className="pointer-events-none absolute inset-0"
            initial={{ x: "-100%", opacity: 0 }}
            animate={hovered && !(disabled || loading) ? { x: "100%", opacity: 1 } : { x: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
            }}
          />
        )}

        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="size-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading…
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";
export { ShimmerButton };
