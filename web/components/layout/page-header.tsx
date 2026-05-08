"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  gradientWord?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, gradientWord, subtitle, action, className }: PageHeaderProps) {
  const reduced = useReducedMotion();

  const titleParts = gradientWord
    ? title.split(new RegExp(`(${gradientWord})`, "i"))
    : [title];

  return (
    <motion.div
      className={cn("mb-8", className)}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            {gradientWord ? (
              titleParts.map((part, i) =>
                part.toLowerCase() === gradientWord.toLowerCase() ? (
                  <GradientText key={i}>{part}</GradientText>
                ) : (
                  <span key={i}>{part}</span>
                )
              )
            ) : (
              title
            )}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Animated gradient line */}
      <motion.div
        className="mt-4 h-px"
        style={{
          background: "linear-gradient(90deg, rgba(99,102,241,0.6) 0%, rgba(139,92,246,0.3) 60%, transparent 100%)",
        }}
        initial={reduced ? false : { scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      />
    </motion.div>
  );
}
