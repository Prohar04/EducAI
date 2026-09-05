"use client"

import { useSyncExternalStore } from "react"

interface Props {
  name?: string | null
}

function partOfDay(date: Date) {
  const hour = date.getHours()
  return hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening"
}

// The value depends on the viewer's clock, which is an external system rather
// than React state — so there is nothing to subscribe to.
const noopSubscribe = () => () => {}

export function DynamicGreeting({ name }: Props) {
  // The server renders in its own timezone and would disagree with the browser,
  // a hydration mismatch (React #418) that makes React throw away the server
  // HTML and re-render. useSyncExternalStore is the supported way to render one
  // thing on the server and the real local value once hydrated: the server
  // snapshot is timezone-independent, and React swaps in the client's clock
  // immediately after hydration without a mismatch.
  const timeOfDay = useSyncExternalStore(
    noopSubscribe,
    () => partOfDay(new Date()),
    () => null,
  )

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
      }}>
        {timeOfDay ? `Good ${timeOfDay}` : "Welcome back"}
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
