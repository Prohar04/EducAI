"use client"
import { useEffect, useRef } from "react"
import { useInView, useMotionValue, animate, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  target: number
  prefix?: string
  suffix?: string
  duration?: number
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 1.8,
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      if (ref.current) ref.current.textContent = `${prefix}${target.toLocaleString()}${suffix}`
      return
    }
    const controls = animate(count, target, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (v) => {
        if (ref.current) {
          const n = parseFloat(v.toFixed(decimals))
          ref.current.textContent = `${prefix}${n.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}${suffix}`
        }
      },
    })
    return () => controls.stop()
  }, [inView, target, prefix, suffix, duration, count, reduced, decimals])

  return (
    <span ref={ref} className={cn(className)}>
      {prefix}0{suffix}
    </span>
  )
}

export default AnimatedCounter
