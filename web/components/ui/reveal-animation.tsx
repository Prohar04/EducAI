"use client"
import { useRef } from "react"
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

type VariantName = "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale"

const variants: Record<VariantName, Variants> = {
  fadeUp:     { hidden: { opacity: 0, y: 18 },        visible: { opacity: 1, y: 0 } },
  fadeIn:     { hidden: { opacity: 0 },                visible: { opacity: 1 } },
  slideLeft:  { hidden: { opacity: 0, x: -24 },        visible: { opacity: 1, x: 0 } },
  slideRight: { hidden: { opacity: 0, x: 24 },         visible: { opacity: 1, x: 0 } },
  scale:      { hidden: { opacity: 0, scale: 0.94 },   visible: { opacity: 1, scale: 1 } },
}

interface RevealAnimationProps {
  children: React.ReactNode
  variant?: VariantName
  delay?: number
  duration?: number
  once?: boolean
  className?: string
}

export function RevealAnimation({
  children,
  variant = "fadeUp",
  delay = 0,
  duration = 0.7,
  once = true,
  className,
}: RevealAnimationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once, margin: "-60px" })

  if (reduced) return <div className={cn(className)}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={variants[variant]}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

export default RevealAnimation
