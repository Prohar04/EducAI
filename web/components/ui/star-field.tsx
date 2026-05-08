"use client"
import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  driftSpeed: number
  twinkleSpeed: number
  twinkleOffset: number
}

interface StarFieldProps {
  className?: string
  density?: number
  style?: React.CSSProperties
}

export default function StarField({ className, density = 8000, style }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let W = 0
    let H = 0
    let stars: Star[] = []

    const init = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = W * window.devicePixelRatio
      canvas.height = H * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      const count = Math.floor((W * H) / density)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 1.1 + 0.15,
        opacity: Math.random() * 0.55 + 0.08,
        driftSpeed: Math.random() * 0.06 + 0.01,
        twinkleSpeed: Math.random() * 0.018 + 0.004,
        twinkleOffset: Math.random() * Math.PI * 2,
      }))
    }

    init()

    let time = 0

    const render = () => {
      ctx.clearRect(0, 0, W, H)
      time += 0.016

      for (const star of stars) {
        const alpha = reduced
          ? star.opacity
          : star.opacity * (0.55 + 0.45 * Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset))

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(184,204,232,${alpha.toFixed(3)})`
        ctx.fill()

        if (!reduced) {
          star.y -= star.driftSpeed * 0.25
          if (star.y < -2) {
            star.y = H + 2
            star.x = Math.random() * W
          }
        }
      }

      rafRef.current = requestAnimationFrame(render)
    }

    render()

    const onResize = () => {
      cancelAnimationFrame(rafRef.current)
      init()
      render()
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current)
      } else {
        render()
      }
    }

    window.addEventListener("resize", onResize)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [density, reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        ...style,
      }}
    />
  )
}
