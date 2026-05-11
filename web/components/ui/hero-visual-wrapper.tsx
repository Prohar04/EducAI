"use client"
import dynamic from "next/dynamic"

const HeroVisual = dynamic(
  () => import("@/components/ui/hero-visual"),
  { loading: () => null, ssr: false }
)

export function HeroVisualWrapper({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={`pointer-events-none ${className ?? ""}`} aria-hidden="true" style={style}>
      <HeroVisual />
    </div>
  )
}
