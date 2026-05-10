"use client"

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
  return (
    <div
      aria-hidden="true"
      className={className}
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
        opacity,
        animation: pulse ? "glowOrbPulse 9s ease-in-out infinite alternate" : "none",
        ...styleProp,
      }}
    />
  )
}
