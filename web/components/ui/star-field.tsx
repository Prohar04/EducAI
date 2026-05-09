"use client"
import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"
import { isLowEndDevice } from "@/lib/utils/device-performance"

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

export default function StarField({ className, density = 12000, style }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (isLowEndDevice()) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { willReadFrequently: false })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    let H = 0
    let stars: Star[] = []

    const init = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.scale(dpr, dpr)

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
    let lastFrame = 0

    const render = (now: number = 0) => {
      rafRef.current = requestAnimationFrame(render)
      if (now - lastFrame < 50) return // ~20fps — stars barely move, imperceptible at 20fps
      lastFrame = now

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
    }

    render()

    let resizeTimer: ReturnType<typeof setTimeout>
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(rafRef.current)
        init()
        render()
      }, 250)
    })
    resizeObserver.observe(canvas)

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current)
      } else {
        render()
      }
    }

    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(resizeTimer)
      resizeObserver.disconnect()
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
