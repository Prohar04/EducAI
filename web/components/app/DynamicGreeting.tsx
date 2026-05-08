"use client";

function computeGreeting(hours: number): string {
  if (hours < 12) return "Good morning";
  if (hours < 17) return "Good afternoon";
  return "Good evening";
}

interface Props {
  name?: string | null;
}

export function DynamicGreeting({ name }: Props) {
  const greeting = computeGreeting(new Date().getHours());
  const firstName = name?.split(" ")[0] ?? "there";

  return (
    <div suppressHydrationWarning>
      <p className="text-sm font-medium" style={{ color: "#8896B0" }}>
        {greeting}
      </p>
      <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl" style={{ lineHeight: 1.2 }}>
        <span style={{ color: "#E8EDF5" }}>{firstName}</span>
        <span
          style={{
            background: "linear-gradient(135deg, #00C9A7, #38BDF8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          , let&apos;s make progress today
        </span>
      </h1>
    </div>
  );
}
