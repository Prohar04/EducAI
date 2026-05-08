"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({
  target,
  duration = 1.5,
  prefix = "",
  suffix = "",
  className,
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const motionValue = useMotionValue(0);

  const formatted = useTransform(motionValue, (v) => {
    const n = parseFloat(v.toFixed(decimals));
    return prefix + n.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + suffix;
  });

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      motionValue.set(target);
      return;
    }
    const controls = animate(motionValue, target, {
      duration,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [inView, target, duration, reduced, motionValue]);

  return (
    <span ref={ref} className={cn(className)}>
      {inView || reduced ? (
        <motion.span>{formatted}</motion.span>
      ) : (
        `${prefix}0${suffix}`
      )}
    </span>
  );
}
