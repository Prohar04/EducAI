"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate, useReducedMotion } from "framer-motion";

interface EmployabilityGaugeProps {
  score: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
}

export function EmployabilityGauge({
  score,
  label = "Employability Score",
  size = 200,
  strokeWidth = 14,
}: EmployabilityGaugeProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetDash = (score / 100) * circumference;

  const dashOffset = useMotionValue(circumference);
  const counterValue = useMotionValue(0);
  const displayValue = useTransform(counterValue, (v) => Math.round(v));

  const scoreColor =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f43f5e";

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      dashOffset.set(circumference - targetDash);
      counterValue.set(score);
      return;
    }
    const c1 = animate(dashOffset, circumference - targetDash, {
      duration: 1.2,
      ease: "easeOut",
    });
    const c2 = animate(counterValue, score, {
      duration: 1.2,
      ease: "easeOut",
    });
    return () => { c1.stop(); c2.stop(); };
  }, [inView, score, targetDash, circumference, reduced, dashOffset, counterValue]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-extrabold"
            style={{ color: scoreColor }}
          >
            {displayValue}
          </motion.span>
          <span className="text-xs text-muted-foreground mt-0.5">/100</span>
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
