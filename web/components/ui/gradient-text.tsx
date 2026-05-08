"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const gradientStyle = (from: string, to: string): React.CSSProperties => ({
  background: `linear-gradient(135deg, ${from}, ${to})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
  display: "inline",
});

const animatedGradientStyle = (from: string, to: string): React.CSSProperties => ({
  background: `linear-gradient(135deg, ${from}, ${to}, ${from})`,
  backgroundSize: "200% 200%",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
  display: "inline",
});

interface GradientTextProps {
  children: React.ReactNode;
  from?: string;
  to?: string;
  animate?: boolean;
  className?: string;
}

export function GradientText({
  children,
  from = "#6366f1",
  to = "#8b5cf6",
  animate: shouldAnimate = false,
  className,
}: GradientTextProps) {
  const reduced = useReducedMotion();

  if (shouldAnimate && !reduced) {
    return (
      <motion.span
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        style={animatedGradientStyle(from, to)}
        className={cn(className)}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <span style={gradientStyle(from, to)} className={cn(className)}>
      {children}
    </span>
  );
}
