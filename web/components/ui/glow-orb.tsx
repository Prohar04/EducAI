"use client"
import { motion, useReducedMotion } from "framer-motion"

interface GlowOrbProps {
  size?: number
  x?: string
  y?: string
  color?: string
  opacity?: number
  blur?: number
  pulse?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function GlowOrb({
  size = 600,
  x = "50%",
  y = "40%",
  color = "rgba(27,61,107,0.28)",
  opacity = 1,
  blur = 130,
  pulse = true,
  className,
  style: styleProp,
}: GlowOrbProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      aria-hidden="true"
      className={className}
      animate={(pulse && !reduced) ? {
        scale: [1, 1.07, 1],
        opacity: [opacity, opacity * 0.72, opacity],
      } : {}}
      transition={{
        duration: 9,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "mirror",
      }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: `blur(${blur}px)`,
        pointerEvents: "none",
        zIndex: 0,
        willChange: "transform, opacity",
        ...styleProp,
      }}
    />
  )
}
