"use client";

import { forwardRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  gradient?: boolean;
  hover?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow = false, gradient = false, hover = true, children, ...props }, ref) => {
    const reduced = useReducedMotion();

    return (
      <motion.div
        ref={ref}
        whileHover={
          hover && !reduced
            ? {
                y: -3,
                boxShadow: glow
                  ? "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.2)"
                  : "0 20px 60px rgba(0,0,0,0.6)",
              }
            : undefined
        }
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn(
          "relative overflow-hidden rounded-xl",
          "border border-white/[0.08] backdrop-blur-xl",
          gradient
            ? "bg-gradient-to-br from-white/[0.04] to-white/[0.01]"
            : "bg-white/[0.03]",
          glow && "hover:border-[rgba(99,102,241,0.4)] transition-colors duration-300",
          className
        )}
        {...(props as React.ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
export { GlassCard };
