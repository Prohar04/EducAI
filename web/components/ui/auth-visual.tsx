"use client"
import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

interface Particle {
  x: number
  y: number
  length: number
  speed: number
  opacity: number
  width: number
}

interface Node {
  x: number
  y: number
  size: number
  opacity: number
  pulseSpeed: number
  pulseOffset: number
  driftX: number
  driftY: number
}

const MAX_DIST = 150

export default function AuthVisual({ className }: { className?: string }) {
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

    const W = () => canvas.offsetWidth
    const H = () => canvas.offsetHeight

    const count = 40
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      length: Math.random() * 80 + 20,
      speed: Math.random() * 0.8 + 0.2,
      opacity: Math.random() * 0.25 + 0.04,
      width: Math.random() * 1.2 + 0.3,
    }))

    const nodes: Node[] = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.4 + 0.08,
      pulseSpeed: Math.random() * 0.015 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.15,
      driftY: (Math.random() - 0.5) * 0.15,
    }))

    let t = 0

    const render = () => {
      if (document.hidden) return
      ctx.clearRect(0, 0, W(), H())

      // Connection lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.06
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(74,144,217,${alpha.toFixed(3)})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Flowing streams (vertical light trails)
      if (!reduced) {
        for (const p of particles) {
          const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y - p.length)
          grad.addColorStop(0, "rgba(74,144,217,0)")
          grad.addColorStop(0.5, `rgba(74,144,217,${p.opacity})`)
          grad.addColorStop(1, "rgba(74,144,217,0)")
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x, p.y - p.length)
          ctx.strokeStyle = grad
          ctx.lineWidth = p.width
          ctx.stroke()

          p.y -= p.speed * 0.5
          if (p.y + p.length < 0) {
            p.y = H() + p.length
            p.x = Math.random() * W()
          }
        }
      }

      // Glowing nodes
      for (const node of nodes) {
        const pulse = reduced
          ? node.opacity
          : node.opacity * (0.6 + 0.4 * Math.sin(t * node.pulseSpeed * 60 + node.pulseOffset))

        const halo = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 6)
        halo.addColorStop(0, `rgba(74,144,217,${(pulse * 0.5).toFixed(3)})`)
        halo.addColorStop(1, "rgba(74,144,217,0)")
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size * 6, 0, Math.PI * 2)
        ctx.fillStyle = halo
        ctx.fill()

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(74,144,217,${pulse.toFixed(3)})`
        ctx.fill()

        if (!reduced) {
          node.x += node.driftX
          node.y += node.driftY
          if (node.x < 0 || node.x > W()) node.driftX *= -1
          if (node.y < 0 || node.y > H()) node.driftY *= -1
        }
      }

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
      }, 300)
    }
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current)
      else render()
    }

    window.addEventListener("resize", onResize)
    document.addEventListener("visibilitychange", onVis)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(resizeTimer)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  )
}
