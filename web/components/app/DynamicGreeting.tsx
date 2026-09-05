"use client"

import { useEffect, useState } from "react"

interface Props {
  name?: string | null
}

function partOfDay(date: Date) {
  const hour = date.getHours()
  return hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening"
}

export function DynamicGreeting({ name }: Props) {
  // The server renders in its own timezone, so the greeting it produces can
  // disagree with the browser's — a hydration mismatch (React #418) that makes
  // React discard the server HTML and re-render. Settle on the server's value
  // for the first paint, then correct it to the viewer's local time on mount.
  const [timeOfDay, setTimeOfDay] = useState(() => partOfDay(new Date()))

  useEffect(() => {
    setTimeOfDay(partOfDay(new Date()))
  }, [])

  const firstName = name?.split(" ")[0] ?? "there"

  return (
    <div>
      <p style={{
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.10em",
        textTransform: "uppercase",
        color: "#2A3A52",
        marginBottom: 10,
      }} suppressHydrationWarning>
        Good {timeOfDay}
      </p>
      <h1 style={{
        fontSize: "clamp(28px, 4vw, 48px)",
        fontWeight: 300,
        lineHeight: 1.12,
        letterSpacing: "-0.025em",
        color: "#E8EEF8",
        display: "block",
      }}>
        {firstName}<span style={{
          background: "linear-gradient(135deg, #FFFFFF 0%, #B8CCE8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: 700,
        }}>, let&apos;s make progress today</span>
      </h1>
    </div>
  )
}
