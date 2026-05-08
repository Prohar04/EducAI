"use client"
import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

interface Ring {
  rx: number
  ry: number
  angle: number
  speed: number
  dotSize: number
  dotAlpha: number
  ringAlpha: number
  tilt: number
}

export default function HeroVisual({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const init = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    init()

    const rings: Ring[] = [
      { rx: 90,  ry: 28, angle: 0,              speed:  0.007, dotSize: 3.5, dotAlpha: 0.85, ringAlpha: 0.09, tilt: 0.18 },
      { rx: 145, ry: 46, angle: Math.PI / 2.5,  speed: -0.005, dotSize: 2.8, dotAlpha: 0.60, ringAlpha: 0.06, tilt: 0.18 },
      { rx: 200, ry: 65, angle: Math.PI * 0.9,  speed:  0.003, dotSize: 2.2, dotAlpha: 0.38, ringAlpha: 0.045, tilt: 0.18 },
      { rx: 255, ry: 82, angle: Math.PI * 1.5,  speed: -0.0018, dotSize: 1.8, dotAlpha: 0.22, ringAlpha: 0.030, tilt: 0.18 },
      { rx: 310, ry: 98, angle: Math.PI * 0.3,  speed:  0.0012, dotSize: 1.4, dotAlpha: 0.14, ringAlpha: 0.018, tilt: 0.18 },
    ]

    let t = 0

    const render = () => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)

      const cx = W / 2
      const cy = H / 2

      // Core glow
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55)
      core.addColorStop(0, "rgba(74,144,217,0.22)")
      core.addColorStop(0.45, "rgba(74,144,217,0.07)")
      core.addColorStop(1, "rgba(74,144,217,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, 55, 0, Math.PI * 2)
      ctx.fillStyle = core
      ctx.fill()

      // Core dot
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(74,144,217,0.75)"
      ctx.fill()

      // Rings
      for (const ring of rings) {
        const a = ring.angle + (reduced ? 0 : t * ring.speed * 60)

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(ring.tilt)

        // Ring ellipse
        ctx.beginPath()
        ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(74,144,217,${ring.ringAlpha})`
        ctx.lineWidth = 0.8
        ctx.stroke()

        // Traveling dot
        const dx = ring.rx * Math.cos(a)
        const dy = ring.ry * Math.sin(a)

        // Dot glow halo
        const halo = ctx.createRadialGradient(dx, dy, 0, dx, dy, ring.dotSize * 5)
        halo.addColorStop(0, `rgba(74,144,217,${(ring.dotAlpha * 0.35).toFixed(3)})`)
        halo.addColorStop(1, "rgba(74,144,217,0)")
        ctx.beginPath()
        ctx.arc(dx, dy, ring.dotSize * 5, 0, Math.PI * 2)
        ctx.fillStyle = halo
        ctx.fill()

        // Dot core
        ctx.beginPath()
        ctx.arc(dx, dy, ring.dotSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(74,144,217,${ring.dotAlpha})`
        ctx.fill()

        // Trailing arc — comet tail
        if (!reduced) {
          const tailLength = 0.4
          const tailStart = a - tailLength
          ctx.beginPath()
          ctx.ellipse(0, 0, ring.rx, ring.ry, 0, tailStart, a)
          const tailGrad = ctx.createLinearGradient(
            ring.rx * Math.cos(tailStart),
            ring.ry * Math.sin(tailStart),
            dx, dy
          )
          tailGrad.addColorStop(0, "rgba(74,144,217,0)")
          tailGrad.addColorStop(1, `rgba(74,144,217,${(ring.dotAlpha * 0.25).toFixed(3)})`)
          ctx.strokeStyle = tailGrad
          ctx.lineWidth = ring.dotSize * 0.8
          ctx.stroke()
        }

        ctx.restore()
      }

      // Outer ambient
      const amb = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.52)
      amb.addColorStop(0, "rgba(27,61,107,0.14)")
      amb.addColorStop(1, "rgba(27,61,107,0)")
      ctx.beginPath()
      ctx.arc(cx, cy, Math.min(W, H) * 0.52, 0, Math.PI * 2)
      ctx.fillStyle = amb
      ctx.fill()

      t += 0.016
      rafRef.current = requestAnimationFrame(render)
    }

    render()

    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(rafRef.current)
        init()
        render()
      }, 250)
    }
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current)
      else render()
    }

    window.addEventListener("resize", onResize)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(resizeTimer)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [reduced])

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  )
}
