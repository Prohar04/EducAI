"use client"

interface Props {
  name?: string | null
}

export function DynamicGreeting({ name }: Props) {
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening"
  const firstName = name?.split(" ")[0] ?? "there"

  return (
    <div suppressHydrationWarning>
      <p style={{
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.10em",
        textTransform: "uppercase",
        color: "#2A3A52",
        marginBottom: 10,
      }}>
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
