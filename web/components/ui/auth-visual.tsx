"use client"
import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

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

    // --- STARS ---
    interface Star { x: number; y: number; r: number; a: number; ta: number; to: number }
    const stars: Star[] = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 0.8 + 0.2,
      a: Math.random() * 0.3 + 0.05,
      ta: Math.random() * 0.012 + 0.003,
      to: Math.random() * Math.PI * 2,
    }))

    // --- CITY DOTS (destination cities) ---
    interface CityDot {
      x: number; y: number
      size: number
      pulseSpeed: number
      pulseOffset: number
      label: string
    }
    const cityDots: CityDot[] = [
      { x: 0.15, y: 0.28, size: 3.5, pulseSpeed: 0.014, pulseOffset: 0,   label: "London" },
      { x: 0.75, y: 0.20, size: 3.0, pulseSpeed: 0.010, pulseOffset: 1.2, label: "Toronto" },
      { x: 0.82, y: 0.55, size: 2.8, pulseSpeed: 0.016, pulseOffset: 2.1, label: "Sydney" },
      { x: 0.28, y: 0.65, size: 3.2, pulseSpeed: 0.012, pulseOffset: 0.8, label: "Berlin" },
      { x: 0.60, y: 0.35, size: 2.5, pulseSpeed: 0.018, pulseOffset: 1.7, label: "Tokyo" },
      { x: 0.45, y: 0.72, size: 3.0, pulseSpeed: 0.011, pulseOffset: 3.0, label: "New York" },
      { x: 0.88, y: 0.30, size: 2.3, pulseSpeed: 0.015, pulseOffset: 0.4, label: "Singapore" },
      { x: 0.20, y: 0.80, size: 2.6, pulseSpeed: 0.013, pulseOffset: 2.5, label: "Paris" },
    ]

    // --- FLOATING DOCUMENTS ---
    interface DocPage {
      x: number; y: number
      w: number; h: number
      speed: number
      opacity: number
      rotation: number
      rotSpeed: number
    }
    const docs: DocPage[] = Array.from({ length: 4 }, () => ({
      x: Math.random(),
      y: Math.random(),
      w: 22 + Math.random() * 12,
      h: 28 + Math.random() * 14,
      speed: 0.04 + Math.random() * 0.06,
      opacity: 0.04 + Math.random() * 0.06,
      rotation: (Math.random() - 0.5) * 0.4,
      rotSpeed: (Math.random() - 0.5) * 0.0008,
    }))

    // --- GRADUATION CAPS ---
    interface GradCap {
      x: number; y: number
      size: number
      speed: number
      opacity: number
      wobble: number
      wobbleSpeed: number
      wobbleOffset: number
    }
    const caps: GradCap[] = Array.from({ length: 5 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 8 + Math.random() * 8,
      speed: 0.05 + Math.random() * 0.08,
      opacity: 0.06 + Math.random() * 0.10,
      wobble: 15 + Math.random() * 20,
      wobbleSpeed: 0.008 + Math.random() * 0.012,
      wobbleOffset: Math.random() * Math.PI * 2,
    }))

    // --- AIRPLANE ---
    let planeT = 0
    const planeSpeed = 0.0008
    const pathP0 = { x: 0.05, y: 0.85 }
    const pathP1 = { x: 0.30, y: 0.05 }
    const pathP2 = { x: 0.70, y: 0.20 }
    const pathP3 = { x: 0.98, y: 0.10 }

    const bezier = (t: number) => {
      const mt = 1 - t
      return {
        x: mt*mt*mt*pathP0.x + 3*mt*mt*t*pathP1.x + 3*mt*t*t*pathP2.x + t*t*t*pathP3.x,
        y: mt*mt*mt*pathP0.y + 3*mt*mt*t*pathP1.y + 3*mt*t*t*pathP2.y + t*t*t*pathP3.y,
      }
    }

    const bezierTangent = (t: number) => {
      const mt = 1 - t
      return {
        x: 3*(mt*mt*(pathP1.x-pathP0.x) + 2*mt*t*(pathP2.x-pathP1.x) + t*t*(pathP3.x-pathP2.x)),
        y: 3*(mt*mt*(pathP1.y-pathP0.y) + 2*mt*t*(pathP2.y-pathP1.y) + t*t*(pathP3.y-pathP2.y)),
      }
    }

    const TRAIL_LEN = 40
    const trail: Array<{ x: number; y: number }> = []

    // --- GLOBE ---
    let globeAngle = 0

    const drawGradCap = (
      cx: number, cy: number, size: number,
      opacity: number, rotation: number
    ) => {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity
      ctx.strokeStyle = "rgba(74,144,217,1)"
      ctx.lineWidth = 1

      const bw = size * 1.4
      const bh = size * 0.25
      ctx.beginPath()
      ctx.rect(-bw/2, -size*0.5, bw, bh)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-size*0.55, -size*0.25)
      ctx.lineTo(-size*0.4,  size*0.35)
      ctx.lineTo( size*0.4,  size*0.35)
      ctx.lineTo( size*0.55, -size*0.25)
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(size*0.55, -size*0.35)
      ctx.lineTo(size*0.55,  size*0.10)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(size*0.55, size*0.15, size*0.10, 0, Math.PI*2)
      ctx.stroke()

      ctx.globalAlpha = 1
      ctx.restore()
    }

    const drawDoc = (
      cx: number, cy: number,
      w: number, h: number,
      opacity: number, rotation: number
    ) => {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity

      ctx.beginPath()
      ctx.roundRect(-w/2, -h/2, w, h, 2)
      ctx.strokeStyle = "rgba(74,144,217,1)"
      ctx.lineWidth = 0.8
      ctx.stroke()

      const lineCount = 4
      const lineSpacing = h / (lineCount + 2)
      for (let i = 1; i <= lineCount; i++) {
        const ly = -h/2 + lineSpacing * (i + 0.5)
        const lw = i === lineCount ? w * 0.45 : w * 0.65
        ctx.beginPath()
        ctx.moveTo(-w/2 + w*0.15, ly)
        ctx.lineTo(-w/2 + w*0.15 + lw, ly)
        ctx.strokeStyle = "rgba(74,144,217,0.5)"
        ctx.lineWidth = 0.7
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      ctx.restore()
    }

    const drawPlane = (
      cx: number, cy: number,
      angle: number, size: number, opacity: number
    ) => {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)
      ctx.globalAlpha = opacity

      ctx.strokeStyle = "#4A90D9"
      ctx.lineWidth = 1.2
      ctx.fillStyle = "rgba(74,144,217,0.15)"

      ctx.beginPath()
      ctx.moveTo(size, 0)
      ctx.lineTo(-size*0.7, -size*0.18)
      ctx.lineTo(-size, 0)
      ctx.lineTo(-size*0.7, size*0.18)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(size*0.05, 0)
      ctx.lineTo(-size*0.2, -size*0.85)
      ctx.lineTo(-size*0.65, -size*0.15)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(size*0.05, 0)
      ctx.lineTo(-size*0.2, size*0.85)
      ctx.lineTo(-size*0.65, size*0.15)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-size*0.65, 0)
      ctx.lineTo(-size*0.95, -size*0.40)
      ctx.lineTo(-size, 0)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.globalAlpha = 1
      ctx.restore()
    }

    let t = 0
    let lastFrame = 0
    const FRAME_INTERVAL = 1000 / 30 // 30fps

    const render = (now = 0) => {
      rafRef.current = requestAnimationFrame(render)
      if (now - lastFrame < FRAME_INTERVAL) return
      lastFrame = now

      // Skip draw when off-screen
      const rect = canvas.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) return

      const w = W()
      const h = H()
      ctx.clearRect(0, 0, w, h)

      // --- GLOBE (faint background) ---
      if (!reduced) {
        ctx.save()
        globeAngle += 0.0008
        const gcx = w * 0.5
        const gcy = h * 0.5
        const gr = Math.min(w, h) * 0.45

        for (let lat = -75; lat <= 75; lat += 25) {
          const radLat = (lat * Math.PI) / 180
          const cosLat = Math.cos(radLat)
          const sinLat = Math.sin(radLat)
          const ry = gr * sinLat
          const rx = gr * cosLat
          ctx.beginPath()
          ctx.ellipse(gcx, gcy, rx, Math.abs(ry) * 0.3 + 2, 0, 0, Math.PI * 2)
          ctx.strokeStyle = "rgba(74,144,217,0.035)"
          ctx.lineWidth = 0.6
          ctx.stroke()
        }

        for (let lon = 0; lon < 180; lon += 30) {
          const radLon = (lon * Math.PI) / 180 + globeAngle
          ctx.save()
          ctx.translate(gcx, gcy)
          ctx.rotate(radLon)
          ctx.beginPath()
          ctx.ellipse(0, 0, gr * 0.15, gr, 0, 0, Math.PI * 2)
          ctx.strokeStyle = "rgba(74,144,217,0.030)"
          ctx.lineWidth = 0.6
          ctx.stroke()
          ctx.restore()
        }

        ctx.beginPath()
        ctx.arc(gcx, gcy, gr, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(74,144,217,0.045)"
        ctx.lineWidth = 0.8
        ctx.stroke()

        ctx.restore()
      }

      // --- STARS ---
      for (const s of stars) {
        const alpha = reduced
          ? s.a
          : s.a * (0.5 + 0.5 * Math.sin(t * s.ta * 60 + s.to))
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(184,204,232,${alpha.toFixed(3)})`
        ctx.fill()
      }

      // --- CITY CONNECTIONS ---
      const connections = [
        [0, 1], [0, 3], [1, 4], [1, 5], [2, 4],
        [2, 6], [3, 7], [4, 6], [5, 7], [3, 5],
      ]
      for (const [a, b] of connections) {
        const ca = cityDots[a]
        const cb = cityDots[b]
        if (!ca || !cb) continue
        const dist = Math.hypot((ca.x - cb.x) * w, (ca.y - cb.y) * h)
        if (dist > w * 0.7) continue

        const mx = ((ca.x + cb.x) / 2) * w
        const my = ((ca.y + cb.y) / 2) * h - 20
        ctx.beginPath()
        ctx.moveTo(ca.x * w, ca.y * h)
        ctx.quadraticCurveTo(mx, my, cb.x * w, cb.y * h)
        ctx.strokeStyle = "rgba(74,144,217,0.055)"
        ctx.lineWidth = 0.7
        ctx.setLineDash([3, 6])
        ctx.stroke()
        ctx.setLineDash([])
      }

      // --- CITY DOTS ---
      for (const cd of cityDots) {
        const pulse = reduced
          ? 0.55
          : 0.35 + 0.65 * Math.sin(t * cd.pulseSpeed * 60 + cd.pulseOffset)
        const cx = cd.x * w
        const cy = cd.y * h

        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, cd.size * 5)
        halo.addColorStop(0, `rgba(74,144,217,${(pulse * 0.18).toFixed(3)})`)
        halo.addColorStop(1, "rgba(74,144,217,0)")
        ctx.beginPath()
        ctx.arc(cx, cy, cd.size * 5, 0, Math.PI * 2)
        ctx.fillStyle = halo
        ctx.fill()

        ctx.beginPath()
        ctx.arc(cx, cy, cd.size * pulse * 0.8 + cd.size * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(74,144,217,${(pulse * 0.75).toFixed(3)})`
        ctx.fill()

        if (!reduced && cd.size > 2.7) {
          ctx.font = "9px Inter, sans-serif"
          ctx.fillStyle = `rgba(122,139,168,${(pulse * 0.5).toFixed(3)})`
          ctx.textAlign = "center"
          ctx.fillText(cd.label, cx, cy + cd.size * 2 + 10)
        }
      }

      // --- FLOATING DOCUMENTS ---
      for (const doc of docs) {
        drawDoc(doc.x * w, doc.y * h, doc.w, doc.h, doc.opacity, doc.rotation)
        if (!reduced) {
          doc.y -= doc.speed * 0.0004
          doc.rotation += doc.rotSpeed
          if (doc.y < -0.15) {
            doc.y = 1.1
            doc.x = Math.random()
          }
        }
      }

      // --- GRADUATION CAPS ---
      for (const cap of caps) {
        const wobble = reduced
          ? 0
          : Math.sin(t * cap.wobbleSpeed * 60 + cap.wobbleOffset) * cap.wobble * 0.0005
        drawGradCap((cap.x + wobble) * w, cap.y * h, cap.size, cap.opacity, 0)
        if (!reduced) {
          cap.y -= cap.speed * 0.0003
          if (cap.y < -0.1) {
            cap.y = 1.1
            cap.x = Math.random()
          }
        }
      }

      // --- AIRPLANE ---
      if (!reduced) {
        planeT += planeSpeed
        if (planeT > 1.05) {
          planeT = 0
          trail.length = 0
        }

        const pos = bezier(Math.min(planeT, 1))
        const px = pos.x * w
        const py = pos.y * h

        trail.push({ x: px, y: py })
        if (trail.length > TRAIL_LEN) trail.shift()

        ctx.save()
        ctx.setLineDash([2, 5])
        ctx.beginPath()
        if (trail.length > 1) {
          ctx.moveTo(trail[0].x, trail[0].y)
          for (let i = 1; i < trail.length; i++) {
            ctx.lineTo(trail[i].x, trail[i].y)
          }
        }
        ctx.strokeStyle = "rgba(74,144,217,0.18)"
        ctx.lineWidth = 0.9
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()

        if (planeT <= 1) {
          const tan = bezierTangent(planeT)
          const angle = Math.atan2(tan.y, tan.x)
          const planeOpacity = planeT < 0.05
            ? planeT / 0.05
            : planeT > 0.95
            ? (1 - planeT) / 0.05
            : 1
          drawPlane(px, py, angle, 14, planeOpacity * 0.85)
        }
      } else {
        const pos = bezier(0.5)
        drawPlane(pos.x * w, pos.y * h, -0.3, 14, 0.5)
      }

      t += 0.016
    }

    rafRef.current = requestAnimationFrame(render)

    let resizeTimer: ReturnType<typeof setTimeout>
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(rafRef.current)
        init()
        rafRef.current = requestAnimationFrame(render)
      }, 250)
    })
    resizeObserver.observe(canvas)

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current)
      else rafRef.current = requestAnimationFrame(render)
    }

    document.addEventListener("visibilitychange", onVis)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(resizeTimer)
      resizeObserver.disconnect()
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
