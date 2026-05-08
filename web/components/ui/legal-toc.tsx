"use client"

import { useEffect, useState } from "react"

interface TocItem {
  id: string
  label: string
}

interface LegalTocProps {
  items: TocItem[]
}

export default function LegalToc({ items }: LegalTocProps) {
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { rootMargin: "-20% 0px -70% 0px" }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [items])

  return (
    <nav aria-label="Table of contents" style={{ position: "sticky", top: 96 }}>
      <p style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#2A3A52",
        marginBottom: 12,
      }}>
        On this page
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
                setActive(id)
              }}
              style={{
                display: "block",
                fontSize: 12,
                lineHeight: 2,
                textDecoration: "none",
                color: active === id ? "#4A90D9" : "#3D4F6B",
                transition: "color 150ms",
              }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
